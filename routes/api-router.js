const apiRouter = require('express').Router();
const { getApi } = require('../controllers/controllers');
const topicsRouter = require('./topics-router');

apiRouter.get('/', getApi);
apiRouter.use('/topics', topicsRouter);

module.exports = apiRouter;