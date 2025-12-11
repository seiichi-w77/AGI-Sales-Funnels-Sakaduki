# Payment Setup Command (Stripe)

Stripe決済連携をセットアップします。

## 実行手順

### 1. Stripeアカウント確認

```bash
# https://dashboard.stripe.com でアカウント作成/ログイン
# ビジネス情報の入力が必要
```

### 2. APIキー取得

```bash
# Dashboard > Developers > API keys
# - Publishable key: pk_test_xxxxx (本番: pk_live_xxxxx)
# - Secret key: sk_test_xxxxx (本番: sk_live_xxxxx)
```

### 3. 環境変数設定

```bash
# .env に追加
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Webhook設定後
```

### 4. Webhook設定

```bash
# Dashboard > Developers > Webhooks > Add endpoint

# エンドポイントURL (本番環境)
# https://your-domain.com/api/webhooks/stripe

# 必要なイベント:
# - checkout.session.completed
# - payment_intent.succeeded
# - payment_intent.payment_failed
# - customer.subscription.created
# - customer.subscription.updated
# - customer.subscription.deleted
# - invoice.paid
# - invoice.payment_failed
```

### 5. ローカル開発用 (Stripe CLI)

```bash
# Stripe CLIインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhook転送を開始
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# 表示されるWebhook Secretを .env に設定
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 6. テスト

```bash
# テストイベント送信
stripe trigger payment_intent.succeeded

# テストカード番号
# 成功: 4242424242424242
# 拒否: 4000000000000002
```

## 完了確認

- [ ] STRIPE_PUBLISHABLE_KEY が設定されている
- [ ] STRIPE_SECRET_KEY が設定されている
- [ ] STRIPE_WEBHOOK_SECRET が設定されている
- [ ] Stripe CLIでWebhook転送が動作する

## 商品・価格の作成 (オプション)

```bash
# Stripeダッシュボードで商品を作成
# Products > Add product

# または Stripe CLI で作成
stripe products create --name "プラン名"
stripe prices create --product prod_xxx --unit-amount 9900 --currency jpy
```

## 関連エージェント

- PaymentAgent: 詳細な決済フロー実装
- InfrastructureAgent: 全体オーケストレーション
