'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

import { cn, formatDateWithYear } from '@/utils/utils';
import OperationsDropdown from '../../OperationsDropdown';

import feishu from '../images/feishu.png';
import lark from '../images/lark.png';
import telegram from '../images/telegram.png';

// ============ Types ============
import type { NotificationChannel } from '@/types/api/notification';

interface ChannelCardProps {
	onDelete: (id: string | number, name: string) => void;
	onEdit: () => void;
	channelData: NotificationChannel;
}

// ============ Constants ============
type ChannelType = 'feishu' | 'lark' | 'telegram';

const CHANNEL_ICONS: Record<ChannelType, StaticImageData> = {
	feishu,
	lark,
	telegram,
};

// ============ Component ============
const ChannelCard: React.FC<ChannelCardProps> = ({ channelData, onDelete, onEdit }) => {
	const t = useTranslations('Notify.channel');

	const { id, channel: type, name: channelName, created_at, webhook_url, bot_token } = channelData;
	const configValue = webhook_url || bot_token;
	const configLabel = webhook_url ? t('webhookUrl') : t('botToken');
	const channelIcon = CHANNEL_ICONS[type as ChannelType];

	const handleEditClick = useCallback(() => {
		onEdit();
	}, [onEdit]);

	const handleDeleteClick = useCallback(() => {
		onDelete(id, channelName);
	}, [id, channelName, onDelete]);

	return (
		<article
			className={cn(
				'bg-gray-100 rounded-xl border border-gray-200',
				'flex flex-col justify-between h-auto',
				'transition-shadow duration-200 hover:shadow-md'
			)}
		>
			{/* Header */}
			<div className='px-3 sm:px-4 py-2 flex justify-between items-center'>
				<time className='text-xs sm:text-sm text-gray-500 truncate'>
					{t('addedAt')}: {formatDateWithYear(created_at) || '-'}
				</time>
				{/* Operations Dropdown */}
				<OperationsDropdown
					onEdit={handleEditClick}
					onDelete={handleDeleteClick}
					itemName={channelName}
				/>
			</div>

			{/* Content */}
			<div className='rounded-xl border bg-white p-3 sm:p-4'>
				{/* Channel Name with Icon */}
				<div className='flex items-center gap-2 sm:gap-3 mb-3'>
					{channelIcon && (
						<Image
							src={channelIcon}
							alt={type}
							width={32}
							height={32}
							className='rounded-lg flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10'
						/>
					)}
					<h3 className='text-base sm:text-xl font-semibold text-gray-900 truncate'>
						{channelName || '-'}
					</h3>
				</div>

				{/* Config Info */}
				<div className='space-y-1'>
					<p className='text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide'>
						{configLabel}
					</p>
					<p className='text-xs sm:text-sm text-gray-700 truncate' title={configValue}>
						{configValue || '-'}
					</p>
				</div>
			</div>
		</article>
	);
};

export default ChannelCard;
