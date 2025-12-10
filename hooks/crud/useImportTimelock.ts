/**
 * Import Timelock Hook
 * 
 * 管理导入 Timelock 的表单状态、验证和导入流程
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useActiveWalletChain } from 'thirdweb/react';

import { useApi } from '../useApi';
import { useTimelockImport, type TimelockParameters } from '../useTimelockImport';
import type { ImportTimelockRequest } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface ImportTimelockFormState {
	chainId: string;
	contractAddress: string;
	standard: string;
	remarks: string;
}

interface ModalParameters {
	chainId: string;
	chainName: string;
	isValid: boolean;
	standard: string;
	contractAddress: string;
	minDelay: number;
	admin: string;
	gracePeriod: number;
	minimumDelay: number;
	maximumDelay: number;
}

interface UseImportTimelockReturn {
	// 表单状态
	formState: ImportTimelockFormState;
	isFormValid: boolean;
	
	// Modal 状态
	isModalOpen: boolean;
	modalParams: ModalParameters;
	
	// 加载状态
	isDetecting: boolean;
	
	// 表单操作
	updateField: (field: keyof ImportTimelockFormState, value: string) => void;
	
	// 流程操作
	handleNextStep: () => Promise<void>;
	handleConfirmImport: () => Promise<void>;
	closeModal: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FORM_STATE: ImportTimelockFormState = {
	chainId: '',
	contractAddress: '',
	standard: 'compound',
	remarks: '',
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useImportTimelock(): UseImportTimelockReturn {
	const t = useTranslations('ImportTimelock');
	const router = useRouter();

	// ========== State ==========
	const [formState, setFormState] = useState<ImportTimelockFormState>(INITIAL_FORM_STATE);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [detectedParams, setDetectedParams] = useState<TimelockParameters | null>(null);

	// ========== External Hooks ==========
	const { id: walletChainId } = useActiveWalletChain() || {};
	const {
		isLoading: isDetecting,
		fetchTimelockParameters,
		validateContractAddress,
		clearParameters,
	} = useTimelockImport();
	const { request: importTimelock, data: importResult } = useApi();

	// ========== Form Update ==========
	const updateField = useCallback(
		(field: keyof ImportTimelockFormState, value: string) => {
			setFormState(prev => ({ ...prev, [field]: value }));
		},
		[]
	);

	// ========== Effects ==========

	// Sync wallet chain to form
	useEffect(() => {
		if (walletChainId && !formState.chainId) {
			updateField('chainId', walletChainId.toString());
		}
	}, [walletChainId, formState.chainId, updateField]);

	// Clear detected params when contract address changes
	useEffect(() => {
		if (detectedParams) {
			setDetectedParams(null);
			clearParameters();
		}
	}, [formState.contractAddress]); // eslint-disable-line react-hooks/exhaustive-deps

	// Handle import result
	useEffect(() => {
		if (importResult?.success) {
			toast.success(t('success.importSuccess'));
			router.push('/timelocks');
		} else if (importResult && !importResult.success) {
			toast.error(t('failedToImportTimelock'));
		}
	}, [importResult, router, t]);

	// ========== Derived State ==========
	const isFormValid = useMemo(
		() => !!(formState.chainId && formState.contractAddress && formState.standard),
		[formState.chainId, formState.contractAddress, formState.standard]
	);

	const modalParams = useMemo<ModalParameters>(
		() => ({
			chainId: formState.chainId,
			chainName: '',
			isValid: detectedParams?.isValid ?? false,
			standard: detectedParams?.standard ?? '',
			contractAddress: detectedParams?.contractAddress ?? '',
			minDelay: detectedParams?.minDelay ?? 0,
			admin: detectedParams?.admin ?? '',
			gracePeriod: detectedParams?.gracePeriod ?? 0,
			minimumDelay: detectedParams?.minimumDelay ?? 0,
			maximumDelay: detectedParams?.maximumDelay ?? 0,
		}),
		[formState.chainId, detectedParams]
	);

	// ========== Handlers ==========
	const handleNextStep = useCallback(async () => {
		// Validation
		if (!formState.chainId) {
			toast.error(t('errors.selectChain'));
			return;
		}

		if (!formState.contractAddress) {
			toast.error(t('errors.enterContractAddress'));
			return;
		}

		if (!formState.standard) {
			toast.error(t('errors.selectContractStandard'));
			return;
		}

		try {
			// Validate contract address
			toast.info(t('status.validatingAddress'));
			const isValid = await validateContractAddress(formState.contractAddress);
			if (!isValid) {
				toast.error(t('errors.invalidContractAddress'));
				return;
			}

			// Fetch timelock parameters
			toast.info(t('status.detectingParameters'));
			const params = await fetchTimelockParameters(formState.contractAddress);
			if (!params.isValid) {
				toast.error(t('errors.failedToDetectParameters'));
				return;
			}

			toast.success(t('status.parametersDetected'));
			setDetectedParams(params);
			setIsModalOpen(true);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			toast.error(t('errors.detectionFailed', { message: errorMessage }));
		}
	}, [formState, validateContractAddress, fetchTimelockParameters, t]);

	const handleConfirmImport = useCallback(async () => {
		if (!detectedParams?.isValid) {
			toast.error(t('errors.invalidTimelockParameters'));
			return;
		}

		toast.info(t('status.importing'));

		try {
			const importData: ImportTimelockRequest = {
				chain_id: parseInt(formState.chainId),
				contract_address: formState.contractAddress,
				standard: detectedParams.standard!,
				remark: formState.remarks || t('defaultRemark'),
				is_imported: true,
			};

			const result = await importTimelock('/api/v1/timelock/create-or-import', importData);
			
			if (!result?.success) {
				toast.error(t('errors.importFailed'));
				return;
			}
			
			setIsModalOpen(false);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			toast.error(t('errors.importFailed') + ': ' + errorMessage);
		}
	}, [detectedParams, formState, importTimelock, t]);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	return {
		// 表单状态
		formState,
		isFormValid,

		// Modal 状态
		isModalOpen,
		modalParams,

		// 加载状态
		isDetecting,

		// 表单操作
		updateField,

		// 流程操作
		handleNextStep,
		handleConfirmImport,
		closeModal,
	};
}
