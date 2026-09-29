import { PERMIT_CONFIG } from './permitConfig';

/**
 * Canonical Permit & Licensing Webhost Endpoints
 */
export const PERMIT_ENDPOINTS = {
  myApplications: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=my_applications`,
  
  submit: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=submit`,

  setupApplicantProfile: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=setup_applicant_profile`,

  uploadRequirement: () => `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=upload_requirement`,

  track: (applicationNoOrId: string | number) => {
    const param = typeof applicationNoOrId === 'number' || /^\d+$/.test(String(applicationNoOrId))
      ? `id=${encodeURIComponent(applicationNoOrId)}`
      : `application_no=${encodeURIComponent(applicationNoOrId)}`;
    return `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=track&${param}`;
  },

  document: (documentId: string | number) =>
    `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=document&id=${encodeURIComponent(documentId)}`,

  verifyBploQr: (token: string) =>
    `${PERMIT_CONFIG.baseUrl}/api/citizen/permit/index.php?action=verify_qr&token=${encodeURIComponent(token.trim())}`,

  verifyTproQr: (hashOrValue: string) =>
    `${PERMIT_CONFIG.baseUrl}/api/licensing/index.php?resource=transport&action=verify-qr&hash=${encodeURIComponent(hashOrValue.trim())}`,
} as const;

