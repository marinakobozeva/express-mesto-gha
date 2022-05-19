const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BadRequestError,
  NotFoundError,
} = require('../utils/errors');
const {
  UNEXPECTED_ERROR,
  UNAUTHORIZED_ERROR,
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  SECRET_KEY,
} = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      res.status(UNEXPECTED_ERROR).send({ message: err.message });
    });
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
      res.send(user);
    })
    .catch((err) => {
      let prettyErr = err;
      if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные при создании пользователя');
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

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findOneAndUpdate({ _id: userId }, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user === null) {
        res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному _id (${userId}) не найден` });
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные при обновлении пользователя' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => {
      if (user === null) {
        res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному _id (${userId}) не найден` });
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.login = (req, res) => {
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
      res.status(UNAUTHORIZED_ERROR).send({ message: err.message });
    });
};

module.exports.getUserInfo = (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  User.findById(_id)
    .then((user) => {
      if (user === null) {
        res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному _id (${_id}) не найден` });
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Передан некорректный формат id' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};
