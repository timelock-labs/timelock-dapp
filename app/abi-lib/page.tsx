/**
 * ABI Library Page
 * 
 * 重构说明：
 * 1. 使用 useAbiLibrary hook 管理所有状态和操作
 * 2. 组件只负责 UI 渲染和列定义
 * 3. 代码从 201 行减少到约 100 行
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FileCode2 } from 'lucide-react';

import { useAbiLibrary } from '@/hooks/crud';
import { formatDateWithYear } from '@/utils/utils';

// Components
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EllipsesSVG from '@/components/icons/ellipses';
import TableTag from '@/components/tableContent/TableTag';
import AddABIForm from './components/AddABIForm';
import ViewABIForm from './components/ViewABIForm';
import ABIRowDropdown from './components/RowDropdown';
import LoadingSkeleton from './components/LoadingSkeleton';
import PageCard from './components/PageCard';

import type { ABIRow, ABIContent } from '@/types';

// ============================================================================
// Component
// ============================================================================

const ABILibPage: React.FC = () => {
	const t = useTranslations('ABI-Lib');
	const tc = useTranslations('common');

	// 使用专门的 hook 管理所有状态和操作
	const {
		abis,
		isLoading,
		addModal,
		viewModal,
		deleteDialog,
		dropdown,
		handleView,
		handleDelete,
	} = useAbiLibrary();

	// 表格列定义
	const columns = useMemo(
		() => [
			{
				key: 'name',
				header: t('abiName'),
				render: (row: ABIRow) => (
					<div
						className='flex items-center space-x-2 cursor-pointer'
						onClick={() => handleView(row)}
					>
						<FileCode2 className='h-4 w-4 text-gray-500' />
						<span>{row.name}</span>
					</div>
				),
			},
			{
				key: 'created_at',
				header: t('addedTime'),
				render: (row: ABIRow) => formatDateWithYear(row.created_at),
			},
			{
				key: 'type',
				header: t('abiType'),
				render: (row: ABIRow) => (
					<TableTag
						label={row.is_shared ? t('platformShared') : t('userImported')}
						colorType={row.is_shared ? 'default' : 'green'}
					/>
				),
			},
			{
				key: 'operations',
				header: t('operations'),
				render: (row: ABIRow) => (
					<div className='relative'>
						<button
							ref={el => {
								dropdown.buttonRefs.current[row.id] = el;
							}}
							type='button'
							onClick={() => dropdown.toggle(row.id)}
							className='hover:text-black p-1 rounded hover:bg-gray-100 transition-colors'
							aria-label='More options'
						>
							<EllipsesSVG />
						</button>
						<ABIRowDropdown
							isOpen={dropdown.openId === row.id}
							dropdownRef={dropdown.dropdownRef}
							onDelete={() => handleDelete(row)}
							onView={() => handleView(row)}
							t={t}
							isShared={row.is_shared}
							buttonRef={
								dropdown.buttonRefs.current[row.id]
									? { current: dropdown.buttonRefs.current[row.id]! }
									: undefined
							}
						/>
					</div>
				),
			},
		],
		[t, handleView, handleDelete, dropdown]
	);

	// Loading 状态
	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<>
			{/* 主内容 */}
			<PageCard
				abis={abis}
				columns={columns}
				setIsAddABIOpen={addModal.open}
			/>

			{/* Add Modal */}
			<AddABIForm isOpen={addModal.isOpen} onClose={addModal.close} />

			{/* View Modal */}
			<ViewABIForm
				isOpen={viewModal.isOpen}
				onClose={viewModal.close}
				viewAbiContent={viewModal.content as ABIContent}
			/>

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={deleteDialog.isOpen}
				onClose={deleteDialog.cancel}
				onConfirm={deleteDialog.confirm}
				title={t('deleteDialog.title')}
				description={t('deleteDialog.description', {
					name: deleteDialog.abi?.name || '',
				})}
				confirmText={tc('delete')}
				cancelText={tc('cancel')}
				variant='destructive'
			/>
		</>
	);
};

export default ABILibPage;
