const express = require('express');
const {createPost,getAllPostWithUsers,getUserAllPosts} = require("../controller/postController")
const router= express.Router();

router.route("/createPost").post(createPost);
router.route("/getAllPostWithUsers").get(getAllPostWithUsers);
router.route("/getUserAllPosts/:id").get(getUserAllPosts);




module.exports = router;