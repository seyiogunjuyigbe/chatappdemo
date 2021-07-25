const router = require('express').Router();
const chatRoutes = require('./chat');

router.use('/chat', chatRoutes);
module.exports = router;