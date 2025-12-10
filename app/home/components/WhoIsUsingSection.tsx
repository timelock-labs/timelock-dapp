"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import FeatureCard from '@/components/ui/FeatureCard';
import { cn } from '@/utils/utils';
import { ethAddress, etherUnits } from 'viem';
import { ethers } from 'ethers';

interface WhoUsingItem {
  address: string;
  icon: string;
  name: string;
  description: string;
  website: string;
  chain_id: number;
  chain_name: string;
}

const PAGE_SIZE = 30;

const WhoIsUsingSection: React.FC = () => {
  const t = useTranslations('home_page');
  const tc = useTranslations('common');
  const [items, setItems] = useState<WhoUsingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/home-whos-using');
        if (!res.ok) {
          setItems([]);
          return;
        }
        const json = await res.json();
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (error) {
        console.error('Failed to fetch who-is-using data:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalItems = items.length;
  const totalPages = useMemo(
    () => (totalItems === 0 ? 1 : Math.ceil(totalItems / PAGE_SIZE)),
    [totalItems]
  );

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return items.slice(start, end);
  }, [items, currentPage]);

  const paginationRange = useMemo(() => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [totalPages, currentPage]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getExplorerUrl = useCallback((item: WhoUsingItem): string | null => {
    // 目前示例：Ethereum mainnet 使用 Etherscan
    if (item.chain_id === 1) {
      return `https://etherscan.io/address/${item.address}`;
    }
    return null;
  }, []);

  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {t('whos_using.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagedItems.map(item => {
          const explorerUrl = getExplorerUrl(item);
          return (
            <FeatureCard
              key={item.address}
              title={item.name}
              description={item.description}
              icon={
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain rounded-full"
                />
              }
              link={item.website}
            >
              {explorerUrl && (
                <button
                  type="button"
                  className="mt-2 text-xs text-gray-600 hover:underline break-all text-left inline-flex items-center gap-1"
                  onClick={e => {
                    e.stopPropagation();
                    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 border border-gray-200 text-[10px] text-gray-500">
                    C
                  </span>
                  {ethers.utils.getAddress(item.address)}
                </button>
              )}
            </FeatureCard>
          );
        })}
      </div>

      {totalItems > PAGE_SIZE && (
        <nav
          aria-label="Who is using pagination"
          className='flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 py-3 sm:py-4 select-none'
        >
          <span className='text-xs sm:text-sm text-gray-500 order-2 sm:order-1'>
            {tc('showing')}{' '}
            {(currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, totalItems)}{' '}
            {tc('of')} {totalItems}
          </span>

          <div className='flex items-center gap-1 order-1 sm:order-2'>
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label={tc('previous')}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'border border-gray-200 transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-100 bg-white cursor-pointer active:scale-95'
              )}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden="true">
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            {paginationRange.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className='w-8 text-center text-gray-400'
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }
              const pageNum = Number(page);
              const isCurrentPage = currentPage === pageNum;
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                    isCurrentPage
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer active:scale-95'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label={tc('next')}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'border border-gray-200 transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-100 bg-white cursor-pointer active:scale-95'
              )}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden="true">
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default WhoIsUsingSection;
