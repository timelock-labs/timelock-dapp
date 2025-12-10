'use client';

import React, { useEffect, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { cn } from '@/utils/utils';
import { Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface HomeAnimationProps {
	className?: string;
	autoplay?: boolean;
	onAnimationLoad?: () => void;
}

interface StatsData {
	chain_count: number;
	contract_count: number;
	transaction_count: number;
}

const HomeAnimation: React.FC<HomeAnimationProps> = ({ className, onAnimationLoad }) => {
	const [stats, setStats] = useState<StatsData | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('https://prod.timelock.tech/api/v1/public/stats', {
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({}),
				});
				const result = await response.json();
				if (result.success && result.data) {
					setStats(result.data);
				}
			} catch (error) {
				console.error('Failed to fetch stats:', error);
			}
		};
		fetchStats();
	}, []);

	const { RiveComponent } = useRive({
		src: '/homeAnimation.riv',
		autoplay: true,
		stateMachines: "homeAnimation",
		onLoad: () => {
			onAnimationLoad?.();
		},
		onLoadError: () => {
			console.error('Failed to load home animation');
		},
		layout: new Layout({
			fit: Fit.Cover,
			alignment: Alignment.Center,
		}),
	});

	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	return (
		<div className={cn('w-full h-full cursor-pointer w-[720px] h-[1060px] relative', className)}>
			<RiveComponent className='w-full h-full' style={{ height: '1060px', width: '720px' }} />
			
			{/* Stats overlay */}
			{stats && (
				<div className='absolute bottom-16 left-10 right-10 flex justify-between gap-6'>
					<div className='flex flex-col'>
						<span className='text-4xl font-bold text-white'>{formatNumber(stats.chain_count)}</span>
						<span className='text-sm text-gray-400 mt-1'>Chains</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-4xl font-bold text-white'>{formatNumber(stats.contract_count)}</span>
						<span className='text-sm text-gray-400 mt-1'>Contracts</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-4xl font-bold text-white'>{formatNumber(stats.transaction_count)}</span>
						<span className='text-sm text-gray-400 mt-1'>Transactions</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default HomeAnimation;
