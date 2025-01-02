const express = require('express');
const { createPost, getAllPostWithUsers, getUserAllPosts, likeAndUnlikePost, getPostOfFollowing, commentOnPost, savePost } = require("../controller/postController");
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route("/createPost").post(isAuthenticated, createPost);
router.route("/getAllPostWithUsers").get(getAllPostWithUsers);
router.route("/getUserAllPosts/:id").get(getUserAllPosts);
router.route('/likeAndUnlikePost/:id').get(isAuthenticated, likeAndUnlikePost);
router.route("/getfollowinguserposts").get(isAuthenticated, getPostOfFollowing);
router.route("/commentonpost/:id").get(isAuthenticated, commentOnPost)
router.route("/savePost/:id").get(isAuthenticated, savePost)




module.exports = router;