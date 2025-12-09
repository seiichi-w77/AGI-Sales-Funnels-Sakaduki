# AGI Sales Funnels Sakaduki - 機能要件定義書

## プロジェクト概要

本ドキュメントは、ClickFunnels 2.0のクローンアプリケーション「AGI Sales Funnels Sakaduki」の緻密で詳細な機能要件定義書です。

ClickFunnels公式ドキュメント（527件のURL）を徹底的にスクレイピングし、ローカルで同等のアプリを作成するための機能要件を定義しています。

## ドキュメント構成

| No. | ファイル名 | 機能カテゴリ | サイズ |
|-----|-----------|-------------|--------|
| 01 | [01-account-workspace.md](./01-account-workspace.md) | アカウント・ワークスペース管理 | ~83KB |
| 02 | [02-funnel-builder.md](./02-funnel-builder.md) | ファネルビルダー | ~43KB |
| 03 | [03-products-commerce.md](./03-products-commerce.md) | 商品・EC機能 | ~92KB |
| 04 | [04-email-broadcast.md](./04-email-broadcast.md) | メール・ブロードキャスト | ~66KB |
| 05 | [05-courses-lms.md](./05-courses-lms.md) | コース・LMS機能 | ~69KB |
| 06 | [06-workflows-automation.md](./06-workflows-automation.md) | ワークフロー・自動化 | ~49KB |
| 07 | [07-contacts.md](./07-contacts.md) | コンタクト管理 | ~48KB |
| 08 | [08-site-page-editor.md](./08-site-page-editor.md) | サイト・ページエディター | ~67KB |
| 09 | [09-affiliate.md](./09-affiliate.md) | アフィリエイト機能 | ~69KB |
| 10 | [10-analytics.md](./10-analytics.md) | アナリティクス | ~20KB |
| 11 | [11-other-features.md](./11-other-features.md) | その他機能 | ~42KB |

### LINE コミュニケーション自動化（UTAGE機能）

| No. | ファイル名 | 機能カテゴリ | サイズ |
|-----|-----------|-------------|--------|
| 12 | [12-line-basic.md](./12-line-basic.md) | LINE公式アカウント連携・基本設定 | ~93KB |
| 13 | [13-line-messaging.md](./13-line-messaging.md) | LINEメッセージ配信 | ~45KB |
| 14 | [14-line-richmenu-automation.md](./14-line-richmenu-automation.md) | LINEリッチメニュー・自動応答 | ~35KB |
| 15 | [15-line-friends-chat.md](./15-line-friends-chat.md) | LINE友だち・チャット管理 | ~58KB |
| 16 | [16-line-security-analytics.md](./16-line-security-analytics.md) | LINEセキュリティ・分析 | ~55KB |
| 17 | [17-scenario-step.md](./17-scenario-step.md) | シナリオ・ステップ配信 | ~54KB |
| 18 | [18-automation-integration.md](./18-automation-integration.md) | 自動化アクション・外部連携 | ~59KB |

### グローバル対応

| No. | ファイル名 | 機能カテゴリ | サイズ |
|-----|-----------|-------------|--------|
| 19 | [19-i18n-multilingual.md](./19-i18n-multilingual.md) | 多言語対応（日本語/英語） | ~15KB |

**合計ドキュメントサイズ**: 約1,062KB（19ファイル）

---

## 機能カテゴリ別概要

### 1. アカウント・ワークスペース管理 (01-account-workspace.md)

**主要機能:**
- プロフィール設定・カスタマイズ
- パスワード管理・リセット
- 二要素認証（2FA）
- サブスクリプション管理
- 請求・インボイス管理
- ワークスペース切り替え
- チーム・コラボレーター管理
- 監査ログ

### 2. ファネルビルダー (02-funnel-builder.md)

**主要機能:**
- ファネル作成・管理
- ファネルステップ管理
- 6種類のファネルタイプ対応
  - Lead Magnet Funnel
  - Book Funnel
  - Cart Funnel
  - Webinar Funnel
  - VSL Funnel
  - Storefront Funnel
- A/Bスプリットテスト
- ファネル共有・クローン
- ファネルアナリティクス

