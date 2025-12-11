# Cache Setup Command (Redis/Upstash)

Redis/Upstashキャッシュサービスをセットアップします。

## 実行手順

### 1. プロバイダー選択

| プロバイダー | 特徴 | 推奨用途 |
|-------------|------|----------|
| **Upstash** | サーバーレスRedis | Vercelデプロイ (推奨) |
| **Railway** | マネージドRedis | 簡単セットアップ |
| **Docker** | ローカルRedis | 開発環境 |

### 2. セットアップガイド

#### Upstash (推奨)
```bash
# 1. https://console.upstash.com でアカウント作成
# 2. Create Database
#    - Name: sakaduki-cache
#    - Region: Tokyo (ap-northeast-1)
#    - Type: Regional

# 3. REST API タブから接続情報をコピー
```

**環境変数設定:**
```bash
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

#### Railway
```bash
# 1. https://railway.app でプロジェクト作成
# 2. New > Database > Redis
# 3. Variables タブから REDIS_URL をコピー
```

**環境変数設定:**
```bash
REDIS_URL=redis://default:xxxxx@xxxxx.railway.app:6379
```

#### Docker (ローカル)
```bash
# docker-compose.yml に追加
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

# 起動
docker-compose up redis -d
```

**環境変数設定:**
```bash
REDIS_URL=redis://localhost:6379
```

### 3. 環境変数設定

```bash
# .env に追加 (Upstashの場合)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# または (標準Redisの場合)
REDIS_URL=redis://username:password@host:6379
```

### 4. 接続テスト

```bash
# Upstash REST API
curl -X POST $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# 標準Redis (redis-cli)
redis-cli -u $REDIS_URL ping
```

### 5. 依存パッケージインストール

```bash
# Upstash
npm install @upstash/redis

# 標準Redis
npm install ioredis
```

## 完了確認

- [ ] UPSTASH_REDIS_REST_URL / REDIS_URL が設定されている
- [ ] 接続テストが成功する
- [ ] 依存パッケージがインストールされている

## Vercel連携 (Upstash)

```bash
# Vercel Integration を使用すると自動設定
# https://vercel.com/integrations/upstash

# 1. Vercelプロジェクトで Integration を追加
# 2. Upstashデータベースを選択/作成
# 3. 環境変数が自動設定される
```

## 用途別TTL設定

| 用途 | 推奨TTL |
|------|---------|
| セッション | 7日 (604800秒) |
| APIキャッシュ | 5分〜1時間 |
| ページキャッシュ | 1時間〜24時間 |
| 一時データ | 5分 (300秒) |

## 関連エージェント

- CacheAgent: 詳細なキャッシュ戦略
- InfrastructureAgent: 全体オーケストレーション
