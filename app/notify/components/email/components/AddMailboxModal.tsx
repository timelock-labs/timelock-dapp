'use client';

import { useCallback, useState } from 'react';
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
import VerificationCodeInput from './VerificationCodeInput';
import { useApi } from '@/hooks/useApi';

// ============ Types ============
interface AddMailboxModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

// ============ Constants ============
const INITIAL_FORM_STATE = {
	email: '',
	remark: '',
	code: '',
};

const VERIFICATION_CODE_LENGTH = 6;

// ============ Component ============
const AddMailboxModal: React.FC<AddMailboxModalProps> = ({ isOpen, onClose, onSuccess }) => {
	const t = useTranslations('Notify.addMailbox');
	const tc = useTranslations('common');

	// Form state
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [isCodeSent, setIsCodeSent] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// API
	const { request: sendCode } = useApi();
	const { request: verifyCode } = useApi();

	// Reset form
	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_STATE);
		setIsCodeSent(false);
	}, []);

	// Update form field
	const updateField = useCallback((field: keyof typeof INITIAL_FORM_STATE, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	// Handle dialog open change
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !isSubmitting) {
				resetForm();
				onClose();
			}
		},
		[isSubmitting, resetForm, onClose]
	);

	// Handle close button click
	const handleCloseClick = useCallback(() => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	}, [isSubmitting, resetForm, onClose]);

	// Send verification code
	const handleSendCode = useCallback(async () => {
		if (!formData.email.trim() || !formData.remark.trim()) {
			toast.error(t('emailAndRemarkRequired'));
			throw new Error('Email and remark are required');
		}

		const response = await sendCode('/api/v1/emails/send-verification', {
			email: formData.email.trim(),
			remark: formData.remark.trim(),
		});

		// Check if API returned success: false
		if (!response?.success) {
			const errorMessage = response?.error?.message || tc('unknownError');
			toast.error(t('addMailboxError', { message: errorMessage }));
			throw new Error(errorMessage);
		}

		setIsCodeSent(true);
		toast.success(t('verificationCodeSent'));
	}, [formData.email, formData.remark, sendCode, t, tc]);

	// Handle save
	const handleSave = useCallback(async () => {
		if (isSubmitting) return;

		// Validate verification code
		if (formData.code.length !== VERIFICATION_CODE_LENGTH) {
			toast.error(t('invalidVerificationCode'));
			return;
		}

		setIsSubmitting(true);
		toast.info(t('verifyingEmail'));

		try {
			// Verify email
			const response = await verifyCode('/api/v1/emails/verify', {
				email: formData.email.trim(),
				code: formData.code,
			});

			// Check if API returned success: false
			if (!response?.success) {
				const errorMessage = response?.error?.message || tc('unknownError');
				toast.error(t('emailVerificationError', { message: errorMessage }));
				return;
			}

			toast.success(t('mailboxAddedSuccessfully'));
			onSuccess();
			resetForm();
			onClose();
		} catch (error) {
			toast.error(
				t('emailVerificationError', {
					message: error instanceof Error ? error.message : tc('unknownError'),
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [isSubmitting, formData, verifyCode, t, tc, onSuccess, resetForm, onClose]);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='w-[558px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<TextInput
						label={t('emailAddress')}
						value={formData.email}
						onChange={(value: string) => updateField('email', value)}
						placeholder={t('emailPlaceholder')}
						disabled={isSubmitting}
						validationType='email'
					/>

					<TextInput
						label={t('emailRemark')}
						value={formData.remark}
						onChange={(value: string) => updateField('remark', value)}
						placeholder={t('remarkPlaceholder')}
						disabled={isSubmitting}
					/>

					<VerificationCodeInput
						email={formData.email}
						onSendCode={handleSendCode}
						onCodeChange={(code: string) => updateField('code', code)}
						codeLength={VERIFICATION_CODE_LENGTH}
						buttonText={isCodeSent ? t('resendCode') : t('sendCode')}
						disabledText={isCodeSent ? t('resending') : t('adding')}
						isFirstTime={!isCodeSent}
					/>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleCloseClick} disabled={isSubmitting}>
						{tc('cancel')}
					</Button>
					<Button
						onClick={handleSave}
						disabled={formData.code.length !== VERIFICATION_CODE_LENGTH}
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

export default AddMailboxModal;
