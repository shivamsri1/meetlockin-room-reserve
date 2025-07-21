import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

// Custom hook for fetching data with loading states
export const useApi = <T>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for each API endpoint
export const useBookings = () => {
  return useApi(() => apiService.getBookings());
};

export const useRooms = () => {
  return useApi(() => apiService.getRooms());
};

export const useUsers = () => {
  return useApi(() => apiService.getUsers());
};