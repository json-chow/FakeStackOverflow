// Admin Profile Document Schema

// This will be used for our server.init.js script (bottom of project specs page)

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminProfileSchema = new Schema({
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

adminProfileSchema.virtual("url").get(function() {
    return "posts/admin/" + this._id;
});

module.exports = mongoose.model("Admin", adminProfileSchema);