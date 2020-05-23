import axios from 'axios';
import { getToken } from './auth';

axios.interceptors.request.use(
  config => {
    config.baseURL = window.env.apiPrefix || '';
    config.timeout = 200000;

    const token = getToken();
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// const url = env.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
// axios.socketUrl = process.env.NODE_ENV === 'production' ? `${url}/events` : '';

export default axios;
