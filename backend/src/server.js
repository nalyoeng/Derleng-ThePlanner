// backend/src/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Import Routes
import pollRoutes from './routes/pollRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import followRoutes from './routes/followRoutes.js'; 
import groupRoutes from './routes/groupRoutes.js';

//import authRoutes from './routes/authRoutes.js';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import profileRoutes from './routes/profileRoutes.js'
const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
]

app.use(
  cors({
    origin(origin, callback) {
      // Allow Apidog, server-to-server requests, and approved frontends
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS`)
      )
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
)
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// Root test route
app.get('/', (req, res) => {
  res.json({ message: 'Derleng API is up and running safely via ES Modules!' });
});

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/polls',   pollRoutes);
app.use('/api/trips',   tripRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/follow', followRoutes);
// POST /api/groups/invite

app.use('/api/groups', groupRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Derleng API running at http://localhost:${PORT}`)
})