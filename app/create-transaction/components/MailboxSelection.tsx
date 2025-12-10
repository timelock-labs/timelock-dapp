import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { useTranslations } from 'next-intl';
import type { MailboxSelectionProps } from '@/types';
import { useApi } from '@/hooks/useApi';
import { Mail } from 'lucide-react';
import Link from 'next/link';

const MailboxSelection: React.FC<MailboxSelectionProps> = () => {
	const t = useTranslations('CreateTransaction');
	const { request: getEmailNotifications } = useApi();
	const [mailboxOptions, setMailboxOptions] = useState<Array<{ id: number; email: string; email_remark?: string }>>([]);

	useEffect(() => {
		const fetchEmails = async () => {
			try {
				const response = await getEmailNotifications('/api/v1/emails', { page: 1, page_size: 100 });
				if (response?.data?.emails) {
					setMailboxOptions(response.data.emails);
				} else {
					setMailboxOptions([]);
					console.warn('No email data received from API');
				}
			} catch (error) {
				console.error('Failed to fetch email notifications:', error);
			}
		};

		fetchEmails();
	}, [getEmailNotifications]);

	return (
		<section className='flex flex-col gap-4 w-full'>
			<SectionHeader title={t('mailbox.title')} description={t('mailbox.description')} />

			<div className='flex flex-wrap gap-2'>
				{mailboxOptions.length > 0 ? (
					mailboxOptions.map(option => (
						<div key={option.id} className='flex items-center border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors bg-gray-100'>
							<div className='text-sm cursor-pointer flex items-center gap-1.5'>
								<Mail className='w-4 h-4 text-gray-500' />
								<span className='leading-5'>{option.email_remark || option.email}</span>
							</div>
						</div>
					))
				) : (
					<Link href='/notify'>
						<div className='text-sm text-gray-900 cursor-pointer bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors'>
							{t('mailbox.noMailbox')}
						</div>
					</Link>
				)}
			</div>
		</section>
	);
};

export default MailboxSelection;
