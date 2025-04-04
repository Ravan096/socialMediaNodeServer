const MessageModel = require("../model/messageModel");
const UsersModel = require("../model/userModel");

exports.SendMessage = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const receiverUser = await UsersModel.findById(req.params.id);
        const { msgText } = req.body;
        if (!receiverUser) {
            res.status(404).json({
                success: false,
                message: "recipient not found"
            })
        }
        const sendedMsg = await MessageModel.create({
            senderId: myId,
            recieverId: receiverUser,
            content: msgText
        });
        res.status(200).json({
            success: true,
            message: "message sent successfully",
            sendedMsg
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getMessages = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const receiverUser = await UsersModel.findById(req.params.id);
        if (!receiverUser) {
            res.status(404).json({
                success: false,
                message: "recipient not found"
            })
        }
        const allMessages = await MessageModel.find({
            $or: [
                { senderId: myId, recieverId: receiverUser },
                { recieverId: myId, senderId: receiverUser }
            ]
        }).sort({ timestamp: 1 })

        res.status(200).json({
            success: true,
            message: "got all messages",
            allMessages
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSideBarChatUser = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const allchatUsers = await MessageModel.find({
            $or: [
                { senderId: myId },
                { recieverId: myId }
            ]
        }).select("recieverId senderId");
        const userIds = new Set();
        allchatUsers.forEach((item) => {
            if (item.senderId.toString() !== myId.toString()) {
                userIds.add(item.senderId);
            }
            if (item.recieverId.toString() !== myId.toString()) {
                userIds.add(item.recieverId)
            }
        })
        const sideUsers = await UsersModel.find({ _id: { $in: Array.from(userIds) } }).select("-Password")
        res.status(200).json({
            success: true,
            message: "got all sidebar user",
            sideUsers,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deleteMessages = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const { messageId } = req.body;
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "message not found"
            })
        }
        if (message.senderId._id.toString() !== myId) {
            return res.status(403).json({
                success: false,
                message: "you can delete only your message"
            })
        }

        await MessageModel.findByIdAndDelete(messageId);
        res.status(200).json({
            success: true,
            message: "message deleted"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



exports.editMessages = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const { messageId, newText } = req.body;
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "message not found"
            })
        }
        if (message.senderId._id.toString() !== myId) {
            return res.status(403).json({
                success: false,
                message: "you can edit only your message"
            })
        }
        message.content = newText;
        await MessageModel.save();
        res.status(200).json({
            success: true,
            message: "message updated"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}