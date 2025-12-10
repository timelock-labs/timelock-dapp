'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import timelockewallet from '@/public/timelockewallet.png';

const WalletSection: React.FC = () => {
	const t = useTranslations('wallet');
	return (
		<div className='bg-white p-6 rounded  flex flex-col items-center justify-center relative border border-gray-200 border-dashed'>
			<div className='flex flex-col items-center justify-center'>
				{/* Icon container with dotted border */}
				<div className='w-12 h-12 border-2 border-gray-200 flex items-center justify-center rounded relative'>
					<Image src={timelockewallet} alt='Timelock Wallet' width={20} height={16} className='w-5 h-4' />
				</div>
			</div>
			<p className='text-xl font-semibold mb-2 mt-4'>{t('noTimelockWallet')}</p>
			<p className='  text-sm mb-6'>{t('description')}</p>
			<Link href='/create-timelock'>
				<Button>{t('createNew')}</Button>
			</Link>
		</div>
	);
};

export default WalletSection;
