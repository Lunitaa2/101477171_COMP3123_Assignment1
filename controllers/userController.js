const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn('SIGNUP_CONFLICT', { username, email });
      return res.status(409).json({ status: false, message: 'Username or email already exists.' });
    }

    const user = new User({ username, email, password });
    await user.save();

    logger.info('USER_REGISTERED', { userId: user._id, username: user.username });
    return res.status(201).json({ message: 'User created successfully.', user_id: user._id });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const query = email ? { email } : { username };
    const user = await User.findOne(query);

    if (!user) {
      logger.warn('LOGIN_FAILED_USER_NOT_FOUND', { identifier: email || username });
      return res.status(401).json({ status: false, message: 'Invalid username/email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('LOGIN_FAILED_WRONG_PASSWORD', { identifier: email || username });
      return res.status(401).json({ status: false, message: 'Invalid username/email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    logger.info('USER_LOGIN_SUCCESS', { userId: user._id, username: user.username });
    return res.status(200).json({ message: 'Login successful.', jwt: token });
  } catch (error) {
    next(error);
  }
};
