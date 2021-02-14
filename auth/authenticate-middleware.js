const jwt = require('jsonwebtoken');

const secrets = require('./secrets');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  const secret = secrets.jwtSecret;

  if (token) {
    jwt.verify(token, secret, error => {
      if (error) {
        res.status(401).json({ message: 'Incorrect credentials.' });
      } else {
        next();
      }
    });
  } else {
    res.status(400).json({ message: 'Please provide credentials.' });
  }
};
