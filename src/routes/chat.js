const router = require('express').Router();
const chatController = require('../controllers/chat')
const auth = require('../middlewares/auth')
router.get('/', chatController.renderChatPage)
router.get('/chat', chatController.generateRoom)
router.get('/chat/:roomId', chatController.getRoom)
module.exports = router;