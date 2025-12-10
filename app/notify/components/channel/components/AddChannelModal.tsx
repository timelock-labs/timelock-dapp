'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import TextInput from '@/components/ui/TextInput';
import { useApi } from '@/hooks/useApi';

import FeishuIcon from '../images/feishu.png';
import LarkIcon from '../images/lark.png';
import TelegramIcon from '../images/telegram.png';

// ============ Types ============
import type { NotificationChannel } from '@/types/api/notification';

export interface ChannelItem {
	type: string;
	name: string;
	icon: string;
	configLabel: string;
}

interface AddChannelModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	editCurrentChannel?: NotificationChannel | null;
}

// ============ Constants ============
const CHANNEL_LIST: ChannelItem[] = [
	{
		type: 'feishu',
		name: 'Feishu',
		icon: FeishuIcon.src,
		configLabel: 'https://open.larksuite.com/open-apis/bot/v2/hook/xxxx-xxxx-xxxx-xxxx',
	},
	{
		type: 'lark',
		name: 'Lark',
		icon: LarkIcon.src,
		configLabel: 'https://open.larksuite.com/open-apis/bot/v2/hook/xxxx-xxxx-xxxx-xxxx',
	},
	{
		type: 'telegram',
		name: 'Telegram',
		icon: TelegramIcon.src,
		configLabel: 'xxxxxx:xxxxxxxxxxxxxxxxxxxxxxx',
	},
];

const DEFAULT_CHANNEL: ChannelItem = CHANNEL_LIST[0]!;

const INITIAL_FORM_STATE = {
	channelName: '',
	webhookUrl: '',
	secret: '',
	botToken: '',
	chatId: '',
};

