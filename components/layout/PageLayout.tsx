'use client';

import React from 'react';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChainSwitcher } from '@/components/wallet/chain-switcher';
import LanguageSwitcher from '../LanguageSwitcherDropdown';
import { ConnectWallet } from '@/components/wallet/connect-wallet';
import type { BaseComponentProps } from '@/types';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

/**
 * Main page layout component with sidebar navigation and header
 *
 * @param props - PageLayout component props
 * @returns JSX.Element
 */
export default function PageLayout({ children, className }: BaseComponentProps) {
	const pathname = usePathname();
	const tAbiLib = useTranslations('ABI-Lib');
	const tCreateTimelock = useTranslations('CreateTimelock');
	const tHome = useTranslations('HomePage');
	const tImportTimelock = useTranslations('ImportTimelock');
	const tTransactions = useTranslations('Transactions');
	const tEcosystem = useTranslations('Ecosystem');
	const tTimelocks = useTranslations('TimelockTable');
	const tNotify = useTranslations('Notify');
	const tCreateTx = useTranslations('CreateTransaction');

	const pathKey = React.useMemo(() => {
		const seg = pathname.split('/').filter(Boolean)[0] ?? 'home';
		return seg;
	}, [pathname]);

	const autoTitleMap: Record<string, string> = {
		'abi-lib': tAbiLib('title'),
		'create-timelock': tCreateTimelock('createTimelock'),
		home: tHome('title'),
		'import-timelock': tImportTimelock('title'),
		transactions: tTransactions('title'),
		ecosystem: tEcosystem('title'),
		timelocks: tTimelocks('title'),
		notify: tNotify('title'),
		'create-transaction': tCreateTx('title'),
	};

	const breadcrumbDescMap: Record<string, string> = {
		home: tHome('subtitle'),
		'abi-lib': tAbiLib('subtitle'),
		ecosystem: tEcosystem('subtitle'),
		notify: tNotify('subtitle'),
		"timelocks": tTimelocks('description'),
		"transactions": tTransactions('transactionHistory'),
		'create-transaction': tCreateTx('encodingTransaction.description'),
	};

	if (['login'].includes(pathKey)) {
		return <div className={className}>{children}</div>;
	}

	const effectiveTitle = autoTitleMap[pathKey] || '';
	const effectiveDesc = breadcrumbDescMap[pathKey] || '';

	return (
		<div className={className}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className='flex h-14 md:h-[72px] shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b border-gray-100 px-3 md:px-0'>
						{/* Mobile menu trigger */}
						<SidebarTrigger className='md:hidden' />
						
						<div className='flex items-center gap-2 px-2 md:px-4 py-2'>
							<Separator orientation='vertical' className='mr-2 h-4 hidden md:block' />
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className='text-sm md:text-base'>{effectiveTitle}</BreadcrumbItem>
								</BreadcrumbList>
								{effectiveDesc && (
									<div className='text-xs md:text-sm text-gray-500 mt-1 hidden sm:block'>{effectiveDesc}</div>
								)}
							</Breadcrumb>
						</div>

						<div className='flex items-center gap-1.5 md:gap-3 ml-auto pr-2 md:pr-6'>
							<ChainSwitcher />
							<LanguageSwitcher />
							<ConnectWallet icon={true} headerStyle={true} />
						</div>
					</header>
					<div className='flex flex-1 flex-col gap-4 px-4 md:px-6 pb-16 md:pb-10 pt-4 md:pt-8'>
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
