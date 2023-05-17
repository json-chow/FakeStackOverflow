// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
var cookieParser = require("cookie-parser");
var sessions = require("express-session");

let Account = require('./models/accounts');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let Session = require('./models/sessions');
let Tag = require('./models/tags');
let Comment = require('./models/comments');

const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var cors = require("cors");

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

const oneHour = 1000*60*60;
app.use(sessions({
    secret: "defaultKey",
    saveUninitialized:true,
    cookie: { 
        maxAge: oneHour,
    },
    resave: false 
}));

async function isSignedIn(req, res, next) {
    let session = await Session.findOne({id: req.session.user});
    if (session) {
        next();
    } else {
        console.log("401: Session Not Found")
        res.sendStatus(401);
    }
}

app.get('/homepage', async(req, res) => {
    let session = await Session.findOne({id: req.session.user});
    if (session) {
        res.send("sessionFound");
    }
    else {
        res.send("sessionNotFound");
    }
});

app.post('/logout', async(req,res) => {
    let deletedSessions = await Session.deleteMany({id: req.body.username});
    console.log(deletedSessions);
    if (deletedSessions) {
        req.session.destroy();
        res.send("Session ended with no errors.");
    }
    else {
        res.send("sessionDisrupted");
    }
});

app.post('/create_session', async(req,res) => {
    const account = await Account.find({username: req.body.username});
    if (!account || account[0] === undefined) {
        res.send("usrW1");
    }
    else {
        const match = await bcrypt.compare(req.body.password, account[0].password);
        if (match) {
            let sessionInfo=req.session;
            sessionInfo.user=req.body.username;
            sessionInfo.secret = Math.random().toPrecision(21).toString();
            // res.cookie(req.body.username, sessionInfo.secret, {httpOnly: false});
            let dbSession = new Session({id: sessionInfo.user, secret: sessionInfo.secret})
            await dbSession.save();
            res.send("accessGranted");
        }
        else {
            res.send("pwdW1");
        }
    }
});

app.post("/new_account", async(req, res) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    let hashedPassword = await bcrypt.hash(req.body.password, salt);
    let accountFields = {
        username: req.body.username,
        password: hashedPassword,
        accountName: req.body.accountName,
        dateCreated: Date.now()
    }
    let newAccount = new Account(accountFields);
    await newAccount.save();
    res.sendStatus(200);
});

app.get("/", async (req, res) => {
    let tags, questions, maxPages, numQuestions, accounts;
    let limit = 5
    let page = parseInt(req.query.page);
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
            questions = await Question.find({}).sort({ask_date_time: -1, _id: -1}).limit(limit).skip((page - 1) * limit);
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
    accounts = await Account.find({});
    res.send({questions, tags, maxPages, accounts});
});

app.get("/posts/question/:qid", async (req, res) => {
    let limit = 5
    let page = parseInt(req.query.page);
    let question = await Question
                            .findByIdAndUpdate(req.params.qid, {$inc: {views: req.query.incViews ? 1 : 0}}, {new: true});
    let tags = await Tag.find({_id: {$in: question.tags}});
    let numAnswers = (await Answer.find({_id: {$in: question.answers}}).sort({ans_date_time: 'desc'})).length;
    let answers = await Answer
                        .find({_id: {$in: question.answers}})
                        .sort({ans_date_time: -1, _id: -1})
                        .limit(limit)
                        .skip((page - 1) * limit);
    let maxPages = Math.ceil(numAnswers / limit);
    res.send({question, answers, tags, numAnswers, maxPages});
})

app.get("/posts/question/:qid/comments", async (req, res) => {
    let cpage = parseInt(req.query.cpage);
    let question = await Question.findById(req.params.qid);
    let numQComments = (await Comment.find({_id: {$in: question.comments}})).length;
    let comments = await Comment.find({_id: {$in: question.comments}}).sort({cmnt_date_time: -1, _id: -1}).limit(3).skip((cpage - 1) * 3);
    let maxPages = Math.ceil(numQComments / 3);
    res.send({comments, maxPages})
})

app.get("/posts/answer/:aid/comments", async (req, res) => {
    let cpage = parseInt(req.query.cpage);
    let answer = await Answer.findById(req.params.aid);
    let numQComments = (await Comment.find({_id: {$in: answer.comments}})).length;
    let comments = await Comment.find({_id: {$in: answer.comments}}).sort({cmnt_date_time: -1, _id: -1}).limit(3).skip((cpage - 1) * 3);
    let maxPages = Math.ceil(numQComments / 3);
    res.send({comments, maxPages})
})

