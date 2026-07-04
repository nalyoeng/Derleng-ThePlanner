import { create } from 'zustand';
import Cookies from 'js-cookie';
import { supabase } from '../supabaseClient'; // Assuming you have a supabaseClient.js

const useAuthStore = create((set) => ({
  token: Cookies.get('token') || null,
  user: null,
  isAuthenticated: !!Cookies.get('token'),

  login: async (email, password) => { // Changed to use Supabase auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const token = data.session.access_token;
      const user = data.user;
      Cookies.set('token', token, { expires: 7 });
      set({ token, user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  register: async (userData) => { // Changed to use Supabase auth
    try {
      const { data, error } = await supabase.auth.signUp({ email: userData.email, password: userData.password });
      if (error) throw error;
      const token = data.session.access_token;
      const user = data.user;
      Cookies.set('token', token, { expires: 7 });
      set({ token, user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  logout: async () => { // Changed to use Supabase auth
    await supabase.auth.signOut();
    Cookies.remove('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchUser: async () => { // Changed to use Supabase auth
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, isAuthenticated: !!user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      Cookies.remove('token'); // Clear invalid token
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
