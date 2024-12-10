const PostModel = require('../model/postModel');
const UserModel = require('../model/userModel')


exports.createPost = async (req, res, next) => {
    try {
        const { title, content, userId } = req.body;
        const post = await PostModel.create({
            title,
            content,
            userId
        });
        const user = await UserModel.findById(userId);
        user.posts.push(post._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: "post created successfully",
            post
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getAllPostWithUsers = async (req, res, next) => {
    try {
        const allposts = await PostModel.find().populate("userId", "FirstName LastName Email");
        res.status(200).json({
            success: true,
            allposts
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getUserAllPosts = async (req, res, next) => {
    try {
        const singleUserPost = await UserModel.findById(req.params.id).populate("posts");
        if (!singleUserPost) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        res.status(200).json({
            success: true,
            singleUserPost
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.likeAndUnlikePost = async (req, res, next) => {
    try {
        const loggedInUser = req.user._id;
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        if (post.like.includes(loggedInUser)) {
            const index = post.like.indexOf(loggedInUser);
            post.like.splice(index, 1);
            await post.save();
            res.status(201).json({
                success: true,
                message: "Post Unliked"
            })
        } else {
            post.like.push(loggedInUser);
            await post.save();
            res.status(201).json({
                success: true,
                message: "Post liked"
            })
        }

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}