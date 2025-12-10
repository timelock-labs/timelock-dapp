import { cn } from '@/utils/utils';
import type { ParameterDisplayRowProps } from '@/types';

interface ExtendedParameterDisplayRowProps extends ParameterDisplayRowProps {
	/** 是否可复制 */
	copyable?: boolean;
	/** 布局方向 */
	layout?: 'vertical' | 'horizontal';
	className?: string;
}

/**
 * Parameter display row for showing key-value pairs
 */
const ParameterDisplayRow: React.FC<ExtendedParameterDisplayRowProps> = ({
	label,
	value,
	children,
	layout = 'vertical',
	className,
}) => {
	const content = value || children;

	if (layout === 'horizontal') {
		return (
			<div className={cn('flex items-start justify-between gap-4 py-2', className)}>
				<dt className='text-sm font-medium text-gray-500 flex-shrink-0'>
					{label}
				</dt>
				<dd className='text-sm text-gray-900 text-right break-all'>
					{content}
				</dd>
			</div>
		);
	}

	return (
		<div className={cn('mb-4', className)}>
			<dt className='text-sm font-semibold text-gray-700 mb-1'>
				{label}
			</dt>
			<dd className='text-sm text-gray-900 break-words'>
				{content}
			</dd>
		</div>
	);
};

export default ParameterDisplayRow;
