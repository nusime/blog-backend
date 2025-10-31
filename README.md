## Blog Website Backend API
A simple and beginner-friendly Node.js backend API for a blog website.

## Features
* Lets users register, login, and logout
* Three user types: Reader, Blogger, Admin
* Create and manage blog posts and comments
* Uses PostgreSQL to store data
* Has API documentation with Swagger

## Technologies Used
* Node.js
* Express.js
* PostgreSQL
* Swagger (for API docs)


## Prerequisites
* Node.js installed on your computer
* PostgreSQL database
* npm (comes with Node.js)

## Set up
1. Get the code
* git clone https://github.com/nusime/blog-backend.git
* cd blog-backend

2. Install packages
* npm install

3. Create Environment File
Create a .env file in your project folder and add this inside:
* PORT=4000
* DATABASE_URL=postgres://username:password@localhost:5432/blogdb
* SESSION_SECRET=any_random_string_here

4. Create Your Database
* Open pgAdmin or your terminal and create a new database called:
* CREATE DATABASE blogdb;

5. Run the Server
* npm start
* Your server will run on: http://localhost:4000
* Check the docs: Visit http://localhost:4000/api-docs to see all available API routes.

## Users Roles
1. Reader (Default role)
* View blog posts
* Read comments
* Cannot write or edit posts

2. Blogger
* Everything Reader can do
* Write new posts
* Edit their own posts
* Comment on posts

3. Admin
* Everything Blogger can do
* Edit any post
* Delete any post or comment

## Main API Routes
1. Authentication
* POST /api/auth/register - Create account
* POST /api/auth/login - Login
* GET /api/auth/logout - Logout

2. Posts
* GET /api/posts - Get all posts
* POST /api/posts - Create post (Blogger/Admin only)
* PUT /api/posts/:id - Edit post
* DELETE /api/posts/:id - Delete post

3. Comments
* POST /api/posts/:id/comments - Add comment
* DELETE /api/comments/:id - Delete comment

## Folder Structure
your-project/
├── src/
│   ├── routes/       # API routes
│   ├── controllers/  # Functions for each route
│   ├── models/       # Database stuff
│   └── config/       # Database connection
├── .env              # Your secrets (don't share!)
├── package.json      # Project info
└── README.md         # This file!

## Run the App
* npm run start

## Deployment (Optional: Render)
If you want to deploy online:
1. Push your project to GitHub.
2. Go to Render.com New Web Service.
3. Connect your GitHub repo.
4. Add environment variables:
   * DATABASE_URL
   * SESSION_SECRET
5. PORT (Render sets automatically)
6. Deploy — your API will get a public link like https://yourapp.onrender.com.

## Tips for Beginners
* Restart the server after changing .env.
* If you get a database error, check your DATABASE_URL.
* Use Swagger to test your routes.
* Don’t upload your .env file to GitHub.

## License
This project is open-source and free to use for learning purposes.

