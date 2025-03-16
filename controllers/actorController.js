// controllers/actorController.js
const asyncHandler = require('express-async-handler');
const Actor = require('../models/Actor');
const Movie = require('../models/Movie');

// @desc    Get all actors
// @route   GET /api/actors
// @access  Private
const getActors = asyncHandler(async (req, res) => {
  const actors = await Actor.find({}).sort({ name: 1 });
  res.json(actors);
});

// @desc    Get actor by ID
// @route   GET /api/actors/:id
// @access  Private
const getActorById = asyncHandler(async (req, res) => {
  const actor = await Actor.findById(req.params.id);

  if (actor) {
    res.json(actor);
  } else {
    res.status(404);
    throw new Error('Actor not found');
  }
});

// @desc    Get movies by actor
// @route   GET /api/actors/:id/movies
// @access  Private
const getActorMovies = asyncHandler(async (req, res) => {
  const actor = await Actor.findById(req.params.id);
  
  if (!actor) {
    res.status(404);
    throw new Error('Actor not found');
  }
  
  const movies = await Movie.find({ actors: req.params.id })
    .populate('director', 'name')
    .populate('genres', 'name')
    .sort({ releaseYear: -1 });

  res.json(movies);
});

// @desc    Create an actor
// @route   POST /api/actors
// @access  Private/Admin
const createActor = asyncHandler(async (req, res) => {
  const { name, birthYear, bio } = req.body;

  const actor = await Actor.create({
    name,
    birthYear,
    bio,
  });

  if (actor) {
    res.status(201).json(actor);
  } else {
    res.status(400);
    throw new Error('Invalid actor data');
  }
});

// @desc    Update an actor
// @route   PUT /api/actors/:id
// @access  Private/Admin
const updateActor = asyncHandler(async (req, res) => {
  const { name, birthYear, bio } = req.body;

  const actor = await Actor.findById(req.params.id);

  if (actor) {
    actor.name = name || actor.name;
    actor.birthYear = birthYear || actor.birthYear;
    actor.bio = bio || actor.bio;

    const updatedActor = await actor.save();
    res.json(updatedActor);
  } else {
    res.status(404);
    throw new Error('Actor not found');
  }
});

// @desc    Delete an actor
// @route   DELETE /api/actors/:id
// @access  Private/Admin
const deleteActor = asyncHandler(async (req, res) => {
  // First check if this actor is used by any movies
  const moviesWithActor = await Movie.find({ actors: req.params.id });
  
  if (moviesWithActor.length > 0) {
    res.status(400);
    throw new Error('Cannot delete actor that is associated with movies');
  }

  const actor = await Actor.findById(req.params.id);

  if (!actor) {
    res.status(404);
    throw new Error('Actor not found');
  }

  console.log(actor);

  await actor.deleteOne();
  
  res.status(200).json({ message: 'Actor removed' });
});

module.exports = {
  getActors,
  getActorById,
  getActorMovies,
  createActor,
  updateActor,
  deleteActor,
};