### 3. 商品・EC機能 (03-products-commerce.md)

**主要機能:**
- グローバル商品管理
- 価格設定（単発・サブスクリプション・分割払い）
- 商品バリアント
- 在庫管理
- ショッピングカート
- チェックアウト
- 注文管理
- サブスクリプション管理
- 決済ゲートウェイ連携（Stripe、PayPal）
- 税金計算
- 請求書管理
- フルフィルメント
- 割引・クーポン

### 4. メール・ブロードキャスト (04-email-broadcast.md)

**主要機能:**
- ブロードキャスト作成・送信
- オーディエンス設定
- メールデザイン（ドラッグ&ドロップエディター）
- パーソナライゼーション（マージタグ）
- テスト送信
- スケジュール送信
- パフォーマンス分析
- SMTP連携（SendGrid、Mailgun等）
- メールドメイン認証（SPF、DKIM、DMARC）
- 配信停止管理

### 5. コース・LMS機能 (05-courses-lms.md)

**主要機能:**
- コース作成・管理
- モジュール・レッスン管理
- コーステーマカスタマイズ
- 動画ホスティング（3GBまで）
- ドリップコンテンツ
- 受講者登録管理
- 進捗トラッキング
- 完了証明書
- コースメール自動化

### 6. ワークフロー・自動化 (06-workflows-automation.md)

**主要機能:**
- ワークフロー作成・管理
- トリガー設定（オプトイン、購入、ページビュー等）
- 12種類以上のワークフローステップ
  - メール送信
  - 遅延
  - 条件分岐
  - タグ付け
  - Webhook
  - 他ワークフロー起動
- クイックアクション
- ダブルオプトイン実装
- カート放棄シーケンス

### 7. コンタクト管理 (07-contacts.md)

**主要機能:**
- コンタクト一覧・検索
- コンタクトプロフィール
- カスタム属性
- タグ管理
- セグメント（スマートリスト）
- インポート/エクスポート（CSV）
- 一括アクション
- アクティビティトラッキング

### 8. サイト・ページエディター (08-site-page-editor.md)

**主要機能:**
- ドラッグ&ドロップページエディター
- セクション・行・カラム・要素
- コンテンツ要素（ヘッドライン、ボタン、画像、動画等）
- フォーム要素（入力、チェックボックス、セレクト等）
- ポップアップ
- ヘッダー・フッター管理
- テーマ・スタイルシステム
- ブログ機能
- ドメイン接続
- レスポンシブデザイン
- カスタムCSS/JavaScript

### 9. アフィリエイト機能 (09-affiliate.md)

**主要機能:**
- アフィリエイトプログラム作成
- アフィリエイト登録・認証
- コミッションプラン（Tier 1 & Tier 2）
- アフィリエイトキャンペーン
- 商品コミッション設定
- ペイアウト管理
- アフィリエイト資料提供
- カスタムアフィリエイトコード
- クリック・コンバージョントラッキング
- 45日間Cookie追跡

### 10. アナリティクス (10-analytics.md)

**主要機能:**
- アナリティクスダッシュボード
- ファネルアナリティクス
- レポート機能
- ライブビュー
- Google Analytics 4連携
- Meta Pixel連携
- メールブロードキャスト分析

### 11. その他機能 (11-other-features.md)

**主要機能:**
- カウントダウンタイマー
- 予約・アポイントメント
- コミュニティ
- MessageHub（マルチチャネル通信）
- パイプライン（CRM）
- カスタマーセンター
- API

---

## LINE コミュニケーション自動化（UTAGE機能）

### 12. LINE公式アカウント連携・基本設定 (12-line-basic.md)

**主要機能:**
- LINE公式アカウント作成・連携
- LINE Developers管理者権限設定
- Messaging API / LINE Login設定
- メッセージ通数カウント
- テスト送信先設定
- LINE登録ページ・QRコード

### 13. LINEメッセージ配信 (13-line-messaging.md)

