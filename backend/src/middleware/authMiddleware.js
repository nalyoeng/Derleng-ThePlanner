// src/middleware/authMiddleware.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const protect = async (req, res, next) => {
  try {
    // 1. Check if the Authorization header exists and starts with 'Bearer '
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    // 2. Extract the actual JWT token string
    const token = authHeader.split(' ')[1];

    // 3. Ask Supabase to verify this token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }

    // 4. Attach the verified user object to the request so controllers can use it
    req.user = user;
    
    // Move on to the next function (the controller)
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Authentication process failed' });
  }
};