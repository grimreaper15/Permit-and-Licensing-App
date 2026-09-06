import { useCallback, useEffect, useState } from 'react';
import { getMyApplications, PermitApiError } from '../api/permitApi';
import { PermitApplication } from '../types/permit.types';

export function usePermitApplications() {
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err: any) {
      if (err instanceof PermitApiError) {
        setError(err.message);
      } else {
        setError('Unable to load your permit applications. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const refresh = useCallback(() => {
    return fetchApplications(true);
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    isRefreshing,
    error,
    refresh,
    refetch: fetchApplications,
  };
}
