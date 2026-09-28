import { AuthService } from '@/src/services/auth-service';
import { PERMIT_CONFIG } from './permitConfig';
import { PERMIT_ENDPOINTS } from './permitEndpoints';
import {
  ApiResponse,
  PermitApplication,
  PermitSubmitPayload,
  PermitSubmitResult,
  PermitTrackingResponse,
  PermitUploadResult,
  PermitVerificationResult,
  TproVerificationResult,
} from '../types/permit.types';

export class PermitApiError extends Error {
  public statusCode?: number;
  public rawResponse?: any;

  constructor(message: string, statusCode?: number, rawResponse?: any) {
    super(message);
    this.name = 'PermitApiError';
    this.statusCode = statusCode;
    this.rawResponse = rawResponse;
  }
}

/**
 * Builds request headers including citizen authentication headers if available
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    ...PERMIT_CONFIG.defaultHeaders,
  };

  try {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && !currentUser.isGuest) {
      if (currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }
      if (currentUser.citizen_user_id) {
        headers['X-Citizen-Id'] = String(currentUser.citizen_user_id);
      }
    }
  } catch {
    // Graceful fallback if AuthService is in an uninitialized state
  }

  return headers;
}

/**
 * Safely parses response text into JSON, avoiding raw HTML crash
 */
function parseJsonSafely(text: string): { data: any; parseError?: boolean } {
  if (!text || text.trim() === '') {
    return { data: null, parseError: false };
  }
  try {
    return { data: JSON.parse(text), parseError: false };
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return { data: JSON.parse(jsonMatch[0]), parseError: false };
      } catch {
        // failed regex parse
      }
    }
    return { data: null, parseError: true };
  }
}

/**
 * Common fetch executor with timeout and safe error formatting
 */
async function executeFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PERMIT_CONFIG.timeoutMs);

  try {
    const headers: Record<string, string> = {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };

    // If payload is multipart FormData, remove Content-Type so boundary is auto-generated
    if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    const { data: parsed, parseError } = parseJsonSafely(responseText);

    if (parseError) {
      throw new PermitApiError(
        'The server returned an unexpected response format. Please ensure the Civentral Permit service is running.',
        response.status
      );
    }

    if (!response.ok) {
      const serverMessage = parsed?.message || parsed?.error || `Server responded with status ${response.status}.`;
      throw new PermitApiError(serverMessage, response.status, parsed);
    }

    // Standardize PHP response format
    const isSuccess = parsed?.success === true || parsed?.status === 'success';
    const finalData = (parsed?.data !== undefined ? parsed.data : parsed) as T;

    return {
      success: isSuccess,
      status: parsed?.status || (isSuccess ? 'success' : 'error'),
      message: parsed?.message || (isSuccess ? 'Success' : 'Request completed.'),
      data: finalData,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof PermitApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new PermitApiError('Connection timed out. Please check your network connection.');
    }

    // Network errors (e.g. Failed to fetch, ECONNREFUSED)
    const isNetworkError =
      err.message?.includes('Network') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('ECONNREFUSED');

    if (isNetworkError) {
      throw new PermitApiError('Unable to connect to the Civentral Permit server.');
    }

    throw new PermitApiError(err.message || 'An unexpected error occurred while contacting the Permit service.');
  }
}

/**
 * Retrieve the authenticated citizen's permit applications
 */
export async function getMyApplications(): Promise<PermitApplication[]> {
  const url = PERMIT_ENDPOINTS.myApplications();
  const response = await executeFetch<PermitApplication[]>(url, { method: 'GET' });
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  // If backend returns data wrapped or empty object
  return [];
}

/**
 * Retrieve deep tracking information for a permit application by number or ID
 */
export async function getPermitTracking(applicationNoOrId: string | number): Promise<PermitTrackingResponse> {
  const url = PERMIT_ENDPOINTS.track(applicationNoOrId);
  const response = await executeFetch<PermitTrackingResponse>(url, { method: 'GET' });
  
  if (!response.data || typeof response.data !== 'object' || Array.isArray(response.data)) {
    throw new PermitApiError(`Application '${applicationNoOrId}' details not found.`);
  }

  return response.data;
}

/**
 * Submit a new BPLO permit application to the webhost backend
 */
export async function submitPermitApplication(payload: PermitSubmitPayload): Promise<PermitSubmitResult> {
  const url = PERMIT_ENDPOINTS.submit();

  const formData = new FormData();
  formData.append('permit_type', payload.permit_type || 'Business Permit');
  formData.append('business_name', payload.business_name.trim());
  formData.append('business_address', payload.business_address.trim());
  formData.append('line_of_business', payload.line_of_business || 'General Trade');
  formData.append('capital_investment', String(payload.capital_investment || 0));
  formData.append('gross_sales', String(payload.gross_sales || 0));
  formData.append('number_of_employees', String(payload.number_of_employees || 1));
  formData.append('floor_area_sqm', String(payload.floor_area_sqm || 0));
  formData.append('ownership_type', payload.ownership_type || 'Sole Proprietorship');

  const response = await executeFetch<PermitSubmitResult>(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.data || !response.data.application_no) {
    throw new PermitApiError('Application submitted, but server did not return application identifiers.');
  }

  return response.data;
}

