import { useCallback, useEffect, useState } from 'react';
import { getPermitTracking, PermitApiError } from '../api/permitApi';
import { PermitTrackingResponse } from '../types/permit.types';

export function usePermitTracking(applicationNoOrId?: string | number | null) {
  const [trackingData, setTrackingData] = useState<PermitTrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async (targetId?: string | number | null, isManualRefresh = false) => {
    const idToFetch = targetId ?? applicationNoOrId;
    if (!idToFetch || String(idToFetch).trim() === '') {
      setTrackingData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getPermitTracking(idToFetch);
      setTrackingData(data);
    } catch (err: any) {
      if (err instanceof PermitApiError) {
        setError(err.message);
      } else {
        setError('Unable to track the specified permit application.');
      }
      setTrackingData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [applicationNoOrId]);

  useEffect(() => {
    if (applicationNoOrId) {
      fetchTracking(applicationNoOrId);
    }
  }, [applicationNoOrId, fetchTracking]);

  const refresh = useCallback(() => {
    return fetchTracking(applicationNoOrId, true);
  }, [applicationNoOrId, fetchTracking]);

  return {
    trackingData,
    isLoading,
    isRefreshing,
    error,
    refresh,
    trackApplication: (id: string | number) => fetchTracking(id, false),
  };
}
