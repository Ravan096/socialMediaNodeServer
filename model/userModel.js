const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
    },
    LastName: {
        type: String
    },
    Email: {
        type: String
    },
    Password: {
        type: String
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]
});

userSchema.pre("save", async function (next) {
    if (this.isModified("Password")) {
        this.Password = await bcrypt.hash(this.Password, 10)
    }
    next();
});

userSchema.methods.isMatchPassword = async function (password) {
    console.log(password)
    return await bcrypt.compare(password, this.Password)
}

userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET)
}


module.exports = mongoose.model("Users", userSchema)