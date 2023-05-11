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
    let questions = await Question.find({});
    let tags = await Tag.find({});
    let answers = await Answer.find({});
    res.send({questions, tags, answers});
});

app.get("/posts/question/:qid", async (req, res) => {
    let question = await Question.findByIdAndUpdate(req.params.qid, {$inc: {views: 1}}, {new: true});
    let answers = await Answer.find({}).sort({ans_date_time: 'desc'});
    res.send({question, answers});
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