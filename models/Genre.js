// models/Genre.js
const mongoose = require('mongoose');

const genreSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Genre', genreSchema);
