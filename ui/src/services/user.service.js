import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/test/';

class UserService {
  getPublicContent = () => axios.get(`${API_URL}all`);

  getUserBoard = () => axios.get(`${API_URL}user`, { headers: authHeader() });

  getModeratorBoard = () => axios.get(`${API_URL}mod`, { headers: authHeader() });

  getAdminBoard = () => axios.get(`${API_URL}admin`, { headers: authHeader() });
}

export default new UserService();