app.post("/posts/question/:qid/comments", isSignedIn, async (req, res) => {
    let cmntFields = {
        text: req.body.text,
        cmnt_by: req.session.user,
        cmnt_date_time: req.body.cmnt_date_time
    };
    let newComment = new Comment(cmntFields);
    await newComment.save();
    await Question.findByIdAndUpdate(req.params.qid, {$push: {comments: newComment}});
    res.sendStatus(200);
})

app.post("/posts/answer/:aid/comments", isSignedIn, async (req, res) => {
    let cmntFields = {
        text: req.body.text,
        cmnt_by: req.session.user,
        cmnt_date_time: req.body.cmnt_date_time
    };
    let newComment = new Comment(cmntFields);
    await newComment.save();
    await Answer.findByIdAndUpdate(req.params.aid, {$push: {comments: newComment}});
    res.sendStatus(200);
})

app.get("/posts/question/:qid/votes", async (req, res) => {
    let question = await Question.findById(req.params.qid);
    let account = await Account.findOne({username: req.session.user});
    let vote = 0;
    if (account) {
        if (account.questionUpvotes && account.questionUpvotes.includes(req.params.qid)) {
            vote = 1;
        } else if (account.questionDownvotes && account.questionDownvotes.includes(req.params.qid)) {
            vote = -1
        }
    } else {
        vote = undefined;
    }
    res.send({votes: question.votes, vote: vote})
})

app.get("/posts/answer/:aid/votes", async (req, res) => {
    let answer = await Answer.findById(req.params.aid);
    let account = await Account.findOne({username: req.session.user});
    let vote = 0;
    if (account) {
        if (account.answerUpvotes && account.answerUpvotes.includes(req.params.aid)) {
            vote = 1;
        } else if (account.answerDownvotes && account.answerDownvotes.includes(req.params.aid)) {
            vote = -1
        }
    }
    res.send({votes: answer.votes, vote: vote})
})

app.get("/comments/:cid/votes", async (req, res) => {
    let comment = await Comment.findById(req.params.cid);
    let account = await Account.findOne({username: req.session.user});
    let vote = 0;
    if (account && account.commentUpvotes && account.commentUpvotes.includes(req.params.cid)) {
        vote = 1;
    }
    res.send({votes: comment.votes, vote: vote})
})

app.post("/posts/question/:qid/votes/:amt", isSignedIn, async (req, res) => {
    let voteAmt = parseInt(req.params.amt);
    let qid = req.params.qid;
    let account = await Account.findOne({username: req.session.user});
    // Check reputation
    if (account.reputation < 50) {
        res.sendStatus(403)
        return
    }
    let question;
    if (voteAmt == 1) { // Upvote case
        if (account.questionUpvotes && account.questionUpvotes.includes(qid)) {
            // Revert previous upvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: -1}});
            await Account.findByIdAndUpdate(account._id, {$pull: {questionUpvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: -5}})
        } else if (account.questionDownvotes && account.questionDownvotes.includes(qid)){
            // Change from downvote to upvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: 2}})
            await Account.findByIdAndUpdate(account._id, {$pull: {questionDownvotes: qid}, $push: {questionUpvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: 15}})
        } else {
            // No previous upvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: 1}})
            await Account.findByIdAndUpdate(account._id, {$push: {questionUpvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: 5}})
        }
    } else { // Downvote case
        if (account.questionDownvotes && account.questionDownvotes.includes(qid)) {
            // Revert previous downvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: 1}});
            await Account.findByIdAndUpdate(account._id, {$pull: {questionDownvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: 10}})
        } else if (account.questionUpvotes && account.questionUpvotes.includes(qid)){
            // Change from upvote to downvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: -2}})
            await Account.findByIdAndUpdate(account._id, {$pull: {questionUpvotes: qid}, $push: {questionDownvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: -15}})
        } else {
            // No previous downvote
            question = await Question.findByIdAndUpdate(qid, {$inc: {votes: -1}})
            await Account.findByIdAndUpdate(account._id, {$push: {questionDownvotes: qid}})
            await Account.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: -10}})
        }
    }
    res.send({votes: question.votes})
})

