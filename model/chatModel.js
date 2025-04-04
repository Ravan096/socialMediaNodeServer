const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    groupChat: {
        type: Boolean,
        default: false
    },
    Creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    // messages: [
    //     {
    //         sender: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "Users",
    //             required: true
    //         },
    //         content: {
    //             type: String,
    //             required: true
    //         },
    //         timestamp: {
    //             type: Date,
    //             default: Date.now
    //         }

    //     }
    // ],
    CreatedAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("Chat", chatSchema)