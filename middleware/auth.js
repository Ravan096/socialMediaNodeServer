const jwt = require('jsonwebtoken');
const UserModel = require("../model/userModel");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Login first"
            })
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findById(decode._id);
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}