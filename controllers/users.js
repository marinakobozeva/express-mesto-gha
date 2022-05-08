const User = require('../models/user');
const { UNEXPECTED_ERROR, NOT_FOUND_ERROR, BAD_REQUEST_ERROR } = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      res.status(UNEXPECTED_ERROR).send({ message: err.message });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (user === null) {
        res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному _id (${userId}) не найден` });
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      res.status(UNEXPECTED_ERROR).send({ message: err.message });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
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
