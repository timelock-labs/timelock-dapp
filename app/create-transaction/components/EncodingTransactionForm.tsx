import React, { useMemo, useState, useEffect, useCallback } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import SelectInput from '@/components/ui/SelectInput';
import TextInput from '@/components/ui/TextInput';
import TargetABISection from './TargetABISection';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/userStore';
import { useApi } from '@/hooks/useApi';
import { useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import TimelockCompundABI from '@/components/abi/TimelockCompound.json';
import type { EncodingTransactionFormProps } from '@/types';
import { getChainObject } from '@/utils/chainUtils';
import TextAreaInput from '@/components/ui/TextAreaInput';
import { ethers } from 'ethers';
import TimelockSelector from '@/components/web3/TimelockSelector';

/**
 * Encoding transaction form component for creating timelock transactions
 *
 * @param props - EncodingTransactionForm component props
 * @returns JSX.Element
 */
const EncodingTransactionForm: React.FC<EncodingTransactionFormProps> = ({
	targetCalldata,
	timelockType,
	onTimelockTypeChange,
	timelockMethod,
	onTimelockMethodChange,
	target,
	onTargetChange,
	value,
	onValueChange,
	abiValue,
	onAbiChange,
	functionValue,
	onFunctionChange,
	timeValue,
	onTimeChange,
	argumentValues,
	onArgumentChange,
	onTimelockAddressChange,
	onTimelockDetailsChange,
}) => {
	const t = useTranslations('CreateTransaction');
	const { allTimelocks } = useAuthStore();
	const { data: timelockDetailResponse, request: fetchTimelockDetail } = useApi();
	const [, setIsLoadingDetails] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{ target?: string; value?: string }>({});
	const [currentTimelockDetails, setCurrentTimelockDetails] = useState<Record<string, unknown> | null>(null);

	const { id: chainId } = useActiveWalletChain() || {};
	const switchChain = useSwitchActiveWalletChain();

	const validateTarget = (target: string) => {
		if (!/^0x[a-fA-F0-9]{40}$/.test(target)) {
			return 'Invalid Ethereum address';
		}
		return undefined;
	};

	const validateValue = (value: string) => {
		try {
			BigInt(value);
			return undefined;
		} catch {
			return 'Invalid bigint value';
		}
	};

	const handleTargetChange = (newValue: string) => {
		onTargetChange(newValue);
		const error = validateTarget(newValue);
		setValidationErrors(prev => ({ ...prev, target: error }));
	};

	const handleValueChange = (newValue: string) => {
		onValueChange(newValue);
		const error = validateValue(newValue);
		setValidationErrors(prev => ({ ...prev, value: error }));
	};

	const timelockOptions = useMemo(() => {
		if (!Array.isArray(allTimelocks)) {
			return [];
		}
		return allTimelocks.map(timelock => ({
			value: String(timelock.id),
			label: `${timelock.remark || 'Timelock'}(${ethers.utils.getAddress(timelock.contract_address)})`,
			address: timelock.contract_address ?? '',
		}));
	}, [allTimelocks]);

	const handleTimelockChange = useCallback(
		async (value: string) => {
			onTimelockTypeChange(value);
			const selectedTimelock = timelockOptions.find(option => option.value === value);
			if (selectedTimelock) {
				onTimelockAddressChange(selectedTimelock.address);

				const fullTimelock = allTimelocks.find(tl => tl.id.toString() === value);
				if (fullTimelock) {
					// First, switch the chain
					if (fullTimelock.chain_id !== chainId) {
						const chainObject = getChainObject(fullTimelock.chain_id);
						if (chainObject) {
							await switchChain(chainObject);
						}
					}

					// Then, fetch the details
					setIsLoadingDetails(true);
					try {
						await fetchTimelockDetail('/api/v1/timelock/detail', {
							chain_id: fullTimelock.chain_id,
							contract_address: fullTimelock.contract_address,
							standard: 'compound',
						});
					} catch (error) {
						console.error('Failed to fetch timelock details:', error);
					} finally {
						setIsLoadingDetails(false);
					}
				}
			}
		},
		[allTimelocks, fetchTimelockDetail, onTimelockAddressChange, onTimelockTypeChange, timelockOptions, chainId, switchChain]
	);

	useEffect(() => {
		if (timelockDetailResponse && timelockDetailResponse.success) {
			setCurrentTimelockDetails(timelockDetailResponse.data.compound_timelocks);
			if (onTimelockDetailsChange) {
				onTimelockDetailsChange(timelockDetailResponse.data.compound_timelocks);
			}
		}
	}, [timelockDetailResponse, onTimelockDetailsChange]);

	const handleTimelockMethodChange = useCallback(() => {
		// 修复 currentTimelockDetails 可能为 null 的问题
		if (currentTimelockDetails && currentTimelockDetails.chain_id && Number(currentTimelockDetails.chain_id) !== chainId) {
			const chainObject = getChainObject(Number(currentTimelockDetails.chain_id));
			switchChain(chainObject);
		}
	}, [chainId, currentTimelockDetails, switchChain]);

	useEffect(() => {
		if (currentTimelockDetails?.chain_id) handleTimelockMethodChange();
	}, [currentTimelockDetails, handleTimelockMethodChange]);

	const timelockMethodOptions = useMemo(() => {
		if (!timelockType || !allTimelocks || allTimelocks.length === 0) {
			return [];
		}

		const selectedTimelock = allTimelocks.find(tl => tl.id.toString() === timelockType);

		if (!selectedTimelock) {
			return [];
		}

		// 只保留指定的三个函数
		const allowedFunctions = ['cancelTransaction', 'executeTransaction', 'queueTransaction'];
		const functions = TimelockCompundABI.filter(
			item => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure' && item.name && allowedFunctions.includes(item.name)
		);

		return functions.map(fn => {
			const inputTypes = (fn.inputs || []).map(input => input.type).join(',');
			const signature = `${fn.name}(${inputTypes})`;
			return {
				value: signature,
				label: signature,
			};
		});
	}, [timelockType, allTimelocks]);

	useEffect(() => {
		const currentChainId = currentTimelockDetails?.chain_id;
		if (currentChainId && parseInt(currentChainId as string) !== chainId) {
			handleTimelockChange('');
			handleTimelockMethodChange();
		}
	}, [currentTimelockDetails, chainId, handleTimelockChange, handleTimelockMethodChange]);

	const timeZone = () => {
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const timeOffset = -new Date().getTimezoneOffset() / 60;

		return zone ? `(${zone} UTC${timeOffset >= 0 ? '+' : ''}${timeOffset})` : `UTC${timeOffset >= 0 ? '+' : ''}${timeOffset}`;
	};

	function toLocalDateTimeString(date: Date) {
		const pad = (n: number) => n.toString().padStart(2, '0');

		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1); // 月份是 0-based
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());

		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	const getTimelockDetails = (timelockId: string) => {
		const c = allTimelocks.find(item => Number(item.id) === Number(timelockId))
		return c
	}

	return (
		<section className='flex flex-col gap-4 w-full'>
			<SectionHeader title={t('encodingTransaction.title')} />
			
			<div className='flex flex-col w-full'>
				{/* Timelock Selection */}
				<TimelockSelector
					label={t('encodingTransaction.selectTimelock')}
					placeholder={t('encodingTransaction.selectTimelock')}
					noOptionsText={t('encodingTransaction.noTimelocksAvailable')}
					timelockType={timelockType}
					timelockOptions={timelockOptions}
					getTimelockDetails={getTimelockDetails}
					onChange={handleTimelockChange}
				/>
				
				<SelectInput
					label={t('encodingTransaction.selectTimelockMethod')}
					value={timelockMethod}
					onChange={onTimelockMethodChange}
					options={timelockMethodOptions}
					placeholder={timelockType ? t('encodingTransaction.selectTimelockMethodPlaceholder') : t('encodingTransaction.selectTimelockFirstPlaceholder')}
				/>

				{/* Transaction Details */}
				<TextInput
					label={t('encodingTransaction.target')}
					value={target}
					onChange={handleTargetChange}
					placeholder='0x...'
					error={validationErrors.target}
					validationType='address'
				/>
				
				<TextInput
					label={t('encodingTransaction.value')}
					value={value}
					onChange={handleValueChange}
					placeholder='0'
					validationType='positiveNumber'
				/>

				{/* Execution Time */}
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						{t('targetABI.time')} <span className='text-xs text-gray-500 font-normal'>{timeZone()}</span>
					</label>
					<input
						type='datetime-local'
						aria-label={`Transaction execution time ${timeZone()}`}
						value={toLocalDateTimeString(new Date(timeValue * 1000))}
						className='mt-1 block w-full px-3 py-2.5 rounded-lg text-sm bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all duration-200 ease-in-out'
						onChange={e => {
							const date = new Date(e.target.value);
							if (!isNaN(date.getTime())) {
								onTimeChange(Math.floor(date.getTime() / 1000));
							}
						}}
					/>
				</div>

				{/* Target ABI Section */}
				<TargetABISection
					abiValue={abiValue}
					onAbiChange={onAbiChange}
					functionValue={functionValue}
					onFunctionChange={onFunctionChange}
					argumentValues={argumentValues}
					onArgumentChange={onArgumentChange}
				/>
			</div>
		</section>
	);
};

export default EncodingTransactionForm;
