import { useMemo } from 'react';
import { cn } from '@/utils/utils';
import capitalizeFirstLetter from '@/utils/capitalizeFirstLetter';

type ColorType = 'blue' | 'green' | 'red' | 'gray' | 'yellow' | 'default' | 'none';
type StatusType = 'waiting' | 'ready' | 'cancelled' | 'expired' | 'executed';

interface TableTagProps {
	label: string | undefined;
	colorType?: ColorType;
	statusType?: StatusType;
	Icon?: React.ReactNode;
	/** 尺寸 */
	size?: 'sm' | 'md';
}

const colorStyles: Record<ColorType, string> = {
	blue: 'bg-blue-50 text-blue-700 border-blue-200',
	green: 'bg-green-50 text-green-700 border-green-200',
	red: 'bg-red-50 text-red-700 border-red-200',
	gray: 'bg-gray-100 text-gray-700 border-gray-200',
	yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
	default: 'bg-gray-100 text-gray-700 border-gray-200',
	none: '',
};

const statusToColor: Record<StatusType, ColorType> = {
	waiting: 'blue',
	ready: 'green',
	cancelled: 'red',
	expired: 'gray',
	executed: 'yellow',
};

const sizeStyles = {
	sm: 'text-xs py-0.5',
	md: 'text-sm py-1',
} as const;

/**
 * Table tag/badge component for status display
 */
export default function TableTag({
	label,
	colorType,
	statusType,
	Icon,
	size = 'sm',
}: TableTagProps) {
	const styleClass = useMemo(() => {
		if (colorType) return colorStyles[colorType];
		if (statusType) return colorStyles[statusToColor[statusType]];
		return colorStyles.default;
	}, [colorType, statusType]);

	if (!label) return null;

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 font-medium',
				'transition-colors duration-150',
				sizeStyles[size],
				styleClass,
				!colorType && `border p-1 rounded-md`
			)}
		>
			{Icon && (
				<span className='flex-shrink-0' aria-hidden='true'>
					{Icon}
				</span>
			)}
			<span>{capitalizeFirstLetter(label)}</span>
		</span>
	);
}