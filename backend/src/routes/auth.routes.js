const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidator, authController.register);

// POST /api/auth/login
router.post('/login', loginValidator, authController.login);

// GET /api/auth/me – requires authentication
router.get('/me', verifyToken, authController.me);

module.exports = router;
