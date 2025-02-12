const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    status: {
        enum: ["pending", "accepted", "rejected"]
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
}, { timestamps: true })


module.exports = mongoose.Model("RequestModel", requestSchema)