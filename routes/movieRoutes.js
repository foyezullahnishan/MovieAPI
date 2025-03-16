// routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMovies)
  .post(protect, admin, createMovie);

router.route('/:id')
  .get(protect, getMovieById)
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie);

module.exports = router;