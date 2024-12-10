const express = require('express');
const { createPost, getAllPostWithUsers, getUserAllPosts, likeAndUnlikePost } = require("../controller/postController");
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route("/createPost").post(isAuthenticated, createPost);
router.route("/getAllPostWithUsers").get(getAllPostWithUsers);
router.route("/getUserAllPosts/:id").get(getUserAllPosts);
router.route('/likeAndUnlikePost/:id').get(isAuthenticated, likeAndUnlikePost)




module.exports = router;