let Account = require('./models/accounts');
const bcrypt = require("bcrypt");

let userArgs = process.argv.slice(2);

let mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/fake_so", {useNewUrlParser: true, useUnifiedTopology: true});

async function init() {
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    let hashedPassword = await bcrypt.hash(userArgs[1], salt);

    accountdetail = {
        username: userArgs[0],
        password: hashedPassword,
        accountName: "admin",
        dateCreated: Date.now(),
        admin: true
    };

    let account = new Account(accountdetail);
    await account.save();

    db.close();
}

init();