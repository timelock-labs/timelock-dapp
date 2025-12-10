'use client';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import type { BaseComponentProps, VoidCallback } from '@/types';
import type { TimelockContractItem } from '@/store/schema';
import { FilePlus, FileDown } from 'lucide-react';
import TimelockSummaryCard from './TimelockSummaryCard';
import EmptyState from '@/components/ui/EmptyState';

// Define the props for the component
interface TimelockContractTableProps extends BaseComponentProps {
	data: TimelockContractItem[];
	onDataUpdate?: VoidCallback;
}

/**
 * Timelock contract table component with CRUD operations
 *
 * @param props - TimelockContractTable component props
 * @returns JSX.Element
 */
const TimelockContractTable: React.FC<TimelockContractTableProps> = ({ data, onDataUpdate, className }) => {
	const t = useTranslations('TimelockTable');
	const tc = useTranslations('common');
	const router = useRouter();

	const { data: deleteResponse, request: deleteContract } = useApi();

	const handleImportContract = () => {
		router.push(`/import-timelock`);
	};

	const handleCreateContract = () => {
		router.push(`/create-timelock`);
	};

	const handleDeleteContract = async (contract: TimelockContractItem) => {
		const standard = contract.standard || 'compound'; // 默认使用 compound 标准
		await deleteContract(`/api/v1/timelock/delete`, {
			standard,
			contract_address: contract.contract_address,
			chain_id: contract.chain_id,
		});
	};

	useEffect(() => {
		if (deleteResponse?.success === true) {
			toast.success(t('deleteSuccess'));
			if (onDataUpdate) {
				onDataUpdate();
			}
		} else if (deleteResponse?.success === false && deleteResponse.data !== null) {
			console.error('Failed to delete contract:', deleteResponse.error);
			toast.error(t('deleteError', { message: deleteResponse.error?.message || t('unknown') }));
		}
	}, [deleteResponse, onDataUpdate, t]);

    return (
        <div className={`bg-white ${className || ''}`}>
            <div className='mx-auto'>
                <div className='flex items-center mb-6 mt-4'>
                    <div className='flex-grow' />
                    <div className='flex transform -translate-y-2.5'>
                        <button
                            type='button'
                            onClick={handleImportContract}
                            className='bg-white px-4 py-2 rounded-md border border-gray-300 font-medium hover:bg-gray-50 transition-colors text-sm cursor-pointer flex items-center'>
                            <FileDown className='w-4 h-4 mr-2' />
                            {t('importExistingContract')}
                        </button>
                        <button
                            type='button'
                            onClick={handleCreateContract}
                            className='ml-2.5 bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors text-sm cursor-pointer flex items-center'>
                            <FilePlus className='w-4 h-4 mr-2' />
                            {t('createNewContract')}
                        </button>
                    </div>
                </div>
                {Array.isArray(data) && data.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {data.map((item) => {
                            const itemDelay = (item as TimelockContractItem & { delay?: number }).delay;
                            const itemGracePeriod = (item as TimelockContractItem & { grace_period?: number }).grace_period;
                            return (
                                <TimelockSummaryCard
                                    key={`${item.contract_address}-${item.chain_id}`}
                                    title={item.remark || t('timelock')}
                                    timelockAddress={item.contract_address}
                                    ownerAddress={item.admin || ''}
                                    chainId={item.chain_id}
                                    minDelaySeconds={itemDelay}
                                    gracePeriodSeconds={itemGracePeriod}
                                    permissions={(item as TimelockContractItem & { user_permissions?: string[] }).user_permissions || []}
                                    className='w-full'
                                    onDelete={() => handleDeleteContract(item)}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        }
                        title={t('noTimelockContracts')}
                        description={t('noTimelockContractsDescription')}
                        action={{
                            label: t('createNewContract'),
                            onClick: handleCreateContract,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TimelockContractTable;
