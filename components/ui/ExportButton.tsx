'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
	onClick: () => void;
	label?: string;
	showIcon?: boolean;
	loading?: boolean;
	disabled?: boolean;
}

/**
 * Export button component with loading state
 */
const ExportButton: React.FC<ExportButtonProps> = ({
	onClick,
	label,
	showIcon = true,
	loading = false,
	disabled = false,
}) => {
	const t = useTranslations('Transactions');

	return (
		<Button
			variant='outline'
			onClick={onClick}
			loading={loading}
			disabled={disabled}
			aria-label={label || t('export')}
		>
			{showIcon && <Download className='h-4 w-4' aria-hidden='true' />}
			<span>{label || t('export')}</span>
		</Button>
	);
};

export default ExportButton;
