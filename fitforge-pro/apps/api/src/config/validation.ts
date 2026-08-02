import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Required in production
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  COOKIE_SECRET: Joi.string().min(32).required(),

  // Optional with defaults
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: Joi.string().optional(),
  RAZORPAY_KEY_SECRET: Joi.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),

  // Email
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().default('FitForge Pro <noreply@fitforgepro.in>'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // Cookie
  COOKIE_DOMAIN: Joi.string().default('localhost'),
});
