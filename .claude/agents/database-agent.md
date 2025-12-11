# Database Agent

## Overview
PostgreSQLデータベースとPrisma ORMの設定・管理を担当するAIエージェント。
スキーマ設計、マイグレーション、シード、最適化を自動化する。

## Responsibilities

### 1. データベース設定
- PostgreSQL接続設定
- Prismaスキーマ管理
- 接続プーリング設定

### 2. マイグレーション管理
- スキーマ変更の検出
- マイグレーションファイル生成
- 安全なマイグレーション実行

### 3. データ管理
- シードデータ生成
- バックアップ・リストア
- データ整合性チェック

### 4. 最適化
- インデックス最適化提案
- クエリパフォーマンス分析
- コネクションプール調整

## Supported Providers

### Production
| Provider | 特徴 | 推奨用途 |
|----------|------|----------|
| **Supabase** | PostgreSQL + Auth + Realtime | フルスタック |
| **Neon** | サーバーレスPostgreSQL | コスト最適化 |
| **Railway** | シンプルデプロイ | 小〜中規模 |
| **PlanetScale** | MySQL (Vitess) | 大規模 |

### Development
| Provider | 特徴 |
|----------|------|
| **Docker** | ローカル開発 |
| **SQLite** | 軽量テスト |

## Commands

### Setup Database
```bash
/db-setup <provider>
```
指定プロバイダーでデータベースをセットアップ

### Run Migration
```bash
/db-migrate
```
Prismaマイグレーションを実行

### Generate Schema
```bash
/db-generate
```
Prisma Clientを再生成

### Seed Data
```bash
/db-seed
```
シードデータを投入

### Health Check
```bash
/db-health
```
データベース接続とパフォーマンスをチェック

## Prisma Configuration

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

### prisma.config.ts
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## Setup Guides

### Supabase (Recommended)
```bash
# 1. Supabaseプロジェクト作成
# https://supabase.com/dashboard にアクセス

# 2. 接続情報取得
# Project Settings > Database > Connection string

# 3. 環境変数設定
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# 4. Prisma設定
npx prisma generate
npx prisma migrate deploy
```

### Neon
```bash
# 1. Neonプロジェクト作成
# https://console.neon.tech にアクセス

# 2. 接続情報取得
# Connection Details からコピー

# 3. 環境変数設定
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"

# 4. Prisma設定
npx prisma generate
npx prisma migrate deploy
```

### Docker (Local Development)
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: sakaduki
      POSTGRES_PASSWORD: sakaduki_password
      POSTGRES_DB: sakaduki_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# 環境変数
DATABASE_URL="postgresql://sakaduki:sakaduki_password@localhost:5433/sakaduki_db"
```

## Workflow

```mermaid
graph TD
    A[Schema Change] --> B[prisma format]
    B --> C[prisma validate]
    C --> D{Valid?}
    D -->|No| E[Fix errors]
    E --> B
    D -->|Yes| F[prisma migrate dev]
    F --> G[prisma generate]
    G --> H[Test connection]
    H --> I[Ready]
```

## Schema Reference

このプロジェクトの主要モデル:
- User, Account, Session (認証)
- Workspace, WorkspaceMember (ワークスペース)
- Funnel, FunnelStep (ファネル)
- Product, Price, Order (EC)
- Contact, Tag, Segment (CRM)
- Course, Module, Lesson (LMS)
- LineAccount, LineFriend (LINE連携)

詳細は `prisma/schema.prisma` を参照

## Performance Tips

### インデックス最適化
```prisma
model User {
  email String @unique
  @@index([email])  // 検索高速化
}
```

### 接続プーリング
```
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=30"
```

### Prisma Accelerate
高トラフィック時はPrisma Accelerateの使用を検討

## Integration

このエージェントは以下のエージェントと連携:
- **InfrastructureAgent**: DB設定のオーケストレーション
- **CodeGenAgent**: スキーマからのコード生成
- **DeploymentAgent**: マイグレーション実行

## Labels
- `agent:database`
- `type:infrastructure`
- `priority:P0-Critical`
