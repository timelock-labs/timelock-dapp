'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import type { ViewABIFormProps } from '@/types';

/** 格式化 ABI JSON 内容 */
const formatAbiContent = (content: string): string => {
	try {
		return JSON.stringify(JSON.parse(content), null, 2);
	} catch {
		return content;
	}
};

const ViewABIForm: React.FC<ViewABIFormProps> = ({ isOpen, onClose, viewAbiContent }) => {
	const t = useTranslations('ABI-Lib.viewForm');

	// 缓存格式化后的 ABI 内容
	const formattedAbi = useMemo(
		() => (viewAbiContent?.abi_content ? formatAbiContent(viewAbiContent.abi_content) : ''),
		[viewAbiContent?.abi_content]
	);

	// Dialog 组件会处理 isOpen 状态，无需提前返回 null
	if (!viewAbiContent) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='w-[558px] overflow-hidden'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
				</DialogHeader>

				<div className='grid gap-4'>
					<div className='space-y-2'>
						<Label>{t('nameLabel')}</Label>
						<Input
							value={viewAbiContent.name}
							readOnly
							className='bg-gray-50 cursor-default'
							tabIndex={-1}
						/>
					</div>

					<div className='space-y-2'>
						<Label>{t('descriptionLabel')}</Label>
						<Textarea
							value={viewAbiContent.description}
							readOnly
							className='bg-gray-50 cursor-default resize-none'
							tabIndex={-1}
						/>
					</div>

					<div className='space-y-2'>
						<Label>{t('interfaceDetails')}</Label>
						<Textarea
							value={formattedAbi}
							readOnly
							className='h-[300px] bg-gray-50 cursor-default resize-none font-mono text-sm'
							tabIndex={-1}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type='button' variant='outline' onClick={onClose}>
						{t('closeButton')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ViewABIForm;
