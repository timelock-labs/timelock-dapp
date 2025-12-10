// components/transactions/TabbedNavigation.tsx
import React, { useCallback, useRef } from 'react';
import { cn } from '@/utils/utils';

interface Tab {
	id: string;
	label: string;
	count?: number;
}

interface TabbedNavigationProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	/** 可选的 aria-label 用于描述标签组 */
	ariaLabel?: string;
}

/**
 * 可访问的标签导航组件
 * - 支持键盘导航 (左右箭头、Home、End)
 * - 正确的 ARIA 角色和属性
 * - 平滑的视觉过渡
 */
const TabbedNavigation: React.FC<TabbedNavigationProps> = ({ 
	tabs, 
	activeTab, 
	onTabChange,
	ariaLabel = 'Filter tabs'
}) => {
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// 键盘导航处理
	const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
		let newIndex: number | null = null;

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
				break;
			case 'ArrowRight':
				e.preventDefault();
				newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'Home':
				e.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				newIndex = tabs.length - 1;
				break;
		}

		if (newIndex !== null) {
			const targetTab = tabs[newIndex];
			if (targetTab) {
				tabRefs.current[newIndex]?.focus();
				onTabChange(targetTab.id);
			}
		}
	}, [tabs, onTabChange]);

	return (
		<div 
			role="tablist" 
			aria-label={ariaLabel}
			className='flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl overflow-x-auto max-w-full scrollbar-hide'
		>
			{tabs.map((tab, index) => {
				const isActive = activeTab === tab.id;
				return (
					<button
						key={tab.id}
						ref={el => { tabRefs.current[index] = el; }}
						role="tab"
						aria-selected={isActive}
						aria-controls={`tabpanel-${tab.id}`}
						tabIndex={isActive ? 0 : -1}
						onClick={() => onTabChange(tab.id)}
						onKeyDown={(e) => handleKeyDown(e, index)}
						className={cn(
							'px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg text-center relative whitespace-nowrap flex-shrink-0 cursor-pointer',
							'transition-all duration-200 ease-out',
							'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1',
							isActive
								? 'bg-white text-gray-900 shadow-sm font-medium'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
						)}
					>
						{tab.label}
						{tab.count !== undefined && (
							<span className={cn(
								'ml-1.5 px-1.5 py-0.5 text-xs rounded-full min-w-[20px] inline-block',
								isActive
									? 'bg-gray-900 text-white'
									: 'bg-gray-200 text-gray-600'
							)}>
								{tab.count}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
};

export default TabbedNavigation;
