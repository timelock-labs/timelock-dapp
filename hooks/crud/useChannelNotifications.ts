/**
 * Channel Notifications Hook
 * 
 * 专门处理渠道通知的 CRUD 操作
 * 处理飞书、Lark、Telegram 等多种渠道类型
 */

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useApi } from '../useApi';
import { useModalState } from './useCrudOperations';
import type {
	NotificationChannel,
	ChannelConfigsResponse,
	WebhookChannelConfig,
	TelegramChannelConfig,
	DeleteConfirmState,
	EMPTY_CHANNEL,
} from '@/types/api/notification';
import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface UseChannelNotificationsOptions {
	autoFetch?: boolean;
}

interface UseChannelNotificationsReturn {
	// 数据
	channels: NotificationChannel[];
	isLoading: boolean;
	error: Error | null;

	// Modal 状态
	modal: {
		isOpen: boolean;
		editingChannel: NotificationChannel | null;
		open: (channel?: NotificationChannel) => void;
		close: () => void;
	};

	// 删除确认
	deleteConfirm: DeleteConfirmState;

	// 操作
	fetchChannels: () => Promise<void>;
	handleDelete: (id: string | number, name: string) => void;
	confirmDelete: () => Promise<boolean>;
	cancelDelete: () => void;
	handleEdit: (channel: NotificationChannel) => void;
	onSuccess: () => void;
}

// ============================================================================
// Utilities
// ============================================================================

/** 将 API 响应转换为统一的 Channel 格式 */
function transformChannelConfigs(response: ChannelConfigsResponse): NotificationChannel[] {
	const channels: NotificationChannel[] = [];

	// 处理飞书配置
	if (response.feishu_configs?.length) {
		channels.push(
			...response.feishu_configs.map((item: WebhookChannelConfig) => ({
				...item,
				channel: 'feishu' as const,
				id: `feishu_${item.id}`,
				webhook_url: item.webhook_url || '',
				secret: item.secret || '',
			}))
		);
	}

	// 处理 Lark 配置
	if (response.lark_configs?.length) {
		channels.push(
			...response.lark_configs.map((item: WebhookChannelConfig) => ({
				...item,
				channel: 'lark' as const,
				id: `lark_${item.id}`,
				webhook_url: item.webhook_url || '',
				secret: item.secret || '',
			}))
		);
	}

	// 处理 Telegram 配置
	if (response.telegram_configs?.length) {
		channels.push(
			...response.telegram_configs.map((item: TelegramChannelConfig) => ({
				...item,
				channel: 'telegram' as const,
				id: `telegram_${item.id}`,
				bot_token: item.bot_token || '',
				chat_id: item.chat_id || '',
				webhook_url: '',
				secret: '',
			}))
		);
	}

	return channels;
}

/** 空渠道对象 */
const EMPTY_CHANNEL_DATA: NotificationChannel = {
	id: '',
	name: '',
	channel: 'feishu',
	user_address: '',
	is_active: false,
	created_at: '',
	webhook_url: '',
	secret: '',
	bot_token: '',
	chat_id: '',
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useChannelNotifications(
	options: UseChannelNotificationsOptions = {}
): UseChannelNotificationsReturn {
	const { autoFetch = true } = options;

	const t = useTranslations('Notify.channel');
	const tc = useTranslations('common');

	// State
	const [channels, setChannels] = useState<NotificationChannel[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
		isOpen: false,
		id: '',
		name: '',
	});

	// API
	const { request: getChannelsApi } = useApi();
	const { request: deleteChannelApi } = useApi();

	// ========== Fetch ==========
	const fetchChannels = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await getChannelsApi('/api/v1/notifications/configs');

			if (response?.data) {
				const transformedChannels = transformChannelConfigs(response.data);
				setChannels(transformedChannels);
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Unknown error');
			setError(error);
			console.error('Failed to fetch channels:', error);
		} finally {
			setIsLoading(false);
		}
	}, [getChannelsApi]);

	// 自动加载
	useEffect(() => {
		if (autoFetch) {
			fetchChannels();
		}
	}, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

	// ========== Delete ==========
	const handleDelete = useCallback((id: string | number, name: string) => {
		setDeleteConfirm({ isOpen: true, id, name });
	}, []);

	const confirmDelete = useCallback(async (): Promise<boolean> => {
		const channel = channels.find(ch => ch.id === deleteConfirm.id);

		if (!channel) {
			toast.error(t('channelNotFound'));
			setDeleteConfirm({ isOpen: false, id: '', name: '' });
			return false;
		}

		try {
			const response = await deleteChannelApi('/api/v1/notifications/delete', {
				channel: channel.channel,
				name: channel.name,
			});

			if (response?.success === false) {
				toast.error(response?.error?.message || t('deleteChannelError'));
				return false;
			}

			// Optimistic update
			setChannels(prev => prev.filter(ch => ch.id !== deleteConfirm.id));
			toast.success(t('channelDeletedSuccessfully'));
			return true;
		} catch (err) {
			console.error('Failed to delete channel:', err);
			toast.error(t('deleteChannelError'));
			return false;
		} finally {
			setDeleteConfirm({ isOpen: false, id: '', name: '' });
		}
	}, [channels, deleteConfirm, deleteChannelApi, t]);

	const cancelDelete = useCallback(() => {
		setDeleteConfirm({ isOpen: false, id: '', name: '' });
	}, []);

	// ========== Modal ==========
	const openModal = useCallback((channel?: NotificationChannel) => {
		setEditingChannel(channel || null);
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setEditingChannel(null);
	}, []);

	const handleEdit = useCallback((channel: NotificationChannel) => {
		openModal(channel);
	}, [openModal]);

	const onSuccess = useCallback(() => {
		closeModal();
		fetchChannels();
	}, [closeModal, fetchChannels]);

	// ========== Modal State Object ==========
	const modal = useMemo(
		() => ({
			isOpen: isModalOpen,
			editingChannel,
			open: openModal,
			close: closeModal,
		}),
		[isModalOpen, editingChannel, openModal, closeModal]
	);

	return {
		// 数据
		channels,
		isLoading,
		error,

		// Modal 状态
		modal,

		// 删除确认
		deleteConfirm,

		// 操作
		fetchChannels,
		handleDelete,
		confirmDelete,
		cancelDelete,
		handleEdit,
		onSuccess,
	};
}
