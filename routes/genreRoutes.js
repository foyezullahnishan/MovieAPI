// routes/genreRoutes.js
const express = require('express');
const router = express.Router();
const {
  getGenres,
  getGenreById,
  getGenreMovies,
  createGenre,
  updateGenre,
  deleteGenre,
} = require('../controllers/genreController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGenres)
  .post(protect, admin, createGenre);

router.route('/:id')
  .get(protect, getGenreById)
  .put(protect, admin, updateGenre)
  .delete(protect, admin, deleteGenre);

router.route('/:id/movies').get(protect, getGenreMovies);

module.exports = router;