// routes/directorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDirectors,
  getDirectorById,
  getDirectorMovies,
  createDirector,
  updateDirector,
  deleteDirector,
} = require('../controllers/directorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDirectors)
  .post(protect, admin, createDirector);

router.route('/:id')
  .get(protect, getDirectorById)
  .put(protect, admin, updateDirector)
  .delete(protect, admin, deleteDirector);

router.route('/:id/movies').get(protect, getDirectorMovies);

module.exports = router;