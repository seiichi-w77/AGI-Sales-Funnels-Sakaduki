# LINE Setup Command

LINE公式アカウント連携をセットアップします。

## 実行手順

### 1. LINE公式アカウント作成

```bash
# https://manager.line.biz でアカウント作成
# - 無料プラン (メッセージ数制限あり)
# - ライトプラン / スタンダードプラン (有料)
```

### 2. LINE Developers設定

```bash
# https://developers.line.biz でログイン
# 1. プロバイダー作成 (初回のみ)
# 2. Messaging APIチャンネル作成
```

### 3. Messaging API設定

```bash
# チャンネル基本設定:
# - チャンネル名: [アプリ名]
# - チャンネル説明: [説明]
# - 業種: [該当業種]

# Messaging API設定タブ:
# - Webhook URL: https://your-domain.com/api/webhooks/line
# - Webhookの利用: ON
# - 応答メッセージ: OFF (Bot側で処理)
# - あいさつメッセージ: 任意

# トークン発行:
# - チャンネルアクセストークン (長期) を発行
```

### 4. 環境変数設定

```bash
# .env に追加
LINE_CHANNEL_ACCESS_TOKEN=xxxxx  # 長期トークン
LINE_CHANNEL_SECRET=xxxxx        # チャンネルシークレット
```

### 5. LINE Login設定 (オプション)

```bash
# LINE Developersで新しいチャンネル作成 (LINE Login)
# 1. チャンネルタイプ: LINE Login
# 2. コールバックURL: https://your-domain.com/api/auth/callback/line
# 3. 同意画面設定:
#    - メールアドレス取得: ON
#    - プロフィール情報: ON

# 環境変数に追加
LINE_LOGIN_CHANNEL_ID=xxxxx
LINE_LOGIN_CHANNEL_SECRET=xxxxx
```

### 6. ローカル開発用 (ngrok)

```bash
# ngrokでローカルサーバーを公開
ngrok http 3001

# 表示されるURLをWebhook URLに設定
# https://xxxx.ngrok.io/api/webhooks/line
```

### 7. テスト

```bash
# 1. LINE公式アカウントを友だち追加
# 2. メッセージを送信
# 3. Webhookが正しく受信されることを確認
```

## 完了確認

- [ ] LINE_CHANNEL_ACCESS_TOKEN が設定されている
- [ ] LINE_CHANNEL_SECRET が設定されている
- [ ] Webhook URLが設定されている
- [ ] 友だち追加でWebhookが動作する

## リッチメニュー設定 (オプション)

```bash
# LINE Official Account Manager
# ホーム > リッチメニュー > 作成

# または LINE Bot SDK で作成
# (詳細は line-agent.md を参照)
```

## メッセージ通数の確認

```bash
# LINE Official Account Manager
# 分析 > メッセージ配信

# 注意: 無料プランは月200通まで
# 超過時はライトプラン以上が必要
```

## 関連エージェント

- LineAgent: 詳細なLINE連携設定
- InfrastructureAgent: 全体オーケストレーション
