'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/utils';
import { Asset } from './AssetList';
import AnimatedAssetValue from './AnimatedAssetValue';
import { useAuthStore } from '@/store/userStore';
import EmptyState from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

interface AssetOverviewCardProps {
  totalValue: number;
  assets: Asset[];
  className?: string;
  isLoading?: boolean;
}

const AssetOverviewCard: React.FC<AssetOverviewCardProps> = ({
  totalValue,
  assets,
  className,
  isLoading = false,
}) => {
  const t = useTranslations('assetList');
  const chains = useAuthStore((state) => state.chains);

  const getChainLogo = (chainId: number) => {
    const chain = chains?.find((c) => c.chain_id.toString() === chainId.toString());
    return chain?.logo_url;
  };

  const formatBalance = (v: string) => {
    const n = Number((v ?? '0').toString().replace(/,/g, ''));
    return Number.isFinite(n)
      ? n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
      : '0';
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 pt-4',
        className
      )}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-gray-500 font-medium text-sm">{t('totalAssetValue')}</h2>
        {isLoading ? (
          <div className="h-10 w-48 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-4xl font-bold text-gray-900 tracking-tight">
            <AnimatedAssetValue value={totalValue} prefix="$" />
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 w-full mb-6" />

      {/* Assets List */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-1 h-full overflow-y-auto">
        {assets.map((asset) => {
          const chainLogo = getChainLogo(asset.chain_id);

          return (
            <div
              key={`${asset.chain_id}-${String(asset.id ?? asset.token_address ?? asset.symbol)}`}
              className="flex items-center justify-between group"
            >
              {/* Left: Icon & Token Info */}
              <div className="flex items-center gap-4">
                {/* Icons Container */}
                <div className="relative w-11 h-11 shrink-0">
                  {asset.logo ? (
                    <Image
                      src={asset.logo}
                      alt={asset.symbol}
                      fill
                      className="rounded-full object-cover border border-gray-50"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs ring-1 ring-gray-100">
                      {asset.symbol.slice(0, 2)}
                    </div>
                  )}

                  {/* Chain Badge */}
                  {chainLogo && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full p-[1.5px] ring-1 ring-white shadow-sm">
                      <Image
                        src={chainLogo}
                        alt="Chain"
                        width={16}
                        height={16}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 leading-none mb-1.5">
                    {asset.symbol}
                  </span>
                  <span className="text-sm font-medium text-gray-500 leading-none">
                    ${asset.usd_price ? asset.usd_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Right: Balance & Value */}
              <div className="flex flex-col items-end">
                <span className="text-base font-bold text-gray-900 leading-none mb-1.5">
                  {formatBalance(asset.balance_formatted)}
                </span>
                <span className="text-sm font-medium text-gray-500 leading-none">
                  <AnimatedAssetValue value={asset.usd_value} prefix="$" />
                </span>
              </div>
            </div>
          );
        })}

        {assets.length === 0 && !isLoading && (
          <EmptyState
            description={t('noAssetsDescription')}
            size='lg'
            className='h-full'
            icon={<Search />}
          />
        )}
      </div>
    </div>
  );
};

export default AssetOverviewCard;
