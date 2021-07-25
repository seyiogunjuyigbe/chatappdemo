const router = require('express').Router();
const chatController = require('../controllers/chat')

router.get('/', chatController.renderChatPage)

module.exports = router;