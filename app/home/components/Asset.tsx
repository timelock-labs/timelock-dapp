'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PendingTransactions from './PendingTransactions';
import { useApi } from '@/hooks/useApi';
import useMoralis from '@/hooks/useMoralis';
import AssetList from './AssetList';
import { useQueries } from '@tanstack/react-query';
import { TimelockContractItem } from '@/types';
import { Asset as AssetType } from './AssetList';
import OverviewBar from './OverviewBar';


interface AssertProps {
	// Props interface for future extensibility
	className?: string;
	timelocks: TimelockContractItem[]; // Assuming timelocks is an array of objects
}

const Assert: React.FC<AssertProps> = ({ timelocks }) => {
	const { request: getFlowsCountReq } = useApi();
	const { getUserAssets } = useMoralis();

	const [flow_count, setFlowCount] = useState({
		waiting: 0,
		ready: 0,
		executed: 0,
		cancelled: 0,
		expired: 0,
	});

	useEffect(() => {
		const fetchFlowsCount = async () => {
			const { data } = await getFlowsCountReq('/api/v1/flows/list/count');
			setFlowCount(data.flow_count);
		};
		fetchFlowsCount();
	}, [getFlowsCountReq]);

	const assetQueries = useQueries({
		queries: (timelocks ?? []).map(timelock => ({
			queryKey: ['userAssets', timelock.chain_id, timelock.contract_address],
			queryFn: () => getUserAssets(timelock.chain_id.toString(), timelock.contract_address),
			staleTime: 5 * 60 * 1000, // 5 minutes
			enabled: !!timelock.chain_id && !!timelock.contract_address,
		})),
	});

	const userAssets = useMemo(() => {
		const assetsList: AssetType[] = [];
		assetQueries.forEach((query, index) => {
			if (query.isSuccess && query.data) {
				const timelock = timelocks[index];
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const assetsWithTimelock = query.data.map((asset: any) => ({ ...asset, ...timelock })) as AssetType[];
				assetsList.push(...assetsWithTimelock);
			}
		});
		return assetsList;
	}, [assetQueries, timelocks]);

	return (
		<div className='flex flex-col space-y-6'>
			<OverviewBar counts={flow_count} className='h-full' />
			<div className='flex flex-col md:flex-row gap-4'>
				<div className='w-full md:w-[30%] h-[420px] md:h-[600px]'>
					<AssetList assets={userAssets} />
				</div>
				<div className='w-full md:w-[70%] h-[420px] md:h-[600px]'>
					<PendingTransactions />
				</div>
			</div>
		</div>
	);
};

export default Assert;