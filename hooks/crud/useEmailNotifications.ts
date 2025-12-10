/**
 * Email Notifications Hook
 * 
 * 专门处理邮箱通知的 CRUD 操作
 * 基于通用 useCrudOperations 构建，添加邮箱特有的业务逻辑
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCrudOperations, useModalState } from './useCrudOperations';
import type { EmailNotification } from '@/types/api/notification';

// ============================================================================
// Types
// ============================================================================

interface UseEmailNotificationsOptions {
	/** 是否自动加载数据 */
	autoFetch?: boolean;
	/** 只显示已验证的邮箱 */
	verifiedOnly?: boolean;
}

/** Modal 状态类型 */
interface ModalState<T> {
	isOpen: boolean;
	data: T | null;
	open: (newData?: T) => void;
	close: () => void;
	reset: () => void;
}

interface UseEmailNotificationsReturn {
	// 数据
	mailboxes: EmailNotification[];
	verifiedMailboxes: EmailNotification[];
	isLoading: boolean;
	error: Error | null;

	// Modal 状态
	addModal: ModalState<null>;
	editModal: ModalState<EmailNotification>;

	// 删除确认
	deleteConfirm: {
		isOpen: boolean;
		id: string | number;
		name: string;
	};

	// 操作
	fetchMailboxes: () => Promise<void>;
	handleDelete: (id: number, email: string) => void;
	confirmDelete: () => Promise<boolean>;
	cancelDelete: () => void;
	handleEdit: (mailbox: EmailNotification) => void;
	onAddSuccess: () => void;
	onEditSuccess: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEmailNotifications(
	options: UseEmailNotificationsOptions = {}
): UseEmailNotificationsReturn {
	const { autoFetch = true, verifiedOnly = true } = options;
	
	const t = useTranslations('Notify');

	// 使用通用 CRUD hook
	const crud = useCrudOperations<EmailNotification>(
		{
			resourceName: 'mailbox',
			endpoints: {
				list: '/api/v1/emails',
				delete: '/api/v1/emails/delete',
			},
			extractData: (response) => {
				const data = response as { data?: { emails?: EmailNotification[] } };
				return data?.data?.emails || [];
			},
			getEntityId: (entity) => entity.id,
			getEntityName: (entity) => entity.email,
		},
		{
			fetchError: t('fetchEmailListError', { message: 'Unknown error' }),
			deleteSuccess: t('deleteMailboxSuccess'),
			deleteError: t('deleteMailboxError', { message: 'Unknown error' }),
		}
	);

	// Modal 状态
	const addModal = useModalState();
	const editModal = useModalState<EmailNotification>(null);

	// 自动加载
	useEffect(() => {
		if (autoFetch) {
			crud.fetch();
		}
	}, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

	// 过滤已验证邮箱
	const verifiedMailboxes = verifiedOnly
		? crud.data.filter(m => m.is_verified)
		: crud.data;

	// 处理删除
	const handleDelete = useCallback(
		(id: number, email: string) => {
			crud.remove(id, email);
		},
		[crud]
	);

	// 处理编辑
	const handleEdit = useCallback(
		(mailbox: EmailNotification) => {
			editModal.open(mailbox);
		},
		[editModal]
	);

	// 添加成功回调
	const onAddSuccess = useCallback(() => {
		addModal.close();
		crud.refresh();
	}, [addModal, crud]);

	// 编辑成功回调
	const onEditSuccess = useCallback(() => {
		editModal.close();
		crud.refresh();
	}, [editModal, crud]);

	return {
		// 数据
		mailboxes: crud.data,
		verifiedMailboxes,
		isLoading: crud.isLoading,
		error: crud.error,

		// Modal 状态
		addModal,
		editModal,

		// 删除确认
		deleteConfirm: crud.deleteConfirm,

		// 操作
		fetchMailboxes: crud.fetch,
		handleDelete,
		confirmDelete: crud.confirmDelete,
		cancelDelete: crud.cancelDelete,
		handleEdit,
		onAddSuccess,
		onEditSuccess,
	};
}
