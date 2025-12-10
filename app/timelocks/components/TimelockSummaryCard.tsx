'use client';
import React, { useMemo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BaseComponentProps } from '@/types';
import ChainLabel from '@/components/web3/ChainLabel';
import copyToClipboard from '@/utils/copy';
import { Copy, MoreVertical, Trash2, Check } from 'lucide-react';
import { formatAddress, cn } from '@/utils/utils';
import { ethers } from 'ethers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TimelockSummaryCardProps extends BaseComponentProps {
  title: string;
  timelockAddress: string;
  ownerAddress: string;
  chainId: number | string;
  minDelaySeconds?: number; // Delay in seconds
  gracePeriodSeconds?: number; // Grace period in seconds
  permissions?: string[]; // e.g., ['admin', 'creator']
  onDelete?: () => void;
}

// Time unit keys for translation
type TimeUnitKey = 'years' | 'year' | 'months' | 'month' | 'days' | 'day' | 'hours' | 'hour' | 'minutes' | 'minute' | 'seconds' | 'second';

const TimelockSummaryCard: React.FC<TimelockSummaryCardProps> = ({
  title,
  timelockAddress,
  ownerAddress,
  chainId,
  minDelaySeconds,
  gracePeriodSeconds,
  permissions = [],
  className,
  onDelete,
}) => {
  const t = useTranslations('TimelockSummaryCard');
  const tc = useTranslations('common');
  const [isCopied, setIsCopied] = useState(false);

  // Helper function to format seconds to readable time with i18n
  const formatDelayTime = useCallback((seconds: number): { value: string; unit: string } => {
    if (seconds === 0) return { value: '0', unit: t('seconds') };

    const units: { plural: TimeUnitKey; singular: TimeUnitKey; seconds: number }[] = [
      { plural: 'years', singular: 'year', seconds: 365 * 24 * 60 * 60 },
      { plural: 'months', singular: 'month', seconds: 30 * 24 * 60 * 60 },
      { plural: 'days', singular: 'day', seconds: 24 * 60 * 60 },
      { plural: 'hours', singular: 'hour', seconds: 60 * 60 },
      { plural: 'minutes', singular: 'minute', seconds: 60 },
      { plural: 'seconds', singular: 'second', seconds: 1 },
    ];

    for (const unit of units) {
      const count = Math.floor(seconds / unit.seconds);
      if (count >= 1) {
        return { value: count.toString(), unit: t(count === 1 ? unit.singular : unit.plural) };
      }
    }

    return { value: seconds.toString(), unit: t('seconds') };
  }, [t]);

  const hasAdmin = permissions.includes('admin');

  // Format min delay time - memoized
  const delayFormatted = useMemo(() => 
    minDelaySeconds ? formatDelayTime(minDelaySeconds) : null,
    [minDelaySeconds, formatDelayTime]
  );

	// Format grace period time - memoized
	const graceFormatted = useMemo(() =>
		gracePeriodSeconds ? formatDelayTime(gracePeriodSeconds) : null,
		[gracePeriodSeconds, formatDelayTime]
	);

	// Execution window tooltip range: [minDelay, minDelay + gracePeriod]
	const executionWindow = useMemo(() => {
		if (!minDelaySeconds || !gracePeriodSeconds) return null;
		const start = formatDelayTime(minDelaySeconds);
		const end = formatDelayTime(minDelaySeconds + gracePeriodSeconds);
		return { start, end };
	}, [minDelaySeconds, gracePeriodSeconds, formatDelayTime]);

  // Format owner address for header - memoized
  const formattedOwner = useMemo(() => 
    formatAddress(ownerAddress).toUpperCase(),
    [ownerAddress]
  );

  // Get checksummed timelock address - memoized
  const checksummedAddress = useMemo(() => 
    timelockAddress ? ethers.utils.getAddress(timelockAddress) : '',
    [timelockAddress]
  );

  // Address parts for display - memoized
  const { addressStart, addressMiddle, addressEnd } = useMemo(() => ({
    addressStart: checksummedAddress.slice(0, 7),
    addressMiddle: checksummedAddress.slice(7, -5),
    addressEnd: checksummedAddress.slice(-5),
  }), [checksummedAddress]);

  // Copy handler with visual feedback
  const handleCopy = useCallback(async () => {
    await copyToClipboard(checksummedAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [checksummedAddress]);

  return (
    <div className={`bg-gray-100 rounded-2xl shadow-sm overflow-hidden ${className || ''}`}>
      {/* Top gray header bar */}
      <div className='bg-gray-100 px-4 sm:px-6 py-2 sm:py-3'>
        <span className='text-[10px] sm:text-xs font-medium tracking-wide text-gray-500'>
         <span className='mr-1 uppercase'>{t('owner')}:</span> {ethers.utils.getAddress(ownerAddress)}
        </span>
      </div>

      {/* Main content */}
      <div className='p-4 sm:p-6 bg-white rounded-xl rounded-2xl shadow-sm'>
        {/* Title row with permission tags */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4'>
          <h2 className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>{title}</h2>
          <div className='flex items-center gap-2 sm:gap-3'>
            {hasAdmin && (
              <div className='flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border border-green-300 bg-green-50'>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='sm:w-[18px] sm:h-[18px]'>
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#22c55e" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="#22c55e" strokeWidth="2"/>
                  <path d="M7 18c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className='text-xs sm:text-sm font-medium text-green-600'>{t('admin')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timelock address section */}
        <div className='mb-4 sm:mb-6 overflow-hidden'>
          <div className='text-[10px] sm:text-xs font-medium tracking-wide text-gray-400 uppercase mb-1 sm:mb-2'>
            {t('timelock')}
          </div>
          <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
            <span className='text-base sm:text-xl font-bold text-gray-900 shrink-0'>{addressStart}</span>
            <span className='text-sm sm:text-lg text-gray-400 font-mono hidden sm:inline truncate min-w-0'>{addressMiddle}</span>
            <span className='text-base sm:text-xl font-bold text-gray-900 shrink-0'>{addressEnd}</span>
            <button
              type='button'
              onClick={handleCopy}
              className={cn(
                'p-1 sm:p-1.5 rounded transition-all duration-200 ml-1 shrink-0',
                'hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                isCopied ? 'text-green-500' : 'text-gray-400'
              )}
              aria-label={isCopied ? tc('copied') : 'Copy timelock address'}
            >
              {isCopied ? (
                <Check className='w-4 h-4 sm:w-5 sm:h-5' />
              ) : (
                <Copy className='w-4 h-4 sm:w-5 sm:h-5' />
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-200 my-3 sm:my-4' />

        {/* Bottom info row */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-4 sm:gap-8'>
            {/* Chain */}
            <div>
              <div className='text-[10px] sm:text-xs font-medium tracking-wide text-gray-400 uppercase mb-1'>
                {t('chain')}
              </div>
              <ChainLabel chainId={chainId} />
            </div>

            {/* Min Delay */}
            <div>
              <div className='text-[10px] sm:text-xs font-medium tracking-wide text-gray-400 uppercase mb-1'>
                {t('minDelay')}
              </div>
              <div className='flex items-baseline gap-1 sm:gap-2'>
                <span className='text-lg sm:text-xl font-bold text-gray-900'>
                  {delayFormatted?.value || '-'}
                </span>
                <span className='text-base sm:text-lg text-gray-500'>
                  {delayFormatted?.unit || ''}
                </span>
                {graceFormatted && (
                  <span className='ml-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap'>
                    +
                    {graceFormatted.value} {graceFormatted.unit}
                  </span>
                )}
                {executionWindow && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='ml-1 text-[10px] sm:text-xs text-gray-400 cursor-help border border-dashed border-gray-300 rounded px-1'>
                        i
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side='top' sideOffset={6} className='bg-black text-white rounded-md px-3 py-2 text-xs max-w-xs text-left'>
                      <span className='flex justify-center text-center'>
                        {t('executionWindowTooltip', {
                          startValue: executionWindow.start.value,
                          startUnit: executionWindow.start.unit,
                          endValue: executionWindow.end.value,
                          endUnit: executionWindow.end.unit,
                        })}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* More button with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='p-1.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors self-end sm:self-auto'
                aria-label='More options'
              >
                <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40 bg-white shadow-lg rounded-lg border border-gray-200'>
              <DropdownMenuItem
                variant='destructive'
                onClick={onDelete}
                className='flex items-center justify-between px-4 py-2.5 cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50'
              >
                <span className='font-medium'>{tc('delete')}</span>
                <Trash2 className='w-4 h-4' />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TimelockSummaryCard;