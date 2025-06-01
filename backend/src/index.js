require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/database');
const {sanitizationMiddleware} = require('./middleware/sanitization');

connectDB();
// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: [],
		}
	},
	xssFilter: true,
	referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
	crossOriginEmbedderPolicy: false
})); 
app.use(express.json());
app.use(sanitizationMiddleware({
	body: true,
    query: true,
    params: true
}));

//CORS setup
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}));

// Routes
app.use(cookieParser());
app.use('/api', authRoutes);

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
