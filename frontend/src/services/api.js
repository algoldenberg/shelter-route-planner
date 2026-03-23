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

export const addShelterComment = async (shelterId, commentData) => {
  // Create FormData for multipart/form-data (supports photos)
  const formData = new FormData();
  formData.append('username', commentData.username || 'Anonymous');
  formData.append('comment', commentData.comment);
  formData.append('rating', commentData.rating);
  
  // Add photos if present
  if (commentData.photos && commentData.photos.length > 0) {
    commentData.photos.forEach((photo) => {
      formData.append('photos', photo);
    });
  }
  
  const response = await api.post(`/comments/shelters/${shelterId}/comments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Shelter submission endpoints
export const submitNewShelter = async (shelterData) => {
  // Create FormData for multipart/form-data (supports photos)
  const formData = new FormData();
  formData.append('name', shelterData.name);
  formData.append('address', shelterData.address);
  formData.append('latitude', shelterData.latitude);
  formData.append('longitude', shelterData.longitude);
  formData.append('type', shelterData.type);
  formData.append('captcha_token', shelterData.captcha_token);
  
  if (shelterData.capacity) {
    formData.append('capacity', shelterData.capacity);
  }
  
  if (shelterData.comment) {
    formData.append('comment', shelterData.comment);
  }
  
  // Add photos if present
  if (shelterData.photos && shelterData.photos.length > 0) {
    shelterData.photos.forEach((photo) => {
      formData.append('photos', photo);
    });
  }
  
  const response = await api.post('/shelters/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Shelter report endpoints
export const reportShelterIssue = async (shelterId, reportData) => {
  // Create FormData for multipart/form-data (supports photos)
  const formData = new FormData();
  formData.append('issue_type', reportData.issueType);
  formData.append('comment', reportData.comment);
  
  if (reportData.contact) {
    formData.append('contact', reportData.contact);
  }
  
  // Add photos if present
  if (reportData.photos && reportData.photos.length > 0) {
    reportData.photos.forEach((photo) => {
      formData.append('photos', photo);
    });
  }
  
  const response = await api.post(`/shelters/${shelterId}/report`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

// live - counting footer

export const getShelterStats = async () => {
  const response = await api.get('/shelters/stats');
  return response.data;
};


export default api;