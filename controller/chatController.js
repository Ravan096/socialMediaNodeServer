const chatModel = require('../model/chatModel');
const UsersModel = require('../model/userModel');

exports.createChat = async (req,res,next)=>{
    try {
        const {name,particpant,message, receiverId} = req.body;
        const receiverUser = await UsersModel.findById({_id:receiverId});
        await chatModel.create({
            Name:name,
            
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}