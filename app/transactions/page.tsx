import React from 'react';
import TransactionHistorySection from './components/TransactionHistorySection';
import TransactionHistoryTable from './components/TransactionHistoryTable';

const Transactions: React.FC = () => {
	return (
		<>
			<TransactionHistorySection />
			<TransactionHistoryTable />
			<section className="hidden" aria-hidden="true">
				<h1>Timelock Transaction History & On-chain Monitoring</h1>
				<p>
					This page shows queued and executed transactions related to smart contract timelocks and administrative
					operations. Monitoring time-delayed transactions helps DeFi teams and auditors understand how governance
					decisions and protocol upgrades are being applied on-chain.
				</p>
				<p>
					By tracking timelock execution, protocols can verify that upgrades, parameter changes and treasury movements
					follow the expected time-delay mechanism. This improves transparency, supports incident response workflows and
					contributes to overall DeFi security and risk control.
				</p>
			</section>
		</>
	)
};

export default Transactions;
