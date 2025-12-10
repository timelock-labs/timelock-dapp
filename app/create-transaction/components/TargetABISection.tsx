import React, { useState, useMemo } from 'react';
import SelectInput from '@/components/ui/SelectInput';
import TextInput from '@/components/ui/TextInput';
import TextAreaInput from '@/components/ui/TextAreaInput';
import AddABIForm from '@/app/abi-lib/components/AddABIForm';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { TargetABISectionProps } from '@/types';
import { useApi } from '@/hooks/useApi';

/**
 * Target ABI section component for selecting ABI and function with arguments
 *
 * @param props - TargetABISection component props
 * @returns JSX.Element
 */
const TargetABISection: React.FC<TargetABISectionProps> = ({ abiValue, onAbiChange, functionValue, onFunctionChange, argumentValues, onArgumentChange }) => {
	const t = useTranslations('CreateTransaction');
	const [isAddABIOpen, setIsAddABIOpen] = useState(false);
	const [abiList, setAbiList] = useState<Array<{ id: number; name: string; abi_content: string }>>([]);
	const { request: getAbiList, isLoading } = useApi();

	// Fetch ABI list on mount
	React.useEffect(() => {
		const fetchAbiList = async () => {
			try {
				const { data } = await getAbiList('/api/v1/abi/list');
				setAbiList(data?.abis || []);
			} catch (error) {
				console.error('Failed to fetch ABI list:', error);
				toast.error(t('fetchABIError', { message: error instanceof Error ? error.message : 'Unknown error' }));
			}
		};
		
		fetchAbiList();
	}, [isAddABIOpen, t, getAbiList]);

	// Convert ABI list to options format
	const abiOptions = useMemo(() => {
		if (!Array.isArray(abiList)) {
			return [];
		}
		return abiList.map(abi => ({
			value: abi.id.toString(),
			label: abi.name,
		}));
	}, [abiList]);

	// Parse functions from selected ABI
	const functionOptions = useMemo(() => {
		if (!abiValue || !Array.isArray(abiList)) return [];

		const selectedAbi = abiList.find(abi => abi.id.toString() === abiValue);
		if (!selectedAbi) return [];

		try {
			const abiContent = JSON.parse(selectedAbi.abi_content);
			return abiContent
				.filter((item: Record<string, unknown>) => {
					// Only include functions that are writable (not view or pure)
					return item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure';
				})
				.map((func: Record<string, unknown>) => {
					// Create unique value using function name and input types
					const inputs = Array.isArray(func.inputs) ? func.inputs : [];
					const inputTypes = inputs.map((input: Record<string, unknown>) => input.type).join(',');
					const uniqueValue = `${func.name}(${inputTypes})`;

					return {
						value: uniqueValue,
						label: func.name as string,
					};
				});
		} catch (error) {
			console.error('Error parsing ABI content:', error);
			return [];
		}
	}, [abiValue, abiList]);

	// Get selected function details including parameters
	const selectedFunctionDetails = useMemo(() => {
		if (!functionValue || !Array.isArray(abiList) || !abiValue) return null;

		const selectedAbi = abiList.find(abi => abi.id.toString() === abiValue);
		if (!selectedAbi) return null;

		try {
			const abiContent = JSON.parse(selectedAbi.abi_content);

			// Extract function name from the value (format: "functionName(type1,type2)")
			const functionName = functionValue.split('(')[0];
			const inputTypesString = functionValue.match(/\((.*)\)/)?.[1] || '';
			const expectedInputTypes = inputTypesString ? inputTypesString.split(',') : [];

			const selectedFunction = abiContent.find((item: Record<string, unknown>) => {
				if (item.type !== 'function' || item.name !== functionName) return false;

				// Match by input types to handle function overloading
				const inputs = Array.isArray(item.inputs) ? item.inputs : [];
				const actualInputTypes = inputs.map((input: Record<string, unknown>) => input.type);

				return JSON.stringify(actualInputTypes) === JSON.stringify(expectedInputTypes);
			});

			return selectedFunction || null;
		} catch (error) {
			console.error('Error parsing ABI content:', error);
			return null;
		}
	}, [functionValue, abiList, abiValue]);


	return (
		<div>
			{/* ABI Selection with Add Button */}
			<div className='flex items-end gap-3'>
				<div className='flex-1'>
					<SelectInput
						label={t('targetABI.label')}
						value={abiValue}
						onChange={onAbiChange}
						options={abiOptions}
						placeholder={
							isLoading ? 'Loading ABIs...'
							: abiOptions.length === 0 ?
								'No ABIs available'
							:	t('targetABI.placeholder')
						}
					/>
				</div>
				<button
					type='button'
					onClick={() => setIsAddABIOpen(true)}
					className='mb-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium w-[72px] h-[42px] flex items-center justify-center'>
					Add
				</button>
			</div>

			{/* Function Selection */}
			<div className='w-1/2'>
				<SelectInput 
					label={t('targetABI.function')} 
					value={functionValue} 
					onChange={onFunctionChange} 
					options={functionOptions} 
					placeholder={t('targetABI.selectFunction')} 
				/>
			</div>

			{/* Dynamic function arguments */}
			{selectedFunctionDetails &&
				Array.isArray(selectedFunctionDetails.inputs) &&
				(selectedFunctionDetails.inputs as Array<Record<string, unknown>>).length > 0 && (
				<div className='space-y-3'>
					<h4 className='text-sm font-medium text-gray-700'>Function Arguments</h4>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{(selectedFunctionDetails.inputs as Array<Record<string, any>>).map((input, index) => {
							const label = `${input.name || `Argument ${index + 1}`} (${input.type})`;
							const type = String(input.type || '');
							const isTupleType = type.includes('tuple');

							if (!isTupleType) {
								const getValidationType = (inputType: string) => {
									if (inputType === 'address') return 'address';
									if (inputType.startsWith('uint') || inputType.startsWith('int')) return 'positiveNumber';
									return undefined;
								};

								return (
									<TextInput
										key={index}
										label={label}
										value={argumentValues[index] || ''}
										onChange={(value: string) => onArgumentChange(index, value)}
										placeholder={type === 'address' ? '0x...' : `Enter ${input.type} value`}
										validationType={getValidationType(type)}
									/>
								);
							}

							// For tuple / tuple[] types, use JSON input with a structure hint
							const components = Array.isArray(input.components) ? (input.components as Array<any>) : [];
							const buildStructureHint = (fields: Array<any>, indent = 0): string => {
								const pad = '  '.repeat(indent);
								return fields
									.map(field => {
										const fieldType = String(field.type || '');
										if (fieldType.includes('tuple') && Array.isArray(field.components)) {
											return `${pad}${field.name || ''}: {\n${buildStructureHint(field.components as Array<any>, indent + 1)}\n${pad}}`;
										}
										return `${pad}${field.name || ''}: ${fieldType}`;
									})
									.join('\n');
							};

							const structureHint = components.length > 0 ? buildStructureHint(components) : '';
							const isArrayTuple = type.includes('[]');
							const placeholderLines = ['Enter JSON matching this structure:'];
							if (structureHint) placeholderLines.push(structureHint);
							placeholderLines.push('Example:');
							placeholderLines.push(isArrayTuple ? '[{ ... }, { ... }]' : '{ ... }');

							return (
								<div key={index} className='flex flex-col space-y-1'>
									<TextAreaInput
										label={`${label} (JSON)`}
										value={argumentValues[index] || ''}
										onChange={(value: string) => onArgumentChange(index, value)}
										rows={4}
										placeholder={placeholderLines.join('\n')}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}

			<AddABIForm isOpen={isAddABIOpen} onClose={() => setIsAddABIOpen(false)} />
		</div>
	);
};

export default TargetABISection;
