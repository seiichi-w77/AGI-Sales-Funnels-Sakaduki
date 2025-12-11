# Email Setup Command (Self-Hosted)

自前でメール配信システムをセットアップします。SendGrid等の外部サービスは不要です。

## 実行手順

### 1. SMTP プロバイダー選択

| プロバイダー | 無料枠 | 推奨用途 |
|-------------|--------|----------|
| **Gmail SMTP** | 500/日 | 開発・テスト |
| **AWS SES** | 62,000/月 | 本番（大量配信） |
| **Resend** | 3,000/月 | 本番（シンプル） |
| **独自SMTP** | 無制限 | 完全制御 |

### 2. セットアップガイド

#### Gmail SMTP (開発用・推奨)
```bash
# 1. Googleアカウントで2段階認証を有効化
#    https://myaccount.google.com/security

# 2. アプリパスワードを生成
#    https://myaccount.google.com/apppasswords
#    - アプリ: メール
#    - デバイス: その他 (カスタム名)

# .env に追加
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME="AGI Sales Funnels"
```

#### AWS SES (本番用)
```bash
# 1. AWS SESコンソールでドメイン検証
#    https://console.aws.amazon.com/ses/

# 2. 本番アクセスをリクエスト (サンドボックス解除)
#    Account Dashboard > Request production access

# .env に追加
AWS_SES_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME="AGI Sales Funnels"
```

#### Resend (シンプル)
```bash
# 1. https://resend.com でアカウント作成
# 2. ドメイン検証
# 3. APIキーを取得

# .env に追加
RESEND_API_KEY=re_xxxxx
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME="AGI Sales Funnels"
```

### 3. 依存パッケージインストール

```bash
npm install nodemailer @react-email/components @react-email/render bullmq
npm install -D @types/nodemailer
```

### 4. ディレクトリ構造作成

```bash
mkdir -p lib/email/templates
```

以下のファイルを作成:
- `lib/email/transporter.ts` - SMTP送信設定
- `lib/email/renderer.ts` - テンプレートレンダラー
- `lib/email/queue.ts` - 配信キュー
- `lib/email/broadcast.ts` - 一斉配信
- `lib/email/templates/` - メールテンプレート

### 5. データベーススキーマ追加

```bash
# prisma/schema.prisma に EmailLog, EmailClick, Broadcast モデルを追加
# (詳細は email-agent.md を参照)

npx prisma db push
```

### 6. 接続テスト

```bash
# テストメール送信
npm run email:test

# または
npx ts-node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.verify().then(() => console.log('SMTP OK')).catch(console.error);
"
```

## 完了確認

- [ ] SMTP環境変数が設定されている
- [ ] 依存パッケージがインストールされている
- [ ] テストメールが送信できる
- [ ] データベーススキーマが追加されている

## 実装される機能

| 機能 | 説明 |
|------|------|
| メール送信 | Nodemailerによる直接送信 |
| テンプレート | React Emailでリッチなメール作成 |
| 配信キュー | BullMQ + Redisでバックグラウンド処理 |
| 開封トラッキング | Tracking Pixelで開封検知 |
| クリック追跡 | リダイレクトリンクでクリック計測 |
| 配信停止 | Unsubscribe API & ページ |
| ブロードキャスト | タグ/オーディエンスベースの一斉配信 |
| スケジュール送信 | 遅延ジョブで予約配信 |

## トラブルシューティング

### Gmail: Less secure app access
```bash
# Googleアカウントで「安全性の低いアプリのアクセス」は不要
# 代わりにアプリパスワードを使用してください
```

### 送信エラー: Connection refused
```bash
# ポートを確認 (587 または 465)
# ファイアウォール設定を確認
```

### AWS SES: Email address not verified
```bash
# サンドボックスモードでは検証済みメールのみ送信可能
# 本番アクセスをリクエストするか、送信先を検証
```

## 関連エージェント

- EmailAgent: 詳細な実装ガイド
- CacheAgent: Redis Queue設定
- InfrastructureAgent: 全体オーケストレーション
