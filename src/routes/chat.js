const router = require('express').Router();
const chatController = require('../controllers/chat')
const auth = require('../middlewares/auth')
router.get('/', chatController.renderChatPage)

module.exports = router;