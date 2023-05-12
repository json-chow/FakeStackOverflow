// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const app = express();

let Account = require('./models/accounts');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let Tag = require('./models/tags');

const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var cors = require("cors");
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
    let tags, questions, maxPages, numQuestions, accounts;
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    console.log(page, limit);
    if (req.query.tags === undefined && req.query.nontags === undefined) {
        if (req.query.sortBy === "active") {
            questions = await Question.aggregate([
                {$lookup: {from: "answers", localField: "answers", foreignField: "_id", as: "latest_answer"}},
                {$sort: {"latest_answer.ans_date_time": -1}},
                {$skip: (page - 1) * limit},
                {$limit: limit}
            ]);
        } else if (req.query.sortBy === "unanswered") {
            questions = await Question.find({answers: {$size: 0}}).limit(limit).skip((page - 1) * limit);
        } else { // Sort by newest first
            questions = await Question.find({}).sort({ask_date_time: "desc"}).limit(limit).skip((page - 1) * limit);
        }
        numQuestions = await Question.estimatedDocumentCount();
        questions.push(numQuestions);
    } else {
        let nontags = req.query.nontags && req.query.nontags.map((e) => "\\b" + e + "\\b");
        let nontags_regex = nontags ? nontags.join("|") : "a^";
        let q_tags = await Tag.find({name: {$in: req.query.tags}});
        let tids = q_tags && q_tags.map((e) => e._id);
        questions = await Question
                            .find({$or: [{title: {$regex: nontags_regex, $options: "i"}}, {tags: {$in: tids}}]})
                            .limit(limit)
                            .skip((page - 1) * limit);
        numQuestions = (await Question.find({$or: [{title: {$regex: nontags_regex, $options: "i"}}, {tags: {$in: tids}}]})).length;
        questions.push(numQuestions);
    }
    maxPages = Math.ceil(numQuestions / limit);
    tags = await Tag.find({});
    console.log("Max pages: " + maxPages)
    accounts = await Account.find({});
    res.send({questions, tags, maxPages, accounts});
});

app.get("/posts/question/:qid", async (req, res) => {
    console.log(req.query.incViews);
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    let question = await Question.findByIdAndUpdate(req.params.qid, {$inc: {views: req.query.incViews ? 1 : 0}}, {new: true});
    let numAnswers = (await Answer.find({_id: {$in: question.answers}}).sort({ans_date_time: 'desc'})).length;
    let answers = await Answer
                        .find({_id: {$in: question.answers}})
                        .sort({ans_date_time: 'desc'})
                        .limit(limit)
                        .skip((page - 1) * limit);
    let maxPages = Math.ceil(numAnswers / limit);
    res.send({question, answers, numAnswers, maxPages});
})

app.get("/tags", async(req, res) => {
    let questions = await Question.find({});
    let tags = await Tag.find({});
    res.send({questions, tags});
});

app.post("/new_account", async(req, res) => {
    let accountFields = {
        username: req.body.username,
        password: req.body.password,
        accountName: req.body.accountName
    }
    let newAccount = new Account(accountFields);
    await newAccount.save();
    res.sendStatus(200);
});

app.post("/new_answer", async(req, res) => {
    let answerFields = {
        text: req.body.candidateAnswer.text,
        ans_by: req.body.candidateAnswer.ansBy,
        ans_date_time: req.body.candidateAnswer.ansDate
    }
    let newAnswer = new Answer(answerFields);
    await newAnswer.save();
    await Question.findByIdAndUpdate(req.body.qid, {$push: {answers: newAnswer}});
    res.sendStatus(200);
});

app.post("/new_question", async(req, res) => {
    let newTags = await getNewTags(req.body.tagIds[0]);
    let questionFields = {
        title: req.body.title,
        text: req.body.text,
        tags: newTags,
        asked_by: req.body.askedBy,
        ask_date_time: req.body.askDate
    }
    let question = new Question(questionFields);
    await question.save();
    res.sendStatus(200);
});

app.listen(8000, () => {
    console.log("Listening on port 8000");
});

async function getNewTags(newPostTags) {
    let tags = await Tag.find({});
    let qtnTags = [];
    if (tags === undefined || tags.length === undefined) {  // if there are no tags in database
        for (let i = 0; i < newPostTags.length; i++) {
            let tagName = newPostTags[i].toLowerCase();
            let newTag = new Tag({name: tagName});
            qtnTags.push(newTag);
            await newTag.save();
        }
        return qtnTags;
    }
    else {
        for (let i = 0; i < newPostTags.length; i++) {
            let tagName = newPostTags[i].toLowerCase();
            let existingTag = await Tag.findOne({name: tagName});
            if (existingTag === null) { // tag NOT in database
                let newTag = new Tag({name: tagName});
                qtnTags.push(newTag);
                tags.push(newTag);
                await newTag.save();
            }
            else { // tag in database
                qtnTags.push(existingTag._id);
            }
        }
    }
    return qtnTags;
};

// Closing the server
process.on("SIGINT", () => {
    if (db) {
        db.close()
            .then(() => {
                console.log("Server closed. Database instance disconnected.");
                process.exit();
            })
    }
});