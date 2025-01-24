const express = require('express');
const { registerUser, getUsers, deleteUser, getSingleUser, userLogin, followAndfollwing, logoutUser, changePassword, forgetPassword, resetPassword, updateUser, getMe } = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();
const passport = require('passport')


router.route('/register').post(registerUser);
router.route('/getUser').get(getUsers);
router.route('/updateUser').post(isAuthenticated, updateUser);
router.route('/deleteUser/:id').delete(deleteUser);
router.route('/getSingleUser/:id').get(getSingleUser);
router.route('/userLogin').post(userLogin);
router.route("/follow&unfollow/:id").get(isAuthenticated, followAndfollwing);
router.route("/logout").get(logoutUser);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/forgetPassword").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route('/me').get(isAuthenticated, getMe);
router.get('/googlelogin', passport.authenticate('google',
    { scope: ['profile', 'email'] }));

router.get('/githublogin', passport.authenticate('github',
    { scope: ['user:email'] }))

router.get('/login',passport.authenticate('google',{
    failureRedirect:'http://localhost:4000',
    successRedirect:'http://localhost:4000'
}))
router.get('login',passport.authenticate('github',{
    failureRedirect:"http://localhost:4000",
    successRedirect:"http://localhost:4000"
}))

module.exports = router;