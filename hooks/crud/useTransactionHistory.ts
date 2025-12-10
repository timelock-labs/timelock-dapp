/**
 * Transaction History Hook
 * 
 * 管理交易历史的获取、过滤和导出
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useApi } from '../useApi';
import { formatDate } from '@/utils/utils';
import type { Transaction, TransactionStatus, ContractStandard, Hash, Address, Timestamp } from '@/types';

// ============================================================================
// Types
// ============================================================================

/** 交易历史行数据 */
export interface HistoryTxRow {
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
	chainIcon?: React.ReactNode;
}

/** 过滤标签类型 */
export type FilterTab = 'all' | 'waiting' | 'ready' | 'executed' | 'cancelled' | 'expired';

interface UseTransactionHistoryOptions {
	autoFetch?: boolean;
	pageSize?: number;
}

interface FilterTabConfig {
	id: FilterTab;
	label: string;
}

interface UseTransactionHistoryReturn {
	// 数据
	transactions: HistoryTxRow[];
	isLoading: boolean;
	isEmpty: boolean;

	// 过滤
	activeTab: FilterTab;
	filterTabs: FilterTabConfig[];
	setActiveTab: (tab: FilterTab) => void;

	// 导出
	handleExport: () => Promise<void>;
	canExport: boolean;

	// 操作
	refresh: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTransactionHistory(
	options: UseTransactionHistoryOptions = {}
): UseTransactionHistoryReturn {
	const { autoFetch = true, pageSize = 100 } = options;

	const t = useTranslations('Transactions_log');

	// State
	const [transactions, setTransactions] = useState<HistoryTxRow[]>([]);
	const [activeTab, setActiveTab] = useState<FilterTab>('all');
	const [isLoading, setIsLoading] = useState(false);

	// API
	const { request: getTransactionList } = useApi();

	// Filter tabs configuration - all statuses for history table
	const filterTabs = useMemo<FilterTabConfig[]>(
		() => [
			{ id: 'all', label: t('viewAll') },
			{ id: 'waiting', label: t('waiting') },
			{ id: 'ready', label: t('ready') },
			{ id: 'executed', label: t('executed') },
			{ id: 'cancelled', label: t('cancelled') },
			{ id: 'expired', label: t('expired') },
		],
		[t]
	);

	// ========== Fetch ==========
	const fetchTransactions = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data } = await getTransactionList('/api/v1/flows/list', {
				page: 1,
				page_size: pageSize,
				status: activeTab === 'all' ? 'all' : activeTab,
			});

			const flows = data?.flows ?? [];
			if (flows.length > 0) {
				const transformedData: HistoryTxRow[] = flows.map((tx: Transaction) => ({
					...tx,
					chainIcon: null,
				}));
				setTransactions(transformedData);
			} else {
				setTransactions([]);
			}
		} catch (error) {
			console.error('Failed to fetch transaction history:', error);
			setTransactions([]);
		} finally {
			setIsLoading(false);
		}
	}, [getTransactionList, activeTab, pageSize]);

	// 自动加载 & 当 activeTab 变化时重新加载
	useEffect(() => {
		if (autoFetch) {
			fetchTransactions();
		}
	}, [autoFetch, fetchTransactions]);

	// ========== Export ==========
	const handleExport = useCallback(async () => {
		if (transactions.length === 0) {
			toast.warning(t('noDataToExport'));
			return;
		}

		try {
			// 动态导入 XLSX 库
			const XLSX = await import('xlsx');

			// 准备导出数据
			const exportData = transactions.map(tx => ({
				Chain: tx.chain_id,
				Remark: tx.contract_remark,
				'Transaction Hash': tx.queue_tx_hash,
				'Timelock Address': tx.contract_address,
				'Target Address': tx.target_address,
				Value: tx.value,
				'Function Signature': tx.function_signature,
				Status: tx.status,
				'Created At': formatDate(tx.created_at),
				ETA: formatDate(tx.eta),
				'Expired At': formatDate(tx.expired_at),
			}));

			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction History');

			// 生成带日期的文件名
			const timestamp = new Date().toISOString().split('T')[0];
			const filename = `transaction-history-${timestamp}.xlsx`;

			XLSX.writeFile(workbook, filename);
			toast.success(t('exportSuccess'));
		} catch (error) {
			console.error('Export failed:', error);
			toast.error(t('exportError'));
		}
	}, [transactions, t]);

	// ========== Derived State ==========
	const isEmpty = transactions.length === 0;
	const canExport = transactions.length > 0;

	return {
		// 数据
		transactions,
		isLoading,
		isEmpty,

		// 过滤
		activeTab,
		filterTabs,
		setActiveTab,

		// 导出
		handleExport,
		canExport,

		// 操作
		refresh: fetchTransactions,
	};
}
