const usersRouter = require('express').Router();
const { getUsers } = require('../controllers/controllers');

usersRouter
  .route('/') 
  .get(getUsers);

module.exports = usersRouter;