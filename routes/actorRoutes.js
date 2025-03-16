// routes/actorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getActors,
  getActorById,
  getActorMovies,
  createActor,
  updateActor,
  deleteActor,
} = require('../controllers/actorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getActors)
  .post(protect, admin, createActor);

router.route('/:id')
  .get(protect, getActorById)
  .put(protect, admin, updateActor)
  .delete(protect, admin, deleteActor);

router.route('/:id/movies').get(protect, getActorMovies);

module.exports = router;