const { sendMail } = require('../middleware/sendMail');
const UsersModel = require('../model/userModel');
const crypto = require("crypto");
const dataUri = require('../utils/dataUri');
const cloudinary = require("cloudinary");
const requestModel = require('../model/requestModel');
const { emitEvent } = require('../features/features');
const chatModel = require('../model/chatModel')

exports.registerUser = async (req, res, next) => {
    try {

        const { FullName, userName, Email, Password } = req.body;

        if (!FullName || !userName || !Email || !Password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: FullName, Email, Password.",
            });
        }
        const newUser = await UsersModel.create({
            FullName,
            userName,
            Email,
            Password
        })
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            newUser
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the user. Please try again later.",
            error: error.message,
        });
    }
}

exports.userLogin = async (req, res, next) => {
    try {
        const { Email, password } = req.body;
        let user = await UsersModel.findOne({ Email }).select("+Password").populate("posts", "image _id");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not exist"
            })
        }
        const matchPassword = await user.isMatchPassword(password);
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: "password is invalid"
            })
        }
        const token = await user.generateToken();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'None'
        })
        res.status(200).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMe = async (req, res, next) => {
    try {
        const user = await UsersModel.findById(req.user._id).populate("posts", "image _id");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const user = req.user;
        const { userName, Email, bio, dob, gender, website, state, mobile } = req.body;
        // const files = req.file;

        // if (!files) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Avatar file is required"
        //     })
        // }






        // if (!["male", "female", "non-binary", "other"].includes(gender?.toLowerCase())) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid gender value",
        //     });
        // }

        // if (dob) {
        //     const dateOfBirth = new Date(dob);
        //     const today = new Date();
        //     const age = today.getFullYear() - dateOfBirth.getFullYear();
        //     if (age < 18 || isNaN(dateOfBirth)) {
        //         return res.status(400).json({
        //             success: false,
        //             message: "You must be at least 18 years old",
        //         });
        //     }
        // }

        // if (files) {
        //     const imageUri = dataUri(files);
        //     const cloud = await cloudinary.v2.uploader.upload(imageUri.content, {
        //         folder: "User"
        //     });

        //     user.Avatar = {
        //         public_id: cloud.public_id,
        //         url: cloud.secure_url
        //     };
        // }



        if (dob) user.dob = dob;
        if (website) user.website = website;
        if (bio) user.bio = bio;
        if (Email) {
            if (!/^\S+@\S+\.\S+$/.test(Email)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid Email is Required"
                })
            }

            user.Email = Email;
        }
        if (userName) user.userName = userName;
        if (gender) user.gender = gender;
        if (state) user.state = state;
        if (mobile) {
            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid mobile is required"
                })
            }
            user.mobile = mobile;
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: "avatar updated successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.findUserByName = async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getUsers = async (req, res, next) => {
    try {
        const allUsers = await UsersModel.find();
        res.status(201).json({
            success: true,
            allUsers
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while getting all users",
            error: error.message
        })
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const currentUser = await UsersModel.findById(req.parmas.id);
        if (!currentUser) {
            return res.status(200).json({
                success: false,
                message: `User is not found with ${req.params.id}`
            })
        }
        await currentUser.deleteOne();
        res.status(200).json({
            success: true,
            message: "user is deleted successfully",
            currentUser
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `User is not delete `,
            error: error.message
        })
    }
}

