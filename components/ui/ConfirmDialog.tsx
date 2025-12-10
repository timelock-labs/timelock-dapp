'use client';

import { useCallback, useState } from 'react';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import type { ModalProps, VoidCallback } from '@/types';

interface ConfirmDialogProps extends ModalProps {
	onConfirm: VoidCallback | (() => Promise<void>);
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'default' | 'destructive';
	/** 确认按钮加载中文本 */
	loadingText?: string;
}

/**
 * Confirmation dialog component with customizable actions and loading state
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title = 'Confirm Action',
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'default',
	loadingText,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = useCallback(async () => {
		setIsLoading(true);
		try {
			await onConfirm();
		} finally {
			setIsLoading(false);
		}
	}, [onConfirm]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !isLoading) {
				onClose();
			}
		},
		[isLoading, onClose]
	);

	return (
		<AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={variant === 'destructive' ? 'destructive' : 'default'}
						onClick={handleConfirm}
						loading={isLoading}
						loadingText={loadingText}
						className={cn({
							'bg-red-600 hover:bg-red-700': variant === 'destructive',
						})}
					>
						{confirmText}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmDialog;
