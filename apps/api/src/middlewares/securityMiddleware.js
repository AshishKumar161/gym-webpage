import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

export const configureSecurityMiddlewares = (app) => {
  // Helmet HTTP security headers
  app.use(helmet());

  // CORS configuration
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Prevent NoSQL Query Injection attacks
  app.use(mongoSanitize());
};
