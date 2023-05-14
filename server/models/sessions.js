// Session Document Schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    id: {type: String},
    secret: {type: String},
    saveUninitialized: {type: Boolean},
    cookie: {},
    resave: {type: Boolean}
});

sessionSchema.virtual("url").get(function() {
    return "posts/session/" + this._id;
});

module.exports = mongoose.model("Session", sessionSchema);
