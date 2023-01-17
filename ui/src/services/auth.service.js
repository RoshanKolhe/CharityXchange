/* eslint-disable class-methods-use-this */

import axiosInstance from "../helpers/axios";

class AuthService {
  // login = (email, password) => {};

  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
  };

  register = (username, email, password, active) =>
    axiosInstance.post(`users/signup`, {
      username,
      email,
      password,
      active
    });

  getCurrentUser = () => JSON.parse(localStorage.getItem('user'));
}

export default new AuthService();
