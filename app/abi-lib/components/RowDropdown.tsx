'use client';

import { RefObject, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, FileText } from 'lucide-react';
import { cn } from '@/utils/utils';

interface ABIRowDropdownProps {
	isOpen: boolean;
	dropdownRef: RefObject<HTMLDivElement | null>;
	onDelete: () => void;
	onView: () => void;
	t: (key: string) => string;
	isShared: boolean;
	buttonRef?: RefObject<HTMLButtonElement>;
}

/**
 * ABI row dropdown menu with delete and view actions
 */
const ABIRowDropdown: React.FC<ABIRowDropdownProps> = ({
	isOpen,
	dropdownRef,
	onDelete,
	onView,
	t,
	isShared,
	buttonRef,
}) => {
	const [position, setPosition] = useState({ top: 0, left: 0 });

	useEffect(() => {
		if (isOpen && buttonRef?.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			// 使用视口相对位置，因为 dropdown 使用 fixed 定位
			// 不需要加 window.scrollY/scrollX，getBoundingClientRect 已经是视口相对坐标
			setPosition({
				top: rect.bottom + 4,
				left: rect.right - 140,
			});
		}
	}, [isOpen, buttonRef]);

	// 键盘导航支持
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				buttonRef?.current?.focus();
			}
		},
		[buttonRef]
	);

	if (!isOpen) return null;

	const dropdown = (
		<div
			ref={dropdownRef}
			role='menu'
			aria-orientation='vertical'
			onKeyDown={handleKeyDown}
			className={cn(
				'fixed w-36 bg-white rounded-lg z-50',
				'border border-gray-200 shadow-lg',
				'py-1 animate-in fade-in-0 zoom-in-95 duration-150'
			)}
			style={{ top: position.top, left: position.left }}
		>
			{/* View Button */}
			<button
				type='button'
				role='menuitem'
				onClick={onView}
				className={cn(
					'w-full text-left px-3 py-2 text-sm cursor-pointer',
					'flex items-center gap-2',
					'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
					'transition-colors duration-150',
					'focus:outline-none focus:bg-gray-100'
				)}
			>
				<FileText className='w-4 h-4' aria-hidden='true' />
				<span>{t('viewABI')}</span>
			</button>

			{/* Delete Button */}
			{!isShared && (
				<button
					type='button'
					role='menuitem'
					onClick={onDelete}
					className={cn(
						'w-full text-left px-3 py-2 text-sm cursor-pointer',
						'flex items-center gap-2',
						'text-red-600 hover:bg-red-50 hover:text-red-700',
						'transition-colors duration-150',
						'focus:outline-none focus:bg-red-50'
					)}
				>
					<Trash2 className='w-4 h-4' aria-hidden='true' />
					<span>{t('delete')}</span>
				</button>
			)}
		</div>
	);

	return createPortal(dropdown, document.body);
};

export default ABIRowDropdown;
