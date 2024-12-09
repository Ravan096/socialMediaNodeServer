const express = require('express');
const {registerUser,getUsers,deleteUser,getSingleUser,userLogin} = require('../controller/userController');
const router= express.Router();


router.route('/register').post(registerUser);
router.route('/getUser').get(getUsers);
router.route('/deleteUser/:id').delete(deleteUser);
router.route('/getSingleUser/:id').get(getSingleUser);
router.route('/userLogin').get(userLogin);

module.exports = router;