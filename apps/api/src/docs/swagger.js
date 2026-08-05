import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRootDir = path.resolve(__dirname, '../../');

// Normalize glob paths with forward slashes for Windows compatibility
const formatPath = (relPath) => path.resolve(apiRootDir, relPath).replace(/\\/g, '/');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'A² ReVamp Gym Enterprise REST API',
      version: '1.0.0',
      description: 'Production REST API documentation for A² ReVamp Gym management system built with Clean Architecture, Prisma ORM, and Neon PostgreSQL.',
      contact: {
        name: 'A² Gym Engineering Team',
        email: 'support@a2gym.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    tags: [
      { name: 'Health Check', description: 'System health monitoring endpoints' },
      { name: 'Authentication', description: 'User registration, login, JWT token management, and password recovery' },
      { name: 'Users & Uploads', description: 'User profile management and avatar file uploads' },
      { name: 'Admin', description: 'Administrative analytics, user management, and system governance' },
      { name: 'Members & Dashboard', description: 'Member dashboard, personal profile, workouts, and attendance' },
      { name: 'Trainers', description: 'Trainer dashboard, assigned members, workout/diet plan management, and schedule' },
      { name: 'Plans & Memberships', description: 'Membership plans creation, listing, and subscription' },
      { name: 'Plans & Workouts', description: 'Workout plan management and exercise routines' },
      { name: 'Plans & Diets', description: 'Diet plan management and meal tracking' },
      { name: 'Attendance', description: 'Member check-in logging and attendance tracking' },
      { name: 'Payments', description: 'Invoice generation, payment logging, and status updates' },
      { name: 'Notifications', description: 'System notifications and read status updates' },
      { name: 'Inquiries & Support', description: 'Public lead inquiries and support ticket status' },
      { name: 'Classes & Schedule', description: 'Fitness class scheduling and member bookings' },
      { name: 'Admin & Coupons', description: 'Discount coupon code management' },
      { name: 'Blogs & Content', description: 'Public fitness blog articles and content management' },
      { name: 'AI Assistant', description: 'AI-powered workout generation, diet planning, progress prediction, and chat' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT bearer token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'd3b07384-d113-46a4-a939-51c0e0f2b3e4' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            avatar: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v123456/avatar.jpg' },
            role: { type: 'string', enum: ['MEMBER', 'TRAINER', 'ADMIN'], example: 'MEMBER' },
            emailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-03T15:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-03T15:00:00.000Z' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'StrongP@ss123' },
            phone: { type: 'string', example: '+1234567890' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'StrongP@ss123' }
          }
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            otp: { type: 'string', example: '123456' }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string', example: 'reset-token-uuid-12345' },
            newPassword: { type: 'string', format: 'password', example: 'NewStrongP@ss123' }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password', example: 'OldP@ss123' },
            newPassword: { type: 'string', format: 'password', example: 'NewStrongP@ss123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication successful.' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Membership: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0' },
            title: { type: 'string', example: 'Gold Elite Membership' },
            slug: { type: 'string', example: 'gold-elite-membership' },
            price: { type: 'number', example: 99.99 },
            durationMonths: { type: 'integer', example: 12 },
            features: { type: 'array', items: { type: 'string' }, example: ['Full Gym Access', 'Personal Trainer', 'Sauna'] },
            isPopular: { type: 'boolean', example: true }
          }
        },
        WorkoutPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'c1d2e3f4-g5h6-7890-1234-56789abcdef0' },
            title: { type: 'string', example: 'Hypertrophy Upper Body' },
            memberId: { type: 'string', format: 'uuid' },
            trainerId: { type: 'string', format: 'uuid' },
            dayOfWeek: { type: 'string', example: 'Monday' },
            notes: { type: 'string', example: 'Focus on progressive overload.' }
          }
        },
        DietPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0' },
            title: { type: 'string', example: 'Lean Mass Muscle Gain' },
            memberId: { type: 'string', format: 'uuid' },
            trainerId: { type: 'string', format: 'uuid' },
            dailyCaloriesTarget: { type: 'integer', example: 2800 },
            waterIntakeLiters: { type: 'number', example: 3.5 },
            instructions: { type: 'string', example: 'Eat every 3-4 hours.' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date-time' },
            checkInTime: { type: 'string', example: '08:30 AM' },
            checkOutTime: { type: 'string', example: '10:00 AM' },
            method: { type: 'string', example: 'QR_CODE' },
            status: { type: 'string', example: 'present' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            invoiceNumber: { type: 'string', example: 'INV-2026-001' },
            userId: { type: 'string', format: 'uuid' },
            planName: { type: 'string', example: 'Gold Elite Membership' },
            amount: { type: 'number', example: 99.99 },
            paymentMethod: { type: 'string', example: 'UPI' },
            status: { type: 'string', example: 'paid' },
            paidAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            recipientId: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Membership Expiring Soon' },
            message: { type: 'string', example: 'Your membership expires in 3 days. Renew now!' },
            type: { type: 'string', example: 'warning' },
            isRead: { type: 'boolean', example: false }
          }
        },
        Inquiry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Alice Smith' },
            phone: { type: 'string', example: '+1987654321' },
            message: { type: 'string', example: 'Interested in personal training rates.' },
            status: { type: 'string', example: 'PENDING' }
          }
        },
        GymClass: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'HIIT Cardio Fusion' },
            trainer: { type: 'string', example: 'Coach Mike' },
            time: { type: 'string', example: '07:00 AM' },
            duration: { type: 'string', example: '45 mins' },
            capacity: { type: 'integer', example: 20 },
            enrolled: { type: 'integer', example: 12 }
          }
        },
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: 'SUMMER20' },
            discountPercent: { type: 'number', example: 20 },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        Blog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Top 5 Nutrition Rules for Muscle Gain' },
            content: { type: 'string', example: 'Protein intake and caloric surplus are essential...' },
            author: { type: 'string', example: 'Dr. Fitness' },
            image: { type: 'string', example: 'https://example.com/blog.jpg' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully.' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Invalid credentials or resource not found.' },
            statusCode: { type: 'integer', example: 400 }
          }
        }
      }
    }
  },
  apis: [
    formatPath('src/routes/*.js'),
    formatPath('src/routes/**/*.js'),
    formatPath('src/controllers/*.js'),
    formatPath('src/controllers/**/*.js'),
    formatPath('src/docs/*.js'),
    formatPath('server.js'),
    './src/routes/**/*.js',
    './src/controllers/**/*.js',
    './src/docs/**/*.js',
    './server.js'
  ]
};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app) => {
  const pathsObj = swaggerSpec.paths || {};
  const pathCount = Object.keys(pathsObj).length;
  console.log(`[SWAGGER] OpenAPI spec loaded. Total operations/paths indexed: ${pathCount}`);

  // Serve Swagger UI at both /api/docs and /api-docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve JSON spec at both /api/docs.json and /api-docs.json
  const sendJsonSpec = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  };
  app.get('/api/docs.json', sendJsonSpec);
  app.get('/api-docs.json', sendJsonSpec);
};

export default swaggerSpec;
