import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { useTranslations } from 'next-intl';
import type { EncodingPreviewProps } from '@/types';

const EncodingPreview: React.FC<EncodingPreviewProps> = ({ previewContent }) => {
	const t = useTranslations('CreateTransaction');

	return (
		<section className='flex flex-col w-full'>
			<SectionHeader title={t('preview.title')} description={t('preview.description')} />
			<div className='bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap overflow-x-auto min-h-[150px] sm:min-h-[200px] text-green-600 break-all'>
				{previewContent ?? t('preview.noData')}
			</div>
		</section>
	);
};

export default EncodingPreview;
