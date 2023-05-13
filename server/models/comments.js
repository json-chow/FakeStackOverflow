// Comment Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    cmnt_by: {
        type: String,
        required: true
    },
    cmnt_date_time: {
        type: Date,
        default: Date.now()
    },
    votes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Comment", commentSchema);