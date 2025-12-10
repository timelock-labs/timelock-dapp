/**
 * Import Timelock Page
 * 
 * 重构说明：
 * 1. 使用 useImportTimelock hook 管理表单状态和导入流程
 * 2. 组件只负责 UI 渲染
 * 3. 代码从 242 行减少到约 90 行
 */

'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useImportTimelock } from '@/hooks/crud';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/ui/SectionHeader';
import TextInput from '@/components/ui/TextInput';
import SelectInput from '@/components/ui/SelectInput';
import ChainSelector from '@/components/web3/ChainSelector';
import CheckParametersModal from './components/CheckParametersModal';
import { compoundTimelockAbi } from '@/contracts/abis/CompoundTimelock';

import QuestionIcon from '@/public/QuestionIcon.svg';

// ============================================================================
// Constants
// ============================================================================

const STANDARD_OPTIONS = [{ value: 'compound', label: 'Compound' }] as const;

// ============================================================================
// Component
// ============================================================================

const ImportTimelockPage: React.FC = () => {
	const t = useTranslations('ImportTimelock');

	const {
		formState,
		isFormValid,
		isModalOpen,
		modalParams,
		isDetecting,
		updateField,
		handleNextStep,
		handleConfirmImport,
		closeModal,
	} = useImportTimelock();

	return (
		<div className='bg-white p-8 flex flex-col'>
			<div className='flex-grow'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-gray-200'>
					{/* Left: Header */}
					<div className='flex flex-col pr-8'>
						<SectionHeader
							title={t('title')}
							description={t('description')}
							icon={<Image src={QuestionIcon} alt='Question Icon' width={15} height={15} />}
						/>
					</div>

					{/* Right: Form */}
					<div className='flex flex-col pl-8 gap-4'>
						<ChainSelector
							label={t('selectChain')}
							value={formState.chainId}
							onChange={v => updateField('chainId', v)}
							placeholder={t('selectChainPlaceholder')}
							autoSwitchChain
						/>

						<TextInput
							label={t('contractAddress')}
							value={formState.contractAddress}
							onChange={(v: string) => updateField('contractAddress', v)}
							placeholder={t('contractAddressPlaceholder')}
							validationType='address'
						/>

						<SelectInput
							label={t('contractStandard')}
							value={formState.standard}
							onChange={v => updateField('standard', v)}
							options={[...STANDARD_OPTIONS]}
							placeholder={t('contractStandardPlaceholder')}
						/>

						<TextInput
							label={t('remarks')}
							value={formState.remarks}
							onChange={(v: string) => updateField('remarks', v)}
							placeholder={t('remarksPlaceholder')}
						/>
					</div>
				</div>

				{/* Submit Button */}
				<div className='flex justify-end mt-8'>
					<Button
						onClick={handleNextStep}
						disabled={isDetecting || !isFormValid}
						className='px-8 py-3'
					>
						{isDetecting ? t('detecting') : t('nextStep')}
					</Button>
				</div>
			</div>

			{/* Confirmation Modal */}
			<CheckParametersModal
				isOpen={isModalOpen}
				onClose={closeModal}
				onConfirm={handleConfirmImport}
				abiText={JSON.stringify(compoundTimelockAbi, null, 2)}
				parameters={modalParams}
			/>
		</div>
	);
};

export default ImportTimelockPage;
