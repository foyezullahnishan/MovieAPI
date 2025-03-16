# Movie Database API

A RESTful API for managing a movie database with movies, directors, actors, and genres. Built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based authorization (admin/user)
- CRUD operations for movies, directors, actors, and genres
- Relationship management between entities
- Pagination for listing endpoints
- Comprehensive error handling

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Database Seeding](#database-seeding)
- [API Endpoints](#api-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Testing with curl](#testing-with-curl)
- [Admin Access](#admin-access)
- [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.x or higher)

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/movie-database-api.git

# Navigate to project directory
cd movie-database-api
```

### Install Dependencies

```bash
# Install all required packages
npm install
```

This will install all dependencies including:
- express (web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- other required packages

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/movie-database
JWT_SECRET=your_jwt_secret_key
```

Replace `your_jwt_secret_key` with a secure random string.

### MongoDB Setup

Ensure MongoDB is running on your system:

```bash
# For Linux/macOS
sudo service mongod start
# or
brew services start mongodb-community

# For Windows (run in Command Prompt as Administrator)
net start MongoDB
```

## Running the Server

### Development Mode

```bash
# Run with nodemon for development (auto-restart on file changes)
npm run dev
```

### Production Mode

```bash
# Run in production mode
npm start
```

The server will start on the port defined in your `.env` file (default: 5001).

## Database Seeding

Populate the database with sample data:

```bash
# Run the seed script
npm run seed
```

This will create:
- 2 users (admin and regular user)
- 3 directors
- 3 actors
- 3 genres
- 3 sample movies

Default credentials:
- Admin: admin@example.com / admin123
- User: user@example.com / user123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/profile` - Get user profile (protected)

### Movies

- `GET /api/movies` - Get all movies (with pagination)
- `GET /api/movies/:id` - Get a specific movie
- `POST /api/movies` - Create a movie (admin only)
- `PUT /api/movies/:id` - Update a movie (admin only)
- `DELETE /api/movies/:id` - Delete a movie (admin only)

### Directors

- `GET /api/directors` - Get all directors
- `GET /api/directors/:id` - Get a specific director
- `GET /api/directors/:id/movies` - Get all movies by a director
- `POST /api/directors` - Create a director (admin only)
- `PUT /api/directors/:id` - Update a director (admin only)
- `DELETE /api/directors/:id` - Delete a director (admin only)

### Actors

- `GET /api/actors` - Get all actors
- `GET /api/actors/:id` - Get a specific actor
- `GET /api/actors/:id/movies` - Get all movies with an actor
- `POST /api/actors` - Create an actor (admin only)
- `PUT /api/actors/:id` - Update an actor (admin only)
- `DELETE /api/actors/:id` - Delete an actor (admin only)

### Genres

- `GET /api/genres` - Get all genres
- `GET /api/genres/:id` - Get a specific genre
- `GET /api/genres/:id/movies` - Get all movies in a genre
- `POST /api/genres` - Create a genre (admin only)
- `PUT /api/genres/:id` - Update a genre (admin only)
- `DELETE /api/genres/:id` - Delete a genre (admin only)

## Testing with Postman

### Setup Postman

1. Install Postman: Download and install from [postman.com](https://www.postman.com)
2. Create a Collection:
   - Click "Collections" in the sidebar
   - Click "+" to create a new collection
   - Name it "Movie Database API"
3. Create Environment:
   - Click "Environments" in the sidebar
   - Click "+" to create a new environment
   - Name it "Movie DB Local"
   - Add variable `base_url` with value `http://localhost:5001`
   - Add variable `token` (leave empty for now)
   - Save and select this environment

### Authentication in Postman

#### Register a User

1. Create a new request
2. Method: POST
3. URL: `{{base_url}}/api/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
6. Send the request

#### Login

1. Create a new request
2. Method: POST
3. URL: `{{base_url}}/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
6. Send the request
7. From response, copy the token value
8. Set your environment variable `token` to this value

### Using Token for Authenticated Requests

For any protected endpoint, add this header:
```
Authorization: Bearer {{token}}
```

#### Example: Creating a Director (Admin only)

1. Create a new request
2. Method: POST
3. URL: `{{base_url}}/api/directors`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{token}}`
5. Body (raw JSON):
```json
{
  "name": "Quentin Tarantino",
  "birthYear": 1963,
  "bio": "American film director, screenwriter, producer, and actor."
}
```
6. Send the request

## Testing with curl

### Authentication

#### Register a User

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Save the token from the response:
```bash
export TOKEN="your_token_here"
```

### Protected Endpoints

#### Get All Movies

```bash
curl -X GET http://localhost:5001/api/movies \
  -H "Authorization: Bearer $TOKEN"
```

#### Create a Director (Admin only)

```bash
curl -X POST http://localhost:5001/api/directors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"James Cameron","birthYear":1954,"bio":"Canadian filmmaker known for directing Titanic and Avatar."}'
```

#### Get Movies by Director

```bash
curl -X GET http://localhost:5001/api/directors/director_id/movies \
  -H "Authorization: Bearer $TOKEN"
```

(Replace `director_id` with an actual director ID)

## Admin Access

There are two ways to get admin access:

### 1. Use the Seeded Admin Account

After running the seed script, login with:
- Email: admin@example.com
- Password: admin123

### 2. Promote a User to Admin

Connect to MongoDB and update a user's role:

```javascript
// In MongoDB shell
use movie-database
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { role: "admin" } }
)
```

## Troubleshooting

### Common Issues

- **Connection refused error:**
  - Check if MongoDB is running
  - Verify the MongoDB connection string in `.env`
- **Authentication failed:**
  - Ensure you're using the correct email/password
  - Check if the JWT_SECRET in `.env` matches what was used during token generation
- **Permission denied (403):**
  - Endpoint requires admin privileges
  - Login as admin or update your user role to admin
- **"Router.use() requires middleware function" error:**
  - Check that all route files export the router correctly
  - Make sure controllers are properly imported and exported
- **Node module not found:**
  - Run `npm install` to ensure all dependencies are installed

### Logs

Check the server logs in the terminal for detailed error information and request logs.

## License

MIT