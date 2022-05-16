const jwt = require('jsonwebtoken');
const { UNAUTHORIZED_ERROR, SECRET_KEY } = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(UNAUTHORIZED_ERROR).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  const payload = jwt.verify(token, SECRET_KEY);

  if (!payload) {
    res.status(UNAUTHORIZED_ERROR).send({ message: 'Необохдима авторизация' });
  }

  req.user = payload;
  next();
};