exports.getSingleUser = async (req, res, next) => {
    try {
        const singleUser = await UsersModel.findById(req.params.id).populate('posts');
        if (!singleUser) {
            return res.status(404).json({
                success: false,
                message: `User not found with this id ${req.params.id}`
            })
        }
        res.status(200).json({
            success: true,
            singleUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.followAndfollwing = async (req, res, next) => {
    try {
        const loggedInUser = req.user;
        const tofollowUser = await UsersModel.findById(req.params.id);
        if (!tofollowUser) {
            return res.status(404).json({
                success: false,
                message: "following user does not exist"
            })
        }

        if (loggedInUser._id.equals(tofollowUser._id)) {
            return res.status(400).json({
                success: false,
                message: "you can not follow yourself"
            })
        }


        if (loggedInUser.following.includes(tofollowUser._id)) {
            const tofollowindex = loggedInUser.following.indexOf(tofollowUser._id)
            loggedInUser.following.splice(tofollowindex, 1);
            await loggedInUser.save();
            const followingindex = tofollowUser.followers.indexOf(loggedInUser._id);
            tofollowUser.followers.splice(followingindex, 1);
            await tofollowUser.save();
            res.status(201).json({
                success: true,
                message: "unfollowed"
            })
        } else {
            tofollowUser.followers.push(loggedInUser._id);
            await tofollowUser.save();
            loggedInUser.following.push(tofollowUser._id);
            await loggedInUser.save();
            res.status(201).json({
                success: true,
                message: "followed"
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getUsersFollowingList = async (req, res, next) => {
    try {
        const user = await UsersModel.findById(req.params.id).populate({ path: "following", select: "FullName userName Avatar" }).populate({ path: "followers", select: "FullName userName Avatar" });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found with this userid"
            })
        }
        const followingWithIsFollow = user.following.map((following) => ({
            ...following.toObject(),
            isFollow: user.following.some(f => f.toString() === req.user._id)
        }));
        const followersWithIsFollow = user.followers.map((followers) => ({
            ...followers.toObject(),
            isFollow: user.followers.some(f => f.toString() === req.user._id)
        }))

        res.status(200).json({
            success: true,
            userName: user.userName,
            followings: followingWithIsFollow,
            followers: followersWithIsFollow
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.logoutUser = async (req, res, next) => {
    try {
        res.status(200).cookie("token", null, { httpOnly: true, expires: new Date(Date.now()) }).json({
            success: true,
            message: "logout successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const user = req.user;
        const { oldPassword, newPassword } = req.body;
        const isPasswordMatch = await user.isMatchPassword(oldPassword);
        if (isPasswordMatch) {
            user.Password = newPassword;
            await user.save();
            res.status(200).json({
                success: true,
                message: "Password changed successfully"
            })
        }
        res.status(200).json({
            success: false,
            message: "old password is incorrect"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UsersModel.findOne({ Email: email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        const resetPasswordToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;

        const mailOptions = {
            to: user.Email,
            text: `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`
        }
        try {
            await sendMail(mailOptions);
            res.status(200).json({
                success: true,
                message: `mail sent to ${user.Email}`,
                resetPasswordToken,
                resetUrl
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({
                success: false,
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await UsersModel.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "invalid token or token expire"
            })
        }
        user.Password = req.body.password;
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "password updated successfully",
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.sendFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const request = await requestModel.findOne({
            $or: [{
                sender: req.user, receiver: userId
            }, {
                receiver: req.user, sender: userId
            }]
        })
        if (request) {
            return res.status(403).json({
                success: false,
                message: "request already send"
            })
        }

        await requestModel.create({
            sender: req.user,
            receiver: userId
        })

        emitEvent(req, "NEW_REQUEST", [userId])
        res.status(200).json({
            success: true,
            message: "friend request sent successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.acceptFriendRequest = async (req, res, next) => {
    try {
        const { requestId, accept } = req.body;
        const requestData = await requestModel.findById(requestId).populate("sender", "FullName").populate("receiver", "FullName");
        if (!requestData) {
            return res.status(404).json({
                success: false,
                message: "requset not found"
            })
        }
        if (requestData.receiver._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "you are not authorized to accept this request"
            })
        }
        if (!accept) {
            await requestData.deleteOne();
            return res.status(200).json({
                success: true,
                message: "request rejected"
            })
        }
        const memebers = [requestData.sender._id, requestData.receiver._id];
        await Promise.all([
            chatModel.create({
                participants: memebers,
                Name: `${requestData.sender.FullName}-${requestData.receiver.FullName}`
            }),
            requestData.deleteOne()
        ])
        emitEvent(req, "REFRESH_CHAT", memebers)
        res.status(200).json({
            success: true,
            message: "freiend request accepted",
            senderId: requestData.sender._id
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



exports.searchUsers = async (req, res, next) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({ users: [] })

        const regex = new RegExp(query, 'i');
        const users = await UsersModel.find({
            $or: [
                { FullName: { $regex: regex } },
                { userName: { $regex: regex } }
            ]
        }).select("_id FullName userName Avatar");
        res.json({ users })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}