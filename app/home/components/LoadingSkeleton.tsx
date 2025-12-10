import { cn } from '@/utils/utils';

interface LoadingSkeletonProps {
	className?: string;
	/** 变体类型 */
	variant?: 'default' | 'card' | 'list';
}

/**
 * Home page loading skeleton with staggered animation
 */
const LoadingSkeleton = ({ className, variant = 'default' }: LoadingSkeletonProps) => {
	if (variant === 'card') {
		return (
			<div
				className={cn('animate-pulse p-6 rounded-xl border border-gray-200', className)}
				role='status'
				aria-label='Loading'
			>
				<div className='flex items-center gap-3 mb-4'>
					<div className='h-10 w-10 bg-gray-200 rounded-lg' />
					<div className='h-5 bg-gray-200 rounded w-24' />
				</div>
				<div className='h-8 bg-gray-200 rounded w-32 mb-2' />
				<div className='h-4 bg-gray-100 rounded w-20' />
				<span className='sr-only'>Loading...</span>
			</div>
		);
	}

	if (variant === 'list') {
		return (
			<div
				className={cn('animate-pulse space-y-3', className)}
				role='status'
				aria-label='Loading'
			>
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className='flex items-center gap-3 p-3 rounded-lg bg-gray-50'
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<div className='h-8 w-8 bg-gray-200 rounded-full' />
						<div className='flex-1 space-y-2'>
							<div className='h-4 bg-gray-200 rounded w-3/4' />
							<div className='h-3 bg-gray-100 rounded w-1/2' />
						</div>
					</div>
				))}
				<span className='sr-only'>Loading...</span>
			</div>
		);
	}

	return (
		<div
			className={cn('animate-pulse space-y-6 p-6', className)}
			role='status'
			aria-label='Loading'
		>
			{/* Title */}
			<div className='h-8 bg-gray-200 rounded-lg w-1/3' />

			{/* Content lines with staggered widths */}
			<div className='space-y-3'>
				<div className='h-4 bg-gray-100 rounded w-full' />
				<div className='h-4 bg-gray-100 rounded w-5/6' />
				<div className='h-4 bg-gray-100 rounded w-4/6' />
			</div>

			{/* Large content block */}
			<div className='h-32 bg-gray-100 rounded-lg' />

			<span className='sr-only'>Loading content...</span>
		</div>
	);
};

export default LoadingSkeleton;