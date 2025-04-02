const jwt = require('jsonwebtoken');
const UserModel = require("../model/userModel");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid",
            });
        }

        const token = authHeader.split(' ')[1];

        const secretKey = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secretKey);
        const user = await UserModel.findById(decoded._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}


exports.socketAuth = async (err, socket, next) => {
    try {
        if (err) return next(err);
        const authHeader = socket.handshake.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid",
            });
        }

        const token = authHeader.split(' ')[1];

        const secretKey = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secretKey);
        const user = await UserModel.findById(decoded._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        socket.user = user;
        next();
    } catch (error) {
        return next(new Error(error.message))
    }
}




// const jwt = require('jsonwebtoken');
// const UsersModel = require('../models/UsersModel'); // Adjust the path to your user model

// const authenticateUser = async (req, res, next) => {
//     try {
//         // Get token from Authorization header
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token is missing or invalid",
//             });
//         }

//         const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
//         const secretKey = process.env.JWT_SECRET; // Replace with your secret key

//         // Verify token
//         const decoded = jwt.verify(token, secretKey);

//         // Find the user from the database
//         const user = await UsersModel.findById(decoded.id);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // Attach user to req.user
//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({
//             success: false,
//             message: "Invalid or expired token",
//         });
//     }
// };

// module.exports = authenticateUser;

// exports.isAuthenticated = async (req, res, next) => {
//     try {
//         const { token } = req.cookies;
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Login first"
//             })
//         }
//         const decode = await jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await UserModel.findById(decode._id);
//         next();
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
