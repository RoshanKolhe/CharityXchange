import axios from 'axios';
import authService from '../services/auth.service';
import history from './history';

const baseURL = process.env.API_URL || 'http://localhost:3001/';

let headers = {};

if (localStorage.getItem('token')) {
  headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const axiosInstance = axios.create({ baseURL, headers });

// add token
axiosInstance.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token')) {
      config.headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // place your reentry code
      authService.logout();
      // localStorage.setItem('isAuthenticated', false);
      history.push('/login', { replace: true });
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
