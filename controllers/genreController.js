// controllers/genreController.js
const asyncHandler = require('express-async-handler');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

// @desc    Get all genres
// @route   GET /api/genres
// @access  Private
const getGenres = asyncHandler(async (req, res) => {
  const genres = await Genre.find({}).sort({ name: 1 });
  res.json(genres);
});

// @desc    Get genre by ID
// @route   GET /api/genres/:id
// @access  Private
const getGenreById = asyncHandler(async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (genre) {
    res.json(genre);
  } else {
    res.status(404);
    throw new Error('Genre not found');
  }
});

// @desc    Get movies by genre
// @route   GET /api/genres/:id/movies
// @access  Private
const getGenreMovies = asyncHandler(async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  
  if (!genre) {
    res.status(404);
    throw new Error('Genre not found');
  }
  
  const movies = await Movie.find({ genres: req.params.id })
    .populate('director', 'name')
    .populate('actors', 'name')
    .sort({ releaseYear: -1 });

  res.json(movies);
});

// @desc    Create a genre
// @route   POST /api/genres
// @access  Private/Admin
const createGenre = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if genre already exists
  const genreExists = await Genre.findOne({ name: name.trim() });

  if (genreExists) {
    res.status(400);
    throw new Error('Genre already exists');
  }

  const genre = await Genre.create({
    name,
    description,
  });

  if (genre) {
    res.status(201).json(genre);
  } else {
    res.status(400);
    throw new Error('Invalid genre data');
  }
});

// @desc    Update a genre
// @route   PUT /api/genres/:id
// @access  Private/Admin
const updateGenre = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const genre = await Genre.findById(req.params.id);

  if (genre) {
    // If name is being changed, check if the new name already exists
    if (name && name !== genre.name) {
      const genreExists = await Genre.findOne({ name: name.trim() });
      if (genreExists) {
        res.status(400);
        throw new Error('Genre with that name already exists');
      }
    }

    genre.name = name || genre.name;
    genre.description = description || genre.description;

    const updatedGenre = await genre.save();
    res.json(updatedGenre);
  } else {
    res.status(404);
    throw new Error('Genre not found');
  }
});



// @desc    Delete a genre
// @route   DELETE /api/genres/:id
// @access  Private/Admin
const deleteGenre = asyncHandler(async (req, res) => {
  // First check if this genre is used by any movies
  const moviesWithGenre = await Movie.find({ genres: req.params.id });
  
  if (moviesWithGenre.length > 0) {
    res.status(400);
    throw new Error('Cannot delete genre that is associated with movies');
  }

  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    res.status(404);
    throw new Error('Genre not found');
  }

  console.log(moviesWithGenre)

  await genre.deleteOne();
  
  res.status(200).json({ message: 'Genre removed' });
});

module.exports = {
  getGenres,
  getGenreById,
  getGenreMovies,
  createGenre,
  updateGenre,
  deleteGenre,
};