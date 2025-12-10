'use client';

import { useCountUp } from '@/hooks/useCountUp';
import { useTranslations } from 'next-intl';
import { DollarSign } from 'lucide-react';
import { cn } from '@/utils/utils';

interface TotalAssetValueProps {
	totalUsdValue: number;
	className?: string;
	/** 是否显示加载状态 */
	isLoading?: boolean;
}

/**
 * Total asset value display card with animated counter
 */
const TotalAssetValue: React.FC<TotalAssetValueProps> = ({
	totalUsdValue,
	className,
	isLoading = false,
}) => {
	const t = useTranslations('assetList');
	const countUpRef = useCountUp({
		end: totalUsdValue,
		duration: 2,
		decimals: 2,
		prefix: '$',
		separator: ',',
	});

	return (
		<article
			className={cn(
				'bg-white h-full p-6 rounded-xl border border-gray-200',
				'transition-shadow duration-200 hover:shadow-md',
				className
			)}
		>
			{/* Header */}
			<div className='flex items-center gap-2 mb-2'>
				<div className='p-1.5 bg-green-100 rounded-lg'>
					<DollarSign className='w-4 h-4 text-green-600' aria-hidden='true' />
				</div>
				<h2 className='text-sm font-medium text-gray-600'>
					{t('totalAssetValue')}
				</h2>
			</div>

			{/* Value */}
			<div className='flex items-baseline gap-2'>
				{isLoading ? (
					<div className='h-9 w-32 bg-gray-100 rounded animate-pulse' />
				) : (
					<p className='text-3xl font-bold text-gray-900'>
						<span ref={countUpRef}>$0.00</span>
					</p>
				)}
			</div>
		</article>
	);
};

export default TotalAssetValue;
