import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/utils';
import type { ButtonProps } from '@/types';
import LoadingSpinner from './LoadingSpinner';

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline: 'border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 px-6 has-[>svg]:px-4',
				icon: 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

interface ExtendedButtonProps extends ButtonProps {
	/** 是否显示加载状态 */
	loading?: boolean;
	/** 加载时显示的文本 */
	loadingText?: string;
}

/**
 * Button component with consistent styling, loading state, and behavior
 */
function Button({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	loadingText,
	disabled,
	children,
	...props
}: ExtendedButtonProps) {
	const Comp = asChild ? Slot : 'button';
	const isDisabled = disabled || loading;

	// 根据 variant 决定 spinner 颜色
	const spinnerColor = variant === 'outline' || variant === 'ghost' || variant === 'link'
		? 'primary'
		: 'white';

	return (
		<Comp
			data-slot='button'
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={isDisabled}
			aria-busy={loading}
			aria-disabled={isDisabled}
			{...props}
		>
			{loading ? (
				<>
					<LoadingSpinner size='sm' color={spinnerColor} />
					{loadingText && <span>{loadingText}</span>}
					{!loadingText && children}
				</>
			) : (
				children
			)}
		</Comp>
	);
}

export { Button, buttonVariants };