// ============ Component ============
const AddChannelModal: React.FC<AddChannelModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	editCurrentChannel,
}) => {
	const t = useTranslations('Notify.addChannelModal');
	const tc = useTranslations('common');

	// Form state
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [currentChannel, setCurrentChannel] = useState<ChannelItem>(DEFAULT_CHANNEL);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// API
	const { request: saveChannel } = useApi();

	// Derived state
	const isEditMode = useMemo(
		() => !!(editCurrentChannel?.id && editCurrentChannel?.channel),
		[editCurrentChannel]
	);

	const isTelegram = currentChannel.type === 'telegram';

	// Reset form
	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_STATE);
		setCurrentChannel(DEFAULT_CHANNEL);
	}, []);

	// Update form field
	const updateField = useCallback((field: keyof typeof INITIAL_FORM_STATE, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	// Initialize form when editing
	useEffect(() => {
		if (!isOpen) return;

		if (isEditMode && editCurrentChannel) {
			const channel = CHANNEL_LIST.find(item => item.type === editCurrentChannel.channel);
			if (channel) {
				setCurrentChannel(channel);
				setFormData({
					channelName: editCurrentChannel.name || '',
					webhookUrl: editCurrentChannel.webhook_url || '',
					secret: editCurrentChannel.secret || '',
					botToken: editCurrentChannel.bot_token || '',
					chatId: editCurrentChannel.chat_id || '',
				});
			}
		} else {
			resetForm();
		}
	}, [isOpen, isEditMode, editCurrentChannel, resetForm]);

	// Handle dialog open change
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !isSubmitting) {
				resetForm();
				onClose();
			}
		},
		[isSubmitting, resetForm, onClose]
	);

	// Handle close button click
	const handleCloseClick = useCallback(() => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	}, [isSubmitting, resetForm, onClose]);

	// Validate form
	const validateForm = useCallback((): boolean => {
		if (!formData.channelName.trim()) {
			toast.error(t('channelNameRequired'));
			return false;
		}

		if (isTelegram) {
			if (!formData.botToken.trim() || !formData.chatId.trim()) {
				toast.error(t('configRequired'));
				return false;
			}
		} else {
			if (!formData.webhookUrl.trim()) {
				toast.error(t('configRequired'));
				return false;
			}
		}

		return true;
	}, [formData, isTelegram, t]);

	// Handle save
	const handleSave = useCallback(async () => {
		if (!validateForm() || isSubmitting) return;

		setIsSubmitting(true);
		toast.info(isEditMode ? t('updatingChannel') : t('addingChannel'));

		try {
			const payload = isTelegram
				? {
						channel: currentChannel.type,
						bot_token: formData.botToken.trim(),
						chat_id: formData.chatId.trim(),
						name: formData.channelName.trim(),
				  }
				: {
						channel: currentChannel.type,
						webhook_url: formData.webhookUrl.trim(),
						secret: formData.secret.trim(),
						name: formData.channelName.trim(),
				  };

			const apiEndpoint = isEditMode
				? '/api/v1/notifications/update'
				: '/api/v1/notifications/create';

			const response = await saveChannel(apiEndpoint, payload);

			// Check if API returned success: false
			if (!response?.success) {
				const errorMessage = response?.error?.message || tc('unknownError');
				toast.error(t('saveChannelError', { message: errorMessage }));
				return;
			}

			toast.success(isEditMode ? t('channelUpdatedSuccessfully') : t('channelAddedSuccessfully'));
			onSuccess();
			resetForm();
			onClose();
		} catch (error) {
			toast.error(
				t('saveChannelError', {
					message: error instanceof Error ? error.message : tc('unknownError'),
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		validateForm,
		isSubmitting,
		isTelegram,
		currentChannel.type,
		formData,
		isEditMode,
		saveChannel,
		t,
		tc,
		onSuccess,
		resetForm,
		onClose,
	]);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='w-[558px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{isEditMode ? t('editTitle') : t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Channel Type & Name */}
					<div className='flex gap-6'>
						<div className='flex flex-col gap-1'>
							<span className='text-sm font-medium'>{t('method')}</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild disabled={isEditMode}>
									<button
										type='button'
										disabled={isEditMode}
										className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer h-8 gap-1.5 px-3 border bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 w-42'
									>
										<div className='flex gap-2 items-center'>
											{currentChannel.icon && (
												<Image
													src={currentChannel.icon}
													alt={currentChannel.name}
													width={20}
													height={20}
													className='rounded-full'
												/>
											)}
											<span>{currentChannel.name}</span>
										</div>
										<ChevronDown className='ml-2 h-3 w-3' />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-42 bg-white border border-gray-200 p-2 rounded-lg'>
									{CHANNEL_LIST.map(channel => (
										<DropdownMenuItem
											key={channel.type}
											onClick={() => setCurrentChannel(channel)}
											className={`flex gap-2 items-center cursor-pointer hover:bg-gray-50 p-2 rounded ${
												currentChannel.type === channel.type ? 'bg-gray-100' : ''
											}`}
										>
											<Image
												src={channel.icon}
												alt={channel.name}
												width={20}
												height={20}
												className='rounded-full'
											/>
											<span className='text-sm font-medium'>{channel.name}</span>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className='flex-1'>
							<TextInput
								label={t('channelName')}
								value={formData.channelName}
								onChange={(value: string) => updateField('channelName', value)}
								disabled={isEditMode || isSubmitting}
							/>
						</div>
					</div>

					{/* Channel Config */}
					{isTelegram ? (
						<>
							<TextInput
								label='Bot Token'
								value={formData.botToken}
								onChange={(value: string) => updateField('botToken', value)}
								placeholder={currentChannel.configLabel}
								disabled={isSubmitting}
								validationType='botToken'
							/>
							<TextInput
								label='Chat ID'
								value={formData.chatId}
								onChange={(value: string) => updateField('chatId', value)}
								disabled={isSubmitting}
								validationType='chatId'
							/>
						</>
					) : (
						<>
							<TextInput
								label='Webhook URL'
								value={formData.webhookUrl}
								onChange={(value: string) => updateField('webhookUrl', value)}
								placeholder={currentChannel.configLabel}
								disabled={isSubmitting}
								validationType='webhookUrl'
							/>
							<TextInput
								label={`Secret ${t('optional')}`}
								value={formData.secret}
								onChange={(value: string) => updateField('secret', value)}
								placeholder='*****'
								className='bg-gray-50'
								disabled={isSubmitting}
							/>
						</>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleCloseClick} disabled={isSubmitting}>
						{tc('cancel')}
					</Button>
					<Button
						onClick={handleSave}
						loading={isSubmitting}
						loadingText={tc('loading')}
					>
						{tc('save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddChannelModal;
