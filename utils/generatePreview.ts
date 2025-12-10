const generatePreview = ({
	address,
	timelockAddress,
	value,
	timelockMethod,
	timelockCalldata,
}: {
	allTimelocks?: { id: string | number; chain_name?: string }[];
	timelockType?: string;
	functionValue?: string;
	argumentValues?: string[];
	selectedMailbox?: string[];
	timeValue?: number | null | undefined;
	targetCalldata?: string;
	abiValue?: string;
	address?: string;
	timelockAddress?: string;
	timelockMethod?: string;
	target?: string;
	value?: string | number;
	description?: string;
	timelockCalldata?: string;
}) => {
	// 只有 executeTransaction 需要发送真正的 ETH
	// queueTransaction 和 cancelTransaction 的 value 只是函数参数
	const isExecuteTransaction = timelockMethod?.startsWith('executeTransaction');
	const transactionValue = isExecuteTransaction ? (value || '0') : '0';

	return [
		`from:     ${address || 'Not connected'}`,
		`to:       ${timelockAddress || 'Not selected'}`,
		`value:    ${transactionValue}`,
		`calldata: ${timelockCalldata || 'Not generated'}`,
	].join('\n');
};

export default generatePreview;
