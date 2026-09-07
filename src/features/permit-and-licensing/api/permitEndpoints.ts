import { PERMIT_CONFIG } from './permitConfig';

/**
 * Canonical Permit & Licensing Webhost Endpoints
 */
export const PERMIT_ENDPOINTS = {
  myApplications: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=my_applications`,
  
  submit: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=submit`,

  uploadRequirement: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=upload_requirement`,

  track: (applicationNoOrId: string | number) => {
    const param = typeof applicationNoOrId === 'number' || /^\d+$/.test(String(applicationNoOrId))
      ? `id=${encodeURIComponent(applicationNoOrId)}`
      : `application_no=${encodeURIComponent(applicationNoOrId)}`;
    return `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=track&${param}`;
  },

  document: (documentId: string | number) =>
    `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=document&id=${encodeURIComponent(documentId)}`,
} as const;

