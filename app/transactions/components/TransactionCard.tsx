'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import TransactionDetailsCard from '@/components/ui/TransactionDetailsCard';
import { cn } from '@/utils/utils';

// ============ Types ============
type TransactionStatus = 'waiting' | 'ready' | 'executed' | 'expired';
interface TransactionCardProps {
    status: TransactionStatus;
    title: string;
    timelockAddress: string;
    value: string;
    valueUnit: string;
    targetAddress: string;
    transactionHash: string;
    chain: string;
    createdAt: string;
    eta: string;
    expiredAt: string;
    actionButtons?: React.ReactNode;
    chainId: string | number;
    functionSignature?: string;
    callDataHex?: string;
}

// ============ Constants ============

const STATUS_STYLES = {
    waiting: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
    },
    ready: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
    },
    executed: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
    },
    expired: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
    },
} as const;

// ============ Component ============
const TransactionCard: React.FC<TransactionCardProps> = ({
    status,
    title,
    timelockAddress,
    value,
    valueUnit,
    targetAddress,
    transactionHash,
    createdAt,
    eta,
    expiredAt,
    actionButtons,
    chainId,
    functionSignature,
    callDataHex,
}) => {
    const t = useTranslations('Transactions');

    // Status config with translations - memoized
    const statusConfig = useMemo(
        () => ({
            waiting: { label: t('waiting'), ...STATUS_STYLES.waiting },
            ready: { label: t('ready'), ...STATUS_STYLES.ready },
            executed: { label: t('executed'), ...STATUS_STYLES.executed },
            expired: { label: t('expired'), ...STATUS_STYLES.expired },
        }),
        [t]
    );

    const currentStatus = statusConfig[status];

    return (
        <article 
            className={cn(
                'bg-gray-50 rounded-2xl border border-gray-200',
                'p-3 sm:p-4 md:p-5',
                'flex flex-col lg:flex-row gap-4 lg:gap-6',
                'transition-shadow duration-200',
                'hover:shadow-md'
            )}
            aria-label={`Transaction: ${title}`}
        >
            {/* Left Section */}
            <div className="flex flex-col justify-between w-full lg:w-[340px] lg:min-w-[280px]">
                <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <div 
                            className={cn(
                                'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border',
                                currentStatus.border, 
                                currentStatus.bg
                            )}
                            role="status"
                            aria-label={`Status: ${currentStatus.label}`}
                        >
                            <span 
                                className={cn('w-1.5 h-1.5 rounded-full', currentStatus.dot)} 
                                aria-hidden="true"
                            />
                            <span className={cn('text-[10px] sm:text-xs font-medium', currentStatus.text)}>
                                {currentStatus.label}
                            </span>
                        </div>
                    </div>

                    {/* Title & Address */}
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
                            {title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wide break-all">
                            <span className="uppercase">{t('timelockAddress')}</span>: {timelockAddress}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                {actionButtons && (
                    <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3" role="group" aria-label="Transaction actions">
                        {actionButtons}
                    </div>
                )}
            </div>

            {/* Right Section - Details */}
            <div className="flex-1 min-w-0">
                <TransactionDetailsCard
                    value={value}
                    valueUnit={valueUnit}
                    targetAddress={targetAddress}
                    transactionHash={transactionHash}
                    chainId={chainId}
                    createdAt={createdAt}
                    eta={eta}
                    expiredAt={expiredAt}
                    functionSignature={functionSignature}
                    callDataHex={callDataHex}
                />
            </div>
        </article>
    );
};

export default TransactionCard;
