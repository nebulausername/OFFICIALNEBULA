import { API_BASE_URL, getToken, removeToken } from './config';

// Helper function to handle API responses - optimized
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorData;
    try {
      errorData = isJson ? await response.json() : { message: response.statusText };
    } catch {
      errorData = { message: response.statusText || 'API request failed' };
    }

    const apiError = new Error(errorData.message || 'API request failed');
    apiError.status = response.status;
    apiError.data = errorData;

    if (response.status === 500) {
      console.error('Critical Server Error (500):', errorData);
    }
    throw apiError;
  }

  // Handle empty responses
  if (response.status === 204 || !isJson) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Main API client function
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return await handleResponse(response);
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error('Verbindung zum Server fehlgeschlagen. Bitte überprüfe, ob der Server läuft.');
      networkError.status = 0;
      networkError.networkError = true;
      throw networkError;
    }
    if (error.status) throw error;
    throw new Error(error.message || 'Network error');
  }
};

// HTTP method helpers - optimized
const createMethod = (method) => (endpoint, data = null, options = {}) => {
  if (method === 'GET' && data) {
    const queryString = new URLSearchParams(data).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method, ...options });
  }

  if (data !== null) {
    return apiRequest(endpoint, {
      method,
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  return apiRequest(endpoint, { method, ...options });
};

export const api = {
  get: createMethod('GET'),
  post: createMethod('POST'),
  patch: createMethod('PATCH'),
  put: createMethod('PUT'),
  delete: createMethod('DELETE'),
};

export default api;

