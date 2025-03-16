// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');

describe('Auth API', () => {
  beforeAll(async () => {
    // Clear users collection before tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close server and database connection after tests
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('_id');
      expect(res.body.username).toEqual('testuser');
      expect(res.body.email).toEqual('test@example.com');
      expect(res.body.role).toEqual('user');
    });

    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toEqual('testuser');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
      // Login to get token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      token = res.body.token;
    });

    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual('testuser');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Not authorized, no token');
    });
  });
});