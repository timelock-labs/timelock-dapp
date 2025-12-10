'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

// ============ Constants ============
const TIMELOCK_FEATURES = [
	'features.preventUnauthorized',
	'features.avoidRisks',
	'features.earlyWarning',
	'features.industryStandard',
] as const;

const PROTOCOL_FEATURES = [
	'protocolFeatures.importExisting',
	'protocolFeatures.readableEncoding',
	'protocolFeatures.eventManagement',
	'protocolFeatures.comprehensiveMonitoring',
] as const;

const SECTIONS = [
	{ key: 'timelock', titleKey: 'whyTimelock', features: TIMELOCK_FEATURES },
	{ key: 'protocol', titleKey: 'whyProtocol', features: PROTOCOL_FEATURES },
] as const;

// ============ Sub Components ============
interface NavigationButtonProps {
	direction: 'prev' | 'next';
	onClick: () => void;
}

function NavigationButton({ direction, onClick }: NavigationButtonProps) {
	const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
	const ariaLabel = direction === 'prev' ? 'Previous section' : 'Next section';

	return (
		<button
			type='button'
			onClick={onClick}
			aria-label={ariaLabel}
			className={cn(
				'p-3 rounded-full cursor-pointer',
				'bg-white/10 backdrop-blur-sm',
				'transition-all duration-200',
				'hover:bg-white/20 hover:scale-110',
				'active:scale-95',
				'focus:outline-none focus:ring-2 focus:ring-white/30'
			)}
		>
			<Icon className='w-5 h-5' aria-hidden='true' />
		</button>
	);
}

interface FeatureCardProps {
	text: string;
	index: number;
}

function FeatureCard({ text, index }: FeatureCardProps) {
	return (
		<div
			className={cn(
				'text-base py-2 px-3 rounded-lg',
				'bg-white/5 backdrop-blur-sm',
				'transition-all duration-200',
				'hover:bg-white/10 hover:scale-[1.02]',
				'cursor-default animate-in fade-in slide-in-from-bottom-2'
			)}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			{text}
		</div>
	);
}

// ============ Main Component ============
export default function LoginFooter() {
	const t = useTranslations('walletLogin');
	const [currentSection, setCurrentSection] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	const handleToggleSection = useCallback(() => {
		setCurrentSection(prev => (prev === 0 ? 1 : 0));
	}, []);

	// 延迟显示动画
	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 300);
		return () => clearTimeout(timer);
	}, []);

	const section = SECTIONS[currentSection] ?? SECTIONS[0];

	const featureCards = useMemo(() => {
		return section.features.map((feature, index) => (
			<FeatureCard key={feature} text={t(feature)} index={index} />
		));
	}, [section.features, t]);

	return (
		<footer
			className={cn(
				'text-gray-300 absolute bottom-10 left-1/2 -translate-x-1/2',
				'w-[90%] max-w-6xl',
				'flex justify-center items-center',
				'border border-gray-800 rounded-2xl',
				'bg-gray-900/70 backdrop-blur-md',
				'transition-all duration-700 ease-out',
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
			)}
			role='region'
			aria-label='Feature highlights'
		>
			<div className='flex justify-between items-center w-full px-6 py-6 gap-8'>
				{/* Prev Button */}
				<NavigationButton direction='prev' onClick={handleToggleSection} />

				{/* Title Section */}
				<div className='flex-shrink-0 w-64'>
					<div className='mb-3'>
						<HelpCircle className='w-8 h-8 text-gray-400' aria-hidden='true' />
					</div>
					<h2 className='text-2xl font-semibold text-white'>
						{t(section.titleKey)}
					</h2>
				</div>

				{/* Features Grid */}
				<div className='flex-1 grid grid-cols-2 gap-3'>
					{featureCards}
				</div>

				{/* Next Button */}
				<NavigationButton direction='next' onClick={handleToggleSection} />

				{/* Section Indicators */}
				<div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
					{SECTIONS.map((_, index) => (
						<button
							key={index}
							type='button'
							onClick={() => setCurrentSection(index)}
							aria-label={`Go to section ${index + 1}`}
							className={cn(
								'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer',
								currentSection === index
									? 'bg-white w-4'
									: 'bg-white/30 hover:bg-white/50'
							)}
						/>
					))}
				</div>
			</div>
		</footer>
	);
}
