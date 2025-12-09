# AGI Sales Funnels Sakaduki - リソース評価 & AIエージェント提案

## プロジェクト規模分析

### ドキュメント規模
| 項目 | 値 |
|------|-----|
| 要件定義書 | 19ファイル |
| 総ファイルサイズ | 1.1MB |
| 総行数 | 39,014行 |
| 計画Issue数 | 115件 (#31-#145) |
| 現在作成済みIssue | 70件 |

### 機能カテゴリ
| カテゴリ | 機能数 | 複雑度 |
|----------|--------|--------|
| アカウント・ワークスペース | 13機能 | 高 |
| ファネルビルダー | 7機能 | 非常に高 |
| 商品・EC | 14機能 | 非常に高 |
| メール・ブロードキャスト | 10機能 | 高 |
| コース・LMS | 9機能 | 高 |
| ワークフロー・自動化 | 8機能 | 非常に高 |
| コンタクト管理 | 8機能 | 中 |
| ページエディター | 12機能 | 非常に高 |
| アフィリエイト | 10機能 | 高 |
| アナリティクス | 7機能 | 中 |
| LINE連携 (UTAGE) | 25機能 | 非常に高 |
| 多言語対応 | 7機能 | 中 |

**総機能数: 130+機能**

---

## 現在のリソース状況

### 利用可能なリソース
| リソース | 状況 | 評価 |
|----------|------|------|
| Miyabi Framework | ✅ 導入済み | 良好 |
| 7つの自律エージェント | ✅ 利用可能 | 良好 |
| Claude Code (Opus 4.5) | ✅ アクティブ | 良好 |
| GitHub リポジトリ | ✅ 設定済み | 良好 |
| 要件定義書 | ✅ 完備 | 良好 |

### 不足しているリソース
| リソース | 状況 | 重要度 |
|----------|------|--------|
| PostgreSQL データベース | ❌ 未設定 | 必須 |
| Redis キャッシュ | ❌ 未設定 | 必須 |
| Stripe アカウント | ❌ 未設定 | 必須 |
| SendGrid アカウント | ❌ 未設定 | 必須 |
| LINE Developers アカウント | ❌ 未設定 | 必須 |
| Cloudflare R2 / S3 | ❌ 未設定 | 必須 |
| Vercel デプロイ設定 | ❌ 未設定 | 必須 |
| 追加AIエージェント | ⚠️ 不足 | 推奨 |

---

## リソースギャップ分析

### 1. インフラストラクチャ (緊急度: 高)

**必要なセットアップ:**
```
1. PostgreSQL (Supabase / Neon / Railway)
2. Redis (Upstash / Railway)
3. Object Storage (Cloudflare R2 / AWS S3)
4. Vercel プロジェクト設定
```

### 2. 外部サービス連携 (緊急度: 高)

**必要なアカウント・API キー:**
```
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- SENDGRID_API_KEY
- LINE_CHANNEL_ACCESS_TOKEN
- LINE_CHANNEL_SECRET
- LINE_LOGIN_CHANNEL_ID
- DATABASE_URL
- REDIS_URL
```

### 3. 開発リソース (緊急度: 中)

**現在の並列実行能力:**
- Miyabi エージェント: 7種類
- Claude Code: 1インスタンス

**推奨される追加リソース:**
- 複数のClaude Codeインスタンス (並列開発用)
- 専門特化型AIエージェント

---

## 推奨AIエージェント構成

### 現在のMiyabi 7エージェント
| エージェント | 役割 | 状況 |
|-------------|------|------|
| CoordinatorAgent | タスク統括・DAG分解 | ✅ |
| IssueAgent | Issue分析・ラベリング | ✅ |
| CodeGenAgent | AI駆動コード生成 | ✅ |
| ReviewAgent | コード品質判定 | ✅ |
| PRAgent | Pull Request自動化 | ✅ |
| DeploymentAgent | CI/CDデプロイ | ✅ |
| MizusumashiAgent | Super App Designer | ✅ |

### 追加推奨AIエージェント (世界最適)

#### Tier 1: 必須追加エージェント

| エージェント | 提供元 | 用途 | 理由 |
|-------------|--------|------|------|
| **Claude Opus 4.5** | Anthropic | コアコード生成 | 最高レベルの推論・コード生成能力 |
| **GPT-4o** | OpenAI | マルチモーダル処理 | 画像・UI設計支援、ドキュメント処理 |
| **Cursor AI** | Cursor | IDE統合開発 | コードベース全体の理解と高速編集 |
| **GitHub Copilot** | GitHub | インラインコード補完 | リアルタイムコード提案 |

#### Tier 2: 専門特化エージェント

| エージェント | 提供元 | 用途 | 理由 |
|-------------|--------|------|------|
| **v0 by Vercel** | Vercel | UIコンポーネント生成 | React/Next.js UIの高速プロトタイピング |
| **Devin** | Cognition | 自律型ソフトウェアエンジニア | 複雑なタスクの自律実行 |
| **SWE-agent** | Princeton | バグ修正特化 | GitHub Issueからの自動バグ修正 |
| **Aider** | Paul Gauthier | ターミナルベース開発 | Git統合コード編集 |

#### Tier 3: ドメイン特化エージェント

| エージェント | 用途 | 対象フェーズ |
|-------------|------|-------------|
| **Stripe Agent Toolkit** | 決済フロー実装 | Phase 1, 3 |
| **LINE Bot Designer** | LINEリッチメニュー設計 | Phase 7 |
| **Playwright Codegen** | E2Eテスト生成 | 全フェーズ |
| **Prisma AI** | データベーススキーマ最適化 | Phase 1 |

---

## 推奨アーキテクチャ

### 並列開発構成

```
┌─────────────────────────────────────────────────────────────┐
│                    CoordinatorAgent                         │
│                  (タスク統括・DAG分解)                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Work Stream A │     │  Work Stream B │     │  Work Stream C │
│  (Frontend)    │     │  (Backend)     │     │  (Integration) │
├───────────────┤     ├───────────────┤     ├───────────────┤
│ Claude Opus   │     │ Claude Opus   │     │ Claude Opus   │
│ + v0 by Vercel│     │ + Cursor AI   │     │ + Devin       │
│ + Copilot     │     │ + Prisma AI   │     │ + SWE-agent   │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌───────────────┐
                    │  ReviewAgent  │
                    │ (品質チェック) │
                    └───────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │   PRAgent     │
                    │ (PR自動作成)  │
                    └───────────────┘
```

### 推奨ワークフロー

```
1. IssueAgent → Issue分類・優先度判定
2. CoordinatorAgent → 3つのWork Streamに分配
3. 各Stream → 並列でコード生成
   - Stream A: UI/フロントエンド (v0 + Claude)
   - Stream B: API/バックエンド (Cursor + Claude)
   - Stream C: 外部連携 (Devin + Claude)
4. ReviewAgent → 品質スコアリング (80点以上で合格)
5. TestAgent → テスト実行
6. PRAgent → Draft PR作成
7. DeploymentAgent → Vercelデプロイ
```

---

## 実行計画

### Phase 1: インフラセットアップ (即時)

```bash
# 1. データベース設定 (Supabase推奨)
# Supabaseダッシュボードでプロジェクト作成
# DATABASE_URL を取得

# 2. Redis設定 (Upstash推奨)
# Upstashダッシュボードでデータベース作成
# REDIS_URL を取得

# 3. Stripe設定
# Stripeダッシュボードでアカウント作成
# APIキーを取得

# 4. SendGrid設定
# SendGridでアカウント作成
# APIキーを取得

# 5. Vercel設定
vercel link
vercel env pull
```

### Phase 2: AIエージェント統合

```bash
# 1. GitHub Copilot
# VSCode/Cursorで拡張機能をインストール

# 2. Cursor AI
# cursor.com からインストール

# 3. v0 by Vercel
# v0.dev でアカウント作成

# 4. 追加Claude Codeインスタンス
# 複数ターミナルで並列実行
```

### Phase 3: 並列開発開始

```
Work Stream A (Frontend):
- #39 共通UIコンポーネント
- #41 ドラッグ&ドロップエディター
- #42-#48 ページ要素

Work Stream B (Backend):
- #33 認証システム
- #34 ワークスペース管理
- #56-#62 商品・EC

Work Stream C (Integration):
- #38 Stripe連携 (継続)
- #87 SendGrid連携
- #106-#108 LINE連携
```

---

## コスト見積もり

### 月額コスト概算
| サービス | プラン | 月額 |
|----------|--------|------|
| Vercel | Pro | $20/member |
| Supabase | Pro | $25 |
| Upstash | Pay-as-you-go | ~$10 |
| Cloudflare R2 | Free tier | $0 |
| SendGrid | Essentials | $20 |
| Stripe | 従量制 | 2.9% + 30¢ |
| Claude API | 従量制 | ~$100-500 |
| GitHub Copilot | Individual | $10 |
| Cursor | Pro | $20 |
| **合計** | | **~$200-600/月** |

---

## 結論

### リソース充足度: **60%**

### 不足している主要リソース:
1. ✘ データベース (PostgreSQL)
2. ✘ キャッシュ (Redis)
3. ✘ 外部サービスAPI (Stripe, SendGrid, LINE)
4. ✘ 追加AIエージェント (並列開発用)

### 推奨アクション:
1. **即時**: インフラサービスのセットアップ
2. **短期**: 追加AIエージェントの導入
3. **継続**: 3ストリーム並列開発体制の構築

### 最適なAIエージェント構成:
- **コア**: Claude Opus 4.5 (3インスタンス並列)
- **補助**: Cursor AI, GitHub Copilot, v0 by Vercel
- **特殊**: Devin (複雑タスク), SWE-agent (バグ修正)

---

## ドキュメントバージョン
| 項目 | 値 |
|------|-----|
| 作成日 | 2025-12-09 |
| 作成者 | Claude Opus 4.5 |
| Issue | #70 |
