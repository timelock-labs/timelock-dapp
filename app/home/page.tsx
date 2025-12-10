/**
 * Home Page
 * 
 * 重构说明：
 * 1. 使用 useHomeData hook 管理数据和视图状态
 * 2. 组件只负责 UI 渲染和懒加载
 * 3. 代码从 123 行减少到约 60 行
 */

'use client';

import { lazy, Suspense } from 'react';
import { useHomeData, type HomeViewState } from '@/hooks/crud';
import LoadingSkeleton from './components/LoadingSkeleton';

// 懒加载组件以减少初始 bundle 大小
const Asset = lazy(() => import('./components/Asset'));
const CreateProtocol = lazy(() => import('./components/CreateProtocol'));

// ============================================================================
// Component
// ============================================================================

export default function HomePage() {
	const { currentView, compoundTimelocks } = useHomeData();

	return (
		<div>
			<HomeView view={currentView} timelocks={compoundTimelocks} />
			{/* SEO-only hidden content about Timelock & DeFi security. This block is not visible in the UI. */}
			<section className="hidden" aria-hidden="true">
				<h1>Timelock: Smart Contract Timelock & DeFi Security Infrastructure</h1>
				<p>
					Timelock provides smart contract timelock infrastructure for DeFi protocols, DAOs and on-chain teams. By
					combining a transparent time-delay mechanism with governance security controls and protocol upgrade
					protection, Timelock makes critical operations such as contract upgrades, parameter changes and treasury
					movements observable and auditable before they are executed.
				</p>
				<p>
					With Timelock, sensitive actions are first queued into a smart contract timelock and can only be executed after
					a configurable delay window. This design gives users, integrators, security auditors and monitoring systems
					valuable time to review upcoming changes and react if something looks wrong, reducing upgrade risk and admin
					key abuse.
				</p>
				<h2>Why DeFi protocols need a time-delay mechanism</h2>
				<p>
					Without a time-delay mechanism, high-privilege roles can upgrade contracts, change critical parameters or move
					funds in a single transaction. Any misconfiguration, compromised private key or malicious governance proposal
					can instantly impact users and liquidity providers. A smart contract timelock enforces a delay between queuing
					and execution so that governance decisions, protocol upgrades and treasury movements are not applied
					immediately, but instead pass through an observable buffer period.
				</p>
				<p>
					This time-delay mechanism is now considered a best practice for DeFi security and protocol upgrade
					protection. It allows the community, security teams and automated monitoring to analyze queued transactions,
					validate the target contracts and parameters, and react before changes take effect.
				</p>
				<h2>Timelock, governance security and protocol upgrade protection</h2>
				<p>
					Timelock is designed to strengthen governance security. When a governance proposal passes, its actions are not
					applied directly, but are scheduled into the timelock contract. Only after the delay window has fully elapsed
					can those actions be executed on-chain. This makes it harder for a captured governance process to push
					through harmful changes without being noticed.
				</p>
				<p>
					For protocol upgrade protection, Timelock ensures that logic contract upgrades, fee changes or risk parameter
					updates follow the same pattern: queue first, delay, then execute. Teams can use Timelock to align their
					upgrade process with audit timelines and monitoring, giving all stakeholders more confidence in the safety of
					changes.
				</p>
				<h2>Multi-sig + Timelock: stronger DeFi security</h2>
				<p>
					Multi-sig wallets reduce single key risk but do not inherently provide time-based security. A group of
					multi-sig signers can still approve an upgrade or transfer that executes immediately. By combining multi-sig +
					timelock, teams get both access control and a time-delay mechanism. Multi-sig defines who can queue an action;
					Timelock defines when it can be executed.
				</p>
				<p>
					This combination is widely adopted by DeFi protocols for governance security, protocol upgrade protection and
					treasury management. It significantly raises the bar for potential attackers and makes rug-pull style events
					more visible and easier to respond to.
				</p>
				<h2>Key use cases for smart contract timelocks</h2>
				<ul>
					<li>Time-delayed governance execution for DAOs and DeFi protocols.</li>
					<li>Protected protocol upgrades for proxy-based smart contract systems.</li>
					<li>Delayed treasury operations and large asset reallocations.</li>
					<li>Risk-controlled parameter changes such as collateral factors or fee rates.</li>
					<li>Transparent scheduling of sensitive administrative actions.</li>
				</ul>
				<h2>FAQ: smart contract timelock & DeFi risk control</h2>
				<h3>What is a smart contract timelock?</h3>
				<p>
					A smart contract timelock is an on-chain time-delay mechanism that enforces a minimum delay between queuing
					and executing sensitive actions. It is commonly used in DeFi security to provide transparency and reaction time
					for protocol upgrades, governance decisions and treasury movements.
				</p>
				<h3>How does a timelock improve DeFi security?</h3>
				<p>
					Timelock makes critical changes observable before they execute. Users, integrators and auditors can see queued
					transactions and review their impact. If a malicious or erroneous action is detected, the community and security
					teams have a window to react, reduce exposure or trigger emergency procedures.
				</p>
				<h3>Why combine multi-sig with a timelock?</h3>
				<p>
					Multi-sig defines who must approve an action; timelock defines how long the system must wait before executing
					it. Combining both creates a stronger governance security model that mitigates admin key risk and reduces the
					likelihood of sudden, opaque changes to the protocol.
				</p>
				<h3>Who should use Timelock?</h3>
				<p>
					Timelock is designed for DeFi protocols, DAO treasuries, on-chain governance systems, smart contract
					developers and security audit teams that need a reliable way to enforce time-delayed execution of sensitive
					operations while keeping everything transparent on-chain.
				</p>
				<p>
					Relevant keywords: Timelock, smart contract timelock, blockchain timelock, DeFi security, time-delay
					mechanism, governance security, protocol upgrade protection, multi-sig + timelock, on-chain risk control,
					smart contract security.
				</p>
			</section>
		</div>
	);
}

// ============================================================================
// Sub Components
// ============================================================================

interface HomeViewProps {
	view: HomeViewState;
	timelocks: ReturnType<typeof useHomeData>['compoundTimelocks'];
}

/**
 * 根据视图状态渲染对应组件
 */
function HomeView({ view, timelocks }: HomeViewProps) {
	switch (view) {
		case 'loading':
			return <LoadingSkeleton />;

		case 'asset':
			return (
				<Suspense fallback={<LoadingSkeleton />}>
					<Asset timelocks={timelocks} />
				</Suspense>
			);

		case 'create':
		default:
			return (
				<Suspense fallback={<LoadingSkeleton />}>
					<CreateProtocol />
				</Suspense>
			);
	}
}
