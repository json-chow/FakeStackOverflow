// Account Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema({
    username: {
        type: String,
        required: true,
        maxLength: 20
    },
    password: {
        type: String,
        required: true,
        maxLength: 20
    },
    accountName: {
        type: String,
        required: true,
        maxLength: 20
    }
});

accountSchema.virtual("url").get(function() {
    return "posts/account/" + this._id;
});

module.exports = mongoose.model("Account", accountSchema);