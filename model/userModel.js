const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require('os');

const userSchema = new mongoose.Schema({
    FullName: {
        type: String,
    },
    userName: {
        type: String
    },
    Email: {
        type: String,
        unique: true
    },
    Password: {
        type: String
    },
    mobile: {
        type: String,
        unique: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    Avatar: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        }
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
    }],
    savedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    bio: {
        type: String
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'non-binary', 'other'],
            message: '{VALUE} is not a valid gender',
        },
        set: (value) => value.toLowerCase()
    },
    dob: {
        type: Date
    },
    website: {
        type: String
    },
    state: {
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

userSchema.pre("save", async function (next) {
    if (this.isModified("Password")) {
        this.Password = await bcrypt.hash(this.Password, 10)
    }
    next();
});

userSchema.methods.isMatchPassword = async function (password) {
    return await bcrypt.compare(password, this.Password)
}

userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET)
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    console.log(resetToken)

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}


module.exports = mongoose.model("Users", userSchema)