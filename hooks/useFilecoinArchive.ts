import { useState } from 'react';

interface ArchiveResult {
  success: boolean;
  cid: string;
  ipfsUrl: string;
  verifiableLink: string;
  fileSize: number;
  uploadedAt: string;
  redundantLinks: string[];
}

interface ArchiveError {
  success: false;
  error: string;
  warning?: string;
}

interface UseFilecoinArchiveReturn {
  archiveOrder: (orderData: Record<string, any>) => Promise<ArchiveResult | ArchiveError>;
  retrieveOrder: (cid: string) => Promise<{ success: boolean; order: Record<string, any> } | ArchiveError>;
  isLoading: boolean;
  error: string | null;
  cid: string | null;
}

/**
 * Hook to archive and retrieve orders from Filecoin
 * Handles API calls to /api/orders/archive-filecoin
 */
export const useFilecoinArchive = (): UseFilecoinArchiveReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);

  const archiveOrder = async (orderData: Record<string, any>): Promise<ArchiveResult | ArchiveError> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/archive-filecoin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to archive order';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
          warning: result.warning,
        };
      }

      setCid(result.cid);
      console.log('✅ Order archived to Filecoin:', result.cid);

      return result as ArchiveResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error archiving order';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveOrder = async (
    cidParam: string
  ): Promise<{ success: boolean; order: Record<string, any> } | ArchiveError> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/archive-filecoin?cid=${cidParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to retrieve order';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }

      console.log('✅ Order retrieved from Filecoin:', result.order);

      return {
        success: true,
        order: result.order,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error retrieving order';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    archiveOrder,
    retrieveOrder,
    isLoading,
    error,
    cid,
  };
};
