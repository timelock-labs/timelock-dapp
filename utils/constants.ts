/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers and strings
 */

// ============================================================================
// Time Constants
// ============================================================================

/** Milliseconds in one second */
export const MS_PER_SECOND = 1000;

/** Seconds in one minute */
export const SECONDS_PER_MINUTE = 60;

/** Seconds in one hour */
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;

/** Seconds in one day */
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/** Maximum timelock delay in seconds (30 days) */
export const MAX_TIMELOCK_DELAY_SECONDS = 30 * SECONDS_PER_DAY;

/** Minimum timelock delay in seconds (0 days) */
export const MIN_TIMELOCK_DELAY_SECONDS = 0;

// ============================================================================
// API Constants
// ============================================================================

/** HTTP status code for unauthorized requests */
export const HTTP_STATUS_UNAUTHORIZED = 401;

/** HTTP status code for rate limiting */
export const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

/** Authentication endpoints that don't require auth header */
export const AUTH_ENDPOINTS = [
  '/api/v1/auth/nonce',
  '/api/v1/auth/wallet-connect'
] as const;

// ============================================================================
// RPC Optimization Constants
// ============================================================================

/** Maximum batch size for RPC requests */
export const RPC_MAX_BATCH_SIZE = 8;

/** Batch timeout in milliseconds */
export const RPC_BATCH_TIMEOUT_MS = 200;

/** Maximum retry attempts for failed requests */
export const RPC_MAX_RETRIES = 3;

/** Base delay between retries in milliseconds */
export const RPC_RETRY_DELAY_MS = 1000;

/** Rate limit window in milliseconds */
export const RPC_RATE_LIMIT_MS = 1000;

// ============================================================================
// UI Constants
// ============================================================================

/** Default items per page for pagination */
export const DEFAULT_ITEMS_PER_PAGE = 10;

/** Maximum items per page */
export const MAX_ITEMS_PER_PAGE = 100;

/** Toast notification duration in milliseconds */
export const TOAST_DURATION_MS = 5000;

/** Debounce delay for search inputs in milliseconds */
export const SEARCH_DEBOUNCE_MS = 300;

/** ENS query debounce delay in milliseconds */
export const ENS_QUERY_DEBOUNCE_MS = 1000;

// ============================================================================
// Validation Constants
// ============================================================================

/** Minimum bytecode length for contract deployment */
export const MIN_BYTECODE_LENGTH = 100;

/** Default address display length (characters from start) */
export const DEFAULT_ADDRESS_DISPLAY_LENGTH = 6;

/** Address suffix length (characters from end) */
export const ADDRESS_SUFFIX_LENGTH = 4;

// ============================================================================
// Wallet Constants
// ============================================================================

/** Signature debounce delay in milliseconds */
export const SIGNATURE_DEBOUNCE_MS = 300;

/** Safe SDK timeout in milliseconds */
export const SAFE_SDK_TIMEOUT_MS = 3000;

// ============================================================================
// Form Constants
// ============================================================================

/** Maximum age for form persistence in milliseconds (5 minutes) */
export const FORM_PERSISTENCE_MAX_AGE_MS = 5 * 60 * MS_PER_SECOND;

/** Default form persistence debounce in milliseconds */
export const FORM_PERSISTENCE_DEBOUNCE_MS = 500;

// ============================================================================
// Verification Code Constants
// ============================================================================

/** Verification code length */
export const VERIFICATION_CODE_LENGTH = 6;

/** Verification code resend cooldown in seconds */
export const VERIFICATION_CODE_COOLDOWN_SECONDS = 60;

// ============================================================================
// Gas Estimation Constants
// ============================================================================

/** Default gas limit for transactions */
export const DEFAULT_GAS_LIMIT = 2000000;

/** Default gas price in wei (20 gwei) */
export const DEFAULT_GAS_PRICE_WEI = '20000000000';

/** Estimated deployment cost in ETH */
export const ESTIMATED_DEPLOYMENT_COST_ETH = '0.04';

// ============================================================================
// Type Exports for Const Arrays
// ============================================================================

/** Type for auth endpoint values */
export type AuthEndpoint = typeof AUTH_ENDPOINTS[number];
