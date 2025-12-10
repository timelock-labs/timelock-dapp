'use client';
import { useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo } from 'react';
import EmptyState from './EmptyState';
import { cn } from '@/utils/utils';

// Define types for columns and data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Column<T = any> {
	key: string; // Unique key for the column, used to access data from row object
	header: string; // Header text to display in the table
	render?: (row: T, rowIndex: number) => React.ReactNode; // Optional custom renderer for cells
}

// Empty state configuration
interface EmptyStateConfig {
	icon?: React.ReactNode; // Custom icon for empty state
	title?: string; // Custom title (if not provided, uses default translation)
	description?: string; // Custom description
	action?: {
		label: string;
		onClick: () => void;
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GenericTableProps<T = any> {
	title?: string; // Optional title for the table card (e.g., "Pending Transactions")
	columns: Column<T>[]; // Array of column definitions
	data: T[]; // Array of row data objects
	showPagination?: boolean; // Whether to display pagination controls (default: true)
	itemsPerPage?: number; // Number of items to show per page (default: 10)
	headerActions?: React.ReactNode; // Slot for custom elements above the table, e.g., buttons
	emptyState?: EmptyStateConfig; // Custom empty state configuration
}

// Using a generic type `T` for the row data. `T` must extend an object with an 'id' for keying.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableComponent<T extends { id: string | number } = any>({ 
	title, 
	columns, 
	data, 
	showPagination = true, 
	itemsPerPage = 10, 
	headerActions, 
	emptyState 
}: GenericTableProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);
	const t = useTranslations('common');

	// Memoize pagination calculations
	const { totalPages, currentItems, currentRangeStart, currentRangeEnd, totalItems } = useMemo(() => {
		const total = data.length;
		const pages = Math.ceil(total / itemsPerPage);
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		
		return {
			totalItems: total,
			totalPages: pages,
			currentItems: data.slice(startIndex, endIndex),
			currentRangeStart: startIndex + 1,
			currentRangeEnd: Math.min(endIndex, total),
		};
	}, [data, currentPage, itemsPerPage]);

	// Memoize pagination range with dots
	const paginationRange = useMemo(() => {
		const delta = 1;
		const range: number[] = [];
		const rangeWithDots: (number | string)[] = [];
		let l: number | undefined;

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
				range.push(i);
			}
		}

		for (const i of range) {
			if (l !== undefined) {
				if (i - l === 2) {
					rangeWithDots.push(l + 1);
				} else if (i - l !== 1) {
					rangeWithDots.push('...');
				}
			}
			rangeWithDots.push(i);
			l = i;
		}

		return rangeWithDots;
	}, [totalPages, currentPage]);

	const handlePreviousPage = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1);
		}
	}, [currentPage]);

	const handleNextPage = useCallback(() => {
		if (currentPage < totalPages) {
			setCurrentPage(prev => prev + 1);
		}
	}, [currentPage, totalPages]);

	const handlePageClick = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);



	// If no data, show empty state
	if (data.length === 0) {
		return (
			<div className='bg-white flex flex-col h-full'>
				{/* Title and Header Actions */}
				{(title || headerActions) && (
					<div className='flex justify-between items-center mb-4 custom-title-bg rounded  '>
						{title && <h2 className='text-lg font-semibold'>{title}</h2>}
						{headerActions && <div>{headerActions}</div>}
					</div>
				)}

				{/* Empty State */}
				<div className='flex-grow flex items-center justify-center border border-gray-200 rounded-lg'>
					<EmptyState
						icon={emptyState?.icon as React.ReactNode}
						title={emptyState?.title as string || t('noData')}
						description={emptyState?.description as string}
						action={emptyState?.action as { label: string; onClick: () => void } | undefined}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white flex flex-col'>
			{/* Title and Header Actions */}
			{(title || headerActions) && (
				<div className='flex justify-between items-center mb-4 custom-title-bg rounded  '>
					{title && <h2 className='text-lg font-semibold'>{title}</h2>}
					{headerActions && <div>{headerActions}</div>}
				</div>
			)}

			{/* Table Container - handles overflow for scrolling */}
			<div className='flex-grow overflow-x-auto overflow-y-auto border border-gray-200 rounded-lg -mx-3 sm:mx-0'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50 sticky top-0 z-10'>
						<tr>
							{columns.map(column => (
								<th key={column.key} scope='col' className='px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-800 uppercase tracking-wider whitespace-nowrap'>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					{/* Table Body */}
					<tbody className='bg-white'>
						{currentItems.map((row, rowIndex) => (
							<tr key={row.id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
								{/* Each row must have a unique 'id' */}
								{columns.map(column => (
									<td key={column.key} className='px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900'>
										{/* Render cell content using custom render function or direct key access */}
										{column.render ? column.render(row, rowIndex) : String(row[column.key as keyof T])}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{showPagination && totalItems > 0 && (
				<nav 
					aria-label="Table pagination"
					className='flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 py-3 sm:py-4 select-none'
				>
					{/* Page info */}
					<span className='text-xs sm:text-sm text-gray-500 order-2 sm:order-1'>
						{t('showing')} {currentRangeStart}-{currentRangeEnd} {t('of')} {totalItems}
					</span>

					{/* Pagination buttons */}
					<div className='flex items-center gap-1 order-1 sm:order-2'>
						<button
							type="button"
							onClick={handlePreviousPage}
							disabled={currentPage === 1}
							aria-label={t('previous')}
							className={cn(
								'flex items-center justify-center w-8 h-8 rounded-lg',
								'border border-gray-200 transition-all duration-200',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
								currentPage === 1
									? 'text-gray-300 cursor-not-allowed bg-gray-50'
									: 'text-gray-600 hover:bg-gray-100 bg-white cursor-pointer active:scale-95'
							)}
						>
							<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden="true">
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
							</svg>
						</button>

						{paginationRange.map((page, index) => {
							if (page === '...') {
								return (
									<span 
										key={`dots-${index}`} 
										className='w-8 text-center text-gray-400'
										aria-hidden="true"
									>
										...
									</span>
								);
							}
							const pageNum = Number(page);
							const isCurrentPage = currentPage === pageNum;
							return (
								<button
									type="button"
									key={pageNum}
									onClick={() => handlePageClick(pageNum)}
									aria-label={`Page ${pageNum}`}
									aria-current={isCurrentPage ? 'page' : undefined}
									className={cn(
										'w-8 h-8 rounded-lg text-sm font-medium',
										'transition-all duration-200',
										'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
										isCurrentPage
											? 'bg-gray-900 text-white'
											: 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer active:scale-95'
									)}
								>
									{pageNum}
								</button>
							);
						})}

						<button
							type="button"
							onClick={handleNextPage}
							disabled={currentPage === totalPages}
							aria-label={t('next')}
							className={cn(
								'flex items-center justify-center w-8 h-8 rounded-lg',
								'border border-gray-200 transition-all duration-200',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
								currentPage === totalPages
									? 'text-gray-300 cursor-not-allowed bg-gray-50'
									: 'text-gray-600 hover:bg-gray-100 bg-white cursor-pointer active:scale-95'
							)}
						>
							<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden="true">
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
							</svg>
						</button>
					</div>
				</nav>
			)}
		</div>
	);
}

export default TableComponent;
export type { Column, GenericTableProps, EmptyStateConfig };
