const mongoose = require('mongoose');

const postSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
    },
    CreatedAt:{
        type:Date,
        default:Date.now
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },
    like:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ]
});

module.exports = mongoose.model("Post",postSchema);