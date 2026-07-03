// backend/src/middleware/authMiddleware.js
import supabase from '../config/supabase.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for the token inside the Authorization header (e.g., "Bearer <token>")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 🌟 DEV MODE FALLBACK: If no token is provided while testing offline
  if (!token || token === 'mock-token') {
    console.warn("🔑 Auth Middleware: Using offline mock user context.");
    req.user = {
      id: 'mock-user-123',
      email: 'student@derleng.edu.kh',
      role: 'admin' // Toggle to 'user' to test role restrictions later!
    };
    return next();
  }

  try {
    // Verify token with Supabase client instance
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Not authorized, token validation failed' });
    }

    // Attach real user data to the request payload
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication engine exception occurred' });
  }
};