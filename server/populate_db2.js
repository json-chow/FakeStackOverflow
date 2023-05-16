// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Account = require('./models/accounts');
let Answer = require('./models/answers');
let Comment = require('./models/comments');
let Question = require('./models/questions');
let Tag = require('./models/tags');

const bcrypt = require("bcrypt");

let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
function tagCreate(name) {
  let tag = new Tag({ name: name });
  return tag.save();
}

function answerCreate(text, comments, ans_by, ans_date_time, votes) {
  answerdetail = {text:text};
  if (comments != false) answerdetail.comments = comments;
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (votes != false) answerdetail.votes = votes;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, summary, text, tags, answers, comments, asked_by, ask_date_time, views, votes) {
  qstndetail = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (comments != false) qstndetail.comments = comments;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;
  if (votes != false) qstndetail.votes = votes;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

function commentCreate(text, cmnt_by, cmnt_date_time, votes) {
  commentdetail = {text:text};
  if (cmnt_by != false) commentdetail.cmnt_by = cmnt_by;
  if (cmnt_date_time != false) commentdetail.cmnt_date_time = cmnt_date_time;
  if (votes != false) commentdetail.votes = votes;
  
  let comment = new Comment(commentdetail);
  return comment.save();
}

async function accountCreate(username, password, email, admin) {
  let account = new Account({username: username, password: password, accountName: email, admin: admin});
  return account.save();
}

const populate = async () => {
  let t1 = await tagCreate('tagone');
  let t2 = await tagCreate('tagtwo');
  let t3 = await tagCreate('tagthree');
  let t4 = await tagCreate('tagfour');
  let t5 = await tagCreate('tagfive');

  const salt = await bcrypt.genSalt(10);
  await accountCreate("hello", (await bcrypt.hash("world", salt)).toString(), "a@b.c", true);

  let c1 = await commentCreate('comment for answer 1', 'usertwo', false, 3);
  let c2 = await commentCreate('comment for answer 1 again', 'userthree', false, 6);
  let c3 = await commentCreate('comment for answer 2', 'userone', false, 16);
  let c4 = await commentCreate('comment for answer 1 again twice', 'usertwo', false, 24);
  let c5 = await commentCreate('comment for answer 1 again thrice', 'userfour', false, false);
  let c6 = await commentCreate('comment for answer 1 again again again', 'userfive', false, -4);
  let c7 = await commentCreate('yet another comment for answer 1', 'userfour', false, 0);
  let c8 = await commentCreate('comment for answer 4, but with a [url](https://www.google.com)', 'usersix', false, 105);
  let c9 = await commentCreate('super long comment for data test 15 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut la', 'userseven', false, 24341);
  
  let a1 = await answerCreate('answer 1', [c1, c2, c4, c5, c6, c7], 'userone', false, 204);
  let a2 = await answerCreate('answer 2', [c3], 'usertwo', false, -53);
  let a3 = await answerCreate('answer 3', false, 'userthree', false, false);
  let a4 = await answerCreate('answer 4', [c8], 'userfour', false, 3);
  let a5 = await answerCreate('answer 5', false, 'userfive', false, 95);
  let ahtml = await answerCreate('yes answer at [ans](https://stackoverflow.com/)', false, 'userfive', false, 1048);

  
  await questionCreate('time test 1', 'test summary', 'test text', [t1], [a1], false, 'quserone', Date.now() - 36000, false, 123);
  await questionCreate('time test 2', 'test summary', 'test text', [t1], [a1], false, 'quserone', Date.now() - 720000, false, 542);
  await questionCreate('time test 3', 'test summary', 'test text', [t1], [a1], false, 'quserone', Date.parse('07 May 2023 12:00:00 GMT'), false, 23);
  await questionCreate('time test 4', 'test summary', 'test text', [t1], [a1], false, 'quserone', Date.parse('01 Jan 2023 12:00:00 GMT'), false, -42);
  await questionCreate('time test 5', 'test summary', 'test text', [t1], [a1], false, 'quserone', Date.parse('01 Jan 2022 12:00:00 GMT'), false, -5);
  
  await questionCreate('HTML test', 'Summary link here --> [link](https://www.google.com)', 'Can you see this link? [ask](https://stackoverflow.com/)', [t1], [ahtml], false, 'quserone', false, false, 32);
  
  await questionCreate('data test 1', 'summary question text 1', 'data question text 1', [t1, t2], [a1], false, 'quserone', false, false, 52);
  await questionCreate('data test 2', 'summary question text 2', 'data question text 2', [t2, t3], [a1], false, 'quserone', false, false, 12);
  await questionCreate('data test 3', 'summary question text 3', 'data question text 3', [t3, t1, t4], [a1], false, 'quserone', false, false, 24);
  await questionCreate('data test 4', 'summary question text 4', 'data question text 4', [t4], [a1], false, 'quserone', false, false, 36);
  await questionCreate('data test 5', 'summary question text 5', 'data question text 5', [t5], [a1], false, 'quserone', false, false, 48);
  await questionCreate('data test 6', 'summary question text 6', 'data question text 6', [t1, t2], [a1], false, 'quserone', false, false, 60);
  await questionCreate('data test 7', 'summary question text 7', 'data question text 7', [t1, t3], [a1], false, 'quserone', false, false, 72);
  await questionCreate('data test 8', 'summary question text 8', 'data question text 8', [t4], [a1], false, 'quserone', false, false, 84);
  await questionCreate('data test 9', 'summary question text 9', 'data question text 9', [t5], [a1], false, 'quserone', false, false, 96);
  await questionCreate('data test 10', 'summary question text 10', 'data question text 10', [t1], [a1, a2], false, 'quserone', false, false, 108);
  await questionCreate('data test 11', 'summary question text 11', 'data question text 11', [t2], [a1], false, 'quserone', false, false, 120);
  await questionCreate('data test 12', 'summary question text 12', 'data question text 12', [t3], [a1], false, 'quserone', false, false, 132);
  await questionCreate('data test 13', 'summary question text 13', 'data question text 13', [t4], [a1, a2, a3, a4], false, 'quserone', false, false, 144);
  await questionCreate('data test 14', 'summary question text 14', 'data question text 14', [t5], [a1], [c1, c2, c3], 'quserone', false, false, -54);
  await questionCreate('data test 15', 'summary question text 15', 'data question text 15', [t1], [a1, a2, a3, a4, a5, ahtml], [c1, c2, c3, c4, c5, c6, c9], 'quserone', false, false, false);


  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
