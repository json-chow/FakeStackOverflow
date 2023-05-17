let Account = require('./models/accounts');

let userArgs = process.argv.slice(2);

let mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/fake_so", {useNewUrlParser: true, useUnifiedTopology: true});

async function init() {
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    accountdetail = {
        username: userArgs[0],
        password: userArgs[1],
        accountName: "admin",
        dateCreated: Date.now(),
        admin: true
    };

    let account = new Account(accountdetail);
    await account.save();

    db.close();
}

init();