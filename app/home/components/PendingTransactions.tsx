'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn, formatDate } from '@/utils/utils';
import { useApi } from '@/hooks/useApi';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import TransactionDetailsCard from '@/components/ui/TransactionDetailsCard';
import type { TransactionStatus, ContractStandard, Hash, Address, Timestamp } from '@/types';
import { useRouter } from 'next/navigation';

interface PendingTransactionsProps {
	className?: string;
}
interface HistoryTxRow {
	id: number;
	flow_id: Hash;
	timelock_standard: ContractStandard;
	chain_id: number;
	contract_address: Address;
	contract_remark: string;
	function_signature: string;
	status: TransactionStatus;
	queue_tx_hash: Hash;
	initiator_address: Address;
	target_address: Address;
	call_data_hex: string;
	value: string;
	eta: Timestamp;
	expired_at: Timestamp;
	created_at: Timestamp;
	updated_at: Timestamp;
}

/**
 * Pending transactions table component
 */
const PendingTransactions: React.FC<PendingTransactionsProps> = ({ className }) => {
	const t = useTranslations('Transactions');
	const t2 = useTranslations('home_page');
	const [pendingTxs, setPendingTxs] = useState<HistoryTxRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const { request: getPendingTransactions } = useApi();
	const fetchPendingTransactions = useCallback(async () => {
		setIsLoading(true);
		try {
			const [waitingResponse, readyResponse] = await Promise.all([
				getPendingTransactions('/api/v1/flows/list', {
					page: 1,
					page_size: 50,
					standard: 'compound',
					status: 'waiting',
				}),
				getPendingTransactions('/api/v1/flows/list', {
					page: 1,
					page_size: 50,
					standard: 'compound',
					status: 'ready',
				}),
			]);

			const waitingFlows = waitingResponse?.data?.flows || [];
			const readyFlows = readyResponse?.data?.flows || [];

			const transformedData = [...waitingFlows, ...readyFlows] as HistoryTxRow[];
			setPendingTxs(transformedData);
		} catch (error) {
			console.error('Failed to fetch pending transactions:', error);
			toast.error(t('fetchPendingTxsError'));
		} finally {
			setIsLoading(false);
		}
	}, [getPendingTransactions, t]);

	useEffect(() => {
		fetchPendingTransactions();
	}, [fetchPendingTransactions]);



	return (
		<article
			className={cn(
				'bg-[#F9FAFB] rounded-xl p-6 pt-4 border border-gray-100 shadow-sm w-full',
				'flex flex-col h-full',
				className
			)}
		>

			<div className='mb-2' >
				<h2 className='font-semibold flex items-center gap-2 text-gray-900'>
					{t('pendingTransactions')}
					<span className='text-[10px] bg-black inline-block text-white rounded-[4px] h-[16px] w-[16px] text-center'>{pendingTxs.length}</span>
				</h2>
				<div className='flex justify-between items-center gap-2 mt-2'>
					<p className='text-sm text-gray-500'>
						{t('transactionHistory')}
					</p>
					<Link
						href='/transactions'
						className='flex items-center text-xs font-semibold tracking-wide text-gray-400 uppercase transition-colors hover:text-gray-600'
					>
						{t2('viewAllTransactions')} <span className='ml-1 text-sm'>›</span>
					</Link>
				</div>
			</div>


			{/* Content */}
			<div className='flex-1 overflow-hidden'>
				{isLoading ? (
					<TableSkeleton rows={5} columns={7} showHeader={false} showPagination={false} />
				) : pendingTxs.length === 0 ? (
					<EmptyState
						title={t('noTransactions')}
						description={t('noTransactionsDescription')}
						size='lg'
						className='h-full'
						action={{
							label: t('create'),
							onClick: () => router.push('/create-transaction'),
						}}
					/>
				) : (
					<div className='flex flex-col gap-4 h-full overflow-y-auto'>
						{pendingTxs.map(row => (
							<TransactionDetailsCard
								key={row.queue_tx_hash || String(row.id)}
								value={row.value || '0'}
								valueUnit={'ETH'}
								targetAddress={row.target_address || '-'}
								transactionHash={row.queue_tx_hash}
								chainId={row.chain_id}
								createdAt={formatDate(row.created_at)}
								eta={formatDate(row.eta)}
								expiredAt={formatDate(row.expired_at)}
								functionSignature={row.function_signature}
								callDataHex={row.call_data_hex}
							/>
						))}
					</div>
				)}
			</div>
		</article>
	);
};

export default PendingTransactions;
