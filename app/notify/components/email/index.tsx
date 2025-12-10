/**
 * Email Notification Section
 * 
 * 重构说明：
 * 1. 状态管理 - 使用 useEmailNotifications hook 抽离业务逻辑
 * 2. 组件职责 - 组件只负责 UI 渲染，不包含业务逻辑
 * 3. 可测试性 - 业务逻辑在 hook 中，易于单元测试
 * 4. 可复用性 - hook 可在其他组件中复用
 */

'use client';

import { useTranslations } from 'next-intl';
import { useEmailNotifications } from '@/hooks/crud';

// Components
import MailboxCard from './components/MailboxCard';
import AddMailboxCard from './components/AddMailboxCard';
import AddMailboxModal from './components/AddMailboxModal';
import EditMailboxModal from './components/EditMailboxModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SectionHeader from '@/components/ui/SectionHeader';
import { LoadingSkeleton } from '../loadingSkeletons';

// ============================================================================
// Component
// ============================================================================

const EmailNotificationSection: React.FC = () => {
	const t = useTranslations('Notify');
	const tc = useTranslations('common');

	// 使用专门的 hook 管理所有状态和操作
	const {
		verifiedMailboxes,
		isLoading,
		addModal,
		editModal,
		deleteConfirm,
		handleDelete,
		confirmDelete,
		cancelDelete,
		handleEdit,
		onAddSuccess,
		onEditSuccess,
	} = useEmailNotifications();

	// Loading 状态
	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<section className='flex flex-col space-y-4 sm:space-y-6 md:space-y-8'>
			{/* Header */}
			<SectionHeader title={t('title')} description={t('description')} />

			{/* Mailbox Grid */}
			<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
				{verifiedMailboxes.map(mailbox => (
					<MailboxCard
						key={mailbox.id}
						id={parseInt(mailbox.id)}
						email={mailbox.email}
						remark={mailbox.remark}
						created_at={mailbox.created_at}
						onDelete={handleDelete}
						onEdit={() => handleEdit(mailbox)}
					/>
				))}
				<AddMailboxCard onClick={() => addModal.open()} />
			</div>

			{/* Modals */}
			<AddMailboxModal
				isOpen={addModal.isOpen}
				onClose={addModal.close}
				onSuccess={onAddSuccess}
			/>

			<EditMailboxModal
				isOpen={editModal.isOpen}
				onClose={editModal.close}
				onSuccess={onEditSuccess}
				initialData={editModal.data}
			/>

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={deleteConfirm.isOpen}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				title={t('confirmDialog.title')}
				description={t('confirmDialog.description', { email: deleteConfirm.name })}
				confirmText={tc('delete')}
				cancelText={tc('cancel')}
				variant='destructive'
			/>
		</section>
	);
};

export default EmailNotificationSection;
