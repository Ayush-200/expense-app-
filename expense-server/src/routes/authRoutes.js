const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginValidators } = require('../validators/authValidators');

const router = express.Router();

router.post('/login', loginValidators, authController.login);
router.post('/register', authController.register);
router.post('/is-user-logged-in', authController.isUserLoggedIn);
router.post('/logout', authController.logout);
router.post('/google-auth', authController.googleSso);
router.get('/admin/users', authMiddleware.protect, authController.getAllUsers);
router.get('/admin/groups', authMiddleware.protect, authController.getAllGroups);

module.exports = router; 