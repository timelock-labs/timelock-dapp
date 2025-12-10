import { cn } from '@/utils/utils';
import type { BaseComponentProps } from '@/types';

interface SectionHeaderProps extends BaseComponentProps {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	/** 右侧操作区域 */
	actions?: React.ReactNode;
	/** 标题大小 */
	size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
	sm: 'text-sm sm:text-base',
	md: 'text-base sm:text-lg',
	lg: 'text-lg sm:text-xl',
} as const;

/**
 * Section header component with title, description, optional icon and actions
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	description,
	icon,
	actions,
	size = 'md',
	className,
}) => {
	return (
		<header className={cn('mb-3 sm:mb-4', className)}>
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4'>
				<h2
					className={cn(
						'font-semibold flex items-center gap-2 text-gray-900',
						sizeClasses[size]
					)}
				>
					{icon && (
						<span className='flex-shrink-0' aria-hidden='true'>
							{icon}
						</span>
					)}
					<span>{title}</span>
				</h2>
				{actions && <div className='flex items-center gap-2'>{actions}</div>}
			</div>
			{description && (
				<p className='text-xs sm:text-sm text-gray-600 mt-1'>{description}</p>
			)}
		</header>
	);
};

export default SectionHeader;
