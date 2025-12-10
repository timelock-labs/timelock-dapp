import React from 'react';
import { useTranslations } from 'next-intl';
import WalletSection from './WalletSection';
import HowTimelockWorks from './HowTimelockWorks';
import HowTimelockProtocol from './HowTimelockProtocol';
import WhoIsUsingSection from './WhoIsUsingSection';

const CreateProtocol: React.FC = () => {
	const t = useTranslations('home_page');

	return (

		<main className='container mx-auto'>
				{/* First Row Component */}
				<div className='mb-12'>
					<WalletSection />
				</div>
				{/* Second Row: How Timelock Works & How to Use Protocol */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12'>
					<HowTimelockWorks />
					<HowTimelockProtocol />
				</div>
				{/* Third Row: Who is using it? */}
				<div className='mb-12'>
					<h2 className='text-xl font-semibold mb-6'>
						{t('whos_using.title')}{' '}
						<span className='text-base font-normal'>{t('whos_using.description')}</span>
					</h2>
					<WhoIsUsingSection />
				</div>
			</main>
	);
};

export default CreateProtocol;
