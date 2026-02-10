'use client';

import { useState, useCallback } from 'react';
import { deliverablesApi, type Deliverable } from '@/lib/api';

// Re-define status type to match API
 type DeliverableStatus = Deliverable['status'];

interface UpdateDeliverableData {
  status?: 'APPROVED' | 'REJECTED';
  comment?: string;
}

interface UseDeliverablesReturn {
  isUpdating: boolean;
  error: string | null;
  updateDeliverable: (id: string, data: UpdateDeliverableData) => Promise<Deliverable | null>;
  approveDeliverable: (id: string) => Promise<Deliverable | null>;
  requestChanges: (id: string, comment: string) => Promise<Deliverable | null>;
}

export function useDeliverables(): UseDeliverablesReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDeliverable = useCallback(async (
    id: string,
    data: UpdateDeliverableData
  ): Promise<Deliverable | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Only pass known Deliverable fields to the API
      const updateData: { status?: DeliverableStatus } = {};
      if (data.status) updateData.status = data.status as DeliverableStatus;

      const { data: responseData, error: apiError } = await deliverablesApi.update(id, updateData);

      if (apiError) {
        throw new Error(apiError);
      }

      return responseData?.deliverable || null;
    } catch (err) {
      console.error('Error updating deliverable:', err);
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const approveDeliverable = useCallback(async (id: string): Promise<Deliverable | null> => {
    return updateDeliverable(id, { status: 'APPROVED' });
  }, [updateDeliverable]);

  const requestChanges = useCallback(async (
    id: string,
    comment: string
  ): Promise<Deliverable | null> => {
    return updateDeliverable(id, { status: 'REJECTED', comment });
  }, [updateDeliverable]);

  return {
    isUpdating,
    error,
    updateDeliverable,
    approveDeliverable,
    requestChanges,
  };
}
