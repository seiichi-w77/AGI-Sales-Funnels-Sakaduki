# Infrastructure Setup Command

インフラストラクチャの不足リソースを検出し、セットアップをガイドします。

## 実行手順

### 1. 環境変数の確認

以下の環境変数をチェックし、不足しているものを報告してください：

```bash
# 必須リソース (P0)
DATABASE_URL          # PostgreSQL
STRIPE_SECRET_KEY     # Stripe
STRIPE_PUBLISHABLE_KEY
NEXTAUTH_SECRET       # NextAuth
NEXTAUTH_URL

# 推奨リソース (P1)
REDIS_URL / UPSTASH_REDIS_REST_URL  # Redis/Upstash (キャッシュ・キュー)
SMTP_HOST             # メール配信 (自前実装)
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL
LINE_CHANNEL_ACCESS_TOKEN  # LINE連携
LINE_CHANNEL_SECRET
R2_ACCESS_KEY_ID      # Cloudflare R2 (ストレージ)
R2_SECRET_ACCESS_KEY
```

### 2. .envファイルの確認

```bash
# .env.example と .env を比較
# 不足している変数を一覧表示
```

### 3. 接続テスト

設定されている各サービスへの接続をテスト：

```bash
# Database
npx prisma db pull --force

# Redis (if configured)
# Stripe (if configured)
# SMTP (if configured)
```

### 4. レポート生成

以下の形式でレポートを出力：

```
## インフラストラクチャ状態レポート

### 必須リソース (P0)
| サービス | 状態 | 環境変数 | セットアップガイド |
|----------|------|----------|-------------------|
| PostgreSQL | ✅/❌ | DATABASE_URL | /db-setup |
| Stripe | ✅/❌ | STRIPE_* | /payment-setup |
| NextAuth | ✅/❌ | NEXTAUTH_* | 自動生成 |

### 推奨リソース (P1)
| サービス | 状態 | 環境変数 | セットアップガイド |
|----------|------|----------|-------------------|
| Redis | ✅/❌ | REDIS_URL | /cache-setup |
| Email (SMTP) | ✅/❌ | SMTP_* | /email-setup |
| LINE | ✅/❌ | LINE_* | /line-setup |
| Storage | ✅/❌ | R2_* | /storage-setup |

### 推奨アクション
1. [不足リソースのセットアップ手順]
2. ...
```

### 5. Docker Compose確認

Docker環境が利用可能な場合、docker-compose.ymlの状態を確認：

```bash
docker-compose ps
docker-compose logs --tail=10
```

## セットアップ優先順位

1. **P0 (必須)**: DATABASE_URL → 認証・データ保存に必要
2. **P0 (必須)**: STRIPE_* → 決済機能に必要
3. **P0 (必須)**: NEXTAUTH_* → 認証に必要
4. **P1 (高)**: REDIS_URL → キャッシュ・メールキューに必要
5. **P1 (高)**: SMTP_* → メール配信に必要（自前実装）
6. **P1 (高)**: LINE_* → LINE連携に必要
7. **P2 (中)**: R2_* → ファイルストレージに必要

## 自前実装機能 (外部サービス不要)

以下の機能は外部APIサービスなしで実装:

| 機能 | 従来の外部サービス | 自前実装 |
|------|-------------------|---------|
| メール送信 | SendGrid | Nodemailer |
| メールテンプレート | SendGrid Templates | React Email |
| 配信キュー | SendGrid | BullMQ + Redis |
| 開封トラッキング | SendGrid Events | Tracking Pixel |
| クリック追跡 | SendGrid Events | Redirect Link |
| 配信停止 | SendGrid | Unsubscribe API |

## 関連エージェント

- InfrastructureAgent: オーケストレーション
- DatabaseAgent: PostgreSQL/Prisma設定
- CacheAgent: Redis/Upstash設定
- PaymentAgent: Stripe設定
- EmailAgent: メール配信システム構築（自前実装）
- LineAgent: LINE設定
- StorageAgent: R2/S3設定
