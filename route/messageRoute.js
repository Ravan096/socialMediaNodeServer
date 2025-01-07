const express = require("express");
const { SendMessage, getMessages, getSideBarChatUser } = require("../controller/messageController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/sendMessage/:id").post(isAuthenticated, SendMessage);
router.route("/getMessages/:id").get(isAuthenticated,getMessages);
router.route("/getallsidebarcharuser").get(isAuthenticated, getSideBarChatUser)



module.exports = router;