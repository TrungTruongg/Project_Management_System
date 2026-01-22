import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Interceptor để tự động thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || "";
      
      const isAuthenticationError = 
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("not authenticated") ||
        errorMessage === "Unauthorized"; 
      
      if (isAuthenticationError) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        console.log("Validation error, staying on page");
      }
    }
    
    return Promise.reject(error);
  }
);


export default api;