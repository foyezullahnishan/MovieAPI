// tests/director.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const Director = require('../models/Director');
const User = require('../models/User');

describe('Director API', () => {
  let adminToken;
  let userToken;
  
  beforeAll(async () => {
    // Clear users collection before tests
    await User.deleteMany({});
    await Director.deleteMany({});

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create regular user
    await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
    });

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    adminToken = adminLogin.body.token;

    // Login as user
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'user123',
      });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    // Close server and database connection after tests
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /api/directors', () => {
    it('should create a new director as admin', async () => {
      const res = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Steven Spielberg',
          birthYear: 1946,
          bio: 'American filmmaker, considered one of the founding pioneers of the New Hollywood era.',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('Steven Spielberg');
      expect(res.body.birthYear).toEqual(1946);
    });

    it('should not create a director as non-admin', async () => {
      const res = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Martin Scorsese',
          birthYear: 1942,
          bio: 'American film director, producer, screenwriter, and actor.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });
  });

  describe('GET /api/directors', () => {
    it('should get all directors', async () => {
      const res = await request(app)
        .get('/api/directors')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/directors/:id', () => {
    let directorId;

    beforeAll(async () => {
      // Get first director from list
      const res = await request(app)
        .get('/api/directors')
        .set('Authorization', `Bearer ${userToken}`);

      directorId = res.body[0]._id;
    });

    it('should get a director by ID', async () => {
      const res = await request(app)
        .get(`/api/directors/${directorId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toEqual(directorId);
    });

    it('should return 404 for non-existent director ID', async () => {
      const res = await request(app)
        .get(`/api/directors/5f7d5f3e9d3e2c001c5f5f5f`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Director not found');
    });
  });
});