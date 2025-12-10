/**
 * Timelocks Page
 * 
 * 重构说明：
 * 1. 使用 useTimelockList hook 管理数据获取和状态
 * 2. 数据转换逻辑移至 hook 中
 * 3. 组件只负责 UI 渲染
 */

'use client';

import { useTimelockList } from '@/hooks/crud';
import AddTimelockContractSection from './components/AddTimelockContractSection';
import TimelockContractTable from './components/TimelockContractTable';
import TableSkeleton from '@/components/ui/TableSkeleton';
import type { TimelockContractItem as StoreTimelockItem } from '@/store/schema';

// ============================================================================
// Component
// ============================================================================

const TimelocksPage: React.FC = () => {
	const { timelocks, isLoading, isEmpty, refresh } = useTimelockList();

	// Loading 状态
	if (isLoading) {
		return (
			<div className='bg-white'>
				<div className='mx-auto'>
					<TableSkeleton rows={5} columns={7} showHeader={true} />
				</div>
			</div>
		);
	}

	// 空状态 vs 数据展示
	if (isEmpty) {
		return (
			<>
				<AddTimelockContractSection />
				<section className="hidden" aria-hidden="true">
					<h1>Timelock Contracts for DeFi Governance Security</h1>
					<p>
						This page lists smart contract timelock configurations used by protocols and DAOs to protect on-chain
						governance, protocol upgrades and treasury operations. Timelock contracts introduce a transparent time-delay
						mechanism so that critical actions are visible on-chain before they execute.
					</p>
					<p>
						By managing timelock contracts here, DeFi teams can coordinate governance security and protocol upgrade
						protection across multiple chains. This helps reduce upgrade risk, admin key abuse and unexpected parameter
						changes.
					</p>
				</section>
			</>
		);
	}

	return (
		<>
			<TimelockContractTable
				data={timelocks as unknown as StoreTimelockItem[]}
				onDataUpdate={refresh}
			/>
			<section className="hidden" aria-hidden="true">
				<h1>Timelock Contract Registry & DeFi Risk Control</h1>
				<p>
					This timelock registry helps teams track which contracts are protected by a smart contract timelock, how
					long the delay is and which governance or multi-sig controls them. Maintaining an accurate timelock table is a
					key part of DeFi security operations.
				</p>
				<p>
					By enforcing time-delayed execution on upgrades and sensitive actions, timelock contracts give users,
					integrators and security auditors more confidence in the protocol. It becomes easier to monitor upcoming
					changes and reduce exposure before high-risk transactions execute.
				</p>
			</section>
		</>
	);
};

export default TimelocksPage;
