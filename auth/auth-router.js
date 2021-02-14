const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('./users-model');
const secrets = require('./secrets');

router.post('/register', async (req, res) => {
  let user = req.body;
  const rounds = process.env.HASH_ROUNDS || 14;
  const hash = bcrypt.hashSync(user.password, rounds);
  user.password = hash;

  try {
    const savedUser = await Users.add(user);
    res.status(201).json(savedUser);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await Users.findBy({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);
      res.status(200).json({ message: 'Logged in.', token });
    } else {
      res.status(401).json({ message: 'Incorrect credientials.' });
    }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

const generateToken = user => {
  const payload = {
    userId: user.id,
    username: user.username,
  };
  const secret = secrets.jwtSecret;
  const options = {
    expiresIn: '2d',
  };
  return jwt.sign(payload, secret, options);
};

module.exports = router;
