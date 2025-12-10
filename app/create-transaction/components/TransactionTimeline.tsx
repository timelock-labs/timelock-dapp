'use client';

import { useMemo, useEffect, useState, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { ethers } from 'ethers';

import { useWeb3React } from '@/hooks/useWeb3React';
import SectionHeader from '@/components/ui/SectionHeader';
import compoundTimelockAbi from '@/components/abi/TimelockCompound.json';

interface TransactionTimelineProps {
	timelockAddress: string;
	etaTimestamp: number; // Unix timestamp in seconds (用户填入的预期执行时间)
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
	timelockAddress,
	etaTimestamp,
}) => {
	const t = useTranslations('CreateTransaction');
	const { provider } = useWeb3React();

	const [delay, setDelay] = useState<number | null>(null);
	const [gracePeriod, setGracePeriod] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Validate address helper
	const isValidAddress = (address: string): boolean => {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	};

	// Fetch delay and grace period from contract
	useEffect(() => {
		const fetchContractParams = async () => {
			if (!timelockAddress || !provider || !isValidAddress(timelockAddress)) {
				setDelay(null);
				setGracePeriod(null);
				return;
			}

			setIsLoading(true);
			try {
				const contract = new ethers.Contract(
					timelockAddress,
					compoundTimelockAbi,
					provider
				);

				const [delayValue, gracePeriodValue] = await Promise.all([
					contract.delay(),
					contract.GRACE_PERIOD(),
				]);

				setDelay(Number(delayValue));
				setGracePeriod(Number(gracePeriodValue));
			} catch (error) {
				console.error('Failed to fetch contract params:', error);
				setDelay(null);
				setGracePeriod(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchContractParams();
	}, [timelockAddress, provider]);

	// 计算时间点:
	// Queue: 当前时间
	// Execute: 预期执行时间 (etaTimestamp)
	// Expire: 预期执行时间 + GRACE_PERIOD
	const timelineData = useMemo(() => {
		if (!etaTimestamp) return null;

		const queueTime = new Date();
		const executeTime = new Date(etaTimestamp * 1000);
		const expireTime = gracePeriod !== null ? new Date((etaTimestamp + gracePeriod) * 1000) : null;

		return { queueTime, executeTime, expireTime };
	}, [etaTimestamp, delay, gracePeriod]);

	// Format time display
	const formatTime = (date: Date | null): string => {
		// 强制这一行使用硬编码
		if (!date) return "No Data"
		return date.toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Format duration
	const formatDuration = (seconds: number | null): string => {
		// 强制这一行使用硬编码
		if (!seconds) return "No Data"
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		
		if (days > 0) {
			return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
		}
		if (hours > 0) {
			return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
		}
		return `${minutes}m`;
	};

	const hasTimelineData = !!timelockAddress && !!etaTimestamp && !!timelineData;

	const stages = [
		{ id: 'queue', label: t('timeline.queue'), time: hasTimelineData ? timelineData?.queueTime : null },
		{ id: 'execute', label: t('timeline.execute'), time: hasTimelineData ? timelineData?.executeTime : null },
		{ id: 'expire', label: t('timeline.expire'), time: hasTimelineData ? timelineData?.expireTime : null },
	];

	return (
		<section className="flex flex-col gap-2 w-full">
			<SectionHeader 
				title={t('timeline.title')} 
				description={`${t('timeline.delay')}: ${formatDuration(delay)} · ${t('timeline.gracePeriod')}: ${formatDuration(gracePeriod)}`}
			/>
			
			<div className="rounded-2xl px-4 py-5">
				<div className="flex items-center justify-center">
					{stages.map((stage, index) => {
						const isQueue = index === 0;
						const isExecute = index === 1;
						const isExpire = index === 2;

						return (
							<Fragment key={stage.id}>
								<div className="flex flex-col items-center">
									{/* Pill step */}
									<div
										className={`
											inline-flex items-center justify-center px-10 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-w-[140px]
											${isQueue ? 'bg-emerald-500 text-white shadow-sm' : ''}
											${isExecute ? 'text-white shadow-sm' : ''}
											${isExpire ? 'border-2 border-orange-400 border-dashed bg-orange-50 text-orange-500' : ''}
										`}
										style={
											isExecute
												? {
													backgroundImage:
														'linear-gradient(135deg, #3b82f6 25%, #2563eb 25%, #2563eb 50%, #3b82f6 50%, #3b82f6 75%, #2563eb 75%, #2563eb 100%)',
													backgroundSize: '16px 16px',
												}
											: undefined
										}
									>
										{stage.label}
									</div>

									{/* Time */}
									<span className="mt-1 text-xs text-gray-700 font-mono">
										{isLoading && index > 0 ? '...' : formatTime(stage.time ?? null)}
									</span>
								</div>

								{/* Connector chevron */}
								{index < stages.length - 1 && (
									<div className="flex items-center justify-center text-gray-400 text-lg mx-3 h-full">
										<span>&raquo;</span>
									</div>
								)}
							</Fragment>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default TransactionTimeline;
