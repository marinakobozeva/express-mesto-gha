const jwt = require('jsonwebtoken');
const { FOBIDDEN_ERROR, SECRET_KEY } = require('../utils/constants');

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(FOBIDDEN_ERROR).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(FOBIDDEN_ERROR).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  next();
};
