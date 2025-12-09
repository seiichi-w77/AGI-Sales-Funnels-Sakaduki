# AGI Sales Funnels Sakaduki - Implementation Project Plan

## Project Overview

ClickFunnels 2.0 + UTAGE LINE機能のフルクローン実装プロジェクト

**重要原則**: モックアプリ禁止。すべてのボタン・メニューに完全な機能を実装する。

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl

### Backend
- **Framework**: Next.js API Routes + Server Actions
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: Cloudflare R2 / AWS S3
- **Email**: SendGrid
- **Payment**: Stripe

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Cloudflare
- **Monitoring**: Sentry

---

## Implementation Phases

### Phase 1: Core Infrastructure (Issues #31-#40)
基盤構築 - 認証、DB、基本UI

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #31 | プロジェクト初期化 (Next.js 14 + TypeScript + Tailwind) | - | P0 |
| #32 | データベース設計 + Prisma Schema | #31 | P0 |
| #33 | 認証システム (NextAuth.js + 2FA) | #32 | P0 |
| #34 | ワークスペース管理 | #33 | P0 |
| #35 | ユーザープロフィール | #33 | P1 |
| #36 | チーム・コラボレーター管理 | #34 | P1 |
| #37 | 監査ログシステム | #33 | P2 |
| #38 | サブスクリプション・請求 (Stripe) | #33 | P1 |
| #39 | 共通UIコンポーネント (shadcn/ui) | #31 | P0 |
| #40 | 多言語対応 (next-intl) | #31 | P1 |

### Phase 2: Page Builder & Funnels (Issues #41-#55)
ページエディター・ファネル構築

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #41 | ドラッグ&ドロップエディター基盤 | #39 | P0 |
| #42 | セクション・行・カラムシステム | #41 | P0 |
| #43 | コンテンツ要素 (見出し、テキスト、画像、動画) | #42 | P0 |
| #44 | フォーム要素 (入力、セレクト、チェックボックス) | #42 | P0 |
| #45 | ボタン・リンク要素 | #42 | P0 |
| #46 | ポップアップシステム | #42 | P1 |
| #47 | ヘッダー・フッター管理 | #42 | P1 |
| #48 | テーマ・スタイルシステム | #41 | P1 |
| #49 | ファネル作成・管理 | #42 | P0 |
| #50 | ファネルステップ管理 | #49 | P0 |
| #51 | 6種類ファネルテンプレート | #50 | P1 |
| #52 | A/Bスプリットテスト | #50 | P2 |
| #53 | ファネル共有・クローン | #49 | P2 |
| #54 | ドメイン接続 | #49 | P1 |
| #55 | カスタムCSS/JavaScript | #41 | P2 |

### Phase 3: Products & Commerce (Issues #56-#70)
商品・EC・決済機能

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #56 | 商品管理 (CRUD) | #32 | P0 |
| #57 | 価格設定 (単発/サブスク/分割) | #56 | P0 |
| #58 | 商品バリアント | #56 | P1 |
| #59 | 在庫管理 | #56 | P1 |
| #60 | ショッピングカート | #56 | P0 |
| #61 | チェックアウトフロー | #60, #38 | P0 |
| #62 | 注文管理 | #61 | P0 |
| #63 | サブスクリプション管理 | #57, #38 | P1 |
| #64 | 税金計算 | #61 | P1 |
| #65 | 請求書生成・管理 | #62 | P1 |
| #66 | フルフィルメント | #62 | P2 |
| #67 | 割引・クーポン | #60 | P1 |
| #68 | PayPal連携 | #61 | P2 |
| #69 | Order Bump | #61 | P1 |
| #70 | Upsell/Downsell | #61 | P1 |

### Phase 4: Contacts & CRM (Issues #71-#80)
コンタクト管理・CRM

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #71 | コンタクト一覧・検索 | #32 | P0 |
| #72 | コンタクトプロフィール | #71 | P0 |
| #73 | カスタム属性 | #71 | P1 |
| #74 | タグ管理 | #71 | P0 |
| #75 | セグメント (スマートリスト) | #74 | P1 |
| #76 | CSV インポート/エクスポート | #71 | P1 |
| #77 | 一括アクション | #71 | P1 |
| #78 | アクティビティトラッキング | #72 | P1 |
| #79 | パイプライン (CRM) | #71 | P2 |
| #80 | カスタマーセンター | #72 | P2 |

### Phase 5: Email & Automation (Issues #81-#95)
メール・ワークフロー自動化

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #81 | メールテンプレートエディター | #41 | P0 |
| #82 | ブロードキャスト作成・送信 | #81, #71 | P0 |
| #83 | オーディエンス設定 | #82, #75 | P1 |
| #84 | マージタグ (パーソナライゼーション) | #82 | P1 |
| #85 | テスト送信 | #82 | P1 |
| #86 | スケジュール送信 | #82 | P1 |
| #87 | SMTP連携 (SendGrid) | #82 | P0 |
| #88 | メールドメイン認証 | #87 | P1 |
| #89 | 配信停止管理 | #82 | P0 |
| #90 | ワークフロー作成・管理 | #32 | P0 |
| #91 | トリガー設定 | #90 | P0 |
| #92 | ワークフローステップ (12種類) | #90 | P0 |
| #93 | 条件分岐 | #92 | P1 |
| #94 | Webhook連携 | #90 | P1 |
| #95 | カート放棄シーケンス | #90, #60 | P1 |

