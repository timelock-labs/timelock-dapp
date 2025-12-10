/**
 * Transaction History Table
 * 
 * 重构说明：
 * 1. 使用 useTransactionHistory hook 管理数据和过滤
 * 2. 列定义使用 useMemo 优化
 * 3. 组件只负责 UI 渲染
 */

'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTransactionHistory, type HistoryTxRow, type FilterTab } from '@/hooks/crud';
import { formatDate, formatAddress } from '@/utils/utils';
import copyToClipboard from '@/utils/copy';

// Components
import TableComponent from '@/components/ui/TableComponent';
import ChainLabel from '@/components/web3/ChainLabel';
import NativeToken from '@/components/web3/NativeToken';
import TableTag from '@/components/tableContent/TableTag';
import { Button } from '@/components/ui/button';
import ExportButton from '@/components/ui/ExportButton';
import TabbedNavigation from './TabbedNavigation';

// ============================================================================
// Component
// ============================================================================

const TransactionHistoryTable: React.FC = () => {
	const t = useTranslations('Transactions_log');

	// 使用专门的 hook 管理所有状态和操作
	const {
		transactions,
		isLoading,
		activeTab,
		filterTabs,
		setActiveTab,
		handleExport,
		canExport,
		refresh,
	} = useTransactionHistory();

	// Refresh button cooldown state (3 seconds)
	const [cooldown, setCooldown] = useState(0);

	// Start a 3-second cooldown when refresh is triggered
	const handleRefresh = useCallback(async () => {
		if (cooldown > 0) return;
		await refresh();
		setCooldown(3);
	}, [cooldown, refresh]);

	// Countdown effect
	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => {
			setCooldown(prev => (prev > 1 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	// Handle tab change
	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId as FilterTab);
	};

	// 表格列定义
	const columns = useMemo(() => [
        {
            key: 'chain',
            header: t('chain'),
            render: (row: HistoryTxRow) => <div className='-ml-3'><ChainLabel chainId={row.chain_id} /></div>,
        },
        {
            key: 'remark',
            header: t('remark'),
            render: (row: HistoryTxRow) => (
                <span className="text-sm text-gray-700">{row.contract_remark}</span>
            ),
        },
        {
            key: 'tx_hash',
            header: t('txHash'),
            render: (row: HistoryTxRow) => (
                <span
                    className="text-sm border-b border-dotted border-gray-400 cursor-pointer hover:text-gray-600 hover:border-gray-600 transition-colors"
                    onClick={() => copyToClipboard(row.queue_tx_hash)}
                >
                    {formatAddress(row.queue_tx_hash)}
                </span>
            ),
        },
        {
            key: 'timelock_address',
            header: t('timelockAddress'),
            render: (row: HistoryTxRow) => (
                <div className="flex items-center gap-2">
                    <span
                        className="text-sm border-b border-dotted border-gray-400 cursor-pointer hover:text-gray-600 hover:border-gray-600 transition-colors"
                        onClick={() => copyToClipboard(row.contract_address)}
                    >
                        {formatAddress(row.contract_address)}
                    </span>
                    <Copy
                        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(row.contract_address);
                        }}
                    />
                </div>
            ),
        },
        {
            key: 'value',
            header: t('value'),
            render: (row: HistoryTxRow) => (
                <div className='flex items-center gap-1 text-sm text-gray-700'>
                    <span>{row.value}</span>
                    <NativeToken chainId={row.chain_id} />
                </div>
            ),
        },
        {
            key: 'target_address',
            header: t('targetAddress'),
            render: (row: HistoryTxRow) => {
                const addr = row.target_address;
                const start = addr.slice(0, 7);
                const end = addr.slice(-5);
                return (
                    <div className="flex items-start gap-2">
                        {/* Mobile: full address with wrapping */}
                        <span className="text-sm font-mono break-all sm:hidden">
                            {row.target_address}
                        </span>
                        {/* Desktop: previous shortened representation */}
                        <span className="hidden sm:inline text-sm font-mono">
                            <span className="font-bold">{start}</span>
                            <span className="text-gray-400 mx-1">...</span>
                            <span className="font-bold">{end}</span>
                        </span>
                        <Copy
                            className="mt-0.5 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(row.target_address);
                            }}
                        />
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            header: t('createdAt'),
            render: (row: HistoryTxRow) => (
                <span className='text-sm text-gray-600'>
                    {formatDate(row.created_at)}
                </span>
            ),
        },
        {
            key: 'eta',
            header: t('eta'),
            render: (row: HistoryTxRow) => (
                <span className='text-sm text-gray-600'>
                    {formatDate(row.eta)}
                </span>
            ),
        },
        {
            key: 'status',
            header: t('status'),
            render: (row: HistoryTxRow) => (
                <TableTag
                    label={row.status}
                    statusType={row.status === 'all' ? undefined : row.status}
                    Icon={
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'ready' ? 'bg-green-500' :
                            row.status === 'executed' ? 'bg-yellow-500' :
                                row.status === 'cancelled' ? 'bg-red-500' :
                                    row.status === 'expired' ? 'bg-gray-500' :
                                        'bg-blue-500'
                            }`} />
                    }
                />
            ),
		},
	], [t]);

	return (
		<div className='bg-white rounded-xl mb-6'>
			{/* Header */}
			<h1 className='text-2xl font-semibold mb-6'>{t('transactionsHistory')}</h1>

			{/* Filter Tabs and Export / Refresh Buttons */}
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
				{/* Filter Tabs */}
				<TabbedNavigation
					tabs={filterTabs}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>

				{/* Refresh + Export Buttons */}
				<div className='flex justify-start sm:justify-end gap-2'>
					{/* Refresh Button with 3s cooldown */}
					<Button
						variant='outline'
						onClick={handleRefresh}
						loading={isLoading}
						disabled={isLoading || cooldown > 0}
						className='inline-flex items-center gap-1'
					>
						<RotateCcw className={`w-4 h-4 ${cooldown > 0 ? 'animate-spin' : ''}`} aria-hidden='true' />
						<span>{cooldown > 0 ? `${t('refresh')} (${cooldown}s)` : t('refresh')}</span>
					</Button>
					{/* Export Button */}
					{canExport && (
						<ExportButton onClick={handleExport} />
					)}
				</div>
			</div>

			{/* Table */}
			<TableComponent<HistoryTxRow>
				columns={columns}
				data={transactions}
				showPagination={true}
				itemsPerPage={10}
				emptyState={{
					title: t('noTransactionsFound'),
					description: t('noTransactionsDescription'),
				}}
			/>
		</div>
	);
};

export default TransactionHistoryTable;
