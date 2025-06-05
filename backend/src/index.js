import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/database.js';

dotenv.config();
connectDB();

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

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

//CORS setup
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Routes
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/question', questionRoutes);


//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

});
console.log(process.env.MONGODB_URI)
