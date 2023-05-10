// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')


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

function answerCreate(text, ans_by, ans_date_time) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views) {
  qstndetail = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

const populate = async () => {
  let t1 = await tagCreate('tagone');
  let t2 = await tagCreate('tagtwo');
  let t3 = await tagCreate('tagthree');
  let t4 = await tagCreate('tagfour');
  let t5 = await tagCreate('tagfive');
  
  let a1 = await answerCreate('answer 1', 'userone', false);
  let a2 = await answerCreate('answer 2', 'usertwo', false);
  let a3 = await answerCreate('answer 3', 'userthree', false);
  let a4 = await answerCreate('answer 4', 'userfour', false);
  let a5 = await answerCreate('answer 5', 'userfive', false);
  let ahtml = await answerCreate('yes answer at [ans](https://stackoverflow.com/)', 'userfive', false);

  
  await questionCreate('time test 1', 'test text', [t1], [a1], 'quserone', Date.now() - 36000, false);
  await questionCreate('time test 2', 'test text', [t1], [a1], 'quserone', Date.now() - 720000, false);
  await questionCreate('time test 3', 'test text', [t1], [a1], 'quserone', Date.parse('07 May 2023 12:00:00 GMT'), false);
  await questionCreate('time test 4', 'test text', [t1], [a1], 'quserone', Date.parse('01 Jan 2023 12:00:00 GMT'), false);
  await questionCreate('time test 5', 'test text', [t1], [a1], 'quserone', Date.parse('01 Jan 2022 12:00:00 GMT'), false);
  
  await questionCreate('HTML test', 'Can you see this link? [ask](https://stackoverflow.com/)', [t1], [ahtml], 'quserone', false, false);
  
  await questionCreate('data test 1', 'data question text 1', [t1, t2], [a1], 'quserone', false, false);
  await questionCreate('data test 2', 'data question text 2', [t2, t3], [a1], 'quserone', false, false);
  await questionCreate('data test 3', 'data question text 3', [t3, t1, t4], [a1], 'quserone', false, false);
  await questionCreate('data test 4', 'data question text 4', [t4], [a1], 'quserone', false, false);
  await questionCreate('data test 5', 'data question text 5', [t5], [a1], 'quserone', false, false);
  await questionCreate('data test 6', 'data question text 6', [t1, t2], [a1], 'quserone', false, false);
  await questionCreate('data test 7', 'data question text 7', [t1, t3], [a1], 'quserone', false, false);
  await questionCreate('data test 8', 'data question text 8', [t4], [a1], 'quserone', false, false);
  await questionCreate('data test 9', 'data question text 9', [t5], [a1], 'quserone', false, false);
  await questionCreate('data test 10', 'data question text 10', [t1], [a1], 'quserone', false, false);
  await questionCreate('data test 11', 'data question text 11', [t2], [a1], 'quserone', false, false);
  await questionCreate('data test 12', 'data question text 12', [t3], [a1], 'quserone', false, false);
  await questionCreate('data test 13', 'data question text 13', [t4], [a1], 'quserone', false, false);
  await questionCreate('data test 14', 'data question text 14', [t5], [a1], 'quserone', false, false);
  await questionCreate('data test 15', 'data question text 15', [t1], [a1], 'quserone', false, false);


  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
