const express = require('express');
const {registerUser,getUsers,deleteUser,getSingleUser} = require('../controller/userController');
const router= express.Router();


router.route('/register').post(registerUser);
router.route('/getUser').get(getUsers);
router.route('/deleteUser/:id').delete(deleteUser);
router.route('/getSingleUser/:id').get(getSingleUser);

module.exports = router;