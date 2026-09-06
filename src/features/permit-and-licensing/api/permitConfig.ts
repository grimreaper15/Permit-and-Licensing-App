import { Platform } from 'react-native';

/**
 * Centralized Permit & Licensing API Configuration
 * 
 * Default for Android Studio Emulator: http://10.0.2.2/civentral-permit/
 * Fallback for web/iOS/local environment: http://localhost/civentral-permit/
 */
const DEFAULT_EMULATOR_BASE_URL = 'http://10.0.2.2/civentral-permit';
const DEFAULT_LOCALHOST_BASE_URL = 'http://localhost/civentral-permit';

export const PERMIT_API_BASE_URL = Platform.select({
  android: DEFAULT_EMULATOR_BASE_URL,
  default: DEFAULT_LOCALHOST_BASE_URL,
});

export const PERMIT_CONFIG = {
  baseUrl: PERMIT_API_BASE_URL,
  timeoutMs: 15000,
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
} as const;
