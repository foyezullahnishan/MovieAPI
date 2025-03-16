// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Director = require('./models/Director');
const Actor = require('./models/Actor');
const Genre = require('./models/Genre');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data for seeding
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    username: 'user',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
  },
];

const directors = [
  {
    name: 'Christopher Nolan',
    birthYear: 1970,
    bio: 'British-American film director known for his innovative film direction.',
  },
  {
    name: 'Steven Spielberg',
    birthYear: 1946,
    bio: 'American film director, producer, and screenwriter.',
  },
  {
    name: 'Greta Gerwig',
    birthYear: 1983,
    bio: 'American actress, screenwriter, and director.',
  },
];

const actors = [
  {
    name: 'Leonardo DiCaprio',
    birthYear: 1974,
    bio: 'American actor and film producer.',
  },
  {
    name: 'Tom Hanks',
    birthYear: 1956,
    bio: 'American actor and filmmaker.',
  },
  {
    name: 'Saoirse Ronan',
    birthYear: 1994,
    bio: 'Irish and American actress.',
  },
];

const genres = [
  {
    name: 'Science Fiction',
    description: 'Fiction based on scientific facts and principles',
  },
  {
    name: 'Drama',
    description: 'Fiction focused on realistic characters dealing with emotional themes',
  },
  {
    name: 'Comedy',
    description: 'Fiction intended to be humorous or amusing',
  },
];

const seedDB = async () => {
  try {
    // Clear database
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Director.deleteMany({});
    await Actor.deleteMany({});
    await Genre.deleteMany({});

    console.log('Data cleared...');

    // Seed users with hashed passwords
    const createdUsers = [];
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }

    console.log('Users seeded...');

    // Seed directors
    const createdDirectors = await Director.insertMany(directors);
    console.log('Directors seeded...');

    // Seed actors
    const createdActors = await Actor.insertMany(actors);
    console.log('Actors seeded...');

    // Seed genres
    const createdGenres = await Genre.insertMany(genres);
    console.log('Genres seeded...');

    // Seed movies
    const movies = [
      {
        title: 'Inception',
        releaseYear: 2010,
        plot: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea in a CEO\'s mind.',
        runtime: 148,
        director: createdDirectors[0]._id,
        actors: [createdActors[0]._id],
        genres: [createdGenres[0]._id, createdGenres[1]._id],
        poster: 'inception.jpg',
      },
      {
        title: 'Saving Private Ryan',
        releaseYear: 1998,
        plot: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        runtime: 169,
        director: createdDirectors[1]._id,
        actors: [createdActors[1]._id],
        genres: [createdGenres[1]._id],
        poster: 'saving-private-ryan.jpg',
      },
      {
        title: 'Little Women',
        releaseYear: 2019,
        plot: 'Jo March reflects back and forth on her life, telling the beloved story of the March sisters - four young women, each determined to live life on her own terms.',
        runtime: 135,
        director: createdDirectors[2]._id,
        actors: [createdActors[2]._id],
        genres: [createdGenres[1]._id, createdGenres[2]._id],
        poster: 'little-women.jpg',
      },
    ];

    for (let movie of movies) {
      const createdMovie = await Movie.create(movie);
      
      // Update director's movies array
      await Director.findByIdAndUpdate(movie.director, {
        $push: { movies: createdMovie._id },
      });
      
      // Update actors' movies array
      for (let actorId of movie.actors) {
        await Actor.findByIdAndUpdate(actorId, {
          $push: { movies: createdMovie._id },
        });
      }
      
      // Update genres' movies array
      for (let genreId of movie.genres) {
        await Genre.findByIdAndUpdate(genreId, {
          $push: { movies: createdMovie._id },
        });
      }
    }

    console.log('Movies seeded...');
    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();