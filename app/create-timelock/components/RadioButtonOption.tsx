import { useCallback } from 'react';
import { cn } from '@/utils/utils';
import type { RadioButtonOptionProps } from '@/types';

/**
 * Radio button option component with label and description
 */
const RadioButtonOption: React.FC<RadioButtonOptionProps> = ({
	id,
	name,
	value,
	label,
	description,
	checked,
	onChange,
	className,
	disabled = false,
}) => {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange?.(e.target.value);
		},
		[onChange]
	);

	return (
		<label
			htmlFor={id}
			className={cn(
				'flex items-start rounded-lg border px-4 py-3',
				'cursor-pointer transition-all duration-200',
				'hover:border-gray-400',
				{
					'border-black bg-gray-50 ring-1 ring-black/10': checked,
					'border-gray-300 bg-white': !checked,
					'opacity-50 cursor-not-allowed': disabled,
				},
				className
			)}
		>
			<input
				type='radio'
				id={id}
				name={name}
				value={value}
				checked={checked}
				onChange={handleChange}
				disabled={disabled}
				className={cn(
					'h-4 w-4 mt-0.5 mr-3 flex-shrink-0',
					'border-gray-300 text-black',
					'focus:ring-2 focus:ring-black/20 focus:ring-offset-0'
				)}
				aria-describedby={description ? `${id}-description` : undefined}
			/>
			<div className='flex-1 min-w-0'>
				<p className={cn(
					'font-medium text-sm text-gray-900',
					{ 'text-gray-500': disabled }
				)}>
					{label}
				</p>
				{description && (
					<p
						id={`${id}-description`}
						className={cn(
							'text-sm text-gray-500 mt-0.5',
							{ 'text-gray-400': disabled }
						)}
					>
						{description}
					</p>
				)}
			</div>
		</label>
	);
};

export default RadioButtonOption;