### Phase 6: Courses & LMS (Issues #96-#105)
コース・学習管理

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #96 | コース作成・管理 | #32 | P0 |
| #97 | モジュール・レッスン管理 | #96 | P0 |
| #98 | 動画ホスティング | #97 | P0 |
| #99 | ドリップコンテンツ | #97 | P1 |
| #100 | 受講者登録管理 | #96, #71 | P1 |
| #101 | 進捗トラッキング | #97 | P1 |
| #102 | 完了証明書 | #101 | P2 |
| #103 | コースメール自動化 | #96, #90 | P1 |
| #104 | コーステーマカスタマイズ | #96 | P2 |
| #105 | クイズ・テスト機能 | #97 | P2 |

### Phase 7: LINE Integration (Issues #106-#125)
LINE連携・自動化

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #106 | LINE公式アカウント連携 | #32 | P0 |
| #107 | Messaging API設定 | #106 | P0 |
| #108 | LINE Login設定 | #106 | P0 |
| #109 | 7種類メッセージタイプ | #107 | P0 |
| #110 | LINE一斉送信 | #109, #71 | P0 |
| #111 | LINEステップ配信 | #109 | P1 |
| #112 | LINEリマインダ配信 | #109 | P1 |
| #113 | リッチメニュー作成 | #107 | P0 |
| #114 | リッチメニュー自動切替 | #113 | P1 |
| #115 | LINE自動応答 | #107 | P1 |
| #116 | LINE友だち一覧 | #107, #71 | P0 |
| #117 | 1to1チャット | #116 | P0 |
| #118 | メール・LINEアカウント統合 | #116 | P1 |
| #119 | LINE通知設定 (Slack等) | #107 | P2 |
| #120 | BAN検知・アラート | #107 | P1 |
| #121 | 登録経路分析 | #116 | P1 |
| #122 | シナリオグループ管理 | #109 | P1 |
| #123 | シナリオ作成・設定 | #122 | P1 |
| #124 | シナリオアクション設定 | #123 | P1 |
| #125 | Googleスプレッドシート連携 | #124 | P2 |

### Phase 8: Affiliate System (Issues #126-#135)
アフィリエイト機能

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #126 | アフィリエイトプログラム作成 | #32 | P0 |
| #127 | アフィリエイト登録・認証 | #126 | P0 |
| #128 | コミッションプラン (Tier 1 & 2) | #126 | P0 |
| #129 | アフィリエイトキャンペーン | #126 | P1 |
| #130 | 商品コミッション設定 | #128, #56 | P1 |
| #131 | ペイアウト管理 | #128 | P1 |
| #132 | アフィリエイト資料提供 | #126 | P2 |
| #133 | カスタムアフィリエイトコード | #127 | P1 |
| #134 | クリック・コンバージョン追跡 | #126 | P0 |
| #135 | 45日間Cookie追跡 | #134 | P1 |

### Phase 9: Analytics & Others (Issues #136-#145)
アナリティクス・その他

| Issue | 機能 | 依存 | 優先度 |
|-------|------|------|--------|
| #136 | アナリティクスダッシュボード | #32 | P0 |
| #137 | ファネルアナリティクス | #136, #49 | P0 |
| #138 | レポート機能 | #136 | P1 |
| #139 | ライブビュー | #136 | P2 |
| #140 | GA4連携 | #136 | P1 |
| #141 | Meta Pixel連携 | #136 | P1 |
| #142 | カウントダウンタイマー | #43 | P1 |
| #143 | 予約・アポイントメント | #32 | P2 |
| #144 | コミュニティ | #32 | P2 |
| #145 | MessageHub | #117 | P2 |

---

## Resource Requirements

### Development Team
- Frontend Engineer: 2-3人
- Backend Engineer: 2-3人
- DevOps Engineer: 1人
- QA Engineer: 1人

### Infrastructure
- Vercel Pro Plan
- PostgreSQL (Supabase / Neon)
- Redis (Upstash)
- Cloudflare R2 (Storage)
- SendGrid (Email)
- Stripe (Payment)
- LINE Developers Account

### External APIs
- Stripe API
- PayPal API
- LINE Messaging API
- LINE Login API
- SendGrid API
- Google Analytics 4 API
- Meta Conversions API

---

## Critical Path

```
#31 → #32 → #33 → #34 → #39 → #41 → #42 → #49 → #50 → #56 → #60 → #61 → #62
                                    ↓
                               #71 → #82 → #90
```

**MVP最短経路**: 31→32→33→39→41→42→49→50→56→60→61

---

## Quality Assurance

### Testing Strategy
- Unit Tests: Vitest (80%+ coverage)
- Integration Tests: Playwright
- E2E Tests: Cypress
- API Tests: Supertest

### Code Quality
- ESLint + Prettier
- TypeScript strict mode
- Pre-commit hooks (Husky + lint-staged)

### CI/CD
- GitHub Actions
- Vercel Preview Deployments
- Automatic test runs on PR

---

## Miyabi Workflow Integration

### Agent Assignments
- **IssueAgent**: 自動ラベル分類
- **CoordinatorAgent**: タスクDAG分解
- **CodeGenAgent**: コード生成
- **ReviewAgent**: 品質チェック (80点以上で合格)
- **TestAgent**: テスト実行
- **PRAgent**: PR作成
- **DeploymentAgent**: 自動デプロイ

### State Transitions
```
pending → analyzing → implementing → reviewing → testing → deploying → done
```

---

## Document Version

- **Created**: 2025-12-09
- **Last Updated**: 2025-12-09
- **Total Issues**: 115 (31-145)
- **Total Requirements Docs**: 19 files (~1,062KB)