/**
 * Upload a document requirement with automated OCR.Space & Gemini screening
 */
export async function uploadPermitRequirement(formData: FormData): Promise<PermitUploadResult> {
  const url = PERMIT_ENDPOINTS.uploadRequirement();

  const response = await executeFetch<PermitUploadResult>(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.data || !response.data.document_id) {
    throw new PermitApiError('Document uploaded, but server did not return document record ID.');
  }

  return response.data;
}

/**
 * Verify a BPLO permit via public verification token
 */
export async function verifyBploPermit(token: string): Promise<PermitVerificationResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      valid: false,
      verification_status: 'INVALID',
      verification_message: 'Verification token cannot be empty.',
    };
  }

  const url = PERMIT_ENDPOINTS.verifyBploQr(trimmed);

  try {
    const response = await executeFetch<any>(url, { method: 'GET' });
    const payload = response.data;

    // Backend returns structured data in payload
    if (payload && typeof payload === 'object') {
      const isExplicitValid = payload.valid === true;
      const statusRaw = String(payload.verification_status || payload.status || (isExplicitValid ? 'VALID' : 'INVALID')).toUpperCase();

      return {
        valid: isExplicitValid,
        verification_status: statusRaw,
        permit_number: payload.permit_number || null,
        permit_type: payload.permit_type || null,
        business_name: payload.business_name || null,
        status: payload.status || null,
        issued_at: payload.issued_at || null,
        payment_verified: payload.payment_verified === true,
        is_issued: payload.is_issued === true,
        verification_message: payload.verification_message || response.message || (isExplicitValid ? 'Permit is authentic and officially issued.' : 'Invalid permit verification token.'),
        raw_status: statusRaw,
      };
    }

    return {
      valid: false,
      verification_status: 'UNKNOWN',
      verification_message: response.message || 'Unexpected server response format.',
    };
  } catch (err: any) {
    if (err instanceof PermitApiError && err.rawResponse) {
      const rawData = err.rawResponse.data || err.rawResponse;
      const statusRaw = String(rawData.verification_status || rawData.status || 'INVALID').toUpperCase();

      return {
        valid: rawData.valid === true,
        verification_status: statusRaw,
        permit_number: rawData.permit_number || null,
        permit_type: rawData.permit_type || null,
        business_name: rawData.business_name || null,
        status: rawData.status || null,
        issued_at: rawData.issued_at || null,
        payment_verified: rawData.payment_verified === true,
        is_issued: rawData.is_issued === true,
        verification_message: rawData.verification_message || err.message || 'Permit verification failed.',
        raw_status: statusRaw,
      };
    }

    return {
      valid: false,
      verification_status: 'INVALID',
      verification_message: err.message || 'Verification token was not recognized.',
    };
  }
}

/**
 * Verify a Transport / Franchise permit via TPRO verifier
 */
export async function verifyTproPermit(hashOrValue: string): Promise<TproVerificationResult> {
  const trimmed = hashOrValue.trim();
  if (!trimmed) {
    return {
      valid: false,
      status: 'INVALID',
      message: 'Transport verification query cannot be empty.',
    };
  }

  const url = PERMIT_ENDPOINTS.verifyTproQr(trimmed);

  try {
    const response = await executeFetch<any>(url, { method: 'GET' });
    const payload = response.data || {};

    const isSuccess = response.success || response.status === 'success' || payload.is_valid_issued === true;
    const statusText = payload.status || (isSuccess ? 'VALID & ACTIVE' : 'VERIFIED');

    return {
      valid: isSuccess,
      status: statusText,
      message: response.message || payload.verification_summary || 'Transport record verified.',
      franchise_number: payload.franchise_number || payload.franchise_no || payload.permit_number || null,
      application_no: payload.application_no || null,
      operator_name: payload.operator_name || payload.driver_name || payload.applicant_name || null,
      plate_number: payload.plate_number || payload.plate_no || null,
      sticker_number: payload.sticker_number || payload.sticker_no || null,
      is_valid_issued: payload.is_valid_issued === true,
      is_blocked: payload.is_blocked === true,
      block_reason: payload.block_reason || null,
      citations_count: typeof payload.citations_count === 'number' ? payload.citations_count : (Array.isArray(payload.citations) ? payload.citations.length : undefined),
      payment_status: payload.payment_status || null,
      issued_at: payload.issued_at || payload.date_issued || null,
      valid_until: payload.valid_until || payload.expiry_date || null,
      raw_data: payload,
    };
  } catch (err: any) {
    if (err instanceof PermitApiError && err.rawResponse) {
      const raw = err.rawResponse;
      const rawData = raw.data || {};

      return {
        valid: false,
        status: raw.status === 'error' ? 'NOT_FOUND' : 'INVALID',
        message: raw.message || err.message || 'No matching transport record found.',
        franchise_number: rawData.franchise_number || null,
        application_no: rawData.application_no || null,
        operator_name: rawData.operator_name || null,
        is_blocked: rawData.is_blocked === true,
        block_reason: rawData.block_reason || null,
        raw_data: raw,
      };
    }

    return {
      valid: false,
      status: 'INVALID',
      message: err.message || 'Unable to complete transport verification.',
    };
  }
}


