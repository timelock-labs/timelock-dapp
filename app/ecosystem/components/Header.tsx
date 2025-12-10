'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/utils';
import bg_png from '@/public/bg.png';

interface EcosystemSearchHeaderProps {
	className?: string;
}

/**
 * Ecosystem page header with background image
 */
const EcosystemSearchHeader: React.FC<EcosystemSearchHeaderProps> = ({ className }) => {
	const t = useTranslations('Ecosystem');

	return (
		<header
			className={cn(
				'relative overflow-hidden',
				'bg-black text-white rounded-xl',
				'p-6 min-h-[80px]',
				'flex items-center gap-4',
				className
			)}
			style={{
				backgroundImage: `url(${bg_png.src})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			{/* Overlay for better text readability */}
			<div className='absolute inset-0 bg-black/30' aria-hidden='true' />

			{/* Content */}
			<div className='relative z-10 flex items-center gap-4'>
				<div className='p-2 bg-white/10 rounded-lg backdrop-blur-sm'>
					<Image
						src='/ecoPanter.png'
						alt=''
						width={24}
						height={24}
						className='w-6 h-6'
						aria-hidden='true'
					/>
				</div>
				<h1 className='text-xl font-semibold'>
					{t('FindEcosystemPartner')}
				</h1>
			</div>
		</header>
	);
};

export default EcosystemSearchHeader;
