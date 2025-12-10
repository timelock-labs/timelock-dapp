import React, { useEffect, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import ChainLabel from '@/components/web3/ChainLabel';
import AddressWarp from '@/components/web3/AddressWarp';

type TimelockDetails = {
	chain_id?: number | string;
	contract_address?: string;
	remark?: string;
};

type TimelockOption = {
	value: string;
};

type TimelockSelectorProps = {
	label: string;
	placeholder: string;
	noOptionsText: string;
	timelockType?: string;
	timelockOptions: TimelockOption[];
	getTimelockDetails: (id: string) => TimelockDetails | null | undefined;
	onChange: (value: string) => void;
};

const TimelockSelector: React.FC<TimelockSelectorProps> = ({
	label,
	placeholder,
	noOptionsText,
	timelockType,
	timelockOptions,
	getTimelockDetails,
	onChange,
}) => {
	const [dropdownWidth, setDropdownWidth] = useState<number>(0);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (triggerRef.current) {
			setDropdownWidth(triggerRef.current.offsetWidth);
		}
	}, []);

	const renderSelected = () => {
		if (!timelockType) {
			return (
				<span className='text-gray-500 font-normal truncate'>
					{placeholder}
				</span>
			);
		}

		const details = getTimelockDetails(timelockType);

		return (
			<div className='flex gap-2 items-center min-w-0 overflow-hidden'>
				{details?.chain_id ? <ChainLabel chainId={details.chain_id} /> : null}
				<span className='font-medium truncate'>
					<AddressWarp address={details?.contract_address} isShort />
				</span>
				{details?.remark && (
					<span className='text-gray-600 text-xs truncate'>{details.remark}</span>
				)}
			</div>
		);
	};

	return (
		<div className='mb-4 z-50 w-full'>
			<label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						ref={triggerRef}
						type='button'
						className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full justify-between h-[42px] px-3 bg-gray-100 hover:bg-gray-200 border-transparent focus:bg-white focus:border-gray-300 focus:outline-none'
					>
						<div className='flex gap-2 items-center min-w-0 overflow-hidden flex-1'>
							{renderSelected()}
						</div>
						<ChevronDown className='ml-2 h-4 w-4 flex-shrink-0' />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent style={{ width: `${dropdownWidth}px` }} className='bg-white border border-gray-200 p-2 flex flex-col rounded' align='end' side='bottom'>
					{(!Array.isArray(timelockOptions) || timelockOptions.length === 0) ? (
						<div className='flex pr-8 py-1 px-1 hover:bg-gray-50 items-center cursor-pointer border-none'>
							<span className='text-gray-800 text-xs'> {noOptionsText}</span>
						</div>
					) : (
						timelockOptions.map(timelock => {
							const timelockDetails = getTimelockDetails(timelock.value);

							return (
								<DropdownMenuItem
									key={timelock.value}
									onClick={() => onChange(timelock.value)}
									className='flex py-2 px-2 hover:bg-gray-50 items-center cursor-pointer border-none rounded'>
									<div className='flex gap-2 items-center font-medium text-sm'>
										{timelockDetails?.chain_id && <ChainLabel chainId={timelockDetails.chain_id} />}
										<AddressWarp address={timelockDetails?.contract_address} isShort />
										{timelockDetails?.remark && (
											<span className='text-gray-600 text-xs'>{timelockDetails.remark}</span>
										)}
									</div>
								</DropdownMenuItem>
							);
						})
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default TimelockSelector;

