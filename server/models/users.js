// User Profile Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 1
    },
    password: {
        type: String,
        required: true,
        minLength: 1
    },
    accountName: {
        type: String,
        required: true,
        minLength: 1
    }
});

userProfileSchema.virtual("url").get(function() {
    return "posts/user/" + this._id;
});

module.exports = mongoose.model("User", userProfileSchema);