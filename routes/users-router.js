const usersRouter = require('express').Router();
const { getUsers } = require('../controllers/controllers');
const { getUserByUsername } = require('../controllers/controllers');

usersRouter
  .route('/') 
  .get(getUsers);

usersRouter
  .route('/:username')
  .get(getUserByUsername);

module.exports = usersRouter;