const express = require('express');
const { registerUser, getUsers, deleteUser, getSingleUser, userLogin,followAndfollwing, logoutUser } = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();


router.route('/register').post(registerUser);
router.route('/getUser').get(getUsers);
router.route('/deleteUser/:id').delete(deleteUser);
router.route('/getSingleUser/:id').get(getSingleUser);
router.route('/userLogin').get(userLogin);
router.route("/follow&unfollow/:id").get(isAuthenticated,followAndfollwing);
router.route("/logout").get(logoutUser);

module.exports = router;