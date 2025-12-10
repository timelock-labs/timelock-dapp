'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';

interface VerificationCodeInputProps {
	email: string;
	onSendCode: () => Promise<void>;
	onCodeChange: (code: string) => void;
	codeLength?: number;
	buttonText?: string;
	disabledText?: string;
	isFirstTime?: boolean;
	disabled?: boolean;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
	email,
	onSendCode,
	onCodeChange,
	codeLength = 6,
	buttonText,
	disabledText,
	isFirstTime = true,
	disabled = false,
}) => {
	const t = useTranslations('Notify.verificationCode');
	const inputRef = useRef<HTMLInputElement | null>(null);
	const onCodeChangeRef = useRef(onCodeChange);
	const inputId = useId();

	const [codeValue, setCodeValue] = useState('');
	const [countdown, setCountdown] = useState(0);
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	// Keep ref updated
	useEffect(() => {
		onCodeChangeRef.current = onCodeChange;
	}, [onCodeChange]);

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0) return;

		const timer = setTimeout(() => {
			setCountdown(prev => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown]);

	// Handle input change
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value.replace(/[^\d]/g, '').slice(0, codeLength);
			setCodeValue(value);
			onCodeChangeRef.current(value);
		},
		[codeLength]
	);

	// Handle send code
	const handleSendCode = useCallback(async () => {
		if (!email) {
			toast.error(t('pleaseEnterEmail'));
			return;
		}

		setIsSendingCode(true);

		try {
			await onSendCode();
			setCountdown(60);
			// 发送成功后自动聚焦到输入框
			inputRef.current?.focus();
		} catch (error) {
			console.error('Error sending code:', error);
		} finally {
			setIsSendingCode(false);
		}
	}, [email, onSendCode, t]);

	// 计算进度百分比用于视觉反馈
	const progressPercent = countdown > 0 ? (countdown / 60) * 100 : 0;
	const isCodeComplete = codeValue.length === codeLength;
	const canSendCode = !isSendingCode && countdown === 0 && !disabled;

	return (
		<div className='mb-4'>
			<label
				htmlFor={inputId}
				className={cn(
					'block text-sm font-medium mb-2 transition-colors duration-200',
					{
						'text-black': isFocused,
						'text-gray-700': !isFocused,
					}
				)}
			>
				{t('label')}
			</label>

			<div className='flex items-center gap-3'>
				{/* 验证码输入框 */}
				<div className='relative'>
					<input
						ref={inputRef}
						id={inputId}
						type='text'
						inputMode='numeric'
						pattern='[0-9]*'
						value={codeValue}
						onChange={handleChange}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder='000000'
						maxLength={codeLength}
						disabled={disabled}
						autoComplete='one-time-code'
						aria-label={t('label')}
						className={cn(
							'w-36 h-11 rounded-lg px-4 text-sm font-mono tracking-[0.3em] text-center',
							'border transition-all duration-200 ease-in-out',
							'focus:outline-none focus:ring-2 focus:ring-offset-0',
							{
								'border-green-500 bg-green-50 focus:ring-green-500/20': isCodeComplete,
								'border-gray-300 bg-gray-50 focus:border-black focus:ring-black/10 hover:border-gray-400': !isCodeComplete && !disabled,
								'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60': disabled,
							}
						)}
					/>
					{/* 完成状态指示器 */}
					{isCodeComplete && (
						<div className='absolute right-3 top-1/2 -translate-y-1/2'>
							<svg
								className='w-4 h-4 text-green-500'
								fill='currentColor'
								viewBox='0 0 20 20'
								aria-hidden='true'
							>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
						</div>
					)}
				</div>

				{/* 发送按钮 */}
				<Button
					type='button'
					onClick={handleSendCode}
					disabled={!canSendCode}
					loading={isSendingCode}
					loadingText={t('sending')}
					variant={countdown > 0 ? 'outline' : 'default'}
					className={cn(
						'h-11 px-5 rounded-lg text-sm font-medium relative overflow-hidden',
						'transition-all duration-200',
						{
							'min-w-[120px]': countdown > 0,
						}
					)}
				>
					{/* 倒计时进度条背景 */}
					{countdown > 0 && (
						<div
							className='absolute inset-0 bg-gray-200 transition-all duration-1000 ease-linear'
							style={{ width: `${progressPercent}%` }}
							aria-hidden='true'
						/>
					)}
					<span className='relative z-10'>
						{countdown > 0 ? (
							<>
								{disabledText || t('sent')} ({countdown}s)
							</>
						) : (
							buttonText || (isFirstTime ? t('sendCode') : t('resendCode'))
						)}
					</span>
				</Button>
			</div>

			{/* 提示文本 */}
			{countdown > 0 && (
				<p className='mt-2 text-xs text-gray-500 animate-in fade-in duration-200'>
					{t('checkEmail')}
				</p>
			)}
		</div>
	);
};

export default VerificationCodeInput;
