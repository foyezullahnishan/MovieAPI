// tests/movie.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Director = require('../models/Director');
const Actor = require('../models/Actor');
const Genre = require('../models/Genre');

describe('Movie API', () => {
  let adminToken;
  let userToken;
  let directorId;
  let actorId;
  let genreId;

  beforeAll(async () => {
    // Clear collections before tests
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Director.deleteMany({});
    await Actor.deleteMany({});
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

    // Create director
    const directorRes = await request(app)
      .post('/api/directors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Christopher Nolan',
        birthYear: 1970,
        bio: 'British-American film director known for Inception, Interstellar.',
      });
    directorId = directorRes.body._id;

    // Create actor
    const actorRes = await request(app)
      .post('/api/actors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Leonardo DiCaprio',
        birthYear: 1974,
        bio: 'American actor known for Titanic, The Revenant.',
      });
    actorId = actorRes.body._id;

    // Create genre
    const genreRes = await request(app)
      .post('/api/genres')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Science Fiction',
        description: 'A genre that uses speculative, fictional science-based themes.',
      });
    genreId = genreRes.body._id;
  });

  afterAll(async () => {
    // Close server and database connection after tests
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /api/movies', () => {
    it('should create a new movie as admin', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Inception',
          releaseYear: 2010,
          plot: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
          runtime: 148,
          director: directorId,
          actors: [actorId],
          genres: [genreId],
          poster: 'inception.jpg',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toEqual('Inception');
      expect(res.body.releaseYear).toEqual(2010);
    });

    it('should not create a movie as non-admin', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'The Dark Knight',
          releaseYear: 2008,
          plot: 'Batman fights the Joker.',
          runtime: 152,
          director: directorId,
          actors: [actorId],
          genres: [genreId],
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });
  });

  describe('GET /api/movies', () => {
    it('should get all movies', async () => {
      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('movies');
      expect(res.body.movies.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/movies/:id', () => {
    let movieId;

    beforeAll(async () => {
      // Get first movie from list
      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${userToken}`);

      movieId = res.body.movies[0]._id;
    });

    it('should get a movie by ID', async () => {
      const res = await request(app)
        .get(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toEqual(movieId);
    });

    it('should return 404 for non-existent movie ID', async () => {
      const res = await request(app)
        .get(`/api/movies/5f7d5f3e9d3e2c001c5f5f5f`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Movie not found');
    });
  });

  describe('PUT /api/movies/:id', () => {
    let movieId;

    beforeAll(async () => {
      // Get first movie from list
      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${userToken}`);

      movieId = res.body.movies[0]._id;
    });

    it('should update a movie as admin', async () => {
      const res = await request(app)
        .put(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plot: 'Updated plot for Inception movie.',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.plot).toEqual('Updated plot for Inception movie.');
    });

    it('should not update a movie as non-admin', async () => {
      const res = await request(app)
        .put(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          plot: 'Another update attempt.',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });
  });

  describe('DELETE /api/movies/:id', () => {
    let movieId;

    beforeAll(async () => {
      // Create a movie to delete
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Movie to Delete',
          releaseYear: 2015,
          plot: 'This movie will be deleted in tests.',
          runtime: 120,
          director: directorId,
          actors: [actorId],
          genres: [genreId],
        });

      movieId = res.body._id;
    });

    it('should not delete a movie as non-admin', async () => {
      const res = await request(app)
        .delete(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized as an admin');
    });

    it('should delete a movie as admin', async () => {
      const res = await request(app)
        .delete(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Movie removed');

      // Verify movie is deleted
      const checkRes = await request(app)
        .get(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkRes.statusCode).toEqual(404);
    });
  });
});