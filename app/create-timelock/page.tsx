/**
 * Create Timelock Page
 * 
 * 重构说明：
 * 1. 使用 useCreateTimelock hook 管理表单状态和部署流程
 * 2. 组件只负责 UI 渲染
 * 3. 代码从 161 行减少到约 60 行
 */

'use client';

import { useCreateTimelock } from '@/hooks/crud';
import CreateTimelockForm from './components/CreateTimelockForm';
import ConfirmCreationDialog from './components/ConfirmCreationDialog';

// ============================================================================
// Component
// ============================================================================

const CreateTimelockPage: React.FC = () => {
	const {
		formState,
		isConfirmDialogOpen,
		dialogDetails,
		isWalletSafe,
		isLoading,
		handleChainChange,
		handleMinDelayChange,
		handleOwnerChange,
		handleCreate,
		handleConfirmDialogConfirm,
		closeConfirmDialog,
	} = useCreateTimelock();

	return (
		<div className='bg-white p-8'>
			<div className='mx-auto flex flex-col space-y-8'>
				<CreateTimelockForm
					selectedChain={formState.selectedChain}
					onChainChange={handleChainChange}
					selectedStandard='compound'
					minDelay={formState.minDelay}
					onMinDelayChange={handleMinDelayChange}
					owner={formState.owner || ''}
					onOwnerChange={handleOwnerChange}
					onDeploy={handleCreate}
					isLoading={isLoading}
					isSafeWallet={isWalletSafe}
				/>
			</div>

			<ConfirmCreationDialog
				isOpen={isConfirmDialogOpen}
				onClose={closeConfirmDialog}
				onConfirm={handleConfirmDialogConfirm}
				creationDetails={dialogDetails}
			/>
		</div>
	);
};

export default CreateTimelockPage;
