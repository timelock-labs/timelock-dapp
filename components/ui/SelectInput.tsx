'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';

import { cn } from '@/utils/utils';
import type { BaseComponentProps, ValueCallback, SelectOption } from '@/types';

interface SelectInputProps extends BaseComponentProps {
	label: string;
	value: string;
	onChange: ValueCallback<string>;
	options?: SelectOption[];
	placeholder?: string;
	logo?: string;
	error?: string;
	disabled?: boolean;
	noOptionsText?: string;
	required?: boolean;
	helperText?: string;
}

/**
 * Enhanced select component with Radix UI, transitions, and accessibility
 */
const SelectInput: React.FC<SelectInputProps> = ({
	logo,
	label,
	value,
	onChange,
	options = [],
	placeholder,
	error,
	disabled = false,
	noOptionsText = 'No options available',
	required = false,
	helperText,
	className,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectId = useId();
	const errorId = useId();
	const helperId = useId();

	const hasError = Boolean(error);
	const ariaDescribedBy = [
		hasError ? errorId : null,
		helperText ? helperId : null,
	].filter(Boolean).join(' ') || undefined;

	return (
		<div className='mb-4'>
			{/* Label */}
			<label
				htmlFor={selectId}
				className={cn(
					'block text-sm font-medium mb-1 transition-colors duration-200',
					{
						'text-red-600': hasError,
						'text-black': isOpen && !hasError,
						'text-gray-700': !isOpen && !hasError,
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

			{/* Select */}
			<Select.Root
				value={value || undefined}
				onValueChange={onChange}
				disabled={disabled}
				onOpenChange={setIsOpen}
			>
				<Select.Trigger
					id={selectId}
					aria-describedby={ariaDescribedBy}
					aria-invalid={hasError}
					aria-required={required}
					className={cn(
						'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm',
						'transition-all duration-200 ease-in-out',
						'focus:outline-none focus:ring-2 focus:ring-offset-0',
						{
							// Error state
							'bg-red-50 border border-red-300 focus:ring-red-500/20': hasError,
							// Normal state - 灰色背景无边框
							'bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-black/10': !hasError && !disabled,
							// Disabled state
							'bg-gray-100 cursor-not-allowed text-gray-400 opacity-60': disabled,
							// Open state
							'bg-white border-gray-300 ring-2 ring-black/10': isOpen && !hasError && !disabled,
						},
						className
					)}
				>
					<div className='flex items-center gap-2 truncate'>
						{logo && (
							<Image
								className='rounded-full overflow-hidden h-6 w-6 flex-shrink-0'
								src={logo}
								alt=''
								width={24}
								height={24}
							/>
						)}
						<Select.Value placeholder={placeholder || ''} />
					</div>
					<Select.Icon asChild>
						<ChevronDown
							className={cn(
								'h-4 w-4 text-gray-500 transition-transform duration-200',
								{ 'rotate-180': isOpen }
							)}
							aria-hidden='true'
						/>
					</Select.Icon>
				</Select.Trigger>

				<Select.Portal>
					<Select.Content
						position='popper'
						side='bottom'
						align='start'
						sideOffset={4}
						className={cn(
							'z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
							'animate-in fade-in-0 zoom-in-95 duration-200',
							'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
						)}
					>
						<Select.Viewport className='p-1 max-h-60 overflow-y-auto'>
							{options.length === 0 ? (
								<div className='px-3 py-2 text-sm text-gray-500 whitespace-nowrap'>
									{noOptionsText}
								</div>
							) : (
								options.map(option => (
									<Select.Item
										key={option.value}
										value={option.value}
										disabled={option.disabled}
										className={cn(
											'flex cursor-pointer select-none items-center justify-between gap-2',
											'rounded-md px-3 py-2 text-sm text-gray-800',
											'transition-colors duration-150',
											'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
											'data-[highlighted]:bg-gray-100',
											'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
										)}
									>
										<Select.ItemText>{option.label}</Select.ItemText>
										<Select.ItemIndicator>
											<Check className='h-4 w-4 text-black' aria-hidden='true' />
										</Select.ItemIndicator>
									</Select.Item>
								))
							)}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>

			{/* Helper Text */}
			{helperText && !hasError && (
				<p id={helperId} className='mt-1 text-xs text-gray-500'>
					{helperText}
				</p>
			)}

			{/* Error Message */}
			{hasError && (
				<p
					id={errorId}
					className='mt-1 text-sm text-red-600 flex items-center gap-1'
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
	);
};

export default SelectInput;
