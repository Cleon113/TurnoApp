import { body } from 'express-validator';

export const registerValidator = [
  body('orgName')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ max: 100 }).withMessage('Organization name must be under 100 characters'),

  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be under 100 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name must be under 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];