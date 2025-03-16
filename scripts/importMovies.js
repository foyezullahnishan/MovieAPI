// scripts/importMovies.js
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const Director = require('../models/Director');
const Actor = require('../models/Actor');
const Genre = require('../models/Genre');

// Load environment variables
dotenv.config();

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Add this to your .env file
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Fetch popular movies from TMDB
const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page: page,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error.message);
    return [];
  }
};

// Fetch movie details (including credits and more details)
const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error.message);
    return null;
  }
};

// Save a director to the database
const saveDirector = async (directorData) => {
  try {
    // Check if director already exists
    let director = await Director.findOne({ name: directorData.name });
    
    if (!director) {
      director = await Director.create({
        name: directorData.name,
        // TMDB doesn't provide birth year in the credits, so we'd need another API call
        // to get complete person details. For simplicity, we'll leave it blank.
        birthYear: null,
        bio: `Director known for their work on ${directorData.movieTitle}.`,
        movies: [],
      });
      console.log(`Director created: ${director.name}`);
    }
    
    return director;
  } catch (error) {
    console.error(`Error saving director ${directorData.name}:`, error.message);
    return null;
  }
};

// Save actors to the database
const saveActors = async (actorsData) => {
  const actorIds = [];
  
  for (const actorData of actorsData) {
    try {
      // Check if actor already exists
      let actor = await Actor.findOne({ name: actorData.name });
      
      if (!actor) {
        actor = await Actor.create({
          name: actorData.name,
          birthYear: null, // Would need another API call for complete details
          bio: `Actor known for playing ${actorData.character} in ${actorData.movieTitle}.`,
          movies: [],
        });
        console.log(`Actor created: ${actor.name}`);
      }
      
      actorIds.push(actor._id);
    } catch (error) {
      console.error(`Error saving actor ${actorData.name}:`, error.message);
    }
  }
  
  return actorIds;
};

// Save genres to the database
const saveGenres = async (genresData) => {
  const genreIds = [];
  
  for (const genreData of genresData) {
    try {
      // Check if genre already exists
      let genre = await Genre.findOne({ name: genreData.name });
      
      if (!genre) {
        genre = await Genre.create({
          name: genreData.name,
          description: `Movies categorized as ${genreData.name}.`,
          movies: [],
        });
        console.log(`Genre created: ${genre.name}`);
      }
      
      genreIds.push(genre._id);
    } catch (error) {
      console.error(`Error saving genre ${genreData.name}:`, error.message);
    }
  }
  
  return genreIds;
};

// Save a movie to the database
const saveMovie = async (movieData, directorId, actorIds, genreIds) => {
  try {
    // Check if movie already exists
    let movie = await Movie.findOne({ title: movieData.title });
    
    if (!movie) {
      movie = await Movie.create({
        title: movieData.title,
        releaseYear: new Date(movieData.release_date).getFullYear(),
        plot: movieData.overview,
        runtime: movieData.runtime,
        director: directorId,
        actors: actorIds,
        genres: genreIds,
        poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : 'no-image.jpg',
      });
      
      console.log(`Movie created: ${movie.title}`);
      
      // Update director's movies array
      await Director.findByIdAndUpdate(directorId, {
        $push: { movies: movie._id },
      });
      
      // Update actors' movies array
      await Actor.updateMany(
        { _id: { $in: actorIds } },
        { $push: { movies: movie._id } }
      );
      
      // Update genres' movies array
      await Genre.updateMany(
        { _id: { $in: genreIds } },
        { $push: { movies: movie._id } }
      );
      
      return movie;
    } else {
      console.log(`Movie already exists: ${movie.title}`);
      return movie;
    }
  } catch (error) {
    console.error(`Error saving movie ${movieData.title}:`, error.message);
    return null;
  }
};

// Main import function
const importMovies = async (numberOfMovies = 20) => {
  await connectDB();
  
  const moviesPerPage = 20;
  const pagesToFetch = Math.ceil(numberOfMovies / moviesPerPage);
  let processedMovies = 0;
  
  for (let page = 1; page <= pagesToFetch; page++) {
    if (processedMovies >= numberOfMovies) break;
    
    const movies = await fetchPopularMovies(page);
    
    for (const movie of movies) {
      if (processedMovies >= numberOfMovies) break;
      
      const movieDetails = await fetchMovieDetails(movie.id);
      if (!movieDetails) continue;
      
      // Find director (assume first person with job "Director" is the main director)
      const directorData = movieDetails.credits.crew.find(person => person.job === 'Director');
      if (!directorData) {
        console.log(`No director found for ${movieDetails.title}, skipping`);
        continue;
      }
      
      // Add movie title to director data for better bio
      directorData.movieTitle = movieDetails.title;
      
      // Get main cast (top 5 actors)
      const topCast = movieDetails.credits.cast.slice(0, 5).map(actor => ({
        ...actor,
        movieTitle: movieDetails.title,
      }));
      
      // Process director
      const director = await saveDirector(directorData);
      if (!director) continue;
      
      // Process actors
      const actorIds = await saveActors(topCast);
      if (actorIds.length === 0) continue;
      
      // Process genres
      const genreIds = await saveGenres(movieDetails.genres);
      if (genreIds.length === 0) continue;
      
      // Save the movie
      await saveMovie(movieDetails, director._id, actorIds, genreIds);
      
      processedMovies++;
      console.log(`Processed ${processedMovies}/${numberOfMovies} movies`);
    }
  }
  
  console.log(`Successfully imported ${processedMovies} movies`);
  process.exit();
};

// Run with optional parameter for number of movies
const numMovies = process.argv[2] ? parseInt(process.argv[2]) : 20;
importMovies(numMovies)
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });