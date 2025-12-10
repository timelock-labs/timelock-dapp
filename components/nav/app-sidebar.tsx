'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
	Clock4,
	BellDot,
	FileCode,
	Boxes,
	House,
	ShieldPlus,
	Send,
	ListTodo,
} from 'lucide-react';
import { NavMain } from '@/components/nav/nav-main';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { useApi } from '@/hooks/useApi';
import Logo from '../layout/Logo';
// import type { BaseComponentProps } from '@/types';

/**
 * Application sidebar component with navigation and user menu
 *
 * @param props - AppSidebar component props
 * @returns JSX.Element
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations();
	const { state } = useSidebar();
	const { request: getTransactionList } = useApi();
	const [transactionCount, setTransactionCount] = useState<number>(0);

	// Fetch transaction counts (waiting + ready)
	const fetchTransactionCount = useCallback(async () => {
		try {
			const [waitingResult, readyResult] = await Promise.all([
				getTransactionList('/api/v1/flows/list', { page: 1, page_size: 1, status: 'waiting' }),
				getTransactionList('/api/v1/flows/list', { page: 1, page_size: 1, status: 'ready' }),
			]);

			const waitingCount = waitingResult?.data?.total || 0;
			const readyCount = readyResult?.data?.total || 0;
			setTransactionCount(waitingCount + readyCount);
		} catch (error) {
			console.error('Failed to fetch transaction count:', error);
		}
	}, [getTransactionList]);

	useEffect(() => {
		fetchTransactionCount();
	}, [fetchTransactionCount]);

	// Refresh transaction count when other parts of the app signal an update
	useEffect(() => {
		const handler = () => {
			void fetchTransactionCount();
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('transactions:updated', handler);
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('transactions:updated', handler);
			}
		};
	}, [fetchTransactionCount]);

	// Grouped navigation data
	const sidebarGroups = [
		{
			items: [
				{
					title: t('sidebar.nav.home'),
					url: 'home',
					icon: House,
				},
				{
					title: t('sidebar.nav.create_transaction'),
					url: 'create-transaction',
					icon: ShieldPlus,
				},
				{
					title: t('sidebar.nav.timelock_contracts'),
					url: 'timelocks',
					icon: Clock4,
				},
				{
					title: t('sidebar.nav.transactions'),
					url: 'transactions',
					icon: ListTodo,
					badge: transactionCount > 0 ? transactionCount : undefined,
					badgeColor: 'green',
				}
			]
		},
		{
			items: [
				{
					title: t('sidebar.nav.abi_library'),
					url: 'abi-lib',
					icon: FileCode,
				},
				{
					title: t('sidebar.nav.notifications'),
					url: 'notify',
					icon: BellDot
				},
			]
		},
		{
			items: [
				{
					title: t('sidebar.nav.ecosystem'),
					url: 'ecosystem',
					icon: Boxes,
				},
			]
		}
	];

	const isCollapsed = state === 'collapsed';

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader className='py-6 px-4'>
				<Logo size='sm' color='black' iconOnly={isCollapsed} />
			</SidebarHeader>
			<SidebarContent>
				{sidebarGroups.map((group, index) => (
					<React.Fragment key={index}>
						<NavMain items={group.items} />
						{index < sidebarGroups.length - 1 && (
							<div className="px-4 py-2">
								<div className="h-[1px] bg-gray-200" />
							</div>
						)}
					</React.Fragment>
				))}
			</SidebarContent>
			<SidebarFooter className={`w-full flex items-center justify-center h-auto py-4 ${isCollapsed ? 'flex-col gap-3 pb-8' : 'flex-row gap-5'}`}>
				{/* Explorer */}
				<a href="https://scan.timelock.tech/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" title="Explorer">
					<svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
				</a>
				{/* Twitter/X */}
				<a href="https://x.com/TimelockApp" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" title="Twitter">
					<svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
				</a>
				{/* Telegram */}
				{/* <a href="https://t.me/+piB_7Ue3WsUyYWY1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" title="Telegram">
					<Send className="w-5 h-5" />
				</a> */}
				{/* GitBook/Docs */}
				<a href="https://docs.timelock.tech" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" title="Documentation">
					<svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" /></svg>
				</a>
				{/* GitHub */}
				<a href="https://github.com/orgs/timelock-labs" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" title="GitHub">
					<svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
				</a>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
