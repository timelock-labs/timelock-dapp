import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Timelock Login | Secure Web3 Timelock & Governance Access',
	description:
		'Log in to Timelock, a blockchain timelock and security platform for managing smart contract timelocks, scheduled transactions, and multi-chain governance safely.',
	alternates: {
		canonical: 'https://timelock.tech/login',
	},
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
