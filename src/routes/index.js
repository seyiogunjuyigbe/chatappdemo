const router = require('express').Router();
const authRoutes = require('./auth')
const chatRoutes = require('./chat');

router.use('/auth', authRoutes)
router.use('/', chatRoutes);
module.exports = router;