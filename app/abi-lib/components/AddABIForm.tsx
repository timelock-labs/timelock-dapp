'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ABITextarea from '@/components/ui/ABITextarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import type { AddABIFormProps } from '@/types';
import { useApi } from '@/hooks/useApi';

/** 表单初始状态 */
const INITIAL_FORM_STATE = {
	name: '',
	description: '',
	abi: '',
} as const;

const AddABIForm: React.FC<AddABIFormProps> = ({ isOpen, onClose }) => {
	const t = useTranslations('ABI-Lib.addForm');
	const tc = useTranslations('common');

	// 表单状态
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// API hooks
	const { request: validateAbi } = useApi();
	const { request: addAbi } = useApi();

	// 表单是否有效
	const isFormValid = useMemo(
		() => formData.name.trim() && formData.description.trim() && formData.abi.trim(),
		[formData]
	);

	// 重置表单
	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_STATE);
	}, []);

	// 更新表单字段
	const updateField = useCallback((field: keyof typeof INITIAL_FORM_STATE, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	// 关闭弹窗
	const handleClose = useCallback(() => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	}, [isSubmitting, resetForm, onClose]);

	// 提交表单
	const handleSubmit = useCallback(async () => {
		if (!isFormValid || isSubmitting) return;

		setIsSubmitting(true);

		try {
			// 1. 验证 ABI 格式
			const validateResult = await validateAbi('/api/v1/abi/validate', {
				abi_content: formData.abi,
			});

			if (!validateResult?.success || !validateResult.data?.is_valid) {
				toast.error(
					t('validateAbiError', {
						message: validateResult?.error?.message || tc('unknownError'),
					})
				);
				return;
			}

			// 2. 添加 ABI
			const addResult = await addAbi('/api/v1/abi', {
				name: formData.name.trim(),
				description: formData.description.trim(),
				abi_content: formData.abi.trim(),
			});

			if (addResult?.success) {
				toast.success(t('addAbiSuccess'));
				resetForm();
				onClose();
			} else {
				toast.error(
					t('addAbiError', {
						message: addResult?.error?.message || tc('unknownError'),
					})
				);
			}
		} catch (error) {
			toast.error(
				t('addAbiError', {
					message: error instanceof Error ? error.message : tc('unknownError'),
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [isFormValid, isSubmitting, formData, validateAbi, addAbi, t, tc, resetForm, onClose]);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='w-[558px] overflow-hidden'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='grid gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='abiName'>{t('nameLabel')}</Label>
						<Input
							id='abiName'
							value={formData.name}
							onChange={e => updateField('name', e.target.value)}
							placeholder={t('nameLabel')}
							disabled={isSubmitting}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='abiDescription'>{t('descriptionLabel')}</Label>
						<Input
							id='abiDescription'
							value={formData.description}
							onChange={e => updateField('description', e.target.value)}
							placeholder={t('descriptionLabel')}
							disabled={isSubmitting}
						/>
					</div>

					<ABITextarea
						id='abiContent'
						label={t('contentLabel')}
						value={formData.abi}
						onChange={value => updateField('abi', value)}
						placeholder={t('contentLabel')}
						rows={5}
						disabled={isSubmitting}
					/>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={handleClose}
						disabled={isSubmitting}
					>
						{tc('cancel')}
					</Button>
					<Button
						type='button'
						onClick={handleSubmit}
						disabled={!isFormValid || isSubmitting}
					>
						{isSubmitting ? tc('loading') : tc('add')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddABIForm;
