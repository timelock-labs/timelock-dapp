'use client';

import React, { useEffect, useState } from 'react';
import Logo from '@/components/layout/Logo';
import HomeAnimation from '@/app/login/components/HomeAnimation';
import './index.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LoginButton } from '@/components/wallet/login-button';

interface StatsData {
	chain_count: number;
	contract_count: number;
	transaction_count: number;
}

const TimeLockSplitPage = () => {
	const t = useTranslations('walletLogin');
	const currentYear = new Date().getFullYear();
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

	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	return (
		<div className='min-h-screen bg-black'>
			<div className='flex w-full h-screen overflow-hidden bg-black flex-col md:flex-row'>
				{/* Left hero section - hidden on mobile */}
				<div className='relative hidden md:flex md:flex-1 bg-black items-center justify-center overflow-hidden'>
					<div className='absolute top-10 left-10'>
						{/* <Logo size='md' color='white' /> */}
					</div>
					<HomeAnimation className='w-full h-full' />
				</div>

				{/* Right content section */}
				<div className='flex-1 bg-white text-black flex flex-col justify-between px-6 sm:px-8 py-8 md:px-16 md:py-10'>
					{/* Top social links */}
                        <div className='flex justify-center sm:justify-end gap-6 text-sm text-gray-500'>
						<div className='flex items-center gap-2 cursor-pointer' onClick={() => window.open('https://scan.timelock.tech/', '_blank')}>
							<Image src='/explorer.svg' alt={t('explorer')} width={18} height={18} />
							<span>{t('explorer')}</span>
						</div>
						<div className='flex items-center gap-2 cursor-pointer' onClick={() => window.open('https://x.com/TimelockApp', '_blank')}>
							<Image src='/twitter.svg' alt={t('twitter')} width={18} height={18} />
							<span>{t('twitter')}</span>
						</div>
						{/* <div className='flex items-center gap-2 cursor-pointer' onClick={() => window.open('https://t.me/+piB_7Ue3WsUyYWY1', '_blank')}>
							<Image src='/telegram.svg' alt={t('telegram')} width={18} height={18} />
							<span>{t('telegram')}</span>
						</div> */}
						<div className='flex items-center gap-2 cursor-pointer' onClick={() => window.open('https://docs.timelock.tech', '_blank')}>
							<Image src='/book.svg' alt={t('gitbook')} width={18} height={18} />
							<span>{t('gitbook')}</span>
						</div>
						<div className='flex items-center gap-2 cursor-pointer' onClick={() => window.open('https://github.com/orgs/timelock-labs', '_blank')}>
							<Image src='/github.svg' alt={t('github')} width={18} height={18} />
							<span>{t('github')}</span>
						</div>
					</div>

					{/* Centered content */}
					<div className='flex-1 flex items-center justify-center py-10 md:py-0'>
						<div className='max-w-sm w-full space-y-6'>
							<div className='flex items-center gap-2'>
								<Logo size='sm' color='black' />
								{/* <span className='font-semibold text-lg'>TimeLock</span> */}
							</div>
							<h1 className='text-3xl font-semibold tracking-tight'>
								{t('getStarted')}
							</h1>
							<p className='text-sm text-gray-600 leading-relaxed'>
								{t('connectWalletDescription')}
							</p>
							<div className='mt-6'>
								<LoginButton fullWidth={true} />
							</div>
						</div>
					</div>

					{/* Mobile Stats - only visible on mobile */}
					{stats && (
						<div className='flex md:hidden justify-between gap-4 py-4 border-t border-gray-100'>
							<div className='flex flex-col items-center flex-1'>
								<span className='text-2xl font-bold text-black'>{formatNumber(stats.chain_count)}</span>
								<span className='text-xs text-gray-500'>Chains</span>
							</div>
							<div className='flex flex-col items-center flex-1'>
								<span className='text-2xl font-bold text-black'>{formatNumber(stats.contract_count)}</span>
								<span className='text-xs text-gray-500'>Contracts</span>
							</div>
							<div className='flex flex-col items-center flex-1'>
								<span className='text-2xl font-bold text-black'>{formatNumber(stats.transaction_count)}</span>
								<span className='text-xs text-gray-500'>Transactions</span>
							</div>
						</div>
					)}

					{/* Footer */}
					<footer className='flex w-full flex-col md:flex-row items-center justify-center xs:justify-between text-[11px] text-gray-500 gap-2 md:gap-0 mt-4 text-center md:text-left' style={{
						display:"flex",
						justifyContent:"space-between;"
					}}>
						<div className='flex items-center gap-4 justify-center'>
							<button
								type='button'
								className='hover:underline'
								onClick={() => window.open('https://raw.githubusercontent.com/timelock-labs/timelock-docs/refs/heads/main/legal/privacy-policy.md', '_blank')}
							>
								{t('privacyPolicy')}
							</button>
							<button
								type='button'
								className='hover:underline'
								onClick={() => window.open('https://raw.githubusercontent.com/timelock-labs/timelock-docs/refs/heads/main/legal/terms-of-service.md', '_blank')}
							>
								{t('termsOfService')}
							</button>
						</div>
						<div className="text-center md:text-right">
							© {currentYear} TimeLock. All rights reserved.
						</div>
					</footer>
				</div>
			</div>
		</div>
	);
};

export default TimeLockSplitPage;
