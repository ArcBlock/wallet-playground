import axios from 'axios';

export default function createService(baseURL, storage, timeout = 10000) {
  const service = axios.create({ baseURL, timeout });

  service.interceptors.request.use(
    config => {
      const token = storage.getToken();
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return service;
}
