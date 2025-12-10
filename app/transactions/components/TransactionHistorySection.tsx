'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportButton from '@/components/ui/ExportButton';
import TabbedNavigation from './TabbedNavigation';
import TransactionCard from './TransactionCard';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Transaction, BaseComponentProps, TransactionStatus, ContractStandard, Hash, Address, Timestamp } from '@/types';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import AddSVG from '@/components/icons/add';
import { formatDate } from '@/utils/utils';
import SectionCard from '@/components/layout/SectionCard';
import { CHAIN_ID_TO_CHAIN } from '@/utils/chainUtils';
import CancelButton from './CancelButton';
import ExecuteButton from './ExecuteButton';
import EmptyState from '@/components/ui/EmptyState';

// Define Transaction type specific to this table
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
 * Transaction history section component with filtering and export functionality
 *
 * @param props - TransactionHistorySection component props
 * @returns JSX.Element
 */
const TransactionHistorySection: React.FC<BaseComponentProps> = () => {
	const t = useTranslations('Transactions');
	const [activeTab, setActiveTab] = useState('all');
	const [historyTxs, setHistoryTxs] = useState<HistoryTxRow[]>([]);
	const [tabCounts, setTabCounts] = useState<{ all: number; waiting: number; ready: number }>({
		all: 0,
		waiting: 0,
		ready: 0,
	});
	const [cooldown, setCooldown] = useState(0);

	const { request: getTransactionList } = useApi();
	const router = useRouter();

	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId);
	};



	// Fetch tab counts
	const fetchTabCounts = useCallback(async () => {
		try {
			// Fetch counts for waiting and ready statuses in parallel
			const [waitingResult, readyResult] = await Promise.all([
				getTransactionList('/api/v1/flows/list', { page: 1, page_size: 1, status: 'waiting' }),
				getTransactionList('/api/v1/flows/list', { page: 1, page_size: 1, status: 'ready' }),
			]);

			const waitingCount = waitingResult?.data?.total || 0;
			const readyCount = readyResult?.data?.total || 0;

			setTabCounts({
				all: waitingCount + readyCount,
				waiting: waitingCount,
				ready: readyCount,
			});
		} catch (error) {
			console.error('Failed to fetch tab counts:', error);
		}
	}, [getTransactionList]);

	// Fetch transaction history
	const fetchHistoryTransactions = useCallback(async () => {
		try {
			// 当为 "all" 标签时，需要同时展示 waiting 和 ready 的交易，
			// 否则如果从混合列表中再前端过滤，会出现数量与顶部统计不一致的问题。
			if (activeTab === 'all') {
				const [waitingRes, readyRes] = await Promise.all([
					getTransactionList('/api/v1/flows/list', {
						page: 1,
						page_size: 10,
						status: 'waiting',
					}),
					getTransactionList('/api/v1/flows/list', {
						page: 1,
						page_size: 10,
						status: 'ready',
					}),
				]);

				const waitingFlows = (waitingRes?.data?.flows ?? []) as Transaction[];
				const readyFlows = (readyRes?.data?.flows ?? []) as Transaction[];
				const mergedFlows = [...waitingFlows, ...readyFlows];

				const transformedData: HistoryTxRow[] = mergedFlows.map((tx: Transaction) => ({
					...tx,
				}));

				setHistoryTxs(transformedData);
			} else {
				const { data } = await getTransactionList('/api/v1/flows/list', {
					page: 1,
					page_size: 10,
					status: activeTab as TransactionStatus,
				});

				const flows = (data?.flows ?? []) as Transaction[];
				const transformedData: HistoryTxRow[] = flows.map((tx: Transaction) => ({
					...tx,
				}));

				setHistoryTxs(transformedData);
			}
		} catch (error) {
			console.error('Failed to fetch transaction history:', error);
			toast.error(t('fetchHistoryTxsError'));
		}
	}, [activeTab, getTransactionList, t]);

	// Fetch counts and history on mount
	useEffect(() => {
		const fetchAll = async () => {
			await Promise.all([fetchTabCounts(), fetchHistoryTransactions()]);
		};

		fetchAll();
	}, [fetchTabCounts, fetchHistoryTransactions]);

	// Countdown effect for refresh button (3s cooldown)
	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => {
			setCooldown(prev => (prev > 1 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	// Shared refresh logic for counts and history
	const refreshData = useCallback(async () => {
		await Promise.all([fetchTabCounts(), fetchHistoryTransactions()]);
		// Notify other parts of the app (e.g. sidebar) that transaction data has been updated
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new Event('transactions:updated'));
		}
	}, [fetchTabCounts, fetchHistoryTransactions]);

	// Delayed refresh after on-chain actions (cancel/execute)
	const handleActionCompleted = useCallback(() => {
		setTimeout(() => {
			void refreshData();
		}, 3000);
	}, [refreshData]);

	// Unified refresh handler for the button (with cooldown)
	const handleRefresh = useCallback(async () => {
		if (cooldown > 0) return;
		await refreshData();
		setCooldown(3);
	}, [cooldown, refreshData]);

	// all, waiting, ready - only show active transaction statuses
	const historyTabs = [
		{ id: 'all', label: t('all'), count: tabCounts.all },
		{ id: 'waiting', label: t('waiting'), count: tabCounts.waiting },
		{ id: 'ready', label: t('ready'), count: tabCounts.ready },
	];

	const handleExport = async () => {
		if (historyTxs.length === 0) {
			toast.warning(t('noDataToExport'));
			return;
		}

		try {
			// 动态导入XLSX库
			const XLSX = await import('xlsx');

			const worksheet = XLSX.utils.json_to_sheet(historyTxs);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction History');

			// Generate filename with current date
			const now = new Date();
			const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
			const filename = `transaction-history-${timestamp}.xlsx`;

			XLSX.writeFile(workbook, filename);
			toast.success(t('exportSuccess'));
		} catch (error) {
			console.error('Export failed:', error);
			toast.error(t('exportError'));
		}
	};

	// Map status to TransactionCard status type
	const mapStatus = (status: TransactionStatus): 'waiting' | 'ready' | 'executed' | 'expired' => {
		switch (status) {
			case 'waiting':
				return 'waiting';
			case 'ready':
				return 'ready';
			case 'executed':
				return 'executed';
			case 'expired':
			case 'cancelled':
			default:
				return 'expired';
		}
	};

	return (
		<>
			<SectionCard>
				<div className='flex flex-col'>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
						<div>
							<TabbedNavigation tabs={historyTabs} activeTab={activeTab} onTabChange={handleTabChange} />
						</div>
						<div className='flex items-center justify-start sm:justify-end space-x-3'>
						{/* Refresh Button with 3s cooldown */}
						<Button
							variant='outline'
							onClick={handleRefresh}
							disabled={cooldown > 0}
							className='inline-flex items-center gap-1'
						>
							<RotateCcw className={`w-4 h-4 ${cooldown > 0 ? 'animate-spin' : ''}`} aria-hidden='true' />
							<span>{cooldown > 0 ? `${t('refresh')} (${cooldown}s)` : t('refresh')}</span>
						</Button>
							{historyTxs.length > 0 && <ExportButton onClick={handleExport} />}
							<button
								type='button'
								onClick={() => {
									router.push('/create-transaction');
								}}
								className='cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'>
								<AddSVG />
								<span>{t('create')}</span>
							</button>
						</div>
					</div>
				</div>

				{/* Transaction Cards List - max height for 2 cards with scroll (smaller on mobile) */}
				<div className='flex flex-col gap-4 max-h-[240px] md:max-h-[480px] overflow-y-auto'>
				{historyTxs.length === 0 ? (
					<EmptyState
						title={t('noTransactions')}
						description={activeTab === 'all' ? t('noTransactionsDescription') : t('noTransactionsForStatus')}
						action={{
							label: t('create'),
							onClick: () => router.push('/create-transaction'),
						}}
					/>
				) : (
					historyTxs.map(tx => (
						<TransactionCard
							key={tx.flow_id}
							status={mapStatus(tx.status)}
							title={tx.contract_remark || t('contractInteraction')}
							timelockAddress={tx.contract_address}
							value={tx.value || '0'}
							valueUnit="ETH"
							targetAddress={tx.target_address}
							transactionHash={tx.queue_tx_hash}
							chainId={tx.chain_id}
							chain={
								CHAIN_ID_TO_CHAIN[tx.chain_id as keyof typeof CHAIN_ID_TO_CHAIN]?.name ||
								t('unknownChain', { chainId: tx.chain_id })
							}
							createdAt={formatDate(tx.created_at)}
							eta={formatDate(tx.eta)}
							expiredAt={formatDate(tx.expired_at)}
							functionSignature={tx.function_signature}
							callDataHex={tx.call_data_hex}
							actionButtons={
								<>
									{tx.status === 'waiting' && (
										<CancelButton timelock={tx} onCompleted={handleActionCompleted} />
									)}
									{tx.status === 'ready' && (
										<ExecuteButton timelock={tx} onCompleted={handleActionCompleted} />
									)}
								</>
							}
						/>
					))
				)}
				</div>
			</SectionCard>
		</>
	);
};

export default TransactionHistorySection;
