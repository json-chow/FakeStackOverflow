// Account Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema({
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
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    questionUpvotes: {
        type: [Schema.Types.ObjectId],
        ref: "Question"
    },
    questionDownvotes: {
        type: [Schema.Types.ObjectId],
        ref: "Question"
    },
    answerUpvotes: {
        type: [Schema.Types.ObjectId],
        ref: "Answer"
    },
    answerDownvotes: {
        type: [Schema.Types.ObjectId],
        ref: "Answer"
    },
    commentUpvotes: {
        type: [Schema.Types.ObjectId],
        ref: "Comment"
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    reputation: {
        type: Number,
        default: 0
    }
});

accountSchema.virtual("url").get(function() {
    return "posts/account/" + this._id;
});

module.exports = mongoose.model("Account", accountSchema);