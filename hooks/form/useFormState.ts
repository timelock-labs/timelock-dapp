/**
 * Form State Hook
 * 
 * 通用表单状态管理 hook
 * 提供：字段更新、重置、验证等功能
 */

'use client';

import { useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseFormStateOptions<T extends Record<string, unknown>> {
	/** 初始表单值 */
	initialValues: T;
	/** 验证函数 */
	validate?: (values: T) => Record<keyof T, string> | null;
	/** 提交前转换 */
	transformBeforeSubmit?: (values: T) => unknown;
}

export interface UseFormStateReturn<T extends Record<string, unknown>> {
	/** 当前表单值 */
	values: T;
	/** 验证错误 */
	errors: Partial<Record<keyof T, string>>;
	/** 表单是否被修改 */
	isDirty: boolean;
	/** 更新单个字段 */
	updateField: <K extends keyof T>(field: K, value: T[K]) => void;
	/** 更新多个字段 */
	updateFields: (updates: Partial<T>) => void;
	/** 重置表单 */
	reset: (newValues?: T) => void;
	/** 设置错误 */
	setError: (field: keyof T, message: string) => void;
	/** 清除错误 */
	clearError: (field: keyof T) => void;
	/** 清除所有错误 */
	clearAllErrors: () => void;
	/** 验证表单 */
	validateForm: () => boolean;
	/** 获取提交数据 */
	getSubmitData: () => unknown;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFormState<T extends Record<string, unknown>>(
	options: UseFormStateOptions<T>
): UseFormStateReturn<T> {
	const { initialValues, validate, transformBeforeSubmit } = options;

	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [isDirty, setIsDirty] = useState(false);

	// 更新单个字段
	const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
		setValues(prev => ({ ...prev, [field]: value }));
		setIsDirty(true);
		// 清除该字段的错误
		setErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	}, []);

	// 更新多个字段
	const updateFields = useCallback((updates: Partial<T>) => {
		setValues(prev => ({ ...prev, ...updates }));
		setIsDirty(true);
	}, []);

	// 重置表单
	const reset = useCallback((newValues?: T) => {
		setValues(newValues ?? initialValues);
		setErrors({});
		setIsDirty(false);
	}, [initialValues]);

	// 设置错误
	const setError = useCallback((field: keyof T, message: string) => {
		setErrors(prev => ({ ...prev, [field]: message }));
	}, []);

	// 清除错误
	const clearError = useCallback((field: keyof T) => {
		setErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	}, []);

	// 清除所有错误
	const clearAllErrors = useCallback(() => {
		setErrors({});
	}, []);

	// 验证表单
	const validateForm = useCallback((): boolean => {
		if (!validate) return true;

		const validationErrors = validate(values);
		if (validationErrors) {
			setErrors(validationErrors as Partial<Record<keyof T, string>>);
			return false;
		}

		setErrors({});
		return true;
	}, [validate, values]);

	// 获取提交数据
	const getSubmitData = useCallback(() => {
		if (transformBeforeSubmit) {
			return transformBeforeSubmit(values);
		}
		return values;
	}, [transformBeforeSubmit, values]);

	return {
		values,
		errors,
		isDirty,
		updateField,
		updateFields,
		reset,
		setError,
		clearError,
		clearAllErrors,
		validateForm,
		getSubmitData,
	};
}
