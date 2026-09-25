import { Platform } from 'react-native';

/**
 * Centralized Permit & Licensing API Configuration
 * 
 * Production Webhost: https://permit.civentral.tech
 * 
 * Can be overridden via Expo environment variable:
 *   EXPO_PUBLIC_PERMIT_API_BASE_URL
 * 
 * Local development fallback is only active if explicitly enabled:
 *   EXPO_PUBLIC_PERMIT_USE_DEV_HOST=true
 */
const PRODUCTION_PERMIT_BASE_URL = 'https://permit.civentral.tech';
const DEV_EMULATOR_BASE_URL = 'http://10.0.2.2/civentral-permit';
const DEV_LOCALHOST_BASE_URL = 'http://localhost/civentral-permit';

function resolvePermitBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_PERMIT_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (process.env.EXPO_PUBLIC_PERMIT_USE_DEV_HOST === 'true') {
    return Platform.select({
      android: DEV_EMULATOR_BASE_URL,
      default: DEV_LOCALHOST_BASE_URL,
    }) || DEV_LOCALHOST_BASE_URL;
  }

  return PRODUCTION_PERMIT_BASE_URL;
}

export const PERMIT_API_BASE_URL = resolvePermitBaseUrl();

export const PERMIT_CONFIG = {
  baseUrl: PERMIT_API_BASE_URL,
  timeoutMs: 15000,
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
} as const;
