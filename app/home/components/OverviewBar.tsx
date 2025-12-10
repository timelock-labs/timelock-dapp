'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import SectionCard from '@/components/layout/SectionCard';
import { cn } from '@/utils/utils';

interface OverviewCounts {
  waiting: number;
  ready: number;
  executed: number;
  cancelled: number;
  expired: number;
}

const OverviewBar: React.FC<{ counts: OverviewCounts; className?: string }> = ({
  counts,
  className,
}) => {
  const t = useTranslations('home_page');

  type HomeStatusKey =
    | 'waitingTransaction'
    | 'readyTransaction'
    | 'executedTransaction'
    | 'cancelledTransaction'
    | 'expiredTransaction';

  const items: { key: HomeStatusKey; value: number; barColor: string }[] = [
    { key: 'waitingTransaction', value: counts.waiting, barColor: 'bg-orange-400' },
    { key: 'readyTransaction', value: counts.ready, barColor: 'bg-emerald-500' },
    { key: 'executedTransaction', value: counts.executed, barColor: 'bg-blue-600' },
    { key: 'cancelledTransaction', value: counts.cancelled, barColor: 'bg-gray-300' },
    { key: 'expiredTransaction', value: counts.expired, barColor: 'bg-zinc-500' },
  ];

  return (
    <SectionCard
      variant='bordered'
      padding='none'
      className={cn('overflow-hidden rounded-2xl shadow-sm bg-gray-50/50', className)}
    >
      {/* Header */}
      <div className='flex items-center justify-between  px-6 py-4'>
        <div className='text-xs font-semibold tracking-wider text-gray-500 uppercase'>
          {t('overviewTitle')}
        </div>
        <Link
          href='/transactions'
          className='flex items-center text-xs font-semibold tracking-wide text-gray-400 uppercase transition-colors hover:text-gray-600'
        >
          {t('viewAllTransactions')} <span className='ml-1 text-sm'>›</span>
        </Link>
      </div>

      {/* Content */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 p-6 rounded-xl border-t bg-white border-gray-100  shadow-sm '>
        {items.map((item) => (
          <div key={item.key} className='flex flex-col'>
            <div className='flex items-center gap-2.5'>
              <span className={cn('h-3.5 w-0.5 rounded-full', item.barColor)} />
              <span className='text-xs font-medium text-gray-500 whitespace-nowrap'>
                {t(item.key)}
              </span>
            </div>
            <span className='mt-3 text-3xl font-medium text-gray-900'>{item.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default OverviewBar;