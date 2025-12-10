import * as React from 'react';

import { cn } from '@/utils/utils';
import type { InputProps } from '@/types';

/**
 * Basic input component with consistent styling
 *
 * @param props - Input component props
 * @returns JSX.Element
 */
function Input({ className, type, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				// 基础样式
				'flex h-[42px] w-full min-w-0 rounded-lg px-3 py-2.5 text-sm',
				// 背景和边框
				'bg-gray-100 border-transparent',
				// 过渡效果
				'transition-all duration-200 ease-in-out',
				// 焦点状态
				'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white focus:border-gray-300 focus:ring-black/10',
				// Placeholder
				'placeholder:text-gray-400',
				// 禁用状态
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:text-gray-400',
				// 只读状态
				'read-only:bg-gray-100 read-only:cursor-default',
				// 错误状态
				'aria-invalid:bg-red-50 aria-invalid:border aria-invalid:border-red-300 aria-invalid:ring-red-500/20',
				// 文件输入
				'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
				className
			)}
			{...props}
		/>
	);
}

export { Input };
