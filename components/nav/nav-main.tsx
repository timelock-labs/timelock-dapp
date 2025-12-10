'use client';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import type { BaseComponentProps } from '@/types';

interface NavMainItem {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	badge?: string | number;
	badgeColor?: string;
	items?: {
		title: string;
		url: string;
	}[];
}

interface NavMainProps extends BaseComponentProps {
	items: NavMainItem[];
}

/**
 * Main navigation component with collapsible menu items
 *
 * @param props - NavMain component props
 * @returns JSX.Element
 */
export function NavMain({ items, className }: NavMainProps) {
	const router = useRouter();
	const pathname = usePathname();
	return (
		<SidebarGroup className={className}>
			<SidebarMenu>
				{items.map(item =>
					item.items ?
						// If item has sub-items, use Collapsible
						<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={item.title}>
										{item.icon && <item.icon className="!size-5 text-[#4d4d4d]" />}
										<span>{item.title}</span>
										<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map(subItem => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<Link href={`/${subItem.url}`} prefetch scroll={false} onMouseEnter={() => router.prefetch(`/${subItem.url}`)}>
														<span>{subItem.title}</span>
													</Link>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
						// If item has no sub-items, use simple Link
						: <SidebarMenuItem key={item.title}>
							<SidebarMenuButton tooltip={item.title} asChild isActive={pathname === `/${item.url}`}>
								<Link href={`/${item.url}`} prefetch scroll={false} onMouseEnter={() => router.prefetch(`/${item.url}`)}>
									{item.icon && <item.icon className={`!size-5 ${pathname === `/${item.url}` ? 'text-black' : 'text-[#4d4d4d]'}`} />}
									<span>{item.title}</span>
									{item.badge && (
										<span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${item.badgeColor === 'green' ? 'bg-emerald-100 text-emerald-600' : item.badgeColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
											{item.badge}
										</span>
									)}
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}
