// models/Actor.js
const mongoose = require('mongoose');

const actorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    birthYear: {
      type: Number,
    },
    bio: {
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

module.exports = mongoose.model('Actor', actorSchema);