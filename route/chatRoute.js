const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { creatGroupChat, getMyChats, addMembers, removeMembers, leaveGroup} = require('../controller/chatController');

const router = express.Router();

router.route('/newgroup').post(isAuthenticated, creatGroupChat);
router.route('/mychats').get(isAuthenticated, getMyChats);
router.route('/addmembers').get(isAuthenticated, addMembers);
router.route('/removemember').get(isAuthenticated, removeMembers);
router.route('/leavegroup/:id').delete(isAuthenticated, leaveGroup);

module.exports = router;
