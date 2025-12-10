import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/utils';

interface SkeletonProps {
	className?: string;
	style?: React.CSSProperties;
}

/**
 * Mailbox/Channel Card Skeleton Component
 */
export const CardSkeleton = ({ className, style }: SkeletonProps) => (
	<div
		className={cn(
			'bg-gray-100 rounded-xl border border-gray-200',
			'animate-in fade-in duration-300',
			className
		)}
		style={style}
		role='status'
		aria-label='Loading card'
	>
		{/* Header */}
		<div className='px-4 py-2'>
			<Skeleton className='h-4 w-32' />
		</div>

		{/* Content */}
		<div className='bg-white rounded-xl border p-4'>
			<div className='flex items-center justify-end gap-2 mb-3'>
				<Skeleton className='h-8 w-16 rounded-lg' />
				<Skeleton className='h-8 w-16 rounded-lg' />
			</div>
			<div className='space-y-3'>
				<Skeleton className='h-5 w-48' />
				<Skeleton className='h-4 w-32' />
			</div>
		</div>
		<span className='sr-only'>Loading...</span>
	</div>
);

/**
 * Add Card Skeleton (dashed border style)
 */
export const AddCardSkeleton = ({ className, style }: SkeletonProps) => (
	<div
		className={cn(
			'bg-gray-100 rounded-xl border-2 border-dashed border-gray-300',
			'p-6 flex flex-col items-center justify-center min-h-[180px]',
			'animate-in fade-in duration-300',
			className
		)}
		style={style}
		role='status'
		aria-label='Loading add card'
	>
		<Skeleton className='h-12 w-12 rounded-full mb-4' />
		<Skeleton className='h-5 w-24 mb-2' />
		<Skeleton className='h-4 w-32' />
		<span className='sr-only'>Loading...</span>
	</div>
);

/**
 * Header Info Skeleton
 */
export const HeaderSkeleton = ({ className }: SkeletonProps) => (
	<div
		className={cn(
			'bg-blue-50 border border-blue-200 rounded-xl p-6',
			'animate-in fade-in duration-300',
			className
		)}
		role='status'
		aria-label='Loading header'
	>
		<div className='space-y-4'>
			<Skeleton className='h-6 w-48' />
			<div className='space-y-2'>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-4 w-5/6' />
			</div>
		</div>
		<span className='sr-only'>Loading...</span>
	</div>
);

/**
 * Combined Notify Page Loading Skeleton
 */
export const LoadingSkeleton = ({ className }: SkeletonProps) => (
	<div className={cn('flex flex-col space-y-8', className)}>
		<HeaderSkeleton />
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
			{[0, 1].map(i => (
				<CardSkeleton
					key={i}
					className='animate-in fade-in'
					style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
				/>
			))}
			<AddCardSkeleton
				className='animate-in fade-in'
				style={{ animationDelay: '200ms' } as React.CSSProperties}
			/>
		</div>
	</div>
);
