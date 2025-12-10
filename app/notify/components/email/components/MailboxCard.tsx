'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { cn, formatDateWithYear } from '@/utils/utils';
import OperationsDropdown from '../../OperationsDropdown';

interface MailboxCardProps {
	onDelete: (id: number, email: string) => void;
	onEdit: (mailbox: { id: string; email: string; remark?: string; created_at: string }) => void;
	id: number;
	email: string;
	remark?: string | null;
	created_at: string;
}

const MailboxCard: React.FC<MailboxCardProps> = ({
	id,
	email,
	remark,
	created_at,
	onDelete,
	onEdit,
}) => {
	const t = useTranslations('Notify.mailboxCard');
	const tc = useTranslations('common');

	const handleCopyEmail = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(email);
			toast.success(tc('copied'));
		} catch {
			toast.error(tc('copyFailed'));
		}
	}, [email, tc]);

	const handleEditClick = useCallback(() => {
		onEdit({
			id: id.toString(),
			email,
			remark: remark ?? undefined,
			created_at,
		});
	}, [id, email, remark, created_at, onEdit]);

	const handleDeleteClick = useCallback(() => {
		onDelete(id, email);
	}, [id, email, onDelete]);

	return (
		<article
			className={cn(
				'bg-gray-100 rounded-xl border border-gray-200',
				'flex flex-col justify-between h-auto',
				'transition-shadow duration-200 hover:shadow-md'
			)}
		>
			{/* Header */}
			<div className='px-3 sm:px-4 py-2 flex justify-between items-center'>
				<time className='text-xs sm:text-sm text-gray-500 truncate'>
					{t('addedAt')}: {formatDateWithYear(created_at) || '-'}
				</time>
				{/* Operations Dropdown */}
				<OperationsDropdown
					onEdit={handleEditClick}
					onDelete={handleDeleteClick}
					itemName={email}
				/>
			</div>

			{/* Content */}
			<div className='rounded-xl border bg-white p-3 sm:p-4'>
				{/* Email */}
				<div className='mb-3'>
					<button
						type='button'
						onClick={handleCopyEmail}
						className={cn(
							'flex items-center gap-2 text-sm sm:text-lg font-semibold w-full',
							'hover:text-gray-600 transition-colors duration-200',
							'group cursor-pointer'
						)}
						aria-label={`${tc('copy')} ${email}`}
					>
						<Mail className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' aria-hidden='true' />
						<span className='truncate flex-1 text-left'>{email}</span>
						<Copy
							className='w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0'
							aria-hidden='true'
						/>
					</button>
				</div>

				{/* Remark */}
				<p className='text-sm sm:text-base text-gray-700 line-clamp-2'>
					{remark || '-'}
				</p>
			</div>
		</article>
	);
};

export default MailboxCard;
