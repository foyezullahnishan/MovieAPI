// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, 'Please add a release year'],
    },
    plot: {
      type: String,
      required: [true, 'Please add a plot'],
    },
    runtime: {
      type: Number,
      required: [true, 'Please add runtime in minutes'],
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Director',
      required: true,
    },
    actors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actor',
      },
    ],
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    poster: {
      type: String,
      default: 'no-image.jpg',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);