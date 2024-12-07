const UsersModel = require('../model/userModel');

exports.registerUser = async (req, res, next) => {
    try {

        const { FirstName, LastName, Email, Password } = req.body;

        if (!FirstName || !LastName || !Email || !Password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: firstName, lastName, Email, Password.",
            });
        }
        const newUser = await UsersModel.create({
            FirstName,
            LastName,
            Email,
            Password
        })
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            newUser
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the user. Please try again later.",
            error: error.message,
        });
    }
}


exports.getUsers = async (req, res, next) => {
    try {
        const allUsers = await UsersModel.find();
        res.status(201).json({
            success: true,
            allUsers
        })
    } catch (error) {
        console.error("Error getting all users", error);
        res.status(500).json({
            success: false,
            message: "Error while getting all users",
            error:error.message
        })
    }
}

exports.deleteUser = async (req,res,next)=>{
    try {
        const currentUser= await UsersModel.findById(req.parmas.id);
        if(!currentUser){
            return res.status(200).json({
                success:false,
                message:`User is not found with ${req.params.id}`
            })
        }
        await currentUser.deleteOne();
        res.status(200).json({
            success:true,
            message:"user is deleted successfully",
            currentUser
        })

    } catch (error) {
        console.log("Error on deleting User", error);
        res.status(500).json({
            success:false,
            message:`User is not delete `,
            error:error.message
        })
    }
}

exports.getSingleUser = async (req,res,next)=>{
    try {
       const singleUser= await UsersModel.findById(req.params.id) ;
       if(!singleUser){
        return res.status(404).json({
            success:false,
            message:`User not found with this id ${req.params.id}`
        })
    }
    res.status(200).json({
        success:true,
        singleUser
    })
    } catch (error) {
        console.log("Error while getting single user", error),
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}