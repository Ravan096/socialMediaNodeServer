const { ALERT, REFRESH_CHATS } = require('../constants/constant');
const { emitEvent } = require('../features/features');
const { otherMember } = require('../lib/helper');
const chatModel = require('../model/chatModel');
const messageModel = require('../model/messageModel');
const UsersModel = require('../model/userModel');

exports.createChat = async (req, res, next) => {
    try {
        const { name, participantIds, isGroup } = req.body;
        const participants = [...participantIds, req.user._id];
        const chat = await chatModel.create({
            Name: isGroup ? name : "Private Chat",
            participants,
            groupChat: isGroup,
            Creator: req.user._id
        })
        res.status(201).json({
            success: true,
            chat
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.startOrGetChat = async (req, res, next) => {
    try {
        const loggedInUser = req.user._id;
        const participantId = req.body.participantId;
        if (!participantId) {
            return res.status(400).json({ success: false, message: "Participant ID required" });
        }
        let existingChat = await chatModel.findOne({
            groupChat: false,
            participants: { $all: [loggedInUser, participantId] },
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        }).populate("participants", "FullName Avatar");

        if (existingChat) {
            return res.status(200).json({
                success: true,
                chat: existingChat
            });
        }
        const newChat = await chatModel.create({
            Name: "Private Chat",
            participants: [loggedInUser, participantId],
            groupChat: false,
            Creator: loggedInUser
        })
        return res.status(201).json({
            success: true,
            chat: newChat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}


exports.resetUnreadCount = async (req, res) => {
    try {
        const chatId = req.params.id;
        const userId = req.user._id.toString();
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }
        chat.unreadCounts.set(userId, 0);
        await chat.save();
        res.status(200).json({
            success: true,
            message: "Unread count reset seccessfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "something went wrong"
        })
    }
}


exports.creatGroupChat = async (req, res, next) => {
    try {
        const { name, participants } = req.body;
        if (participants.length < 2) {
            return res.status(400).json({
                success: false,
                message: "atleast 3 participants required for group"
            })
        }
        const allMembers = [...participants, req.user];
        emitEvent(req, ALERT, allMembers, `welcome to ${name} group`)
        emitEvent(req, REFRESH_CHATS, allMembers, `welcome to ${name} group`)

        await chatModel.create({
            Name: name,
            groupChat: true,
            Creator: req.user,
            participants: allMembers
        })
        res.status(201).json({
            success: true,
            message: "group created"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMyChats = async (req, res, next) => {
    try {
        const chats = await chatModel.find({ participants: req.user._id }).
            populate("participants", "FullName Avatar")
            .sort({ updatedAt: -1 }).lean();
        const enhancedChats = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await messageModel.findOne({ chat: chat._id })
                    .sort({ timestamp: -1 })
                    .populate("senderId", "FullName Avatar")
                    .lean();

                return {
                    ...chat,
                    lastMessage: lastMessage || null
                };
            })
        );
        res.status(200).json({
            success: true,
            enhancedChats
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// exports.getMyChats = async (req, res, next) => {
//     try {
//         const chats = await chatModel.find({ participants: req.user }).populate("participants", "FullName Avatar");
//         const transformChats = chats.map((item) => {
//             const othermember = otherMember(item.participants, req.user)
//             return {
//                 chat_id: item._id,
//                 groupChat: item.groupChat,
//                 name: item.groupChat ? item.Name : othermember.FullName,
//                 participants: item.participants,
//                 avatar: item.groupChat ? item.participants.slice(0, 3).map(({ Avatar }) => Avatar.url) : [othermember.Avatar.url],
//                 participants: item.participants.reduce((prev, curr) => {
//                     if (curr._id.toString() !== req.user.toString()) {
//                         prev.push(curr._id)
//                     }
//                     return prev
//                 }, [])
//             }
//         })
//         res.status(200).json({
//             success: true,
//             chats: transformChats
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

exports.addMembers = async (req, res, next) => {
    try {
        const { chatId, members } = req.body;
        if (!members || members.length < 1) {
            return res.status(400).json({
                success: false,
                message: "atleast 1 member is required "
            })
        }
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "chat not found"
            })
        }
        if (chat.Creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "you are not allowed add member in this group"
            })
        }

        const allUserPromise = members.map((i) => UsersModel.findById(i, "FullName"));
        const allNewUsers = await Promise.all(allUserPromise);
        const uniqueMembers = allNewUsers.filter((i) => !chat.participants.includes(i._id)).map((i) => i._id)
        chat.participants.push(...uniqueMembers.map((i) => i._id))
        await chat.save();

        const allUserName = allNewUsers.map((i) => i.FullName).join(",");
        emitEvent(req, ALERT, allNewUsers, `welcome to ${chat.Name} group`)

        res.status(200).json({
            success: true,
            chat,
            allUserName
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.removeMembers = async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;
        const [chat, user] = await Promise.all([chatModel.findById(chatId), UsersModel.findById(userId, "FullName")]);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "chat not found"
            })
        }
        if (chat.Creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "you are not allowed remove member in this group"
            })
        }
        chat.participants.filter((member) => member.toString() !== userId.toString());
        await chat.save();

        res.status(200).json({
            success: true,
            message: `${user.FullName} removed successfully`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.leaveGroup = async (req, res, next) => {
    try {
        const chat = await chatModel.findById(req.params.id);
        if (!chat) {
            return res.status(400).json({
                success: false,
                message: "chat not found"
            })
        }
        if (!chat.groupChat) {
            return res.status(400).json({
                success: false,
                message: "this is not group chat"
            })
        }
        const remainingUser = chat.participants.filter((member) => member.toString() !== req.user._id.toString());
        if (remainingUser.length < 2) {
            return res.status(400).json({
                success: false,
                message: "group have must atleast 3 member"
            })
        }
        if (req.user._id.toString() === chat.Creator.toString()) {
            chat.Creator = remainingUser[0];
        }
        chat.participants = remainingUser;
        await chat.save();

        res.status(200).json({
            success: true,
            message: `leaved group successfully`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.sendAttachments = async (req, res, next) => {
    try {
        const { chatId } = req.body;
        const [chat, me] = await Promise.all([chatModel.findById(chatId), UsersModel.findById(req.user._id)]);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'chat not found'
            })
        }
        const files = req.files || [];
        if (files.length > 1) {
            return res.status(400).json({
                success: false,
                message: "please provide attachments"
            })
        }
        const attachment = [];
        const messageForDb = { content: "", senderId: me._id, chat: chat._id };
        const messageForRealTime = { content: "", senderId: { _id: me._id, name: me.FullName }, chat: chat._id }
        res.status(200).json({
            success: true,
            chat,
            me
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getChatDetails = async (req, res, next) => {
    try {
        if (req.query.populate === 'true') {
            const chat = await chatModel.findById(req.params.id).populate("participants", "FullName Avatar").lean();
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "chat not found"
                })
            }
            chat.participants = chat.participants.map(({ _id, FullName, Avatar }) => ({
                _id,
                FullName,
                Avatar: Avatar.url
            }))
            res.status(200).json({
                success: true,
                chat
            })
        } else {
            const chat = await chatModel.findById(req.params.id);
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "chat not found"
                })
            }
            res.status(200).json({
                success: true,
                chat
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.renameGroup = async (req, res, next) => {
    try {
        const chat = await chatModel.findById(req.params.id);
        const { name } = req.body;
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "chat not found"
            })
        }
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Group is required"
            })
        }
        if (!chat.groupChat) {
            return res.status(405).json({
                success: false,
                message: "this is not a group chat"
            })
        }

        if (chat.Creator.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "you are not allowed to rename the groupName"
            })
        }
        chat.Name = name;
        await chat.save();
        emitEvent(req, REFRESH_CHATS, chat.participants);

        res.status(200).json({
            success: true,
            chat
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteChats = async (req, res, next) => {
    try {
        const chat = await chatModel.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "chat not found"
            })
        }
        res.status(200).json({
            success: true,
            chat
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}