const PostModel = require('../model/postModel');
const UserModel = require('../model/userModel');
const dataUri = require('../utils/dataUri');
const cloudinary = require('cloudinary');


exports.createPost = async (req, res, next) => {
    try {
        const { title, content, Location } = req.body;
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required"
            })
        }

        const imageuri = dataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(imageuri.content, {
            folder: "Post"
        });

        const post = await PostModel.create({
            title,
            content,
            Location,
            userId,
            image: {
                public_Id: cloud.public_id,
                url: cloud.secure_url
            }
        });

        const user = await UserModel.findById(req.user._id);
        user.posts.push(post._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: "post created successfully",
            post
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error
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

exports.getPostOfFollowing = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id);
        const posts = await PostModel.find({
            userId: {
                $in: user.following
            }
        }).populate("userId", "FirstName LastName Email Avatar _id").sort({ CreatedAt: -1 })
        res.status(200).json({
            success: true,
            posts,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.commentOnPost = async (req, res, next) => {
    try {
        const user = req.user._id;
        const post = await PostModel.findById(req.params.id);
        const { comment } = req.body;
        let commentIndex = -1;
        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        })

        if (commentIndex !== -1) {
            post.comments[commentIndex].comment = comment;
            await post.save();;
            res.status(200).json({
                success: true,
                message: "comment updated"
            })
        } else {
            post.comments.push({
                user: user,
                comment: comment
            })
            await post.save();

            res.status(200).json({
                success: true,
                message: "comment successfully"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.savePost = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        if (loggedInUser.savedPost.includes(post._id)) {
            const index = loggedInUser.savedPost.indexOf(post._id);
            loggedInUser.savedPost.splice(index, 1);
            await loggedInUser.save();
            res.status(201).json({
                success: true,
                message: "Post Unsaved"
            })
        } else {
            loggedInUser.savedPost.push(post._id);
            await loggedInUser.save();
            res.status(201).json({
                success: true,
                message: "Post Saved"
            })
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


// exports.commentOnPost = async (req, res) => {
//     try {
//         const { comment, parentId } = req.body;
//         const userId = req.user._id;
//         if (parentId) {
//             const parentComment = await Comment.findById(parentId);
//             if (!parentComment) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Parent comment not found"
//                 });
//             }
//             const reply = await Comment.create({
//                 user: userId,
//                 comment
//             });
//             parentComment.replies.push(reply._id);
//             await parentComment.save();

//             res.status(201).json({
//                 success: true,
//                 message: "Reply added successfully",
//                 reply
//             });
//         } else {
//             const post = await PostModel.findById(req.params.id);
//             if (!post) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Post not found"
//                 });
//             }

//             const newComment = await Comment.create({
//                 user: userId,
//                 comment
//             });

//             post.comments.push(newComment._id);
//             await post.save();

//             res.status(201).json({
//                 success: true,
//                 message: "Comment added successfully",
//                 newComment
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };



// exports.getPostWithComments = async (req, res) => {
//     try {
//         const post = await PostModel.findById(req.params.id)
//             .populate({
//                 path: "comments",
//                 populate: {
//                     path: "replies",
//                     model: "Comment",
//                     populate: {
//                         path: "replies",
//                         model: "Comment"
//                     }
//                 }
//             })
//             .exec();

//         if (!post) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Post not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             post
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