app.post("/posts/answer/:aid/votes/:amt", isSignedIn, async (req, res) => {
    let voteAmt = parseInt(req.params.amt);
    let aid = req.params.aid;
    let account = await Account.findOne({username: req.session.user});
    // Check reputation
    if (account.reputation < 50) {
        res.sendStatus(403)
        return
    }
    let answer;
    if (voteAmt == 1) { // Upvote case
        if (account.answerUpvotes && account.answerUpvotes.includes(aid)) {
            // Revert previous upvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: -1}});
            await Account.findByIdAndUpdate(account._id, {$pull: {answerUpvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: -5}})
        } else if (account.answerDownvotes && account.answerDownvotes.includes(aid)){
            // Change from downvote to upvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: 2}})
            await Account.findByIdAndUpdate(account._id, {$pull: {answerDownvotes: aid}, $push: {answerUpvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: 15}})
        } else {
            // No previous upvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: 1}})
            await Account.findByIdAndUpdate(account._id, {$push: {answerUpvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: 5}})
        }
    } else { // Downvote case
        if (account.answerDownvotes && account.answerDownvotes.includes(aid)) {
            // Revert previous downvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: 1}});
            await Account.findByIdAndUpdate(account._id, {$pull: {answerDownvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: 10}})
        } else if (account.answerUpvotes && account.answerUpvotes.includes(aid)){
            // Change from upvote to downvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: -2}})
            await Account.findByIdAndUpdate(account._id, {$pull: {answerUpvotes: aid}, $push: {answerDownvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: -15}})
        } else {
            // No previous downvote
            answer = await Answer.findByIdAndUpdate(aid, {$inc: {votes: -1}})
            await Account.findByIdAndUpdate(account._id, {$push: {answerDownvotes: aid}})
            await Account.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: -10}})
        }
    }
    res.send({votes: answer.votes})
})

app.post("/comments/:cid/votes/:amt", isSignedIn, async (req, res) => {
    let cid = req.params.cid;
    let account = await Account.findOne({username: req.session.user});
    let comment;
    if (account.commentUpvotes && account.commentUpvotes.includes(cid)) {
        // Revert previous upvote
        comment = await Comment.findByIdAndUpdate(cid, {$inc: {votes: -1}});
        await Account.findByIdAndUpdate(account._id, {$pull: {commentUpvotes: cid}})
    } else {
        // No previous upvote
        comment = await Comment.findByIdAndUpdate(cid, {$inc: {votes: 1}})
        await Account.findByIdAndUpdate(account._id, {$push: {commentUpvotes: cid}})
    }
    res.send({votes: comment.votes})
})

app.get("/tags", async(req, res) => {
    let questions = await Question.find({});
    let tags = await Tag.find({});
    res.send({questions, tags});
});

app.post("/new_answer", isSignedIn, async(req, res) => {
    let aid = req.body.candidateAnswer.aid;
    if (aid === -1) {
        let answerFields = {
            text: req.body.candidateAnswer.text,
            ans_by: req.session.user,
            ans_date_time: req.body.candidateAnswer.ansDate
        }
        let newAnswer = new Answer(answerFields);
        await newAnswer.save();
        await Question.findByIdAndUpdate(req.body.qid, {$push: {answers: newAnswer}});
        res.sendStatus(200);
    } else {
        await Answer.findByIdAndUpdate(aid, {text: req.body.candidateAnswer.text})
        res.sendStatus(200);
    }
});

app.post("/new_question", isSignedIn, async(req, res) => {
    let edit = req.body.edit;
    for (let i=0; i<req.body.tagIds[0].length; i++) {
        let tag = await Tag.find({name: req.body.tagIds[0][i]})
        if (tag.length === 0) {
            // Check user reputation
            let account  = (await Account.find({username: req.session.user}))[0]
            if (account.reputation < 50) {
                res.sendStatus(403)
                return
            }
        }
    }
    let newTags = await getNewTags(req.body.tagIds[0]);
    let questionFields = {
        title: req.body.title,
        summary: req.body.summary,
        text: req.body.text,
        tags: newTags,
        asked_by: req.session.user,
        ask_date_time: req.body.askDate
    }
    if (edit) {
        delete questionFields.ask_date_time;
        delete questionFields.asked_by;
        await Question.findByIdAndUpdate(req.body.qid, questionFields)
    } else {
        let question = new Question(questionFields);
        await question.save();
    }
    res.sendStatus(200);
});

app.post("/question/:qid/delete", isSignedIn, async(req, res) => {
    let question = await Question.findById(req.params.qid);
    let answers = await Answer.find({_id: {$in: question.answers}});
    // Delete comments under answers
    for (let i = 0; i < answers.length; i++) {
        await Comment.deleteMany({_id: {$in: answers[i].comments}});
    }
    // Delete associated answers
    await Answer.deleteMany({_id: {$in: question.answers}})
    // Delete associated comments
    await Comment.deleteMany({_id: {$in: question.comments}})
    // Delete question
    await Question.findByIdAndDelete(req.params.qid);
    res.sendStatus(200);
});

