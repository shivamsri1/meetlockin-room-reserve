
import { useState, useEffect } from 'react';
import { apiService, BookingsResponse, RoomsResponse, UsersResponse } from '@/lib/api';

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

// Specific hooks for each API endpoint with correct return types
export const useBookings = () => {
  return useApi<BookingsResponse>(() => apiService.getBookings());
};

export const useRooms = () => {
  return useApi<RoomsResponse>(() => apiService.getRooms());
};

export const useUsers = () => {
  return useApi<UsersResponse>(() => apiService.getUsers());
};
