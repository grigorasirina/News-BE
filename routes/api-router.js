const apiRouter = require("express").Router();
const { getApi } = require("../controllers/controllers");
const topicsRouter = require("./topics-router");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const usersRouter = require('./users-router');

apiRouter.get("/", getApi);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use('/comments', commentsRouter); 

apiRouter.use('/users', usersRouter); 

module.exports = apiRouter;
