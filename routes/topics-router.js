const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/controllers'); 

topicsRouter
.get('/', getTopics)
.post('/',postTopic);

module.exports = topicsRouter;