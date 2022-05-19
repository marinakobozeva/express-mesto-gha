const usersRouter = require('express').Router();
const {
  getUsers,
  getUser,
  getUserInfo,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

usersRouter.get('/', getUsers);
usersRouter.get('/me', getUserInfo);
usersRouter.get('/:userId', getUser);

usersRouter.patch('/me', updateUser);
usersRouter.patch('/me/avatar', updateAvatar);

module.exports = usersRouter;
