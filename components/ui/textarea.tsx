import * as React from 'react';

import { cn } from '@/utils/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				// 基础样式
				'flex w-full min-h-[80px] rounded-lg px-3 py-2.5 text-sm',
				// 背景和边框
				'bg-gray-100 border-transparent',
				// 过渡效果
				'transition-all duration-200 ease-in-out',
				// 焦点状态
				'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white focus:border-gray-300 focus:ring-black/10',
				// Placeholder
				'placeholder:text-gray-400',
				// 禁用状态
				'disabled:cursor-not-allowed disabled:opacity-50 disabled:text-gray-400',
				// 只读状态
				'read-only:bg-gray-100 read-only:cursor-default',
				// 错误状态
				'aria-invalid:bg-red-50 aria-invalid:border aria-invalid:border-red-300 aria-invalid:ring-red-500/20',
				className
			)}
			{...props}
		/>
	);
}

export { Textarea };
