// Answer Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: "Comment"
    },
    ans_by: {
        type: String,
        required: true
    },
    ans_date_time: {
        type: Date,
        default: Date.now()
    },
    votes: {
        type: Number,
        default: 0
    }
});

answerSchema.virtual("url").get(function() {
    return "posts/answer/" + this._id;
});

module.exports = mongoose.model("Answer", answerSchema);