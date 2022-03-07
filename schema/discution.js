const mongoose = require("mongoose");


const discussionSchema = mongoose.Schema({
    isPaid: {
        type: Boolean,
        default: false
    },
    partners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    message: [{
        sender: mongoose.Schema.Types.ObjectId,
        text: {
            type: String,
            trim: true,
            index: true
        },
        is_seen: {
            type: Boolean,
            default: false
        },
        dateTime: {
            type: Date,
            default: Date.now()
        }
    }],
    createdDate: {
        type: Date,
        default: Date.now()
    }


});
const Discussion = mongoose.model("discussion", discussionSchema);
module.exports = Discussion;