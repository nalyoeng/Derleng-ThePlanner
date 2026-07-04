export const API_BASE_URL = 'http://localhost:5000/api';

export const fetchFromAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // You can automatically inject your auth token here later
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`🔴 API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
};