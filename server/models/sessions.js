
const { Int32, Double } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const oneDay = 1000 * 60 * 60 * 24;
const sessionSchema = new Schema({
    secret: {type: String},
    saveUninitialized: {type: Boolean},
    cookie: {},
    resave: {type: Boolean}
});

sessionSchema.virtual("url").get(function() {
    return "posts/session/" + this._id;
});

module.exports = mongoose.model("Session", sessionSchema);
