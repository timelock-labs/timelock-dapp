import React, { useMemo } from 'react';
import AssetOverviewCard from './AssetOverviewCard';

export interface Asset {
	token_address: string;
	name: string;
	symbol: string;
	logo: string;
	thumbnail: string;
	decimals: number;
	balance: string;
	possible_spam: boolean;
	verified_contract: boolean;
	usd_price: number;
	usd_price_24hr_percent_change: number;
	usd_price_24hr_usd_change: number;
	usd_value_24hr_usd_change: number;
	usd_value: number;
	portfolio_percentage: number;
	balance_formatted: string;
	native_token: boolean;
	total_supply: number | null;
	total_supply_formatted: string | null;
	percentage_relative_to_total_supply: number | null;
	chain_id: number;
	id: string | number;
}

interface AssetListProps {
	assets: Asset[];
	isLoading?: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ assets, isLoading }) => {
	const totalValue = useMemo(() => {
		return assets.reduce((sum, asset) => sum + (asset.usd_value || 0), 0);
	}, [assets]);

	return (
		<AssetOverviewCard
			totalValue={totalValue}
			assets={assets}
			isLoading={isLoading}
			className='h-full'
		/>
	);
};

export default AssetList;
