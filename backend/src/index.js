require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

connectDB();
// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());

//CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use(cookieParser());
app.use('/api', authRoutes);

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
