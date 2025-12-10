'use client';

import { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { BaseComponentProps } from '@/types';

interface FeatureCardProps extends BaseComponentProps {
	title: string;
	description: string;
	icon?: React.ReactNode;
	link?: string;
	children?: React.ReactNode;
}

/**
 * Feature card component with title, description, icon and optional link
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
	title,
	description,
	icon,
	link,
	children,
	className,
}) => {
	const handleClick = useCallback(() => {
		if (link) {
			window.open(link, '_blank', 'noopener,noreferrer');
		}
	}, [link]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClick();
			}
		},
		[handleClick]
	);

	return (
		<article
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={link ? 'link' : undefined}
			tabIndex={link ? 0 : undefined}
			className={cn(
				'bg-white p-6 rounded-xl border border-gray-200',
				'flex flex-col items-start',
				'transition-all duration-200 ease-in-out',
				'hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5',
				'focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2',
				link && 'cursor-pointer',
				className
			)}
		>
			{/* Header */}
			<div className='flex justify-between items-center w-full mb-4'>
				{/* Icon */}
				<div
					className={cn(
						'rounded-xl',
						'flex items-center justify-center',
						'text-gray-600',
						'transition-colors duration-200',
						'group-hover:bg-gray-200'
					)}
				>
					{icon || (
						<span className='text-sm font-medium' aria-hidden='true'>
							?
						</span>
					)}
				</div>

				{/* External Link Icon */}
				{link && (
					<ExternalLink
						className='w-5 h-5 text-gray-400 transition-colors duration-200 hover:text-gray-600'
						aria-hidden='true'
					/>
				)}
			</div>

			{/* Content */}
			<h3 className='text-base font-semibold text-gray-900 mb-1'>
				{title}
			</h3>
			<p className='text-sm text-gray-600 line-clamp-2'>
				{description}
			</p>
			{children}

			{/* Screen reader link text */}
			{link && (
				<span className='sr-only'>
					Opens in new tab
				</span>
			)}
		</article>
	);
};

export default FeatureCard;
