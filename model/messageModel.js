const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    },
    attachment:{
        type:String
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
})


module.exports = mongoose.model("Message",messageSchema);