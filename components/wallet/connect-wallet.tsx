'use client';

import { ConnectButton } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { memo, useEffect } from 'react';
import { useAuthStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/utils';
import type { BaseComponentProps, VoidCallback } from '@/types';
import { 
	ethereum,
	sepolia,
	polygon,
	coreMainnet,
	scroll,
	linea,
	bsc, 
	optimism, 
	base, 
	arbitrum, 
} from 'thirdweb/chains';
import { 
	hashKey, 
	exSat, 
	merlin, 
	zkLink, 
	aiLayer, 
	bsquare, 
	goat, 
	hemi, 
	plume, 
	mode,
	bitLayer 
} from '@/utils/chainUtils';
import { useActiveWalletConnectionStatus } from 'thirdweb/react';
import { useWeb3React } from '@/hooks/useWeb3React';
import { useTranslations } from 'next-intl';

const wallets = [
	createWallet('io.metamask'), 
	createWallet('com.coinbase.wallet'), 
	createWallet('com.okex.wallet'), 
	createWallet('global.safe'),
	createWallet('com.safepal'),
	createWallet("walletConnect"),
];

const supportedChains = [
	ethereum, 
	sepolia, 
	polygon,
	coreMainnet,
	mode,
	bsc, 
	scroll,
	linea,
	optimism, 
	base, 
	arbitrum, 
	hashKey,
	exSat,
	merlin,
	zkLink,
	aiLayer,
	bsquare,
	goat,
	hemi,
	plume,
	bitLayer,
];
interface ConnectWalletProps extends BaseComponentProps {
	icon?: boolean;
	fullWidth?: boolean;
	headerStyle?: boolean;
	onConnect?: VoidCallback;
	onDisconnect?: VoidCallback;
}

// 样式常量，便于维护和自定义
const WALLET_STYLES = {
	button: {
		base: {
			backgroundColor: '#000000',
			color: '#ffffff',
			border: 'none',
			borderRadius: '0.7rem',
			fontWeight: '500',
			transition: 'background-color 0.2s ease',
			cursor: 'pointer',
			width: '100%',
		},
		hover: {
			backgroundColor: '#374151',
		},
		fullWidth: {
			backgroundColor: '#F5F5F5',
			color: '#000000',
			height: '48px',
			width: '100%',
		},
		header: {
			height: '34px',
			width: '115px',
		},
	},
	connected: {
		hideFirstChild: { display: 'none' },
		hideLastSpan: { display: 'none' },
		centerText: { textAlign: 'center' as const },
	},
} as const;

/**
 * Connect wallet component with thirdweb integration
 *
 * @param props - ConnectWallet component props
 * @returns JSX.Element
 */
export const ConnectWallet = memo(function ConnectWallet({ fullWidth, headerStyle, onConnect, onDisconnect, className }: ConnectWalletProps) {
	const logout = useAuthStore(state => state.logout);
	const router = useRouter();
	const t = useTranslations('walletLogin');

	const wrapperClass = cn('connect-wallet-container', fullWidth ? 'w-full' : 'w-auto', className);
	const { client } = useWeb3React();

	const connectionStatus = useActiveWalletConnectionStatus();

	useEffect(() => {
		if (connectionStatus === 'disconnected') {
			router.replace('/login');
		}
	}, [connectionStatus, router]);

	return (
		<div className={wrapperClass}>
			<ConnectButton
				client={client}
				chains={supportedChains}
				connectButton={{
					label: t('connectWallet'),
				}}
				connectModal={{
					size: 'compact',
					...(headerStyle && { title: t('connectWallet') }),
				}}
				wallets={wallets}
				theme='dark'
				onConnect={() => {
					onConnect?.();
				}}
				onDisconnect={() => {
					logout();
					router.replace('/login');
					onDisconnect?.();
				}}
			/>
		</div>
	);
});
