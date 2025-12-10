'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import TextInput from '@/components/ui/TextInput';
import { useApi } from '@/hooks/useApi';

// ============ Types ============
interface EditMailboxModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	initialData: { id: string; email: string; remark?: string } | null;
}

// ============ Component ============
const EditMailboxModal: React.FC<EditMailboxModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
	const t = useTranslations('Notify.editMailbox');
	const tc = useTranslations('common');

	const [remark, setRemark] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { request: updateEmail } = useApi();

	// Sync initial data
	useEffect(() => {
		if (initialData) {
			setRemark(initialData.remark || '');
		}
	}, [initialData]);

	// Handle dialog open change
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !isSubmitting) {
				setRemark(initialData?.remark || '');
				onClose();
			}
		},
		[isSubmitting, initialData, onClose]
	);

	// Handle close button click
	const handleCloseClick = useCallback(() => {
		if (!isSubmitting) {
			setRemark(initialData?.remark || '');
			onClose();
		}
	}, [isSubmitting, initialData, onClose]);

	// Handle save
	const handleSave = useCallback(async () => {
		if (!remark.trim()) {
			toast.error(t('emailRemarkRequired'));
			return;
		}

		if (!initialData?.id) {
			toast.error(t('cannotGetEmailAddress'));
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await updateEmail('/api/v1/emails/remark', {
				id: parseInt(initialData.id),
				remark: remark.trim(),
			});

			// Check if API returned success: false
			if (!response?.success) {
				const errorMessage = response?.error?.message || tc('unknownError');
				toast.error(t('updateError', { message: errorMessage }));
				return;
			}

			toast.success(t('updateSuccess'));
			onSuccess();
			onClose();
		} catch (error) {
			toast.error(
				t('updateError', {
					message: error instanceof Error ? error.message : tc('unknownError'),
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [remark, initialData, updateEmail, t, tc, onSuccess, onClose]);

	if (!initialData) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='w-[558px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<TextInput
						label={t('emailAddressReadOnly')}
						value={initialData.email}
						onChange={() => {}}
						disabled
						validationType='email'
					/>

					<TextInput
						label={t('emailRemark')}
						value={remark}
						onChange={(value: string) => setRemark(value)}
						disabled={isSubmitting}
					/>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleCloseClick} disabled={isSubmitting}>
						{tc('cancel')}
					</Button>
					<Button
						onClick={handleSave}
						disabled={!remark.trim()}
						loading={isSubmitting}
						loadingText={tc('loading')}
					>
						{tc('save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditMailboxModal;
