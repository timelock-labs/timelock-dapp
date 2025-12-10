import React from 'react';
import type { BaseComponentProps } from '@/types';
import Image from "next/image"
import { cn } from '@/utils/utils';

interface LogoProps extends BaseComponentProps {
	size?: 'sm' | 'md' | 'lg';
	color?: "white" | "black";
	/** 是否只显示图标（用于侧边栏收起状态） */
	iconOnly?: boolean;
}

/**
 * Logo component with customizable size
 *
 * @param props - Logo component props
 * @returns JSX.Element
 */
const Logo: React.FC<LogoProps> = ({ size = 'md', className, color = 'white', iconOnly = false }) => {
	let width = 180;
	let height = 36;
	switch (size) {
		case 'sm':
			width = 120;
			height = parseInt((120 / 4.08).toString());
			break;
		case 'md':
			width = 180;
			height = parseInt((180 / 4.08).toString());
			break;
		case 'lg':
			width = 240;
			height = parseInt((240 / 4.08).toString());
			break;
		default:
			break;
	}

	// 图标尺寸
	const iconSize = size === 'sm' ? 28 : size === 'md' ? 36 : 44;

	if (iconOnly) {
		return (
			<div className={cn('flex items-center justify-center', className)}
				style={{
					width: `${width}px`,
					height: `${height}px`
				}}
			>
				<Image
					src='/logo/logo1_solid_black.png'
					alt='Logo'
					width={800}
					height={800}
					className='object-contain w-full h-full'
				/>
			</div>
		);
	}

	return (
		<div className={cn('flex items-center', className)} style={{
			width: `${width}px`,
			height: `${height}px`
		}}>
			{color === 'white' ? (
				<Image
					src='/logo/logo-banner-white.png'
					alt='Logo'
					width={800}
					height={800}
					className='object-contain h-full w-full'
				/>
			) : (
				<Image
					src='/logo/logo-banner-black.png'
					alt='Logo'
					width={800}
					height={800}
					className='object-contain h-full w-full'
				/>
			)}
		</div>
	);
};

export default Logo;
