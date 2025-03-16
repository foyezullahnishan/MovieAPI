// tests/actor.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const Actor = require('../models/Actor');
const User = require('../models/User');
const Movie = require('../models/Movie');

describe('Actor API', () => {
  let adminToken;
  let userToken;
  
  beforeAll(async () => {
    // Clear users and actors collections before tests
    await User.deleteMany({});
    await Actor.deleteMany({});

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

  describe('POST /api/actors', () => {
    it('should create a new actor as admin', async () => {
      const res = await request(app)
        .post('/api/actors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tom Hanks',
          birthYear: 1956,
          bio: 'American actor and filmmaker known for both comedic and dramatic roles.',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('Tom Hanks');
      expect(res.body.birthYear).toEqual(1956);
    });

    it('should not create an actor as non-admin', async () => {
      const res = await request(app)
        .post('/api/actors')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Meryl Streep',
          birthYear: 1949,
          bio: 'American actress often described as the best actress of her generation.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });
  });

  describe('GET /api/actors', () => {
    it('should get all actors', async () => {
      const res = await request(app)
        .get('/api/actors')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/actors/:id', () => {
    let actorId;

    beforeAll(async () => {
      // Get first actor from list
      const res = await request(app)
        .get('/api/actors')
        .set('Authorization', `Bearer ${userToken}`);

      actorId = res.body[0]._id;
    });

    it('should get an actor by ID', async () => {
      const res = await request(app)
        .get(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toEqual(actorId);
    });

    it('should return 404 for non-existent actor ID', async () => {
      const res = await request(app)
        .get(`/api/actors/5f7d5f3e9d3e2c001c5f5f5f`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Actor not found');
    });
  });

  describe('PUT /api/actors/:id', () => {
    let actorId;

    beforeAll(async () => {
      // Get first actor from list
      const res = await request(app)
        .get('/api/actors')
        .set('Authorization', `Bearer ${userToken}`);

      actorId = res.body[0]._id;
    });

    it('should update an actor as admin', async () => {
      const res = await request(app)
        .put(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bio: 'Updated biography for this famous actor.',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.bio).toEqual('Updated biography for this famous actor.');
    });

    it('should not update an actor as non-admin', async () => {
      const res = await request(app)
        .put(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'Another update attempt.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });
  });

  describe('DELETE /api/actors/:id', () => {
    let actorId;

    beforeAll(async () => {
      // Create a new actor to delete
      const res = await request(app)
        .post('/api/actors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Actor To Delete',
          birthYear: 1980,
          bio: 'This actor will be deleted in tests.',
        });

      actorId = res.body._id;
    });

    it('should not delete an actor as non-admin', async () => {
      const res = await request(app)
        .delete(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });

    it('should delete an actor as admin', async () => {
      const res = await request(app)
        .delete(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Actor removed');

      // Verify actor is deleted
      const checkRes = await request(app)
        .get(`/api/actors/${actorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkRes.statusCode).toEqual(404);
    });
  });

  describe('GET /api/actors/:id/movies', () => {
    let actorId;
    let directorId;
    let genreId;

    beforeAll(async () => {
      // Get first actor
      const actorRes = await request(app)
        .get('/api/actors')
        .set('Authorization', `Bearer ${userToken}`);
      actorId = actorRes.body[0]._id;
      
      // Create director
      const directorRes = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Robert Zemeckis',
          birthYear: 1952,
          bio: 'American film director, producer, and screenwriter.',
        });
      directorId = directorRes.body._id;
      
      // Create genre
      const genreRes = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Drama',
          description: 'Drama film is a genre that relies on the emotional and relational development of realistic characters.',
        });
      genreId = genreRes.body._id;
      
      // Create movie with actor
      await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Forrest Gump',
          releaseYear: 1994,
          plot: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
          runtime: 142,
          director: directorId,
          actors: [actorId],
          genres: [genreId],
          poster: 'forrest-gump.jpg',
        });
    });

    it('should get movies by actor', async () => {
      const res = await request(app)
        .get(`/api/actors/${actorId}/movies`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toEqual('Forrest Gump');
    });

    it('should return 404 for non-existent actor ID', async () => {
      const res = await request(app)
        .get(`/api/actors/5f7d5f3e9d3e2c001c5f5f5f/movies`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Actor not found');
    });
  });
});