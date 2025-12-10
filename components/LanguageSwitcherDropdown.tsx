'use client';

import { useCallback, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe, Check } from 'lucide-react';

import { cookieUtil } from '@/utils/cookieUtil';
import { cn } from '@/utils/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import type { BaseComponentProps } from '@/types';

const LANGUAGES = [
	{ code: 'zh', label: '简体中文', shortLabel: '中文' },
	{ code: 'en', label: 'English', shortLabel: 'EN' },
] as const;

type LanguageCode = typeof LANGUAGES[number]['code'];

interface LanguageSwitcherProps extends BaseComponentProps {
	variant?: 'default' | 'compact';
}

/**
 * Language switcher component for locale selection
 */
export default function LanguageSwitcher({
	className,
	variant = 'default',
}: LanguageSwitcherProps) {
	const router = useRouter();
	const locale = useLocale();

	const currentLanguage = useMemo(
		() => LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[1],
		[locale]
	);

	const handleSwitch = useCallback(
		(lang: LanguageCode) => {
			if (lang === locale) return;

			cookieUtil.set('NEXT_LOCALE', lang, {
				path: '/',
				maxAge: 31536000,
			});
			router.refresh();
		},
		[locale, router]
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					className={cn(
						'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer h-8 px-3 border bg-background hover:bg-accent hover:text-accent-foreground',
						className
					)}
					aria-label={`Current language: ${currentLanguage.label}. Click to change.`}
				>
					<Globe className='h-4 w-4' aria-hidden='true' />
					<span className='hidden sm:inline min-w-[50px] text-left'>
						{currentLanguage.label}
					</span>
					<span className='sm:hidden'>{currentLanguage.shortLabel}</span>
					<ChevronDown className='h-3 w-3 opacity-50' aria-hidden='true' />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='end'
				sideOffset={4}
				className={cn(
					'z-50 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg',
					'p-1 animate-in fade-in-0 zoom-in-95 duration-200'
				)}
			>
				{LANGUAGES.map(language => {
					const isActive = locale === language.code;
					return (
						<DropdownMenuItem
							key={language.code}
							onClick={() => handleSwitch(language.code)}
							className={cn(
								'flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer',
								'text-sm font-medium transition-colors duration-150',
								'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
								isActive && 'bg-gray-50'
							)}
						>
							<span>{language.label}</span>
							{isActive && (
								<Check className='h-4 w-4 text-black' aria-hidden='true' />
							)}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
