import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/userStore';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import { defineChain } from 'thirdweb';
import { compoundTimelockAbi } from '@/contracts/abis/CompoundTimelock';
import { useContractDeployment } from '@/hooks/useBlockchainHooks';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define a type that includes the necessary fields for cancellation
interface CancellableTimelock {
	chain_id: number;
	contract_address: string;
	eta: string | number;
	target_address: string;
	value: string | number;
	function_signature: string;
	call_data_hex: string;
}

type ButtonStatus = 'idle' | 'switching' | 'cancelling' | 'confirming';

const CancelButton = ({ timelock, onCompleted }: { timelock: CancellableTimelock; onCompleted?: () => void }) => {
	const { id: chainId } = useActiveWalletChain() || {};
	const switchChain = useSwitchActiveWalletChain();
	const chains = useAuthStore(state => state.chains);
	const { signer } = useContractDeployment();
	const t = useTranslations('Transactions');
	const tc = useTranslations('common');
	const [isProcessing, setIsProcessing] = useState(false);
	const [status, setStatus] = useState<ButtonStatus>('idle');

	const handleCancel = useCallback(async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		try {
			// 如果链不匹配，自动切换链
			if (chainId !== timelock.chain_id) {
				const targetChain = chains.find(chain => chain.chain_id === timelock.chain_id);
				if (!targetChain) {
					toast.error(t('chainNotFound'));
					return;
				}

				setStatus('switching');
				toast.info(t('switchingNetwork', { network: targetChain.display_name }));
				
				await switchChain(defineChain(timelock.chain_id));
				toast.success(t('switchNetworkSuccess', { network: targetChain.display_name }));
				
				// 切换成功后，等待一小段时间让 signer 更新
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			// 开始取消交易：先提示用户在钱包中确认
			setStatus('cancelling');
			toast.info(t('walletConfirmRequired'));

			const Timelock = new ethers.Contract(
				timelock.contract_address,
				compoundTimelockAbi,
				signer
			);

			const etaTimestamp = new Date(timelock.eta);
			const eta = etaTimestamp.getTime() / 1000;

			// Ensure call_data_hex is a valid 0x-prefixed hex string
			const calldata = timelock.call_data_hex.startsWith('0x') ? timelock.call_data_hex : `0x${timelock.call_data_hex}`;

			const tx = await Timelock.cancelTransaction(
				timelock.target_address,
				timelock.value,
				timelock.function_signature,
				calldata,
				eta
			);

			// 交易已提交，等待链上确认
			setStatus('confirming');
			toast.info(t('transactionSubmitted'));

			await tx.wait();
			toast.success(t('cancelSuccess'));
			onCompleted?.();
		} catch (error) {
			console.error('Error cancelling timelock:', error);
			const message = (error as Error)?.message?.toLowerCase?.() || String(error).toLowerCase();
			if (status === 'switching') {
				toast.error(t('switchNetworkError'));
			} else if (message.includes('user rejected') || message.includes('denied')) {
				toast.info(t('walletRejected'));
			} else {
				toast.error(t('cancelError'));
			}
		} finally {
			setIsProcessing(false);
			setStatus('idle');
		}
	}, [isProcessing, chainId, timelock, chains, t, switchChain, signer, status, onCompleted]);

	const getButtonText = useCallback(() => {
		switch (status) {
			case 'switching':
				return t('switchingNetworkShort');
			case 'cancelling':
				return t('cancellingShort');
			case 'confirming':
				return t('confirmingShort');
			default:
				return tc('cancel');
		}
	}, [status, t, tc]);

	return (
		<button
			type="button"
			onClick={handleCancel}
			disabled={isProcessing}
			aria-busy={isProcessing}
			aria-label={isProcessing ? getButtonText() : tc('cancel')}
			className={cn(
				'inline-flex items-center justify-center gap-2',
				'px-5 py-2 min-w-[100px]',
				'text-sm font-medium text-gray-700',
				'bg-white border border-gray-200 rounded-xl shadow-sm',
				'transition-all duration-200 ease-out',
				'hover:bg-gray-50 hover:border-gray-300',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-1',
				'active:scale-[0.98]',
				'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100'
			)}
		>
			{isProcessing && <LoadingSpinner size="xs" color="gray" />}
			<span>{getButtonText()}</span>
		</button>
	);
};

export default CancelButton;
