import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/utils';

interface TableSkeletonProps {
	rows?: number;
	columns?: number;
	showHeader?: boolean;
	showPagination?: boolean;
	className?: string;
}

/**
 * Table skeleton loading component with staggered animation
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
	rows = 5,
	columns = 6,
	showHeader = true,
	showPagination = true,
	className,
}) => {
	return (
		<div
			className={cn('w-full', className)}
			role='status'
			aria-label='Loading table data'
		>
			{/* Header skeleton */}
			{showHeader && (
				<div className='flex items-center justify-between mb-6 animate-in fade-in duration-300'>
					<div className='space-y-2'>
						<Skeleton className='h-6 w-48' />
						<Skeleton className='h-4 w-64' />
					</div>
					<div className='flex space-x-2'>
						<Skeleton className='h-9 w-40' />
						<Skeleton className='h-9 w-32' />
					</div>
				</div>
			)}

			{/* Table skeleton */}
			<div className='border border-gray-200 rounded-lg overflow-hidden'>
				{/* Table header */}
				<div className='bg-gray-50 border-b border-gray-200 px-6 py-3'>
					<div className='flex space-x-4'>
						{Array.from({ length: columns }).map((_, index) => (
							<Skeleton key={index} className='h-4 w-20 flex-1' />
						))}
					</div>
				</div>

				{/* Table rows with staggered animation */}
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<div
						key={rowIndex}
						className='border-b border-gray-200 px-6 py-4 last:border-b-0 animate-in fade-in slide-in-from-top-1'
						style={{ animationDelay: `${rowIndex * 50}ms` }}
					>
						<div className='flex space-x-4'>
							{Array.from({ length: columns }).map((_, colIndex) => (
								<div key={colIndex} className='flex-1'>
									{colIndex === 0 ? (
										// First column with icon + text
										<div className='flex items-center space-x-2'>
											<Skeleton className='h-5 w-5 rounded-full' />
											<Skeleton className='h-4 w-20' />
										</div>
									) : colIndex === 1 ? (
										// Status badge
										<Skeleton className='h-6 w-20 rounded-full' />
									) : colIndex === columns - 1 ? (
										// Operations column
										<Skeleton className='h-8 w-20' />
									) : (
										// Regular text columns
										<Skeleton className='h-4 w-full max-w-[120px]' />
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Pagination skeleton */}
			{showPagination && (
				<div className='flex items-center justify-between mt-4 animate-in fade-in duration-300 delay-200'>
					<Skeleton className='h-4 w-32' />
					<div className='flex space-x-2'>
						<Skeleton className='h-8 w-8 rounded' />
						<Skeleton className='h-8 w-8 rounded' />
						<Skeleton className='h-8 w-8 rounded' />
					</div>
				</div>
			)}

			{/* Screen reader text */}
			<span className='sr-only'>Loading table data, please wait...</span>
		</div>
	);
};

export default TableSkeleton;
