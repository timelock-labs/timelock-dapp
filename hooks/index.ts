/**
 * Hook utilities barrel export
 * Central export point for all hook utilities and patterns
 */

// CRUD hooks
export * from './crud';

// Form hooks
export * from './form';

// Common hook utilities
export * from './useCommonHooks';
export * from './useHookUtils';

// Blockchain-related hooks
export * from './useBlockchainHooks';
export * from './useWeb3ErrorHandler';

// Re-export commonly used hooks for convenience
export {
	useLoadingState,
	useAsyncOperation,
	useLocalStorage,
	useDebounce,
	usePrevious,
	useToggle,
	useCounter,
	useArray,
	useClipboard,
	useMediaQuery,
	useWindowSize,
	useDocumentTitle,
	useInterval,
	useTimeout,
} from './useCommonHooks';

export { useIsMobile, useIsTablet, useIsDesktop, useDeviceType, useResponsiveValue, useIsTouchDevice } from './useMobile';

export {
	useWalletConnection,
	useContractDeployment,
	useTransactionSender,
	useContractValidation,
	useContractInteraction,
	useGasEstimation,
	useAddressUtils,
} from './useBlockchainHooks';

export { useWeb3ErrorHandler } from './useWeb3ErrorHandler';