import { AuthService } from '@/src/services/auth-service';
import { PERMIT_CONFIG } from './permitConfig';
import { PERMIT_ENDPOINTS } from './permitEndpoints';
import { ApiResponse, PermitApplication, PermitTrackingResponse } from '../types/permit.types';

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
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    ...PERMIT_CONFIG.defaultHeaders,
  };

  try {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && !currentUser.isGuest && currentUser.citizen_user_id) {
      headers['Authorization'] = `Bearer ${currentUser.citizen_user_id}`;
      headers['X-Citizen-Id'] = String(currentUser.citizen_user_id);
      headers['X-Applicant-Id'] = String(currentUser.citizen_user_id);
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
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };

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
