import express from 'express'; 
import * as dotenv from 'dotenv';
import connectDB from './src/config/connection.js';
import morgan from 'morgan';
import cors from 'cors';
import user from './src/routes/userRoute.js';
import course from './src/routes/courseRoute.js';
import quiz from './src/routes/quizRoute.js';
import question from './src/routes/questionRoute.js';
import progress from './src/routes/progressRoute.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from './src/logger/logger.js';
import { limiters } from './src/middlewares/rateLimit/rate-limit.js';

dotenv.config();

// create express app
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
      credentials: true, 
      //origin: 'https://deploy-web-client.vercel.app',
      origin: 'http://localhost:5173',
      allowedHeaders: ['Content-Type', 'X-Csrf-Token'],
      exposedHeaders: ['X-Csrf-Token'],
    })
  );
app.use(cookieParser()); 
app.use(limiters);
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`IP người truy cập: ${ip}`); // Ghi lại địa chỉ IP
  next(); // Chuyển tiếp yêu cầu
});

// // Set up logger
// app.use(morgan('combined', {
//   stream: {
//     write: message => logger.info(message.trim())
//   }
// }));

// Middleware to set Cache-Control headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://www.google.com/recaptcha/", 
      "https://www.gstatic.com/"
    ],
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https://www.google.com",
    ],
    connectSrc: [
      "'self'",
      "https://www.google.com/recaptcha/", 
    ],
    frameSrc: [
      "'self'",
      "https://www.google.com/recaptcha/", 
    ]
  }
}));


// connect to database
connectDB(process.env.MONGODB_URI);

// Routes
app.use('/api/v1/user', user);
app.use('/api/v1/course', course);
app.use('/api/v1/quiz', quiz);
app.use('/api/v1/question', question);  
app.use('/api/v1/progress', progress); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
