'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { cn } from '@/utils/utils';
import type { BaseComponentProps, ValueCallback } from '@/types';

interface TextAreaInputProps extends BaseComponentProps {
	label: string;
	value: string;
	onChange: ValueCallback<string>;
	placeholder?: string;
	rows?: number;
	disabled?: boolean;
	error?: string;
	required?: boolean;
	helperText?: string;
	maxLength?: number;
	showCount?: boolean;
}

/**
 * Enhanced textarea component with label, error handling, and accessibility
 */
const TextAreaInput: React.FC<TextAreaInputProps> = ({
	label,
	value,
	onChange,
	placeholder,
	rows = 4,
	disabled = false,
	error,
	required = false,
	helperText,
	maxLength,
	showCount = false,
	className,
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const textareaId = useId();
	const errorId = useId();
	const helperId = useId();

	const hasError = Boolean(error);
	const charCount = value.length;
	const isOverLimit = maxLength ? charCount > maxLength : false;

	const ariaDescribedBy = useMemo(() => {
		const ids: string[] = [];
		if (hasError) ids.push(errorId);
		if (helperText) ids.push(helperId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}, [hasError, errorId, helperText, helperId]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	return (
		<div className='mb-4'>
			{/* Label */}
			<label
				htmlFor={textareaId}
				className={cn(
					'block text-sm font-medium mb-1 transition-colors duration-200',
					{
						'text-red-600': hasError,
						'text-black': isFocused && !hasError,
						'text-gray-700': !isFocused && !hasError,
						'text-gray-400': disabled,
					}
				)}
			>
				{label}
				{required && (
					<span className='text-red-500 ml-0.5' aria-hidden='true'>
						*
					</span>
				)}
			</label>

			{/* Textarea */}
			<textarea
				id={textareaId}
				rows={rows}
				className={cn(
					'mt-1 block w-full px-3 py-2.5 rounded-lg text-sm',
					'transition-all duration-200 ease-in-out',
					'focus:outline-none focus:ring-2 focus:ring-offset-0',
					'resize-y min-h-[80px]',
					'placeholder:text-gray-400',
					{
						// Error state
						'bg-red-50 border border-red-300 focus:ring-red-500/20': hasError || isOverLimit,
						// Normal state - 灰色背景无边框
						'bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-black/10': !hasError && !isOverLimit && !disabled,
						// Disabled state
						'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60': disabled,
					},
					className
				)}
				placeholder={placeholder || label}
				value={value}
				onChange={handleChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				disabled={disabled}
				aria-invalid={hasError || isOverLimit}
				aria-describedby={ariaDescribedBy}
				aria-required={required}
				maxLength={maxLength}
			/>

			{/* Footer: Helper text / Error / Character count */}
			<div className='mt-1 flex justify-between items-start'>
				<div className='flex-1'>
					{/* Helper Text */}
					{helperText && !hasError && (
						<p id={helperId} className='text-xs text-gray-500'>
							{helperText}
						</p>
					)}

					{/* Error Message */}
					{hasError && (
						<p
							id={errorId}
							className='text-sm text-red-600 flex items-center gap-1'
							role='alert'
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
							{error}
						</p>
					)}
				</div>

				{/* Character Count */}
				{showCount && maxLength && (
					<span
						className={cn('text-xs ml-2 flex-shrink-0', {
							'text-red-500': isOverLimit,
							'text-gray-400': !isOverLimit,
						})}
					>
						{charCount}/{maxLength}
					</span>
				)}
			</div>
		</div>
	);
};

export default TextAreaInput;
