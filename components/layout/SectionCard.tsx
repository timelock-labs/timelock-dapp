import { cn } from '@/utils/utils';

interface SectionCardProps {
	children: React.ReactNode;
	className?: string;
	/** 是否显示边框和背景 */
	variant?: 'default' | 'bordered' | 'elevated';
	/** 内边距大小 */
	padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
} as const;

const variantClasses = {
	default: '',
	bordered: 'bg-white border border-gray-200 rounded-xl',
	elevated: 'bg-white rounded-xl shadow-sm',
} as const;

/**
 * Section card container component
 */
function SectionCard({
	children,
	className,
	variant = 'default',
	padding = 'none',
}: SectionCardProps) {
	return (
		<section
			className={cn(
				variantClasses[variant],
				paddingClasses[padding],
				className
			)}
		>
			{children}
		</section>
	);
}

export default SectionCard;