const express = require('express');
const { registerUser, getUsers, deleteUser, getSingleUser, userLogin, followAndfollwing, logoutUser, changePassword, forgetPassword, resetPassword, updateUser } = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();


router.route('/register').post(registerUser);
router.route('/getUser').get(getUsers);
router.route('/update-user').post(isAuthenticated, updateUser);
router.route('/deleteUser/:id').delete(deleteUser);
router.route('/getSingleUser/:id').get(getSingleUser);
router.route('/userLogin').post(userLogin);
router.route("/follow&unfollow/:id").get(isAuthenticated, followAndfollwing);
router.route("/logout").get(logoutUser);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/forgetPassword").get(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;