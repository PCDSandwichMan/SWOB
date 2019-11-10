const jwt = require('jsonwebtoken');
const config = require('./config');

exports.tokenExtract = req => {
  let errors = {};
  if (!req.headers.authorization) {
    errors.token = 'token is not valid';
    return Object.keys(errors).length > 0 ? { errors: errors } : tokenUser;
  }
  const token = req.headers.authorization;
  const tokenUser = jwt.decode(token.split(' ')[1], config.JWT_KEY);
  if (!tokenUser) {
    errors.token = 'token is not valid';
  }
  return Object.keys(errors).length > 0
    ? { errors: errors }
    : tokenUser.foundUser;
};
