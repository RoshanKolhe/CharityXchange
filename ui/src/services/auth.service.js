import axios from 'axios';

const API_URL = 'http://localhost:3005/users/';

class AuthService {
  login = (email, password) =>
    axios
      .post(`${API_URL}login`, {
        email,
        password
      })
      .then((response) => {
        if (response.data.token) {
          console.log(response.data);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('isAuthenticated', true);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('email', response.data.email);
          return true;
        }
        return null;
      });

  logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  register = (username, email, password) =>
    axios.post(`${API_URL}signup`, {
      username,
      email,
      password
    });

  getCurrentUser = () => JSON.parse(localStorage.getItem('user'));
}

export default new AuthService();
