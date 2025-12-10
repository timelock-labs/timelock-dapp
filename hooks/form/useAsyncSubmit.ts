/**
 * Async Submit Hook
 * 
 * 处理异步表单提交的通用 hook
 * 提供：提交状态、错误处理、成功回调等功能
 */

'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface UseAsyncSubmitOptions<TData, TResult> {
	/** 提交函数 */
	submitFn: (data: TData) => Promise<TResult>;
	/** 成功回调 */
	onSuccess?: (result: TResult) => void;
	/** 失败回调 */
	onError?: (error: Error) => void;
	/** 成功提示消息 */
	successMessage?: string;
	/** 失败提示消息模板 */
	errorMessage?: string;
	/** 是否显示 toast */
	showToast?: boolean;
}

export interface UseAsyncSubmitReturn<TData> {
	/** 是否正在提交 */
	isSubmitting: boolean;
	/** 提交错误 */
	error: Error | null;
	/** 提交函数 */
	submit: (data: TData) => Promise<boolean>;
	/** 重置状态 */
	reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAsyncSubmit<TData, TResult = unknown>(
	options: UseAsyncSubmitOptions<TData, TResult>
): UseAsyncSubmitReturn<TData> {
	const {
		submitFn,
		onSuccess,
		onError,
		successMessage,
		errorMessage = 'An error occurred',
		showToast = true,
	} = options;

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const submit = useCallback(
		async (data: TData): Promise<boolean> => {
			if (isSubmitting) return false;

			setIsSubmitting(true);
			setError(null);

			try {
				const result = await submitFn(data);

				if (showToast && successMessage) {
					toast.success(successMessage);
				}

				onSuccess?.(result);
				return true;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);

				if (showToast) {
					toast.error(`${errorMessage}: ${error.message}`);
				}

				onError?.(error);
				return false;
			} finally {
				setIsSubmitting(false);
			}
		},
		[isSubmitting, submitFn, onSuccess, onError, successMessage, errorMessage, showToast]
	);

	const reset = useCallback(() => {
		setIsSubmitting(false);
		setError(null);
	}, []);

	return {
		isSubmitting,
		error,
		submit,
		reset,
	};
}
