const mongoose= require('mongoose');

const chatSchema = new mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    messages:[
        {
            sender:{
                type:mongoose.Schema.Types.ObjectId,
            ref:"Users",
            required:true
            },
            content:{
                type:String,
                required:true
            },
            timestamp:{
                type:Date,
                default:Date.now
            }

        }
    ],
    CreatedAt:{
        type:Date,
        default:Date.now
    }
})