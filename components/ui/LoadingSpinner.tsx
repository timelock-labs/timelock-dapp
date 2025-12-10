'use client';

import { cn } from '@/utils/utils';

interface LoadingSpinnerProps {
	/** 尺寸 */
	size?: 'xs' | 'sm' | 'md' | 'lg';
	/** 自定义类名 */
	className?: string;
	/** 颜色 */
	color?: 'primary' | 'white' | 'gray';
}

const sizeClasses = {
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
} as const;

const colorClasses = {
	primary: 'text-black',
	white: 'text-white',
	gray: 'text-gray-400',
} as const;

/**
 * Loading spinner component with smooth animation
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 'sm',
	className,
	color = 'primary',
}) => {
	return (
		<svg
			className={cn(
				'animate-spin',
				sizeClasses[size],
				colorClasses[color],
				className
			)}
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			aria-hidden='true'
		>
			<circle
				className='opacity-25'
				cx='12'
				cy='12'
				r='10'
				stroke='currentColor'
				strokeWidth='4'
			/>
			<path
				className='opacity-75'
				fill='currentColor'
				d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
			/>
		</svg>
	);
};

export default LoadingSpinner;
