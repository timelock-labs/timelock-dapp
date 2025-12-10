/**
 * Create Transaction Hook
 * 
 * 管理创建交易的表单状态、编码逻辑和提交流程
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';

import { useTimelockTransaction } from '../useTimelockTransaction';
import { useAuthStore } from '@/store/userStore';
import { createErrorMessage } from '../useHookUtils';
import generatePreview from '@/utils/generatePreview';
import EthereumParamsCodec from '@/utils/ethereumParamsCodec';

// ============================================================================
// Types
// ============================================================================

export interface TransactionFormState {
	timelockType: string;
	timelockMethod: string;
	timelockAddress: string;
	target: string;
	value: string;
	abiValue: string;
	functionValue: string;
	timeValue: number;
	argumentValues: string[];
	selectedMailbox: string[];
}

interface UseCreateTransactionReturn {
	// 表单状态
	formState: TransactionFormState;
	
	// Calldata
	targetCalldata: string;
	timelockCalldata: string;
	
	// 预览
	previewContent: ReturnType<typeof generatePreview>;
	
	// 提交状态
	isSubmitting: boolean;
	
	// 表单操作
	updateForm: <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => void;
	handleArgumentChange: (index: number, value: string) => void;
	handleFunctionChange: (value: string) => void;
	handleAbiChange: (value: string) => void;
	
	// 提交操作
	handleSendTransaction: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIME_OFFSET_DAYS = 2;
const DEFAULT_TIME_HOUR = 14;

const getDefaultTimeValue = (): number => {
	const now = new Date();
	now.setDate(now.getDate() + DEFAULT_TIME_OFFSET_DAYS);
	now.setHours(DEFAULT_TIME_HOUR, 0, 0, 0);
	return Math.floor(now.getTime() / 1000);
};

const INITIAL_FORM_STATE: TransactionFormState = {
	timelockType: '',
	timelockMethod: '',
	timelockAddress: '',
	target: '',
	value: '',
	abiValue: '',
	functionValue: '',
	timeValue: getDefaultTimeValue(),
	argumentValues: [],
	selectedMailbox: [],
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCreateTransaction(): UseCreateTransactionReturn {
	const router = useRouter();
	const t = useTranslations('CreateTransaction');
	const tc = useTranslations('common');

	// ========== External Hooks ==========
	// For create-transaction page, disable gas estimation to avoid
	// UNPREDICTABLE_GAS_LIMIT errors from restricted timelock calls while
	// still allowing the actual transaction to be sent normally.
	// Also disable internal toasts here so this hook can manage all user-facing
	// messages consistently for this flow.
	const { sendTransaction } = useTimelockTransaction({ estimateGas: false, showToasts: false });
	const { address } = useActiveAccount() || {};
	const { id: chainId } = useActiveWalletChain() || {};
	const { allTimelocks } = useAuthStore();

	// ========== State ==========
	const [formState, setFormState] = useState<TransactionFormState>(INITIAL_FORM_STATE);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [targetCalldata, setTargetCalldata] = useState('');
	const [timelockCalldata, setTimelockCalldata] = useState('');

	// ========== Form Update ==========
	const updateForm = useCallback(<K extends keyof TransactionFormState>(
		field: K,
		value: TransactionFormState[K]
	) => {
		setFormState(prev => ({ ...prev, [field]: value }));
	}, []);

	// ========== Encoding Effects ==========
	
	// Encode target calldata when function or arguments change
	useEffect(() => {
		if (!formState.functionValue || formState.argumentValues.length === 0) {
			setTargetCalldata('');
			return;
		}

		try {
			const codec = new EthereumParamsCodec();
			const result = codec.encodeParams(formState.functionValue, formState.argumentValues);
			setTargetCalldata(result.success ? result.encodedData : '');
		} catch {
			setTargetCalldata('');
		}
	}, [formState.functionValue, formState.argumentValues]);

	// Encode timelock calldata when target calldata changes
	useEffect(() => {
		if (!targetCalldata || !formState.timelockMethod) {
			setTimelockCalldata('');
			return;
		}

		try {
			const codec = new EthereumParamsCodec();
			const result = codec.encodeByFunctionSigAndParams(formState.timelockMethod, [
				formState.target,
				formState.value,
				formState.functionValue,
				targetCalldata,
				String(formState.timeValue),
			]);
			setTimelockCalldata(result.success ? result.encodedData : '');
		} catch {
			setTimelockCalldata('');
		}
	}, [
		targetCalldata,
		formState.timelockMethod,
		formState.target,
		formState.value,
		formState.functionValue,
		formState.timeValue,
	]);

	// ========== Preview ==========
	const previewContent = useMemo(
		() =>
			generatePreview({
				allTimelocks,
				timelockType: formState.timelockType,
				functionValue: formState.functionValue,
				argumentValues: formState.argumentValues,
				selectedMailbox: formState.selectedMailbox,
				timeValue: formState.timeValue,
				targetCalldata,
				abiValue: formState.abiValue,
				address,
				timelockAddress: formState.timelockAddress,
				timelockMethod: formState.timelockMethod,
				target: formState.target,
				value: formState.value,
				timelockCalldata,
			}),
		[allTimelocks, formState, targetCalldata, timelockCalldata, address]
	);

	// ========== Form Handlers ==========
	const handleArgumentChange = useCallback((index: number, value: string) => {
		setFormState(prev => {
			const newArgs = [...prev.argumentValues];
			newArgs[index] = value;
			return { ...prev, argumentValues: newArgs };
		});
	}, []);

	const handleFunctionChange = useCallback((value: string) => {
		setFormState(prev => ({
			...prev,
			functionValue: value,
			argumentValues: [], // Clear arguments when function changes
		}));
	}, []);

	const handleAbiChange = useCallback((value: string) => {
		setFormState(prev => ({
			...prev,
			abiValue: value,
			functionValue: '', // Clear function when ABI changes
			argumentValues: [], // Clear arguments when ABI changes
		}));
	}, []);

	// ========== Submit Handler ==========
	const handleSendTransaction = useCallback(async () => {
		// Validation
		if (!address) {
			toast.error(tc('pleaseConnectWalletFirst'));
			return;
		}

		if (!chainId) {
			toast.error(t('pleaseSelectNetwork'));
			return;
		}

		if (
			!formState.timelockAddress ||
			!formState.target ||
			!formState.functionValue ||
			!formState.timeValue
		) {
			toast.error(t('pleaseFillInAllRequiredFields'));
			return;
		}

		setIsSubmitting(true);

		let toastId: string | number | undefined;
		try {
			// 只有 executeTransaction 需要发送真正的 ETH
			// queueTransaction 和 cancelTransaction 的 value 只是函数参数，交易本身不需要发送 ETH
			const isExecuteTransaction = formState.timelockMethod.startsWith('executeTransaction');
			const transactionValue = isExecuteTransaction ? (formState.value || '0') : '0';

			// 显示钱包确认提示
			toastId = toast.loading(t('pleaseConfirmTransactionInYourWallet'));

			await sendTransaction({
				toAddress: formState.timelockAddress,
				calldata: timelockCalldata,
				value: transactionValue,
			});

			// 用户已在钱包确认，交易已发送，提示创建成功
			if (toastId !== undefined) {
				toast.dismiss(toastId);
			}
			toast.success(t('success'));
			router.push('/transactions');
		} catch (error) {
			if (toastId !== undefined) {
				toast.dismiss(toastId);
			}
			const message = createErrorMessage(error);
			const lower = message.toLowerCase();
			if (lower.includes('user rejected') || lower.includes('denied')) {
				toast.error(t('transactionRejectedByUser'));
			} else {
				toast.error(t('failed', { message }));
			}
		} finally {
			setIsSubmitting(false);
		}
	}, [address, chainId, formState, timelockCalldata, sendTransaction, router, t, tc]);

	return {
		// 表单状态
		formState,

		// Calldata
		targetCalldata,
		timelockCalldata,

		// 预览
		previewContent,

		// 提交状态
		isSubmitting,

		// 表单操作
		updateForm,
		handleArgumentChange,
		handleFunctionChange,
		handleAbiChange,

		// 提交操作
		handleSendTransaction,
	};
}
