# Database Setup Command

PostgreSQLデータベースとPrismaをセットアップします。

## 実行手順

### 1. プロバイダー選択

ユーザーに以下のオプションを提示：

| プロバイダー | 特徴 | 推奨用途 |
|-------------|------|----------|
| **Supabase** | PostgreSQL + Auth + Realtime | フルスタック (推奨) |
| **Neon** | サーバーレスPostgreSQL | コスト最適化 |
| **Railway** | シンプルデプロイ | 小〜中規模 |
| **Docker** | ローカル開発 | 開発環境 |

### 2. セットアップガイド

#### Supabase (推奨)
```bash
# 1. https://supabase.com/dashboard でプロジェクト作成
# 2. Project Settings > Database > Connection string
# 3. Transaction pooler の URI をコピー

# 環境変数に設定
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

#### Neon
```bash
# 1. https://console.neon.tech でプロジェクト作成
# 2. Connection Details からコピー

# 環境変数に設定
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

#### Docker (ローカル)
```bash
# docker-compose.yml が既に設定済み
docker-compose up db -d

# 環境変数
DATABASE_URL="postgresql://sakaduki:sakaduki_password@localhost:5433/sakaduki_db"
```

### 3. 環境変数設定

```bash
# .env ファイルに DATABASE_URL を追加
echo 'DATABASE_URL="your-connection-string"' >> .env
```

### 4. Prisma設定

```bash
# Prisma Client生成
npx prisma generate

# データベーススキーマを同期
npx prisma db push

# (オプション) マイグレーション作成
npx prisma migrate dev --name init
```

### 5. 接続テスト

```bash
# Prisma Studioで確認
npx prisma studio
```

### 6. シードデータ投入 (オプション)

```bash
npx prisma db seed
```

## 完了確認

以下をチェック：

- [ ] DATABASE_URL が .env に設定されている
- [ ] `npx prisma generate` が成功する
- [ ] `npx prisma db push` が成功する
- [ ] Prisma Studio でテーブルが表示される

## トラブルシューティング

### 接続エラー
```bash
# SSL接続が必要な場合
DATABASE_URL="...?sslmode=require"

# 接続プーリングを使用
DATABASE_URL="...?pgbouncer=true&connection_limit=10"
```

### Prisma 7 エラー
```bash
# prisma.config.ts が必要
# datasource.url は prisma.config.ts で設定
```

## 関連エージェント

- DatabaseAgent: 詳細な設定・最適化
- InfrastructureAgent: 全体オーケストレーション
