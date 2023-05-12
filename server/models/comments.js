// Comment Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    }
})