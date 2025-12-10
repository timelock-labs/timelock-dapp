import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import { Web3Provider } from '@/components/providers/web3-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/app/globals.css';
import { Geist, Geist_Mono } from 'next/font/google'; // Import fonts here
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';
import PageLayout from '@/components/layout/PageLayout';
import I18nInitializer from '@/components/providers/I18nInitializer';


const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap', // 优化字体加载性能
	preload: true,
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap', // 优化字体加载性能
	preload: false, // 非主要字体延迟加载
});

type Props = {
	children: ReactNode;
};

export default async function RootLayout(props: Props) {
	const { children } = props;
	// use defaultLocale
	const cookieStore = await cookies();
	const locale = cookieStore.get('NEXT_LOCALE')?.value || routing.defaultLocale;
	const messages = await getMessages({ locale });
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<title>Timelock</title>
				<link rel="canonical" href="https://timelock.tech" />
				<meta
					name="description"
					content="Timelock is a blockchain security platform focusing on timelock contracts, multi-chain asset protection, and secure transaction scheduling for Web3 protocols and teams."
				/>
				<meta
					name="keywords"
					content="Timelock, blockchain security, smart contract security, timelock contract, Web3 security, DeFi security, on-chain governance, transaction scheduling"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index,follow" />
				{/* Open Graph for social sharing */}
				<meta property="og:title" content="Timelock | Blockchain Timelock & Security Platform" />
				<meta
					property="og:description"
					content="Discover Timelock, a professional blockchain security and timelock management platform for protocols, DAOs, and teams to protect on-chain assets."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Timelock" />
				<meta property="og:url" content="https://timelock.tech" />
				{/* TODO: replace with real social share image URL after design is ready */}
				<meta property="og:image" content="https://timelock.tech/og-image.png" />
				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Timelock | Blockchain Timelock & Security Platform" />
				<meta
					name="twitter:description"
					content="A secure and transparent timelock and transaction management platform for Web3 projects and DAOs."
				/>
				<meta name="twitter:image" content="https://timelock.tech/og-image.png" />
				{/* Preload key font to improve performance */}
				<link
					rel="preload"
					href="/righteous-regular.ttf"
					as="font"
					type="font/ttf"
					crossOrigin="anonymous"
				/>
				{/* Basic JSON-LD structured data for the Timelock website */}
				<script
					type="application/ld+json"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'WebSite',
							name: 'Timelock',
							description:
								'Blockchain timelock and security platform for managing smart contract timelocks, transactions and multi-chain assets.',
							url: 'https://timelock.tech',
							inLanguage: locale,
						}),
					}}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute='class' defaultTheme='lightTheme' enableSystem>
					<Web3Provider>
						<NextIntlClientProvider locale={locale} messages={messages}>
							<I18nInitializer />
							<PageLayout>
								{children}
							</PageLayout>
						</NextIntlClientProvider>
					</Web3Provider>
				</ThemeProvider>
				<Toaster position='top-center' />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
