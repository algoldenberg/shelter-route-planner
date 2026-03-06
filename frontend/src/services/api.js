import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Shelter endpoints
export const getShelters = async (skip = 0, limit = 100) => {
  const response = await api.get(`/shelters/`, {
    params: { skip, limit },
  });
  return response.data;
};

export const getNearbyShelters = async (latitude, longitude, radius = 1000, limit = 50) => {
  const response = await api.get(`/shelters/nearby/`, {
    params: { latitude, longitude, radius, limit },
  });
  return response.data;
};

// Comment endpoints
export const getShelterComments = async (shelterId) => {
  const response = await api.get(`/comments/shelters/${shelterId}/comments`);
  return response.data;
};

export const addShelterComment = async (shelterId, comment) => {
  const response = await api.post(`/comments/shelters/${shelterId}/comments`, comment);
  return response.data;
};

// Shelter submission endpoints
export const submitNewShelter = async (shelterData) => {
  const response = await api.post('/shelters/submit', shelterData);
  return response.data;
};

// Route endpoints
export const calculateRoute = async (start, end, includeShelters = true, maxShelters = 50) => {
  const payload = {
    start,
    end,
    include_shelters: includeShelters,
    max_shelters: maxShelters,
  };
  
  console.log('🚀 Calculating route with payload:', payload);
  
  const response = await api.post('/route/calculate', payload);
  return response.data;
};

// Walking route endpoints
export const calculateCircularRoute = async (start, distanceKm, preferences, maxPois = 5, includeShelters = true) => {
  const response = await api.post(`/walking-route/circular`, {
    start,
    distance_km: distanceKm,
    preferences,
    max_pois: maxPois,
    include_shelters: includeShelters,
  });
  return response.data;
};

export default api;