'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/utils';
import type { BaseComponentProps, ValueCallback } from '@/types';
import { validate, type ValidationType } from '@/utils/validation';

type InputHTMLAttributes = React.InputHTMLAttributes<HTMLInputElement>;
type OnChangeType = ValueCallback<string> | ((event: React.ChangeEvent<HTMLInputElement>) => void);

interface TextInputProps extends BaseComponentProps, Omit<InputHTMLAttributes, 'onChange' | 'value'> {
	label: string;
	value: string;
	onChange: OnChangeType;
	error?: string | null;
	labelClassName?: string;
	/** 验证类型 */
	validationType?: ValidationType;
	/** 是否在失去焦点时验证 */
	validateOnBlur?: boolean;
	/** 是否在输入时实时验证 */
	validateOnChange?: boolean;
	/** 自定义验证函数 */
	customValidator?: (value: string) => string | null;
	/** 是否显示必填标记 */
	required?: boolean;
	/** 帮助文本 */
	helperText?: string;
}

/**
 * Enhanced text input component with label, error handling, validation, and accessibility
 */
const TextInput: React.FC<TextInputProps> = ({
	label,
	value,
	onChange,
	placeholder,
	type = 'text',
	disabled = false,
	error = null,
	className = '',
	labelClassName = '',
	validationType,
	validateOnBlur = true,
	validateOnChange = false,
	customValidator,
	required = false,
	helperText,
	...rest
}) => {
	const t = useTranslations('common');
	const [internalError, setInternalError] = useState<string | null>(null);
	const [isFocused, setIsFocused] = useState(false);

	// 生成唯一 ID 用于 aria 关联
	const inputId = useId();
	const errorId = useId();
	const helperId = useId();

	// 翻译函数包装器
	const translateValidation = useCallback(
		(key: string) => {
			try {
				return t(key);
			} catch {
				return key;
			}
		},
		[t]
	);

	// 执行验证
	const performValidation = useCallback(
		(val: string): string | null => {
			if (customValidator) {
				const customError = customValidator(val);
				if (customError) return customError;
			}

			if (validationType) {
				const result = validate(val, validationType, translateValidation);
				if (!result.isValid) return result.error;
			}

			return null;
		},
		[customValidator, validationType, translateValidation]
	);

	// 处理输入变化
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;

			if (onChange.length === 1) {
				(onChange as (value: string) => void)(newValue);
			} else {
				(onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
			}

			if (validateOnChange) {
				const validationError = performValidation(newValue);
				setInternalError(validationError);
			} else {
				setInternalError(null);
			}
		},
		[onChange, validateOnChange, performValidation]
	);

	// 处理焦点
	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	// 处理失去焦点
	const handleBlur = useCallback(() => {
		setIsFocused(false);
		if (validateOnBlur && value) {
			const validationError = performValidation(value);
			setInternalError(validationError);
		}
	}, [validateOnBlur, value, performValidation]);

	// 显示的错误信息
	const displayError = error || internalError;
	const hasError = !!displayError;

	// 构建 aria-describedby
	const ariaDescribedBy = useMemo(() => {
		const ids: string[] = [];
		if (hasError) ids.push(errorId);
		if (helperText) ids.push(helperId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}, [hasError, errorId, helperText, helperId]);

	// 输入框样式
	const inputClassName = useMemo(
		() =>
			cn(
				// 基础样式
				'mt-1 block w-full px-3 py-2.5 rounded-lg text-sm',
				// 过渡效果
				'transition-all duration-200 ease-in-out',
				// 焦点状态
				'focus:outline-none focus:ring-2 focus:ring-offset-0',
				// 条件样式
				{
					// 错误状态
					'bg-red-50 border border-red-300 focus:ring-red-500/20': hasError,
					// 正常状态 - 灰色背景无边框
					'bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-black/10': !hasError && !disabled,
					// 禁用状态
					'cursor-not-allowed bg-gray-100 text-gray-400 opacity-60': disabled,
				},
				// placeholder 样式
				'placeholder:text-gray-400',
				className
			),
		[hasError, disabled, className]
	);

	return (
		<div className='mb-4'>
			{/* Label */}
			<label
				htmlFor={inputId}
				className={cn(
					'block text-sm font-medium mb-1 transition-colors duration-200',
					{
						'text-red-600': hasError,
						'text-black': isFocused && !hasError,
						'text-gray-700': !isFocused && !hasError,
					},
					labelClassName
				)}
			>
				{label}
				{required && (
					<span className='text-red-500 ml-0.5' aria-hidden='true'>
						*
					</span>
				)}
			</label>

			{/* Input */}
			<input
				id={inputId}
				type={type}
				className={inputClassName}
				placeholder={placeholder || label}
				value={value}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				disabled={disabled}
				aria-invalid={hasError}
				aria-describedby={ariaDescribedBy}
				aria-required={required}
				{...rest}
			/>

			{/* Helper Text */}
			{helperText && !hasError && (
				<p id={helperId} className='mt-1 text-xs text-gray-500'>
					{helperText}
				</p>
			)}

			{/* Error Message with animation */}
			<div
				className={cn(
					'overflow-hidden transition-all duration-200 ease-in-out',
					hasError ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
				)}
			>
				<p
					id={errorId}
					className='mt-1 text-sm text-red-600 flex items-center gap-1'
					role='alert'
					aria-live='polite'
				>
					<svg
						className='w-4 h-4 flex-shrink-0'
						fill='currentColor'
						viewBox='0 0 20 20'
						aria-hidden='true'
					>
						<path
							fillRule='evenodd'
							d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
							clipRule='evenodd'
						/>
					</svg>
					{displayError}
				</p>
			</div>
		</div>
	);
};

export default TextInput;
