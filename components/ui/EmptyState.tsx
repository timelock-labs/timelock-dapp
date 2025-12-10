import Image from 'next/image';
import NoDataIcon from '@/public/timelockewallet.png';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
	icon?: React.ReactNode;
	title?: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		loading?: boolean;
	};
	/** 尺寸变体 */
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeConfig = {
	sm: {
		padding: 'py-8 px-4',
		iconSize: 'w-12 h-12',
		iconImageSize: 20,
		titleSize: 'text-base',
		descSize: 'text-xs',
	},
	md: {
		padding: 'py-12 px-4',
		iconSize: 'w-14 h-14',
		iconImageSize: 22,
		titleSize: 'text-lg',
		descSize: 'text-sm',
	},
	lg: {
		padding: 'py-16 px-4',
		iconSize: 'w-16 h-16',
		iconImageSize: 24,
		titleSize: 'text-xl',
		descSize: 'text-sm',
	},
} as const;

export default function EmptyState({
	icon,
	title,
	description,
	action,
	size = 'lg',
	className,
}: EmptyStateProps) {
	const config = sizeConfig[size];

	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center',
				config.padding,
				className
			)}
			role='status'
			aria-label={title}
		>
			{/* Icon */}
			<div
				className={cn(
					'flex items-center justify-center',
					'transition-transform duration-200 hover:scale-105',
					config.iconSize
				)}
			>
				{icon || (
					<Image
						src={NoDataIcon}
						alt=''
						width={config.iconImageSize}
						height={config.iconImageSize}
						aria-hidden='true'
					/>
				)}
			</div>

			{/* Title */}
			{title && <h3
				className={cn(
					'font-semibold text-gray-900 mb-2 text-center',
					config.titleSize
				)}
			>
				{title}
			</h3>}

			{/* Description */}
			{description && (
				<p
					className={cn(
						'text-gray-500 text-center max-w-md mb-6',
						config.descSize
					)}
				>
					{description}
				</p>
			)}

			{/* Action Button */}
			{action && (
				<Button
					onClick={action.onClick}
					loading={action.loading}
					className='mt-2'
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}

