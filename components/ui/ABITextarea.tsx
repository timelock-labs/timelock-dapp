'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';

interface ABITextareaProps {
	id?: string;
	label?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	helperText?: string;
}

/**
 * ABI Textarea component with JSON formatting support
 */
const ABITextarea: React.FC<ABITextareaProps> = ({
	id,
	label,
	value,
	onChange,
	placeholder,
	rows = 5,
	className = '',
	required = false,
	disabled = false,
	error,
	helperText,
}) => {
	const generatedId = useId();
	const textareaId = id || generatedId;
	const errorId = useId();
	const helperId = useId();

	const [isFocused, setIsFocused] = useState(false);

	const hasError = Boolean(error);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	// 尝试格式化 JSON
	const handleFormat = useCallback(() => {
		try {
			const parsed = JSON.parse(value);
			onChange(JSON.stringify(parsed, null, 2));
		} catch {
			// 不是有效 JSON，忽略
		}
	}, [value, onChange]);

	const isValidJson = useMemo(() => {
		if (!value.trim()) return null;
		try {
			JSON.parse(value);
			return true;
		} catch {
			return false;
		}
	}, [value]);

	const ariaDescribedBy = useMemo(() => {
		const ids: string[] = [];
		if (hasError) ids.push(errorId);
		if (helperText) ids.push(helperId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}, [hasError, errorId, helperText, helperId]);

	const textareaClassName = cn(
		'overflow-y-auto overflow-x-hidden resize-none',
		'min-h-[120px] max-h-[300px]',
		'whitespace-pre-wrap break-all w-full max-w-full box-border',
		'font-mono text-sm',
		'transition-all duration-200',
		{
			'border-red-500 focus:border-red-500 focus:ring-red-500/20': hasError,
			'border-green-500': isValidJson === true && !hasError,
		},
		className
	);

	return (
		<div className='space-y-2'>
			{/* Label */}
			{label && (
				<div className='flex items-center justify-between'>
					<Label
						htmlFor={textareaId}
						className={cn(
							'transition-colors duration-200',
							{
								'text-red-600': hasError,
								'text-black': isFocused && !hasError,
							},
							required && "after:content-['*'] after:text-red-500 after:ml-1"
						)}
					>
						{label}
					</Label>

					{/* Format Button */}
					{value && isValidJson && (
						<button
							type='button'
							onClick={handleFormat}
							className='text-xs text-gray-500 hover:text-gray-700 transition-colors'
						>
							Format JSON
						</button>
					)}
				</div>
			)}

			{/* Textarea */}
			<Textarea
				id={textareaId}
				value={value}
				onChange={handleChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				placeholder={placeholder || label}
				rows={rows}
				className={textareaClassName}
				disabled={disabled}
				required={required}
				aria-invalid={hasError}
				aria-describedby={ariaDescribedBy}
			/>

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

			{/* JSON Validation Status */}
			{value && isValidJson !== null && !hasError && (
				<p
					className={cn('text-xs flex items-center gap-1', {
						'text-green-600': isValidJson,
						'text-amber-600': !isValidJson,
					})}
				>
					{isValidJson ? (
						<>
							<svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
							Valid JSON
						</>
					) : (
						<>
							<svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
							Invalid JSON
						</>
					)}
				</p>
			)}
		</div>
	);
};

export default ABITextarea;
