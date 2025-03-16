// tests/genre.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const Genre = require('../models/Genre');
const User = require('../models/User');
const Movie = require('../models/Movie');

describe('Genre API', () => {
  let adminToken;
  let userToken;
  
  beforeAll(async () => {
    // Clear users and genres collections before tests
    await User.deleteMany({});
    await Genre.deleteMany({});

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

  describe('POST /api/genres', () => {
    it('should create a new genre as admin', async () => {
      const res = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Action',
          description: 'Action film is a genre that emphasizes elaborate physical action sequences.',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('Action');
      expect(res.body.description).toContain('physical action sequences');
    });

    it('should not create a genre as non-admin', async () => {
      const res = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Horror',
          description: 'Horror film is a genre that aims to create a sense of fear, panic, alarm, and dread.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });

    it('should not create a genre with duplicate name', async () => {
      const res = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Action',
          description: 'Duplicate genre name test.',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Genre already exists');
    });
  });

  describe('GET /api/genres', () => {
    it('should get all genres', async () => {
      const res = await request(app)
        .get('/api/genres')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/genres/:id', () => {
    let genreId;

    beforeAll(async () => {
      // Get first genre from list
      const res = await request(app)
        .get('/api/genres')
        .set('Authorization', `Bearer ${userToken}`);

      genreId = res.body[0]._id;
    });

    it('should get a genre by ID', async () => {
      const res = await request(app)
        .get(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toEqual(genreId);
    });

    it('should return 404 for non-existent genre ID', async () => {
      const res = await request(app)
        .get(`/api/genres/5f7d5f3e9d3e2c001c5f5f5f`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Genre not found');
    });
  });

  describe('PUT /api/genres/:id', () => {
    let genreId;

    beforeAll(async () => {
      // Get first genre from list
      const res = await request(app)
        .get('/api/genres')
        .set('Authorization', `Bearer ${userToken}`);

      genreId = res.body[0]._id;
    });

    it('should update a genre as admin', async () => {
      const res = await request(app)
        .put(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated description for the action genre.',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.description).toEqual('Updated description for the action genre.');
    });

    it('should not update a genre as non-admin', async () => {
      const res = await request(app)
        .put(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Another update attempt.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });

    it('should not update a genre with duplicate name', async () => {
      // First create another genre
      await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Comedy',
          description: 'Comedy film is a genre intended to provoke laughter.',
        });
      
      // Try to update first genre with the name of the second
      const res = await request(app)
        .put(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Comedy',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Genre with that name already exists');
    });
  });

  describe('DELETE /api/genres/:id', () => {
    let genreId;

    beforeAll(async () => {
      // Create a new genre to delete
      const res = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Genre To Delete',
          description: 'This genre will be deleted in tests.',
        });

      genreId = res.body._id;
    });

    it('should not delete a genre as non-admin', async () => {
      const res = await request(app)
        .delete(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });

    it('should delete a genre as admin', async () => {
      const res = await request(app)
        .delete(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Genre removed');

      // Verify genre is deleted
      const checkRes = await request(app)
        .get(`/api/genres/${genreId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkRes.statusCode).toEqual(404);
    });
  });

  describe('GET /api/genres/:id/movies', () => {
    let genreId;
    let directorId;
    let actorId;

    beforeAll(async () => {
      // Create a genre for movies
      const genreRes = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Thriller',
          description: 'Thriller film is a genre that evokes excitement and suspense in the audience.',
        });
      genreId = genreRes.body._id;
      
      // Create director
      const directorRes = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Alfred Hitchcock',
          birthYear: 1899,
          bio: 'English film director and producer.',
        });
      directorId = directorRes.body._id;
      
      // Create actor
      const actorRes = await request(app)
        .post('/api/actors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Anthony Perkins',
          birthYear: 1932,
          bio: 'American actor, director and singer.',
        });
      actorId = actorRes.body._id;
      
      // Create movie with genre
      await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Psycho',
          releaseYear: 1960,
          plot: 'A Phoenix secretary embezzles forty thousand dollars from her employer\'s client, goes on the run, and checks into a remote motel run by a young man under the domination of his mother.',
          runtime: 109,
          director: directorId,
          actors: [actorId],
          genres: [genreId],
          poster: 'psycho.jpg',
        });
    });

    it('should get movies by genre', async () => {
      const res = await request(app)
        .get(`/api/genres/${genreId}/movies`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toEqual('Psycho');
    });

    it('should return 404 for non-existent genre ID', async () => {
      const res = await request(app)
        .get(`/api/genres/5f7d5f3e9d3e2c001c5f5f5f/movies`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Genre not found');
    });
  });
});