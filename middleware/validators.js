const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('VALIDATION_FAILURE', {
      path: req.originalUrl,
      method: req.method,
      errors: errors.array().map(e => e.msg)
    });
    return res.status(400).json({ status: false, errors: errors.array() });
  }
  next();
};

const signupValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error('Must provide either username or email to login');
    }
    return true;
  }),
  validate
];

const employeeValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('date_of_joining').isISO8601().toDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  validate
];

const employeeUpdateValidation = [
  param('eid').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid employee ID format');
    }
    return true;
  }),
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('date_of_joining').optional().isISO8601().toDate().withMessage('Valid date required'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  validate
];

const employeeIdParamValidation = [
  param('eid').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid employee ID format');
    }
    return true;
  }),
  validate
];

const employeeIdQueryValidation = [
  query('eid').custom((value) => {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Valid eid query parameter is required');
    }
    return true;
  }),
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  employeeValidation,
  employeeUpdateValidation,
  employeeIdParamValidation,
  employeeIdQueryValidation
};
