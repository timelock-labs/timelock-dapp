'use client';

import { RefObject, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Pencil, MoreVertical } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useTranslations } from 'next-intl';

interface OperationsDropdownProps {
	onDelete: () => void;
	onEdit: () => void;
	itemName?: string;
}

/**
 * Operations dropdown menu with edit and delete actions
 */
const OperationsDropdown: React.FC<OperationsDropdownProps> = ({
	onDelete,
	onEdit,
	itemName,
}) => {
	const tc = useTranslations('common');
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 4, left: 140 });
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Toggle dropdown
	const toggleDropdown = useCallback(() => {
		setIsOpen(prev => !prev);
	}, []);

	// Close dropdown
	const closeDropdown = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Update position when dropdown opens
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom + 4,
				left: rect.right - 140,
			});
		}
	}, [isOpen]);

	// Close on click outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				closeDropdown();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, closeDropdown]);

	// Handle edit click
	const handleEdit = useCallback(() => {
		onEdit();
		closeDropdown();
	}, [onEdit, closeDropdown]);

	// Handle delete click
	const handleDelete = useCallback(() => {
		onDelete();
		closeDropdown();
	}, [onDelete, closeDropdown]);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeDropdown();
				buttonRef.current?.focus();
			}
		},
		[closeDropdown]
	);

	const dropdown = isOpen ? (
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
			{/* Edit Button */}
			<button
				type='button'
				role='menuitem'
				onClick={handleEdit}
				className={cn(
					'w-full text-left px-3 py-2 text-sm cursor-pointer',
					'flex items-center gap-2',
					'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
					'transition-colors duration-150',
					'focus:outline-none focus:bg-gray-100'
				)}
			>
				<Pencil className='w-4 h-4' aria-hidden='true' />
				<span>{tc('edit')}</span>
			</button>

			{/* Delete Button */}
			<button
				type='button'
				role='menuitem'
				onClick={handleDelete}
				className={cn(
					'w-full text-left px-3 py-2 text-sm cursor-pointer',
					'flex items-center gap-2',
					'text-red-600 hover:bg-red-50 hover:text-red-700',
					'transition-colors duration-150',
					'focus:outline-none focus:bg-red-50'
				)}
			>
				<Trash2 className='w-4 h-4' aria-hidden='true' />
				<span>{tc('delete')}</span>
			</button>
		</div>
	) : null;

	return (
		<>
			<button
				ref={buttonRef}
				type='button'
				onClick={toggleDropdown}
				className={cn(
					'p-2 rounded-lg border border-gray-200',
					'hover:bg-gray-100 transition-colors duration-200',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
					isOpen && 'bg-gray-100'
				)}
				aria-label={itemName ? `Operations for ${itemName}` : 'Operations'}
				aria-expanded={isOpen}
				aria-haspopup='menu'
			>
				<MoreVertical className='w-4 h-4 text-gray-600' aria-hidden='true' />
			</button>
			{typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
		</>
	);
};

export default OperationsDropdown;
