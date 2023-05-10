// Question Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    text: {
        type: String,
        required: true
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: "Tag",
        required: true,
        validate: val => val.length >= 1
    },
    answers: {
        type: [Schema.Types.ObjectId],
        ref: "Answer"
    },
    asked_by: {
        type: String,
        default: "Anonymous"
    },
    ask_date_time: {
        type: Date,
        default: Date.now()
    },
    views: {
        type: Number,
        default: 0
    }
});

questionSchema.virtual("url").get(function() {
    return "posts/question/" + this._id;
});

module.exports = mongoose.model("Question", questionSchema);