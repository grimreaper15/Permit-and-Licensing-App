import { useState } from 'react';
import { uploadPermitRequirement } from '../api/permitApi';
import { PermitUploadResult } from '../types/permit.types';

export function usePermitUpload(onSuccessCallback?: (result: PermitUploadResult) => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PermitUploadResult | null>(null);

  const upload = async (
    permitId: number | string,
    documentName: string,
    fileUri: string,
    fileName: string,
    mimeType?: string,
    requirementId?: string | number
  ): Promise<PermitUploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('permit_id', String(permitId));
      if (requirementId) {
        formData.append('requirement_id', String(requirementId));
      }
      formData.append('document_name', documentName);
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: mimeType || 'application/octet-stream',
      } as any);

      const result = await uploadPermitRequirement(formData);
      setLastResult(result);
      if (onSuccessCallback) {
        onSuccessCallback(result);
      }
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to upload document to server.';
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isUploading,
    error,
    lastResult,
    upload,
    clearError,
  };
}
