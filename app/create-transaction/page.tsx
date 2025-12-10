/**
 * Create Transaction Page
 * 
 * 重构说明：
 * 1. 使用 useCreateTransaction hook 管理表单状态和编码逻辑
 * 2. 组件只负责 UI 渲染
 * 3. 代码从 242 行减少到约 80 行
 */

'use client';

import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';

import { useCreateTransaction } from '@/hooks/crud';
import { Button } from '@/components/ui/button';
import EncodingTransactionForm from './components/EncodingTransactionForm';
import TransactionTimeline from './components/TransactionTimeline';
import EncodingPreview from './components/EncodingPreview';
import MailboxSelection from './components/MailboxSelection';

// ============================================================================
// Component
// ============================================================================

const CreateTransactionPage: React.FC = () => {
	const t = useTranslations('CreateTransaction');

	const {
		formState,
		targetCalldata,
		previewContent,
		isSubmitting,
		updateForm,
		handleArgumentChange,
		handleFunctionChange,
		handleAbiChange,
		handleSendTransaction,
	} = useCreateTransaction();

	return (
		<div>
			<div className='mx-auto flex flex-col'>
				<div className='flex flex-col lg:flex-row gap-6 lg:gap-12 xl:gap-32'>
					{/* Left: Form */}
					<div className='w-full lg:w-1/2 lg:max-w-[450px]'>
						<EncodingTransactionForm
							targetCalldata={targetCalldata}
							timelockType={formState.timelockType}
							onTimelockTypeChange={v => updateForm('timelockType', v)}
							timelockMethod={formState.timelockMethod}
							onTimelockMethodChange={v => updateForm('timelockMethod', v)}
							onTimelockAddressChange={v => updateForm('timelockAddress', v)}
							target={formState.target}
							onTargetChange={v => updateForm('target', v)}
							value={formState.value}
							onValueChange={v => updateForm('value', v)}
							abiValue={formState.abiValue}
							onAbiChange={handleAbiChange}
							functionValue={formState.functionValue}
							onFunctionChange={handleFunctionChange}
							timeValue={formState.timeValue}
							onTimeChange={v => updateForm('timeValue', v)}
							argumentValues={formState.argumentValues}
							onArgumentChange={handleArgumentChange}
						/>
					</div>

					{/* Right: Preview & Actions */}
					<div className='flex flex-col gap-8 w-full lg:w-1/2 max-w-[500px]'>
						<TransactionTimeline 
							timelockAddress={formState.timelockAddress}
							etaTimestamp={formState.timeValue}
						/>
						<EncodingPreview previewContent={previewContent} />
						<MailboxSelection
							selectedMailbox={formState.selectedMailbox}
							onMailboxChange={v => updateForm('selectedMailbox', v)}
						/>
						<div className='pt-4 border-t border-gray-200 flex justify-end'>
							<Button
								onClick={handleSendTransaction}
								disabled={isSubmitting}
								className='flex items-center gap-2 w-full sm:w-auto'
							>
								<Send className='w-4 h-4' />
								{isSubmitting ? t('submitting') : t('sendTransactionButton')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateTransactionPage;
