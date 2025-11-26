import express from "express";
import dotenv from "dotenv";

import authMiddleware from './middleware/authMiddleware.js';
import roleMiddleware from './middleware/roleMiddleware.js';
import validationMiddleware from "./middleware/validationMiddleware";

dotenv.config();
console.log(`Server starting on port ${PORT} | Env: ${process.env.NODE_ENV || 'development'}`);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true}));

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key'); // Allow specific headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Allow HTTP methods
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies/credentials

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Request logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});