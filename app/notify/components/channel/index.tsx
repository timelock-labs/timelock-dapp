/**
 * Channel Notification Section
 * 
 * 重构说明：
 * 1. 类型定义 - 移至 types/api/notification.ts 统一管理
 * 2. 状态管理 - 使用 useChannelNotifications hook 抽离业务逻辑
 * 3. 数据转换 - 在 hook 中处理 API 响应转换
 * 4. 组件职责 - 只负责 UI 渲染
 */

'use client';

import { useTranslations } from 'next-intl';
import { useChannelNotifications } from '@/hooks/crud';

// Components
import AddChannelCard from './components/AddChannelCard';
import AddChannelModal from './components/AddChannelModal';
import ChannelCard from './components/ChannelCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SectionHeader from '@/components/ui/SectionHeader';
import { LoadingSkeleton } from '../loadingSkeletons';

// ============================================================================
// Component
// ============================================================================

export default function ChannelNotificationSection() {
	const t = useTranslations('Notify.channel');
	const tc = useTranslations('common');

	// 使用专门的 hook 管理所有状态和操作
	const {
		channels,
		isLoading,
		modal,
		deleteConfirm,
		handleDelete,
		confirmDelete,
		cancelDelete,
		handleEdit,
		onSuccess,
	} = useChannelNotifications();

	// Loading 状态
	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<section>
			{/* Header */}
			<div className='mb-4 sm:mb-6'>
				<SectionHeader title={t('title')} description={t('description')} />
			</div>

			{/* Channel Grid */}
			<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
				{channels.map(channel => (
					<ChannelCard
						key={channel.id}
						channelData={channel}
						onDelete={handleDelete}
						onEdit={() => handleEdit(channel)}
					/>
				))}
				<AddChannelCard onClick={() => modal.open()} />
			</div>

			{/* Add/Edit Modal */}
			<AddChannelModal
				isOpen={modal.isOpen}
				onClose={modal.close}
				onSuccess={onSuccess}
				editCurrentChannel={modal.editingChannel}
			/>

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={deleteConfirm.isOpen}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				title={t('channelConfirmDialog.title')}
				description={t('channelConfirmDialog.description', { name: deleteConfirm.name })}
				confirmText={tc('delete')}
				cancelText={tc('cancel')}
				variant='destructive'
			/>
		</section>
	);
}
