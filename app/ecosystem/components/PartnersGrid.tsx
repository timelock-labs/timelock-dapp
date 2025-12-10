'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { cn } from '@/utils/utils';
import FeatureCard from '@/components/ui/FeatureCard';
import EmptyState from '@/components/ui/EmptyState';
import type { EcosystemPartner } from '@/types/api';
import PageSkeleton from './PageSkeleton';

interface PartnersGridProps {
	sponsors: EcosystemPartner[];
	partners: EcosystemPartner[];
	isLoading: boolean;
}

interface PartnerSectionProps {
	title: string;
	partners: EcosystemPartner[];
	isLoading: boolean;
	skeletonCount?: number;
}

/**
 * Partner section component
 */
const PartnerSection: React.FC<PartnerSectionProps> = ({
	title,
	partners,
	isLoading,
	skeletonCount = 3,
}) => {
	const t = useTranslations('Ecosystem');

	const content = useMemo(() => {
		if (isLoading) {
			return (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: skeletonCount }).map((_, index) => (
						<PageSkeleton key={index} />
					))}
				</div>
			);
		}

		if (partners.length === 0) {
			return (
				<EmptyState
					title={t('noPartners')}
					description={t('noPartnersDescription')}
					size='sm'
				/>
			);
		}

		return (
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
				{partners.map((partner, index) => (
					<div
						key={partner.id}
						className='animate-in fade-in slide-in-from-bottom-2'
						style={{ animationDelay: `${index * 50}ms` }}
					>
						<FeatureCard
							title={partner.name}
							description={partner.description}
							icon={
								<Image
									src={partner.icon}
									alt={partner.name}
									width={400}
									height={400}
									className='h-10 w-auto object-contain'
								/>
							}
							link={partner.website || ''}
						/>
					</div>
				))}
			</div>
		);
	}, [isLoading, partners, skeletonCount, t]);

	return (
		<section className='space-y-6'>
			<h2 className='text-2xl font-bold text-gray-900'>
				{title}
				{!isLoading && partners.length > 0 && (
					<span className='ml-2 text-base font-normal text-gray-500'>
						({partners.length})
					</span>
				)}
			</h2>
			{content}
		</section>
	);
};

/**
 * Partners grid component with sponsors and partners sections
 */
const PartnersGrid: React.FC<PartnersGridProps> = ({
	sponsors,
	partners,
	isLoading,
}) => {
	const t = useTranslations('Ecosystem');

	return (
		<div className='space-y-12'>
			<PartnerSection
				title={t('sponsors')}
				partners={sponsors}
				isLoading={isLoading}
			/>
			<PartnerSection
				title={t('partners')}
				partners={partners}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default PartnersGrid;
