const API_BASE_ENDPOINT = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/**
 * Common HTTP request handler with JSON parsing and descriptive error throwing.
 */
async function sendJsonRequest(endpoint, requestConfig = {}) {
  try {
    const fullUrl = `${API_BASE_ENDPOINT}/recipes${endpoint}`;
    const response = await fetch(fullUrl, {
      ...requestConfig,
      headers: {
        'Content-Type': 'application/json',
        ...(requestConfig.headers || {})
      }
    });

    const parsedJson = await response.json();

    if (!response.ok) {
      throw new Error(parsedJson.message || `Server responded with status ${response.status}`);
    }

    return parsedJson;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Backend server is unreachable. Please ensure the API is running on port 5000.');
    }
    throw err;
  }
}

export const recipeApi = {
  // Fetch all recipes
  getAll: () => sendJsonRequest(''),

  // Fetch single recipe by MongoDB _id
  getById: (id) => sendJsonRequest(`/${id}`),

  // Create recipe
  create: (recipeData) =>
    sendJsonRequest('', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    }),

  // Update recipe
  update: (id, recipeData) =>
    sendJsonRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData)
    }),

  // Delete recipe
  remove: (id) =>
    sendJsonRequest(`/${id}`, {
      method: 'DELETE'
    })
};