app.post("/answer/:aid/delete", isSignedIn, async(req, res) => {
    let answer = await Answer.findById(req.params.aid);
    // Delete comments
    await Comment.deleteMany({_id: {$in: answer.comments}});
    // Delete question
    await Answer.findByIdAndDelete(req.params.aid);
    res.sendStatus(200);
});

app.post('/delete_account', async(req,res) => {
    let deletedSession = await Session.deleteOne({id: req.params.username});
    let deletedAccount = await Account.deleteOne({id: req.params.username});
    if (deletedAccount) {
        res.send("accountDeleted");
    }
    else {
        res.send("accountNotFound");
    }
});

app.get('/answer/:aid', async(req, res) => {
    let ans = await Answer.findById(req.params.aid);
    if (req.session.user) {
        let filt_ans = await Answer.find({$and: [{_id: req.params.aid}, {ans_by: req.session.user}]});
        if (filt_ans.length === 0) {
            res.send({ans: ans, isOwner: false});
        } else {
            res.send({ans: ans, isOwner: true});
        }
    } else {
        res.send({ans: ans, isOwner: false})
    }
})

app.get('/tag/:tid', async(req, res) => {
    let tag = await Tag.findById(req.params.tid)
    let questions = await Question.find({})
    res.send({tag: tag, questions: questions});
})

app.post('/tag/:tid/update', isSignedIn, async(req, res) => {
    let tag = await Tag.findByIdAndUpdate(req.params.tid, {name: req.body.val})
    res.sendStatus(200);
})

app.post('/tag/:tid/delete', isSignedIn, async(req, res) => {
    // Check if other questions from other users have tag
    let questions = await Question.find({$and: [{tags: req.params.tid}, {asked_by: {$ne: req.session.user}}]})
    if (questions.length !== 0) {
        res.sendStatus(403);
    } else {
        questions = await Question.find({tags: req.params.tid});
        for (let i = 0; i < questions.length; i++) {
            await Question.findByIdAndUpdate(questions[i]._id, {$pull: {tags: req.params.tid}});
        }
        await Tag.deleteOne({_id: req.params.tid});
        res.sendStatus(200);
    }
})

app.post('/profile/:pid/delete', isSignedIn, async(req, res) => {
    await Account.findByIdAndDelete(req.params.pid);
    res.sendStatus(200);
})

app.get("/profile", isSignedIn, async(req, res) => {
    let type = parseInt(req.query.type);
    let account = await Account.findOne({username: req.session.user});
    let questions = await Question.find({asked_by: account.username});
    if (account.admin) {
        let adminOverride = req.query.adminView;
        if (adminOverride) {
            let userAcc = await Account.findById(adminOverride);
            questions = await Question.find({asked_by: userAcc.username});
            let tag_ids = [...new Set(questions.map((question) => question.tags).flat())];
            let tags = await Tag.find({_id: {$in: tag_ids}});
            let answers = await Answer.find({ans_by: userAcc.username});
            let ans_ids = [...new Set(answers.map((answer) => answer._id))];
            ans_q = await Question.find({answers: {$in: ans_ids}}).sort({ask_date_time: -1, _id: -1});
            res.send({
                name: userAcc.username,
                dateCreated: userAcc.dateCreated,
                reputation: userAcc.reputation,
                questions: questions,
                tags: tags,
                ans_q: ans_q,
                accounts: true
            });
            return
        }
        let userAccounts = await Account.find({});
        console.log("userAccounts: " + userAccounts);
        res.send({
            name: account.username,
            dateCreated: account.dateCreated,
            reputation: account.reputation,
            questions: questions,
            accounts: userAccounts
        });
    }
    else {
        switch (type) {
            case 0:
                res.send({name: account.username,
                          dateCreated: account.dateCreated,
                          reputation: account.reputation,
                          questions: questions});
                break;
            case 1:
                let tag_ids = [...new Set(questions.map((question) => question.tags).flat())];
                let tags = await Tag.find({_id: {$in: tag_ids}});
                res.send({name: account.username,
                    dateCreated: account.dateCreated,
                    reputation: account.reputation,
                    tags: tags});
                break;
            case 2:
                let answers = await Answer.find({ans_by: account.username});
                let ans_ids = [...new Set(answers.map((answer) => answer._id))];
                questions = await Question.find({answers: {$in: ans_ids}}).sort({ask_date_time: -1, _id: -1});
                res.send({name: account.username,
                    dateCreated: account.dateCreated,
                    reputation: account.reputation,
                    questions: questions});
                break;
            default:
                break;
        }
    }
})

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