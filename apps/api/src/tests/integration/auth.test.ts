import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    // Seed MEMBER role
    await prisma.role.upsert({
      where: { name: 'MEMBER' },
      update: {},
      create: {
        name: 'MEMBER',
        description: 'Default member role'
      }
    });
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('Should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        phone: '1234567890'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('Should prevent duplicate registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User 2',
        email: testEmail,
        password: testPassword,
        phone: '0987654321'
      });

    expect(res.status).toBe(409); // Conflict
    expect(res.body.status).toBe('fail');
  });

  it('Should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.accessToken).toBeDefined();
    
    // Check if refresh token is in cookies
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((cookie: string) => cookie.includes('refreshToken='))).toBe(true);
  });

  it('Should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });
});
