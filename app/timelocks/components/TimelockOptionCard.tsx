// components/TimelockOptionCard.tsx
import React from 'react';

interface TimelockOptionCardProps {
	title: string;
	description: string;
	bgColor: string; // Tailwind class for background color (e.g., 'bg-black', 'bg-white')
	textColor: string; // Tailwind class for text color (e.g., 'text-white')
	borderColor?: string; // Optional border color (e.g., 'border-gray-200' for the white card)
	bgImage?: string; // Optional background image URL
	onClick?: () => void; // Optional click handler for interactivity
}

import create_bg_img from '@/public/create_bg.png';

const TimelockOptionCard: React.FC<TimelockOptionCardProps> = ({
	title,
	description,
	bgColor,
	textColor,
	// borderColor = 'border-transparent', // Default to no visible border
	bgImage = create_bg_img.src, // Default background image
	onClick,
}) => {
	return (
		<div
			className={`
				${bgColor} ${textColor}
				rounded-xl border
				p-4 sm:p-6 md:p-8
				flex flex-col justify-end
				min-h-[200px] sm:min-h-[250px] md:min-h-[300px]
				cursor-pointer hover:shadow-lg transition-shadow duration-200
				active:scale-[0.99]
			`}
			onClick={onClick}
			style={{
				backgroundImage: `url(${bgImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			<h3 className='text-lg sm:text-xl font-semibold mb-2'>{title}</h3>
			<p className='text-xs sm:text-sm opacity-80 max-w-full md:max-w-[460px]'>{description}</p>
		</div>
	);
};

export default TimelockOptionCard;
