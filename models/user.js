const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { UnauthorizedError } = require('../utils/errors');

const userSchema = new mongoose.Schema({
  name: {
    required: false,
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    required: false,
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    validate: {
      validator(link) {
        return validator.isURL(link);
      },
      message: 'Введён некорректный URL',
    },
    required: false,
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: '',
    },
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function fn({ email, password }) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Передан неверный логин или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Передан неверный логин или пароль');
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
