const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/controllers'); 

topicsRouter.get('/', getTopics);

module.exports = topicsRouter;