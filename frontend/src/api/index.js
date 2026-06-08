import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getVideos = (params = {}) => API.get('/videos/', { params });
export const getVideo = (id) => API.get(`/videos/${id}/`);
export const incrementView = (id) => API.post(`/videos/${id}/view/`);
export const getFeaturedVideos = () => API.get('/videos/featured/');
export const getCategories = () => API.get('/categories/');
export const getTestimonials = (params = {}) => API.get('/testimonials/', { params });
export const submitContact = (data) => API.post('/contact/', data);

export default API;
