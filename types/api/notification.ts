/**
 * Notification API types
 * 统一管理邮箱和渠道通知的类型定义
 */

import type { PaginationResponse } from '../common';

// ============================================================================
// Common Types
// ============================================================================

/** 通知渠道类型 */
export type NotificationChannelType = 'feishu' | 'lark' | 'telegram' | 'email';

/** 基础实体接口 */
interface BaseEntity {
	id: string;
	created_at: string;
	updated_at?: string;
}

// ============================================================================
// Email Notification Types
// ============================================================================

/** 邮箱通知实体 */
export interface EmailNotification extends BaseEntity {
	email: string;
	remark?: string;
	is_verified: boolean;
	last_verified_at?: string;
	timelock_contracts?: string[];
	verification_code?: string;
	verification_expires_at?: string;
}

/** 邮箱通知列表响应 */
export interface EmailNotificationListResponse extends PaginationResponse {
	emails: EmailNotification[];
	total: number;
}

/** 邮箱日志 */
export interface EmailLog {
	id: string;
	email: string;
	subject: string;
	content: string;
	sent_at: string;
	status: 'sent' | 'failed' | 'pending';
	error_message?: string;
	timelock_contract?: string;
	transaction_hash?: string;
}

/** 创建邮箱请求 */
export interface CreateEmailNotificationRequest {
	email: string;
	remark?: string;
	timelock_contracts?: string[];
}

/** 更新邮箱请求 */
export interface UpdateEmailNotificationRequest {
	id: string;
	remark?: string;
}

/** 验证邮箱请求 */
export interface VerifyEmailRequest {
	email: string;
	code: string;
}

/** 重发验证码请求 */
export interface ResendCodeRequest {
	email: string;
}

/** 紧急回复请求 */
export interface EmergencyReplyRequest {
	email: string;
	message: string;
	transaction_hash?: string;
}

/** 邮箱过滤参数 */
export interface EmailNotificationFilters {
	email?: string;
	verified?: boolean;
	timelock_contract?: string;
	page?: number;
	page_size?: number;
	sort_by?: string;
	sort_order?: 'asc' | 'desc';
}

// ============================================================================
// Channel Notification Types
// ============================================================================

/** 渠道配置基础接口 */
interface BaseChannelConfig extends BaseEntity {
	name: string;
	user_address: string;
	is_active: boolean;
}

/** 飞书/Lark 渠道配置 */
export interface WebhookChannelConfig extends BaseChannelConfig {
	webhook_url: string;
	secret?: string;
}

/** Telegram 渠道配置 */
export interface TelegramChannelConfig extends BaseChannelConfig {
	bot_token: string;
	chat_id: string;
}

/** 统一渠道实体 (用于 UI 展示) */
export interface NotificationChannel extends BaseEntity {
	name: string;
	channel: NotificationChannelType;
	user_address: string;
	is_active: boolean;
	// Webhook 类型字段
	webhook_url?: string;
	secret?: string;
	// Telegram 类型字段
	bot_token?: string;
	chat_id?: string;
}

/** 渠道列表 API 响应 */
export interface ChannelConfigsResponse {
	feishu_configs?: WebhookChannelConfig[];
	lark_configs?: WebhookChannelConfig[];
	telegram_configs?: TelegramChannelConfig[];
}

/** 创建渠道请求 */
export interface CreateChannelRequest {
	channel: NotificationChannelType;
	name: string;
	webhook_url?: string;
	secret?: string;
	bot_token?: string;
	chat_id?: string;
}

/** 更新渠道请求 */
export interface UpdateChannelRequest extends CreateChannelRequest {
	id: string;
}

/** 删除渠道请求 */
export interface DeleteChannelRequest {
	channel: NotificationChannelType;
	name: string;
}

// ============================================================================
// CRUD Operation Types (通用)
// ============================================================================

/** 删除确认对话框状态 */
export interface DeleteConfirmState<T = string | number> {
	isOpen: boolean;
	id: T;
	name: string;
}

/** 初始删除确认状态 */
export const INITIAL_DELETE_CONFIRM_STATE: DeleteConfirmState = {
	isOpen: false,
	id: '',
	name: '',
};

/** 空渠道对象 (用于重置表单) */
export const EMPTY_CHANNEL: NotificationChannel = {
	id: '',
	name: '',
	channel: 'feishu',
	user_address: '',
	is_active: false,
	created_at: '',
	webhook_url: '',
	secret: '',
	bot_token: '',
	chat_id: '',
};
