// backend/src/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import pollRoutes    from './routes/pollRoutes.js';
import tripRoutes    from './routes/tripRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';
import friendRoutes  from './routes/friendRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.json({ message: 'Derleng API is up and running safely via ES Modules!' });
});

// Routes
app.use('/api/polls',   pollRoutes);
app.use('/api/trips',   tripRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/friends', friendRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server spinning on: http://localhost:${PORT}`);
});