/**
 * Generic CRUD Operations Hook
 * 
 * 提供通用的增删改查操作抽象，减少组件中的重复逻辑
 * 
 * 设计原则：
 * 1. 单一职责 - 只处理 CRUD 状态和操作
 * 2. 可组合性 - 可与其他 hooks 组合使用
 * 3. 类型安全 - 完整的 TypeScript 支持
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useApi } from '../useApi';
import type { DeleteConfirmState } from '@/types/api/notification';

// ============================================================================
// Types
// ============================================================================

/** CRUD 操作配置 */
interface CrudConfig<T> {
	/** 资源名称 (用于错误消息) */
	resourceName: string;
	/** API 端点 */
	endpoints: {
		list: string;
		create?: string;
		update?: string;
		delete?: string;
	};
	/** 从 API 响应中提取数据的函数 */
	extractData: (response: unknown) => T[];
	/** 获取实体的唯一标识 */
	getEntityId: (entity: T) => string | number;
	/** 获取实体的显示名称 (用于确认对话框) */
	getEntityName: (entity: T) => string;
}

/** CRUD 操作消息配置 */
interface CrudMessages {
	fetchError?: string;
	createSuccess?: string;
	createError?: string;
	updateSuccess?: string;
	updateError?: string;
	deleteSuccess?: string;
	deleteError?: string;
}

/** CRUD Hook 返回值 */
interface UseCrudReturn<T> {
	// 状态
	data: T[];
	isLoading: boolean;
	error: Error | null;
	
	// 删除确认对话框状态
	deleteConfirm: DeleteConfirmState;
	
	// 操作
	fetch: () => Promise<void>;
	create: (payload: unknown) => Promise<boolean>;
	update: (id: string | number, payload: unknown) => Promise<boolean>;
	remove: (id: string | number, name: string) => void;
	confirmDelete: () => Promise<boolean>;
	cancelDelete: () => void;
	
	// 工具
	findById: (id: string | number) => T | undefined;
	refresh: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCrudOperations<T>(
	config: CrudConfig<T>,
	messages: CrudMessages = {}
): UseCrudReturn<T> {
	// State
	const [data, setData] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
		isOpen: false,
		id: '',
		name: '',
	});

	// API hooks
	const { request } = useApi();
	
	// Ref to track if component is mounted
	const isMountedRef = useRef(true);

	// ========== Fetch ==========
	const fetch = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await request(config.endpoints.list);
			
			if (isMountedRef.current) {
				const extractedData = config.extractData(response);
				setData(extractedData);
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Unknown error');
			
			if (isMountedRef.current) {
				setError(error);
				toast.error(messages.fetchError || `Failed to fetch ${config.resourceName}`);
			}
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [request, config, messages.fetchError]);

	// ========== Create ==========
	const create = useCallback(
		async (payload: unknown): Promise<boolean> => {
			if (!config.endpoints.create) {
				console.warn('Create endpoint not configured');
				return false;
			}

			try {
				const response = await request(config.endpoints.create, payload as object);

				if (response?.success === false) {
					toast.error(response?.error?.message || messages.createError || `Failed to create ${config.resourceName}`);
					return false;
				}

				toast.success(messages.createSuccess || `${config.resourceName} created successfully`);
				return true;
			} catch (err) {
				toast.error(messages.createError || `Failed to create ${config.resourceName}`);
				return false;
			}
		},
		[request, config, messages]
	);

	// ========== Update ==========
	const update = useCallback(
		async (id: string | number, payload: unknown): Promise<boolean> => {
			if (!config.endpoints.update) {
				console.warn('Update endpoint not configured');
				return false;
			}

			try {
				const response = await request(config.endpoints.update, { id, ...payload as object });

				if (response?.success === false) {
					toast.error(response?.error?.message || messages.updateError || `Failed to update ${config.resourceName}`);
					return false;
				}

				toast.success(messages.updateSuccess || `${config.resourceName} updated successfully`);
				return true;
			} catch (err) {
				toast.error(messages.updateError || `Failed to update ${config.resourceName}`);
				return false;
			}
		},
		[request, config, messages]
	);

	// ========== Delete ==========
	const remove = useCallback(
		(id: string | number, name: string) => {
			setDeleteConfirm({ isOpen: true, id, name });
		},
		[]
	);

	const confirmDelete = useCallback(async (): Promise<boolean> => {
		if (!config.endpoints.delete) {
			console.warn('Delete endpoint not configured');
			return false;
		}

		const entity = data.find(item => config.getEntityId(item) === deleteConfirm.id);
		
		if (!entity) {
			toast.error(`${config.resourceName} not found`);
			setDeleteConfirm({ isOpen: false, id: '', name: '' });
			return false;
		}

		try {
			const response = await request(config.endpoints.delete, { id: deleteConfirm.id });

			if (response?.success === false) {
				toast.error(response?.error?.message || messages.deleteError || `Failed to delete ${config.resourceName}`);
				return false;
			}

			// Optimistic update
			setData(prev => prev.filter(item => config.getEntityId(item) !== deleteConfirm.id));
			toast.success(messages.deleteSuccess || `${config.resourceName} deleted successfully`);
			return true;
		} catch (err) {
			toast.error(messages.deleteError || `Failed to delete ${config.resourceName}`);
			return false;
		} finally {
			setDeleteConfirm({ isOpen: false, id: '', name: '' });
		}
	}, [request, config, data, deleteConfirm, messages]);

	const cancelDelete = useCallback(() => {
		setDeleteConfirm({ isOpen: false, id: '', name: '' });
	}, []);

	// ========== Utilities ==========
	const findById = useCallback(
		(id: string | number): T | undefined => {
			return data.find(item => config.getEntityId(item) === id);
		},
		[data, config]
	);

	const refresh = useCallback(async () => {
		await fetch();
	}, [fetch]);

	return {
		// State
		data,
		isLoading,
		error,
		deleteConfirm,
		
		// Operations
		fetch,
		create,
		update,
		remove,
		confirmDelete,
		cancelDelete,
		
		// Utilities
		findById,
		refresh,
	};
}

// ============================================================================
// Specialized Hooks (基于通用 Hook 的特化版本)
// ============================================================================

/** Modal 状态管理 Hook */
export function useModalState<T = null>(initialData: T | null = null) {
	const [isOpen, setIsOpen] = useState(false);
	const [data, setData] = useState<T | null>(initialData);

	const open = useCallback((newData?: T) => {
		if (newData !== undefined) {
			setData(newData);
		}
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		setData(initialData);
	}, [initialData]);

	const reset = useCallback(() => {
		setData(initialData);
	}, [initialData]);

	return {
		isOpen,
		data,
		open,
		close,
		reset,
		setData,
	};
}

/** 列表过滤和分页 Hook */
export function useListFilters<T extends Record<string, unknown>>(
	initialFilters: T
) {
	const [filters, setFilters] = useState<T>(initialFilters);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
		setFilters(prev => ({ ...prev, [key]: value }));
		setPage(1); // Reset to first page when filter changes
	}, []);

	const resetFilters = useCallback(() => {
		setFilters(initialFilters);
		setPage(1);
	}, [initialFilters]);

	const nextPage = useCallback(() => {
		setPage(prev => prev + 1);
	}, []);

	const prevPage = useCallback(() => {
		setPage(prev => Math.max(1, prev - 1));
	}, []);

	return {
		filters,
		page,
		pageSize,
		updateFilter,
		resetFilters,
		setPage,
		setPageSize,
		nextPage,
		prevPage,
	};
}
