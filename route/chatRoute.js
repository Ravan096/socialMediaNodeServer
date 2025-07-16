const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { creatGroupChat, getMyChats, addMembers, removeMembers, leaveGroup, sendAttachments, getChatDetails, renameGroup, deleteChats,startOrGetChat } = require('../controller/chatController');

const router = express.Router();

router.route('/newgroup').post(isAuthenticated, creatGroupChat);
router.route('/mychats').get(isAuthenticated, getMyChats);
router.route('/addmembers').get(isAuthenticated, addMembers);
router.route('/removemember').get(isAuthenticated, removeMembers);
router.route('/leavegroup/:id').delete(isAuthenticated, leaveGroup);
router.route('/message/sendattachment').post(isAuthenticated, sendAttachments)
router.route('/chat/:id').get(isAuthenticated, getChatDetails).put(isAuthenticated, renameGroup).delete(isAuthenticated, deleteChats);
router.route('/startorgetchat').post(isAuthenticated, startOrGetChat);

module.exports = router;
