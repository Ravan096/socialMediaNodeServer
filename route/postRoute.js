const express = require('express');
const { createPost, getAllPostWithUsers, getUserAllPosts, likeAndUnlikePost, getPostOfFollowing, commentOnPost, savePost, getPostById } = require("../controller/postController");
// const { isAuthenticated } = require('../middleware/auth');
const { singleUpload } = require("../middleware/multer")
const router = express.Router();

router.route("/createPost").post( singleUpload, createPost);
router.route("/getAllPostWithUsers").get(getAllPostWithUsers);
router.route("/getUserAllPosts/:id").get(getUserAllPosts);
router.route('/likeAndUnlikePost/:id').get( likeAndUnlikePost);
router.route("/getfollowinguserposts").get( getPostOfFollowing);
router.route("/commentonpost/:id").get( commentOnPost)
router.route("/savePost/:id").get( savePost)
router.route("/singlepost/:id").get( getPostById)




module.exports = router;