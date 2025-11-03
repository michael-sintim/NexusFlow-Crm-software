import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, options = {}) => {
    const { showLoading = true, errorMessage = null } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      return response.data;
    } catch (err) {
      const message = errorMessage || err.response?.data?.detail || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    callApi,
    clearError,
  };
};