/**
 * Home Page Data Hook
 * 
 * 管理首页数据的获取和状态
 * 包含：Timelock 列表、视图状态管理
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveWalletConnectionStatus } from 'thirdweb/react';
import { useApi } from '../useApi';
import { useAuthStore } from '@/store/userStore';
import type { TimelockContractItem } from '@/types';

// ============================================================================
// Types
// ============================================================================

/** 首页视图状态 */
export type HomeViewState = 'loading' | 'create' | 'asset';

interface TimelockData {
	total: number;
	compound_timelocks: TimelockContractItem[];
	openzeppelin_timelocks: TimelockContractItem[];
}

interface UseHomeDataOptions {
	/** 视图切换延迟 (ms) */
	viewTransitionDelay?: number;
}

interface UseHomeDataReturn {
	// 连接状态
	isConnected: boolean;
	
	// 数据
	timelockData: TimelockData | null;
	compoundTimelocks: TimelockContractItem[];
	hasTimelocks: boolean;
	isLoading: boolean;
	
	// 视图状态
	currentView: HomeViewState;
	
	// 操作
	refresh: () => Promise<void>;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * 转换 API 响应为统一的 Timelock 数据
 */
function transformTimelockResponse(data: {
	compound_timelocks?: TimelockContractItem[];
	openzeppelin_timelocks?: TimelockContractItem[];
	total?: number;
}): TimelockData {
	const compound = (data.compound_timelocks || []).map(
		(timelock): TimelockContractItem => ({
			...timelock,
			standard: 'compound' as const,
		})
	);

	const openzeppelin = (data.openzeppelin_timelocks || []).map(
		(timelock): TimelockContractItem => ({
			...timelock,
			standard: 'openzeppelin' as const,
		})
	);

	return {
		total: data.total || compound.length + openzeppelin.length,
		compound_timelocks: compound,
		openzeppelin_timelocks: openzeppelin,
	};
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useHomeData(
	options: UseHomeDataOptions = {}
): UseHomeDataReturn {
	const { viewTransitionDelay = 200 } = options;

	// 连接状态
	const connectionStatus = useActiveWalletConnectionStatus();
	const isConnected = connectionStatus === 'connected';

	// Store
	const { setAllTimelocks } = useAuthStore();

	// State
	const [timelockData, setTimelockData] = useState<TimelockData | null>(null);
	const [currentView, setCurrentView] = useState<HomeViewState>('loading');

	// API
	const { request: getTimelockList, isLoading } = useApi();

	// ========== Fetch ==========
	const fetchTimelockData = useCallback(async () => {
		try {
			const response = await getTimelockList('/api/v1/timelock/list', {
				page: 1,
				page_size: 10,
			});

			if (response?.data) {
				const transformed = transformTimelockResponse(response.data);
				setTimelockData(transformed);

				// 同步到全局 store
				const combined = [
					...transformed.compound_timelocks,
					...transformed.openzeppelin_timelocks,
				];
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				setAllTimelocks(combined as any);
			}
		} catch (error) {
			console.error('Failed to fetch timelock data:', error);
		}
	}, [getTimelockList, setAllTimelocks]);

	// 连接后自动加载
	useEffect(() => {
		if (isConnected) {
			fetchTimelockData();
		}
	}, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

	// ========== Derived State ==========
	const hasTimelocks = useMemo(
		() => !!(timelockData && timelockData.total > 0),
		[timelockData]
	);

	const compoundTimelocks = useMemo(
		() => timelockData?.compound_timelocks || [],
		[timelockData]
	);

	// ========== View State Management ==========
	useEffect(() => {
		// 未连接时显示创建视图
		if (!isConnected) {
			setCurrentView('create');
			return;
		}

		// 加载中
		if (isLoading) {
			setCurrentView('loading');
			return;
		}

		// 延迟切换视图，让淡出动画完成
		const timer = setTimeout(() => {
			setCurrentView(hasTimelocks ? 'asset' : 'create');
		}, viewTransitionDelay);

		return () => clearTimeout(timer);
	}, [isConnected, isLoading, hasTimelocks, viewTransitionDelay]);

	return {
		// 连接状态
		isConnected,

		// 数据
		timelockData,
		compoundTimelocks,
		hasTimelocks,
		isLoading,

		// 视图状态
		currentView,

		// 操作
		refresh: fetchTimelockData,
	};
}
