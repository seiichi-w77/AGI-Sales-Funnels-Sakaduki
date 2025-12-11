# Storage Setup Command (Cloudflare R2 / AWS S3)

ファイルストレージサービスをセットアップします。

## 実行手順

### 1. プロバイダー選択

| プロバイダー | 特徴 | 推奨用途 |
|-------------|------|----------|
| **Cloudflare R2** | S3互換、無料枠大 | コスト最適化 (推奨) |
| **AWS S3** | 標準的なオブジェクトストレージ | 既存AWSインフラ |
| **Vercel Blob** | Vercel統合 | シンプルな用途 |

### 2. セットアップガイド

#### Cloudflare R2 (推奨)
```bash
# 1. https://dash.cloudflare.com でログイン
# 2. R2 > Create bucket
#    - Name: sakaduki-storage
#    - Location: Auto

# 3. Manage R2 API Tokens > Create API Token
#    - Permissions: Object Read & Write
#    - Specify bucket(s): sakaduki-storage

# 4. トークン情報を保存
#    - Access Key ID
#    - Secret Access Key
#    - Account ID (URLから取得)
```

**環境変数設定:**
```bash
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ACCOUNT_ID=xxxxx
R2_BUCKET_NAME=sakaduki-storage
R2_PUBLIC_URL=https://storage.yourdomain.com  # カスタムドメイン設定後
```

#### AWS S3
```bash
# 1. AWS Console > S3 > Create bucket
#    - Name: sakaduki-storage
#    - Region: ap-northeast-1

# 2. IAM > Users > Create User
#    - Permissions: AmazonS3FullAccess (または制限付き)
#    - Create access key
```

**環境変数設定:**
```bash
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=ap-northeast-1
S3_BUCKET_NAME=sakaduki-storage
```

### 3. カスタムドメイン設定 (R2)

```bash
# R2 バケット設定 > Custom Domains
# 1. "Connect Domain" をクリック
# 2. storage.yourdomain.com を入力
# 3. DNSレコードが自動設定される (Cloudflare DNS使用時)
```

### 4. CORS設定

#### R2
```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

#### S3
```bash
aws s3api put-bucket-cors --bucket sakaduki-storage --cors-configuration file://cors.json
```

### 5. 依存パッケージインストール

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 6. 接続テスト

```bash
# ファイル一覧取得テスト
# (アプリ内でS3Clientを使用)
```

## 完了確認

- [ ] R2/S3のバケットが作成されている
- [ ] APIキーが設定されている
- [ ] CORS設定が完了している
- [ ] 依存パッケージがインストールされている

## ディレクトリ構造

```
bucket/
├── images/
│   ├── products/     # 商品画像
│   ├── avatars/      # プロフィール画像
│   └── content/      # コンテンツ画像
├── videos/
│   ├── courses/      # コース動画
│   └── uploads/      # ユーザーアップロード
├── documents/
│   ├── invoices/     # 請求書PDF
│   └── exports/      # エクスポートファイル
└── public/           # 公開ファイル
```

## 料金比較

| プロバイダー | ストレージ | 転送 | リクエスト |
|-------------|-----------|------|-----------|
| R2 | $0.015/GB/月 | 無料 | $0.36/100万 |
| S3 | $0.025/GB/月 | $0.09/GB | $0.0004/1000 |

## 関連エージェント

- StorageAgent: 詳細なストレージ管理
- InfrastructureAgent: 全体オーケストレーション
