const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"]
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    // chat: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Chat"
    // },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
}, { timestamps: true })


module.exports = mongoose.model("RequestModel", requestSchema)