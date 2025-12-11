# Cache Agent (Redis / Upstash)

## Overview
キャッシュ・セッション管理を担当するAIエージェント。
Redis/Upstashを使用したデータキャッシング、セッション管理、ジョブキューを自動化する。

## Responsibilities

### 1. Redis設定
- Upstash/Redis接続設定
- 接続プーリング
- クラスター設定

### 2. キャッシュ管理
- データキャッシング
- キャッシュ無効化
- TTL管理

### 3. セッション管理
- ユーザーセッション
- 認証トークン
- レート制限

### 4. ジョブキュー
- バックグラウンドジョブ
- 遅延実行
- 再試行処理

## Required Environment Variables

```bash
# Upstash Redis (Recommended)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Standard Redis (Alternative)
REDIS_URL=redis://username:password@host:6379
```

## Commands

### Setup Cache
```bash
/cache-setup
```
Redis接続をセットアップ

### Test Connection
```bash
/cache-ping
```
接続テストを実行

### Clear Cache
```bash
/cache-clear [pattern]
```
キャッシュをクリア

### Stats
```bash
/cache-stats
```
キャッシュ統計を表示

## Setup Guide

### Upstash (Recommended)

#### 1. アカウント作成
```bash
# https://console.upstash.com にアクセス
# GitHubまたはGoogleでサインアップ
```

#### 2. データベース作成
```bash
# Create Database
# Name: sakaduki-cache
# Region: Tokyo (ap-northeast-1)
# Type: Regional (低コスト) or Global (低レイテンシー)
```

#### 3. 接続情報取得
```bash
# REST API タブから:
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN

# または Redis CLI タブから:
# - REDIS_URL
```

### Docker (Local Development)

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

```bash
REDIS_URL=redis://localhost:6379
```

## Implementation

### Upstash REST Client (Recommended for Serverless)
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 基本操作
await redis.set('key', 'value');
await redis.set('key', 'value', { ex: 3600 }); // TTL: 1時間
const value = await redis.get('key');
await redis.del('key');
```

### ioredis Client (Standard Redis)
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// 基本操作
await redis.set('key', 'value');
await redis.setex('key', 3600, 'value'); // TTL: 1時間
const value = await redis.get('key');
await redis.del('key');
```

### Cache Wrapper
```typescript
interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[];
}

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data as T | null;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (options?.ttl) {
      await this.redis.set(key, value, { ex: options.ttl });
    } else {
      await this.redis.set(key, value);
    }

    // タグベースのキャッシュ無効化用
    if (options?.tags) {
      for (const tag of options.tags) {
        await this.redis.sadd(`tag:${tag}`, key);
      }
    }
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.redis.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      await this.redis.del(`tag:${tag}`);
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }
}

export const cache = new CacheService();
```

### Usage Examples

#### API Response Caching
```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await cache.getOrSet(
    'products:all',
    async () => prisma.product.findMany(),
    { ttl: 300, tags: ['products'] } // 5分キャッシュ
  );

  return NextResponse.json(products);
}

// 商品更新時にキャッシュ無効化
async function updateProduct(id: string, data: any) {
  await prisma.product.update({ where: { id }, data });
  await cache.invalidateByTag('products');
}
```

#### Session Management
```typescript
interface Session {
  userId: string;
  email: string;
  createdAt: number;
}

async function createSession(userId: string, email: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    userId,
    email,
    createdAt: Date.now(),
  };

  await redis.set(`session:${sessionId}`, JSON.stringify(session), {
    ex: 60 * 60 * 24 * 7, // 7日間
  });

  return sessionId;
}

async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}

async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
```

#### Rate Limiting
```typescript
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
}

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;

  const count = await redis.incr(windowKey);

  if (count === 1) {
    await redis.expire(windowKey, windowSeconds);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: (Math.floor(now / windowSeconds) + 1) * windowSeconds,
  };
}

// 使用例: 1分間に10リクエストまで
const result = await checkRateLimit(`user:${userId}`, 10, 60);
if (!result.allowed) {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    },
  });
}
```

### Job Queue (Upstash QStash)
```typescript
import { Client } from '@upstash/qstash';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// ジョブをキューに追加
await qstash.publishJSON({
  url: 'https://your-domain.com/api/jobs/send-email',
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
  },
  delay: 60, // 60秒後に実行
  retries: 3,
});

// ジョブハンドラー
// app/api/jobs/send-email/route.ts
export async function POST(req: NextRequest) {
  // QStash署名を検証
  const signature = req.headers.get('upstash-signature');
  // ...

  const { to, subject } = await req.json();
  await sendEmail(to, subject);

  return new Response('OK');
}
```

## Cache Strategies

### Cache-Aside (Lazy Loading)
```typescript
async function getData(id: string) {
  // 1. キャッシュをチェック
  const cached = await cache.get(`data:${id}`);
  if (cached) return cached;

  // 2. DBから取得
  const data = await prisma.data.findUnique({ where: { id } });

  // 3. キャッシュに保存
  await cache.set(`data:${id}`, data, { ttl: 3600 });

  return data;
}
```

### Write-Through
```typescript
async function updateData(id: string, updates: any) {
  // 1. DBを更新
  const data = await prisma.data.update({
    where: { id },
    data: updates,
  });

  // 2. キャッシュも同時に更新
  await cache.set(`data:${id}`, data, { ttl: 3600 });

  return data;
}
```

### Cache Invalidation
```typescript
async function deleteData(id: string) {
  // 1. DBから削除
  await prisma.data.delete({ where: { id } });

  // 2. キャッシュを削除
  await cache.invalidate(`data:${id}`);
}
```

## Best Practices

### キー命名規則
```typescript
// パターン: {entity}:{id}:{field}
const key = `user:${userId}:profile`;
const key = `product:${productId}:inventory`;
const key = `session:${sessionId}`;
```

### TTL設定
| データタイプ | 推奨TTL |
|------------|---------|
| セッション | 7日 |
| API応答 | 5分〜1時間 |
| 静的データ | 24時間 |
| 一時データ | 5分 |

### メモリ管理
- maxmemory-policy: allkeys-lru
- 定期的な不要キーの削除
- キーのTTL設定を必須に

## Workflow

```mermaid
graph TD
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Fetch from DB]
    D --> E[Store in Cache]
    E --> F[Return Data]
```

## Integration

このエージェントは以下のエージェントと連携:
- **InfrastructureAgent**: 初期設定のオーケストレーション
- **DatabaseAgent**: クエリキャッシング
- **AuthAgent**: セッション管理

## Labels
- `agent:cache`
- `type:infrastructure`
- `priority:P1-High`
