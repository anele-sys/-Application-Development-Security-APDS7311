const express = require('express');
const request = require('supertest');
const authRoutes = require('../src/routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('HustleHub authentication API', () => {
  test('reports authentication route status', async () => {
    const response = await request(app).get('/api/auth/status');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Authentication routes are ready');
    expect(response.body.roles).toEqual(['client', 'freelancer', 'admin']);
  });

  test('rejects registration without a name', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'Valid1234' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Name is required');
  });

  test('rejects registration without an email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', password: 'Valid1234' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is required');
  });

  test('rejects registration without a password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'user@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Password is required');
  });

  test('rejects registration with an invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'not-an-email', password: 'Valid1234' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('A valid email address is required');
  });

  test('rejects registration with a weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'user@example.com', password: 'weakpass' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Password must be at least 8 characters/);
  });

  test('prevents public admin registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'Valid1234',
        role: 'admin'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid registration role');
  });

  test('rejects login without an email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Valid1234' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is required');
  });

  test('rejects login without a password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Password is required');
  });

  test('rejects login with an invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Valid1234' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('A valid email address is required');
  });
});
