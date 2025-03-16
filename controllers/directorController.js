// controllers/directorController.js
const asyncHandler = require('express-async-handler');
const Director = require('../models/Director');
const Movie = require('../models/Movie');

// @desc    Get all directors
// @route   GET /api/directors
// @access  Private
const getDirectors = asyncHandler(async (req, res) => {
  const directors = await Director.find({}).sort({ name: 1 });
  res.json(directors);
});

// @desc    Get director by ID
// @route   GET /api/directors/:id
// @access  Private
const getDirectorById = asyncHandler(async (req, res) => {
  const director = await Director.findById(req.params.id);

  if (director) {
    res.json(director);
  } else {
    res.status(404);
    throw new Error('Director not found');
  }
});

// @desc    Get movies by director
// @route   GET /api/directors/:id/movies
// @access  Private
const getDirectorMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ director: req.params.id })
    .populate('genres', 'name')
    .sort({ releaseYear: -1 });

  res.json(movies);
});

// @desc    Create a director
// @route   POST /api/directors
// @access  Private/Admin
const createDirector = asyncHandler(async (req, res) => {
  const { name, birthYear, bio } = req.body;

  const director = await Director.create({
    name,
    birthYear,
    bio,
  });

  if (director) {
    res.status(201).json(director);
  } else {
    res.status(400);
    throw new Error('Invalid director data');
  }
});

// @desc    Update a director
// @route   PUT /api/directors/:id
// @access  Private/Admin
const updateDirector = asyncHandler(async (req, res) => {
  const { name, birthYear, bio } = req.body;

  const director = await Director.findById(req.params.id);

  if (director) {
    director.name = name || director.name;
    director.birthYear = birthYear || director.birthYear;
    director.bio = bio || director.bio;

    const updatedDirector = await director.save();
    res.json(updatedDirector);
  } else {
    res.status(404);
    throw new Error('Director not found');
  }
});

// @desc    Delete a director
// @route   DELETE /api/directors/:id
// @access  Private/Admin
const deleteDirector = asyncHandler(async (req, res) => {
  // First check if this director is used by any movies
  const moviesWithDirector = await Movie.find({ director: req.params.id });
  
  if (moviesWithDirector.length > 0) {
    res.status(400);
    throw new Error('Cannot delete director that is associated with movies');
  }

  const director = await Director.findById(req.params.id);

  if (!director) {
    res.status(404);
    throw new Error('Director not found');
  }

  await director.deleteOne();
  
  res.status(200).json({ message: 'Director removed' });
});

module.exports = {
  getDirectors,
  getDirectorById,
  getDirectorMovies,
  createDirector,
  updateDirector,
  deleteDirector,
};