# 前端架构优化文档

## 概述

本次重构针对整个前端项目进行了架构层面的深度优化，建立了可复用的 Hook 模式。

**已优化模块：**

- Notify (Email + Channel)
- ABI Library
- Timelocks
- Transactions
- Home
- Ecosystem
- Create Timelock
- Create Transaction
- Import Timelock

## 优化前的问题

### 1. 状态管理分散
```
❌ Email 组件: 147 行，包含 8 个 useState
❌ Channel 组件: 222 行，包含 7 个 useState
❌ 重复的 CRUD 逻辑（fetch, delete, modal 状态）
```

### 2. 类型定义分散
```
❌ Channel 接口在组件内定义
❌ 相同类型在多处重复定义
❌ 缺少统一的类型导出
```

### 3. 组件职责过重
```
❌ 组件同时处理 UI 渲染和业务逻辑
❌ API 调用直接在组件中
❌ 难以进行单元测试
```

## 优化后的架构

### 目录结构
```
hooks/
├── crud/                          # 新增：CRUD 操作 hooks
│   ├── index.ts                   # Barrel export
│   ├── useCrudOperations.ts       # 通用 CRUD hook
│   ├── useEmailNotifications.ts   # 邮箱专用 hook
│   └── useChannelNotifications.ts # 渠道专用 hook
├── index.ts                       # 更新：添加 CRUD 导出
└── ...

types/
└── api/
    └── notification.ts            # 更新：统一通知类型定义

app/notify/components/
├── email/
│   └── index.tsx                  # 重构：147行 → 100行
└── channel/
    └── index.tsx                  # 重构：222行 → 90行
```

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (组件)                         │
│  - 只负责渲染                                                │
│  - 不包含业务逻辑                                            │
│  - 通过 props 接收数据和回调                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Hook Layer (业务逻辑)                      │
│  - useEmailNotifications / useChannelNotifications          │
│  - 状态管理、API 调用、数据转换                               │
│  - 可独立测试                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Base Hook Layer (通用抽象)                  │
│  - useCrudOperations: 通用 CRUD 操作                        │
│  - useModalState: Modal 状态管理                            │
│  - useListFilters: 列表过滤分页                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (useApi)                        │
│  - HTTP 请求封装                                             │
│  - 认证处理                                                  │
│  - 错误处理                                                  │
└─────────────────────────────────────────────────────────────┘
```

## 核心设计模式

### 1. 通用 CRUD Hook (useCrudOperations)

```typescript
// 配置驱动的 CRUD 操作
const crud = useCrudOperations<EmailNotification>({
  resourceName: 'mailbox',
  endpoints: {
    list: '/api/v1/emails',
    delete: '/api/v1/emails/delete',
  },
  extractData: (response) => response?.data?.emails || [],
  getEntityId: (entity) => entity.id,
  getEntityName: (entity) => entity.email,
}, {
  fetchError: t('fetchEmailListError'),
  deleteSuccess: t('deleteMailboxSuccess'),
});
```

**优势：**
- 配置化：通过配置而非代码定义行为
- 类型安全：完整的 TypeScript 支持
- 可测试：业务逻辑与 UI 分离

### 2. Modal 状态管理 (useModalState)

```typescript
const addModal = useModalState();
const editModal = useModalState<EmailNotification>(null);

// 使用
addModal.open();
editModal.open(mailbox);
editModal.close();
```

### 3. 删除确认模式

```typescript
// 统一的删除确认状态
interface DeleteConfirmState<T = string | number> {
  isOpen: boolean;
  id: T;
  name: string;
}

// 使用
crud.remove(id, name);      // 打开确认对话框
crud.confirmDelete();       // 确认删除
crud.cancelDelete();        // 取消
```

## 类型系统优化

### 统一的通知类型 (types/api/notification.ts)

```typescript
// 基础实体接口
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// 邮箱通知
export interface EmailNotification extends BaseEntity {
  email: string;
  remark?: string;
  is_verified: boolean;
  // ...
}

// 渠道通知 (统一多种渠道类型)
export interface NotificationChannel extends BaseEntity {
  name: string;
  channel: NotificationChannelType;
  // Webhook 字段
  webhook_url?: string;
  secret?: string;
  // Telegram 字段
  bot_token?: string;
  chat_id?: string;
}

// 常量导出 (减少硬编码)
export const INITIAL_DELETE_CONFIRM_STATE: DeleteConfirmState = {
  isOpen: false,
  id: '',
  name: '',
};
```

## 代码量对比

| 文件 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| email/index.tsx | 147 行 | 100 行 | 32% |
| channel/index.tsx | 222 行 | 90 行 | 59% |
| **新增 hooks** | - | ~400 行 | - |

**总结：** 虽然新增了 hooks 代码，但：
1. hooks 可在多处复用
2. 组件代码大幅简化
3. 业务逻辑可独立测试
4. 新增功能只需配置

## 扩展指南

### 添加新的 CRUD 模块

```typescript
// 1. 定义类型 (types/api/xxx.ts)
export interface NewEntity extends BaseEntity {
  // ...
}

// 2. 创建专用 hook (hooks/crud/useNewEntity.ts)
export function useNewEntity() {
  const crud = useCrudOperations<NewEntity>({
    resourceName: 'newEntity',
    endpoints: { /* ... */ },
    // ...
  });
  
  // 添加特定业务逻辑
  return { ...crud, /* 额外方法 */ };
}

// 3. 在组件中使用
const { data, isLoading, ... } = useNewEntity();
```

## 性能优化

1. **useCallback/useMemo** - 所有回调函数都使用 useCallback 包装
2. **Optimistic Updates** - 删除操作先更新 UI，再等待 API 响应
3. **数据转换** - API 响应转换在 hook 中进行，组件直接使用转换后的数据

## 测试策略

```typescript
// Hook 测试示例
describe('useEmailNotifications', () => {
  it('should fetch mailboxes on mount', async () => {
    const { result } = renderHook(() => useEmailNotifications());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.mailboxes).toHaveLength(2);
  });
  
  it('should handle delete', async () => {
    const { result } = renderHook(() => useEmailNotifications());
    
    act(() => {
      result.current.handleDelete(1, 'test@example.com');
    });
    
    expect(result.current.deleteConfirm.isOpen).toBe(true);
  });
});
```

## 后续优化建议

1. **添加缓存层** - 使用 React Query 或 SWR 进行数据缓存
2. **错误边界** - 添加 Error Boundary 组件
3. **乐观更新** - 扩展到 create/update 操作
4. **分页支持** - 使用 useListFilters hook
5. **表单验证** - 创建 useFormValidation hook
