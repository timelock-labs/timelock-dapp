'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BadgeCheck, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useDisconnect, useActiveWallet } from 'thirdweb/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/userStore';
import type { BaseComponentProps } from '@/types';

interface NavUserProps extends BaseComponentProps {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}

/**
 * Navigation user component with dropdown menu
 *
 * @param props - NavUser component props
 * @returns JSX.Element
 */
export function NavUser({ user }: NavUserProps) {
	const { isMobile } = useSidebar();
	const t = useTranslations('common');
	const router = useRouter();
	const logout = useAuthStore(state => state.logout);
	const { disconnect } = useDisconnect();
	const wallet = useActiveWallet();

	const handleLogout = useCallback(async () => {
		toast.info(t('loggingOut'));
		
		try {
			// 断开钱包连接
			if (wallet) {
				await disconnect(wallet);
			}
			
			// 清除认证状态
			logout();
			
			toast.success(t('logoutSuccess'));
			
			// 跳转到登录页
			router.replace('/login');
		} catch (error) {
			console.error('Logout error:', error);
			toast.error(t('logoutError'));
			// 即使出错也尝试清除状态并跳转
			logout();
			router.replace('/login');
		}
	}, [wallet, disconnect, logout, router, t]);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<Avatar className='h-8 w-8 rounded'>
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className='rounded'>CN</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-semibold'>{user.name}</span>
								{/* <span className="truncate text-xs">{user.email}</span> */}
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded' side={isMobile ? 'bottom' : 'right'} align='end' sideOffset={4}>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded'>
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className='rounded'>CN</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-semibold'>{user.name}</span>
									<span className='truncate text-xs'>{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
							<LogOut />
							{t('logout')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
