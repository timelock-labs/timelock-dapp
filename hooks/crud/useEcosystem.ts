/**
 * Ecosystem Data Hook
 * 
 * 管理生态系统页面的数据获取
 * 包含：赞助商和合作伙伴列表
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../useApi';
import type { Partner } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseEcosystemOptions {
	autoFetch?: boolean;
}

interface UseEcosystemReturn {
	// 数据
	sponsors: Partner[];
	partners: Partner[];
	isLoading: boolean;
	
	// 派生状态
	hasSponsors: boolean;
	hasPartners: boolean;
	isEmpty: boolean;
	
	// 操作
	refresh: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEcosystem(
	options: UseEcosystemOptions = {}
): UseEcosystemReturn {
	const { autoFetch = true } = options;

	// State
	const [sponsors, setSponsors] = useState<Partner[]>([]);
	const [partners, setPartners] = useState<Partner[]>([]);

	// API
	const { request: getSponsorsReq, isLoading } = useApi();

	// ========== Fetch ==========
	const fetchEcosystemData = useCallback(async () => {
		try {
			const response = await getSponsorsReq('/api/v1/sponsors/public');

			if (response?.success && response.data) {
				setSponsors(response.data.sponsors || []);
				setPartners(response.data.partners || []);
			}
		} catch (error) {
			console.error('Failed to fetch ecosystem data:', error);
		}
	}, [getSponsorsReq]);

	// 自动加载
	useEffect(() => {
		if (autoFetch) {
			fetchEcosystemData();
		}
	}, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

	// ========== Derived State ==========
	const hasSponsors = sponsors.length > 0;
	const hasPartners = partners.length > 0;
	const isEmpty = !hasSponsors && !hasPartners;

	return {
		// 数据
		sponsors,
		partners,
		isLoading,

		// 派生状态
		hasSponsors,
		hasPartners,
		isEmpty,

		// 操作
		refresh: fetchEcosystemData,
	};
}
