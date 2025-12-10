/**
 * Timelock List Hook
 * 
 * 管理 Timelock 合约列表的获取和状态
 * 处理 Compound 和 OpenZeppelin 两种标准的合约
 */

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useApi } from '../useApi';
import { useAuthStore } from '@/store/userStore';
import type { TimelockContractItem } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseTimelockListOptions {
	autoFetch?: boolean;
}

interface TimelockListResponse {
	compound_timelocks: TimelockContractItem[];
	openzeppelin_timelocks: TimelockContractItem[];
}

interface UseTimelockListReturn {
	// 数据
	timelocks: TimelockContractItem[];
	compoundTimelocks: TimelockContractItem[];
	openzeppelinTimelocks: TimelockContractItem[];
	isLoading: boolean;
	isEmpty: boolean;

	// 操作
	refresh: () => void;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * 转换 API 响应为统一的 Timelock 列表
 */
function transformTimelockResponse(data: TimelockListResponse): {
	compound: TimelockContractItem[];
	openzeppelin: TimelockContractItem[];
} {
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

	return { compound, openzeppelin };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTimelockList(
	options: UseTimelockListOptions = {}
): UseTimelockListReturn {
	const { autoFetch = true } = options;

	// Store
	const { allTimelocks, setAllTimelocks } = useAuthStore();

	// API
	const { request: fetchTimelockList, isLoading } = useApi();

	// ========== Fetch ==========
	const refresh = useCallback(() => {
		fetchTimelockList('/api/v1/timelock/list').then(response => {
			if (response?.success && response.data) {
				const { compound, openzeppelin } = transformTimelockResponse(response.data);
				const combined = [...compound, ...openzeppelin];
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				setAllTimelocks(combined as any);
			}
		});
	}, [fetchTimelockList, setAllTimelocks]);

	// 自动加载
	useEffect(() => {
		if (autoFetch) {
			refresh();
		}
	}, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

	// ========== Derived State ==========
	const typedTimelocks = allTimelocks as TimelockContractItem[];
	
	const compoundTimelocks = useMemo(
		() => typedTimelocks.filter(t => t.standard === 'compound'),
		[typedTimelocks]
	);

	const openzeppelinTimelocks = useMemo(
		() => typedTimelocks.filter(t => t.standard === 'openzeppelin'),
		[typedTimelocks]
	);

	const isEmpty = typedTimelocks.length === 0;

	return {
		// 数据
		timelocks: typedTimelocks,
		compoundTimelocks,
		openzeppelinTimelocks,
		isLoading,
		isEmpty,

		// 操作
		refresh,
	};
}
