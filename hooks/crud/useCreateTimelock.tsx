/**
 * Create Timelock Hook
 * 
 * 管理创建 Timelock 的表单状态和部署流程
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import {
	useActiveAccount,
	useActiveWalletChain,
	useSwitchActiveWalletChain,
	useActiveWallet,
} from 'thirdweb/react';

import { useApi } from '../useApi';
import { useDeployTimelock } from '../useDeployTimelock';
import { useAuthStore } from '@/store/userStore';
import { getChainObject } from '@/utils/chainUtils';
import { isSafeWallet } from '@/utils/walletUtils';
import type {
	CreateTimelockFormState,
	CreationDetails,
	CompoundTimelockParams,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseCreateTimelockReturn {
	// 表单状态
	formState: CreateTimelockFormState;
	
	// 对话框状态
	isConfirmDialogOpen: boolean;
	dialogDetails: CreationDetails;
	
	// 派生状态
	selectedChainData: { chain_id: number; display_name: string; logo_url: string; block_explorer_urls?: string } | undefined;
	isWalletSafe: boolean;
	isLoading: boolean;
	
	// 表单操作
	handleChainChange: (chainId: number) => void;
	handleMinDelayChange: (minDelay: string) => void;
	handleOwnerChange: (owner: string) => void;
	
	// 部署操作
	handleCreate: () => Promise<void>;
	handleConfirmDialogConfirm: (remark: string) => Promise<void>;
	closeConfirmDialog: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_FORM_STATE: CreateTimelockFormState = {
	selectedChain: 0,
	selectedStandard: 'compound',
	minDelay: '172800', // 2 days in seconds
	owner: '',
};

const createInitialDialogDetails = (): CreationDetails => ({
	chain_id: '',
	chainName: '',
	chainIcon: <Image src='' alt='Chain Logo' width={16} height={16} className='mr-1' />,
	timelockAddress: '',
	initiatingAddress: '',
	transactionHash: '',
	explorerUrl: '',
});

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCreateTimelock(): UseCreateTimelockReturn {
	const t = useTranslations('CreateTimelock');
	const router = useRouter();

	// ========== External Hooks ==========
	const { id: chainId } = useActiveWalletChain() || {};
	const switchChain = useSwitchActiveWalletChain();
	const { address: walletAddress } = useActiveAccount() || {};
	const wallet = useActiveWallet();
	const { chains } = useAuthStore();
	const { deployCompoundTimelock, isLoading } = useDeployTimelock();
	const { request: createTimelockReq, data: createTimelockData } = useApi();

	// ========== State ==========
	const [formState, setFormState] = useState<CreateTimelockFormState>(INITIAL_FORM_STATE);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [dialogDetails, setDialogDetails] = useState<CreationDetails>(createInitialDialogDetails);

	// ========== Derived State ==========
	const selectedChainData = useMemo(
		() => chains.find(chain => chain.chain_id === formState.selectedChain),
		[chains, formState.selectedChain]
	);

	const isWalletSafe = useMemo(() => isSafeWallet(wallet), [wallet]);

	// ========== Effects ==========
	
	// 同步链 ID
	useEffect(() => {
		if (chainId && chainId !== formState.selectedChain) {
			setFormState(prev => ({ ...prev, selectedChain: chainId }));
		}
	}, [chainId]); // eslint-disable-line react-hooks/exhaustive-deps

	// 同步钱包地址
	useEffect(() => {
		if (walletAddress && !formState.owner) {
			setFormState(prev => ({ ...prev, owner: walletAddress }));
		}
	}, [walletAddress, formState.owner]);

	// 处理创建结果
	useEffect(() => {
		if (createTimelockData?.success) {
			toast.success(t('success'));
			router.push('/timelocks');
		} else if (createTimelockData && !createTimelockData.success) {
			toast.error(
				t('failed', {
					message: createTimelockData?.error?.message || 'Unknown error occurred',
				})
			);
		}
	}, [createTimelockData, router, t]);

	// ========== Form Handlers ==========
	const handleChainChange = useCallback(
		(newChainId: number) => {
			if (!newChainId) {
				toast.error(t('pleaseSelectNetwork'));
				return;
			}

			setFormState(prev => ({ ...prev, selectedChain: newChainId }));
			const chainObject = getChainObject(newChainId);

			if (!chainObject) {
				toast.error(t('chainNotSupported', { chainId: newChainId }));
				return;
			}

			switchChain(chainObject);
		},
		[switchChain, t]
	);

	const handleMinDelayChange = useCallback((minDelay: string) => {
		setFormState(prev => ({ ...prev, minDelay }));
	}, []);

	const handleOwnerChange = useCallback((owner: string) => {
		setFormState(prev => ({ ...prev, owner }));
	}, []);

	// ========== Deploy Handlers ==========
	const handleCreate = useCallback(async () => {
		const params: CompoundTimelockParams = {
			minDelay: parseInt(formState.minDelay),
			admin: (formState.owner || walletAddress) as `0x${string}`,
		};

		const { contractAddress, transactionHash } = await deployCompoundTimelock(params);

		if (contractAddress && transactionHash) {
			setDialogDetails({
				chain_id: formState.selectedChain,
				chainName: selectedChainData?.display_name || 'Unsupported Chain',
				chainIcon: (
					<Image
						src={selectedChainData?.logo_url || ''}
						alt='Chain Logo'
						width={16}
						height={16}
						className='mr-1'
					/>
				),
				timelockAddress: contractAddress,
				initiatingAddress: formState.owner,
				transactionHash,
				explorerUrl: selectedChainData?.block_explorer_urls as string,
			});
			setIsConfirmDialogOpen(true);
		}
	}, [formState, walletAddress, selectedChainData, deployCompoundTimelock]);

	const handleConfirmDialogConfirm = useCallback(
		async (remarkFromDialog: string) => {
			await createTimelockReq('/api/v1/timelock/create-or-import', {
				chain_id: formState.selectedChain,
				remark: remarkFromDialog || '',
				standard: 'compound',
				contract_address: dialogDetails.timelockAddress,
				is_imported: false,
			});

			setIsConfirmDialogOpen(false);
		},
		[createTimelockReq, formState.selectedChain, dialogDetails.timelockAddress]
	);

	const closeConfirmDialog = useCallback(() => {
		setIsConfirmDialogOpen(false);
	}, []);

	return {
		// 表单状态
		formState,

		// 对话框状态
		isConfirmDialogOpen,
		dialogDetails,

		// 派生状态
		selectedChainData,
		isWalletSafe,
		isLoading,

		// 表单操作
		handleChainChange,
		handleMinDelayChange,
		handleOwnerChange,

		// 部署操作
		handleCreate,
		handleConfirmDialogConfirm,
		closeConfirmDialog,
	};
}
