const express = require("express");
const { SendMessage, getMessages, getSideBarChatUser, deleteMessages, editMessages } = require("../controller/messageController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/sendMessage/:id").post(isAuthenticated, SendMessage);
router.route("/getMessages/:id").get(isAuthenticated, getMessages);
router.route("/getallsidebarcharuser").get(isAuthenticated, getSideBarChatUser);
router.route('/deleteMessage').delete(isAuthenticated, deleteMessages);
router.route('editMessage').post(isAuthenticated, editMessages)



module.exports = router;