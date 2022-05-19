const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');
const { SECRET_KEY } = require('../utils/constants');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        name: user.name, about: user.about, avatar: user.avatar, email: user.email, _id: user._id,
      });
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные при создании пользователя');
      } else if (err.code === 11000) {
        prettyErr = new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      next(prettyErr);
    });
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь по указанному _id (${userId}) не найден`);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'CastError') {
        prettyErr = new BadRequestError('Передан некорректный формат id');
      }
      next(prettyErr);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findOneAndUpdate({ _id: userId }, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь по указанному _id (${userId}) не найден`);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные при обновлении пользователя');
      }
      next(prettyErr);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь по указанному _id (${userId}) не найден`);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
      next(prettyErr);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        SECRET_KEY,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUserInfo = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь по указанному _id (${_id}) не найден`);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'CastError') {
        prettyErr = new BadRequestError('Передан некорректный формат id');
      }
      next(prettyErr);
    });
};
