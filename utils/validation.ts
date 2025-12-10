/**
 * 输入验证工具函数
 */

// ============ 常量 ============
export const VALIDATION_RULES = {
	ADDRESS_LENGTH: 42,
	ADDRESS_PREFIX: '0x',
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	WEBHOOK_URL_REGEX: /^https?:\/\/.+/,
	POSITIVE_NUMBER_REGEX: /^\d+$/,
	HEX_REGEX: /^0x[a-fA-F0-9]*$/,
} as const;

// ============ 类型 ============
export interface ValidationResult {
	isValid: boolean;
	error: string | null;
}

export type ValidationType =
	| 'address'
	| 'email'
	| 'webhookUrl'
	| 'positiveNumber'
	| 'required'
	| 'hex'
	| 'botToken'
	| 'chatId'
	| 'abiJson';

// ============ 验证函数 ============

/**
 * 验证以太坊地址
 */
export const validateAddress = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null }; // 空值由 required 验证处理
	}

	if (!value.startsWith(VALIDATION_RULES.ADDRESS_PREFIX)) {
		return {
			isValid: false,
			error: t?.('validation.addressMustStartWith0x') || 'Address must start with 0x',
		};
	}

	if (value.length !== VALIDATION_RULES.ADDRESS_LENGTH) {
		return {
			isValid: false,
			error: t?.('validation.addressMustBe42Chars') || `Address must be ${VALIDATION_RULES.ADDRESS_LENGTH} characters`,
		};
	}

	if (!VALIDATION_RULES.HEX_REGEX.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.addressMustBeHex') || 'Address must be a valid hex string',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证邮箱地址
 */
export const validateEmail = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	if (!VALIDATION_RULES.EMAIL_REGEX.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.invalidEmail') || 'Please enter a valid email address',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证 Webhook URL
 */
export const validateWebhookUrl = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	if (!VALIDATION_RULES.WEBHOOK_URL_REGEX.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.invalidWebhookUrl') || 'Please enter a valid URL starting with http:// or https://',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证正整数
 */
export const validatePositiveNumber = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	if (!VALIDATION_RULES.POSITIVE_NUMBER_REGEX.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.mustBePositiveNumber') || 'Please enter a valid positive number',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证必填字段
 */
export const validateRequired = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value || !value.trim()) {
		return {
			isValid: false,
			error: t?.('validation.required') || 'This field is required',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证 ABI JSON 格式
 */
export const validateAbiJson = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	try {
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) {
			return {
				isValid: false,
				error: t?.('validation.abiMustBeArray') || 'ABI must be a JSON array',
			};
		}
		return { isValid: true, error: null };
	} catch {
		return {
			isValid: false,
			error: t?.('validation.invalidJson') || 'Please enter valid JSON',
		};
	}
};

/**
 * 验证 Telegram Bot Token
 */
export const validateBotToken = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	// Bot token 格式: 数字:字母数字字符串
	if (!/^\d+:[A-Za-z0-9_-]+$/.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.invalidBotToken') || 'Please enter a valid Bot Token',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 验证 Telegram Chat ID
 */
export const validateChatId = (value: string, t?: (key: string) => string): ValidationResult => {
	if (!value) {
		return { isValid: true, error: null };
	}

	// Chat ID 可以是数字或以 @ 开头的用户名
	if (!/^-?\d+$/.test(value) && !/^@\w+$/.test(value)) {
		return {
			isValid: false,
			error: t?.('validation.invalidChatId') || 'Please enter a valid Chat ID',
		};
	}

	return { isValid: true, error: null };
};

/**
 * 通用验证函数
 */
export const validate = (
	value: string,
	type: ValidationType,
	t?: (key: string) => string
): ValidationResult => {
	switch (type) {
		case 'address':
			return validateAddress(value, t);
		case 'email':
			return validateEmail(value, t);
		case 'webhookUrl':
			return validateWebhookUrl(value, t);
		case 'positiveNumber':
			return validatePositiveNumber(value, t);
		case 'required':
			return validateRequired(value, t);
		case 'hex':
			return validateAddress(value, t); // 复用地址验证
		case 'botToken':
			return validateBotToken(value, t);
		case 'chatId':
			return validateChatId(value, t);
		case 'abiJson':
			return validateAbiJson(value, t);
		default:
			return { isValid: true, error: null };
	}
};

/**
 * 组合多个验证规则
 */
export const validateMultiple = (
	value: string,
	types: ValidationType[],
	t?: (key: string) => string
): ValidationResult => {
	for (const type of types) {
		const result = validate(value, type, t);
		if (!result.isValid) {
			return result;
		}
	}
	return { isValid: true, error: null };
};
