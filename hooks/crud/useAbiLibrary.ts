/**
 * ABI Library Hook
 * 
 * 管理 ABI 库的 CRUD 操作
 * 包含：列表、添加、删除、查看等功能
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useApi } from '../useApi';
import { useModalState } from './useCrudOperations';
import type { ABIRow, ABIContent } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseAbiLibraryOptions {
	autoFetch?: boolean;
}

interface DropdownState {
	openId: number | null;
	dropdownRef: React.RefObject<HTMLDivElement | null>;
	buttonRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
}

interface UseAbiLibraryReturn {
	// 数据
	abis: ABIRow[];
	isLoading: boolean;

	// Modal 状态
	addModal: {
		isOpen: boolean;
		open: () => void;
		close: () => void;
	};
	viewModal: {
		isOpen: boolean;
		content: ABIContent | null;
		open: (abi: ABIRow) => void;
		close: () => void;
	};
	deleteDialog: {
		isOpen: boolean;
		abi: ABIRow | null;
		open: (abi: ABIRow) => void;
		confirm: () => Promise<void>;
		cancel: () => void;
	};

	// Dropdown 状态
	dropdown: DropdownState & {
		toggle: (id: number) => void;
		close: () => void;
	};

	// 操作
	refresh: () => void;
	handleView: (abi: ABIRow) => void;
	handleDelete: (abi: ABIRow) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAbiLibrary(
	options: UseAbiLibraryOptions = {}
): UseAbiLibraryReturn {
	const { autoFetch = true } = options;

	const t = useTranslations('ABI-Lib');
	const tc = useTranslations('common');

	// ========== Refs ==========
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

	// ========== State ==========
	const [abis, setAbis] = useState<ABIRow[]>([]);
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	
	// Add Modal
	const [isAddOpen, setIsAddOpen] = useState(false);
	
	// View Modal
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [viewContent, setViewContent] = useState<ABIContent | null>(null);
	
	// Delete Dialog
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [abiToDelete, setAbiToDelete] = useState<ABIRow | null>(null);

	// ========== API ==========
	const { request: fetchAbiList, isLoading } = useApi();
	const { request: deleteAbiApi } = useApi();

	// ========== Fetch ==========
	const refresh = useCallback(() => {
		fetchAbiList('/api/v1/abi/list').then(response => {
			if (response?.success) {
				setAbis(response.data.abis || []);
			} else if (response && !response.success) {
				toast.error(t('fetchAbiListError', { 
					message: response.error?.message || tc('unknownError') 
				}));
			}
		});
	}, [fetchAbiList, t, tc]);

	// 自动加载
	useEffect(() => {
		if (autoFetch) {
			refresh();
		}
	}, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

	// ========== Dropdown ==========
	const toggleDropdown = useCallback((id: number) => {
		setOpenDropdownId(prev => (prev === id ? null : id));
	}, []);

	const closeDropdown = useCallback(() => {
		setOpenDropdownId(null);
	}, []);

	// Click outside handler
	useEffect(() => {
		if (!openDropdownId) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpenDropdownId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [openDropdownId]);

	// ========== Add Modal ==========
	const openAddModal = useCallback(() => {
		setIsAddOpen(true);
	}, []);

	const closeAddModal = useCallback(() => {
		setIsAddOpen(false);
		refresh();
	}, [refresh]);

	// ========== View Modal ==========
	const openViewModal = useCallback((abi: ABIRow) => {
		setViewContent(abi);
		setIsViewOpen(true);
	}, []);

	const closeViewModal = useCallback(() => {
		setIsViewOpen(false);
		setViewContent(null);
	}, []);

	// ========== Delete Dialog ==========
	const openDeleteDialog = useCallback((abi: ABIRow) => {
		setAbiToDelete(abi);
		setIsDeleteOpen(true);
		setOpenDropdownId(null);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!abiToDelete) return;

		try {
			const response = await deleteAbiApi('/api/v1/abi/delete', { id: abiToDelete.id });

			if (response?.success) {
				toast.success(t('deleteAbiSuccess'));
				refresh();
			} else {
				toast.error(t('deleteAbiError', { 
					message: response?.error?.message || tc('unknownError') 
				}));
			}
		} catch (error) {
			toast.error(t('deleteAbiError', { 
				message: error instanceof Error ? error.message : tc('unknownError') 
			}));
		} finally {
			setIsDeleteOpen(false);
			setAbiToDelete(null);
		}
	}, [abiToDelete, deleteAbiApi, t, tc, refresh]);

	const cancelDelete = useCallback(() => {
		setIsDeleteOpen(false);
		setAbiToDelete(null);
	}, []);

	// ========== Handlers ==========
	const handleView = useCallback((abi: ABIRow) => {
		openViewModal(abi);
	}, [openViewModal]);

	const handleDelete = useCallback((abi: ABIRow) => {
		openDeleteDialog(abi);
	}, [openDeleteDialog]);

	return {
		// 数据
		abis,
		isLoading,

		// Modal 状态
		addModal: {
			isOpen: isAddOpen,
			open: openAddModal,
			close: closeAddModal,
		},
		viewModal: {
			isOpen: isViewOpen,
			content: viewContent,
			open: openViewModal,
			close: closeViewModal,
		},
		deleteDialog: {
			isOpen: isDeleteOpen,
			abi: abiToDelete,
			open: openDeleteDialog,
			confirm: confirmDelete,
			cancel: cancelDelete,
		},

		// Dropdown 状态
		dropdown: {
			openId: openDropdownId,
			dropdownRef,
			buttonRefs,
			toggle: toggleDropdown,
			close: closeDropdown,
		},

		// 操作
		refresh,
		handleView,
		handleDelete,
	};
}