**主要機能:**
- 7種類のメッセージタイプ（テキスト、画像、ボタン、カルーセル、音声、動画、スタンプ）
- LINE一斉送信
- LINEステップ配信
- LINEリマインダ配信
- LINEテンプレート機能
- 配信エラー・再送処理
- LINEアクション登録

### 14. LINEリッチメニュー・自動応答 (14-line-richmenu-automation.md)

**主要機能:**
- リッチメニュー作成・設定
- リッチメニュー自動切替
- リッチメニュー手動変更
- リッチメニュー非表示化
- タップ数分析
- LINE自動応答設定
- カスタム送信者設定

### 15. LINE友だち・チャット管理 (15-line-friends-chat.md)

**主要機能:**
- LINE友だち一覧
- 1to1チャット（リアルタイム）
- 友だち詳細情報
- メール・LINEアカウント統合
- LINE通知設定（Chatwork、Slack、Discord）
- 他システムからの友だち移行

### 16. LINEセキュリティ・分析 (16-line-security-analytics.md)

**主要機能:**
- LINE公式アカウントBAN検知
- メッセージ通数上限アラート
- アカウントBAN時切替（β版）
- 登録経路分析
- LINEログイン認証
- Meta コンバージョンAPI連携

### 17. シナリオ・ステップ配信 (17-scenario-step.md)

**主要機能:**
- シナリオグループ管理
- シナリオ作成・設定
- シナリオ読者管理
- メール/LINEステップ配信
- リマインダ配信
- 配信条件設定
- 置き換え文字（マージタグ）

### 18. 自動化アクション・外部連携 (18-automation-integration.md)

**主要機能:**
- シナリオアクション設定
- リンククリック時アクション
- ラベル付与・解除
- 別シナリオ登録・停止
- Googleスプレッドシート連携
- Webhook連携（GET/POST）
- 複数アクション同時実行

### 19. 多言語対応 (19-i18n-multilingual.md)

**主要機能:**
- 言語切替UI（日本語/英語）
- 翻訳ファイル管理（JSON構造）
- Next.js + next-intl実装
- ユーザー言語設定保存
- URLベースのロケール管理
- 動的コンテンツ翻訳
- 日付・通貨フォーマット

---

## 技術スタック推奨

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: shadcn/ui
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod

### バックエンド
- **フレームワーク**: NestJS / Node.js
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **キャッシュ**: Redis
- **ストレージ**: AWS S3 / Cloudflare R2
- **メール**: SendGrid / Mailgun
- **決済**: Stripe

### インフラ
- **ホスティング**: Vercel / AWS
- **CDN**: Cloudflare
- **モニタリング**: Datadog / Sentry

---

## 実装優先順位

### Phase 1: MVP（基盤機能）
1. アカウント・認証システム
2. ワークスペース管理
3. 基本的なページエディター
4. シンプルなファネル作成
5. 商品・決済（Stripe）

### Phase 2: コア機能
1. 完全なファネルビルダー
2. メール・ブロードキャスト
3. コンタクト管理
4. ワークフロー自動化
5. 注文管理

### Phase 3: 拡張機能
1. コース・LMS
2. アフィリエイト
3. アナリティクス
4. コミュニティ
5. MessageHub

### Phase 4: 高度な機能
1. A/Bテスト
2. 高度なワークフロー
3. 予約システム
4. パイプライン（CRM）
5. API公開

---

## 参考資料

- ClickFunnels公式ドキュメント: https://support.myclickfunnels.com/docs/
- ClickFunnels機能ページ: https://www.clickfunnels.com/features/
- UTAGE公式ヘルプ: https://help.utage-system.com/knowledge-allpages

---

## ドキュメント情報

- **作成日**: 2025年12月9日
- **更新日**: 2025年12月9日（多言語対応追加）
- **スクレイピング対象URL数**: 527件（ClickFunnels）+ UTAGE LINE関連URL
- **ドキュメント総サイズ**: 約1,062KB（19ファイル）
- **生成方法**: 並列エージェントによる自動スクレイピング＆要件定義

---

**注意**: 本ドキュメントは、ClickFunnels 2.0の機能を参考に作成されています。実際の開発にあたっては、著作権・知的財産権に十分配慮してください。
