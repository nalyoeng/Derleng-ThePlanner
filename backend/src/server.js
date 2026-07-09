// backend/src/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Automatically loads your .env variables

// Import Routes
import pollRoutes from './routes/pollRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import followRoutes from './routes/followRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.json({ message: "Derleng API is up and running safely via ES Modules!" });
});

// Mounting Feature Routes
app.use('/api/polls', pollRoutes);
app.use('/api/trips', tripRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/follow', followRoutes);

app.listen(PORT, () => {
  console.log(`Server spinning on: http://localhost:${PORT}`);
});