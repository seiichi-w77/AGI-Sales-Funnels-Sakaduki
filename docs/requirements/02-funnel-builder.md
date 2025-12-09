# ファネルビルダー機能要件定義書

## 1. 概要

本文書は、ClickFunnelsのファネルビルダー機能を参考にした、セールスファネル構築システムの詳細要件を定義します。

### 1.1 目的

マーケティングファネルの作成、管理、最適化を可能にする包括的なファネルビルダーシステムを実装する。

### 1.2 主要機能

- ファネルの作成・編集・削除
- 複数のファネルタイプのサポート
- ファネルステップの管理
- A/Bスプリットテスト
- ファネル共有・クローン機能
- ドメイン接続
- ファネル公開・URLシェア
- アナリティクスダッシュボード
- ワークフロー自動化
- 製品・チェックアウト統合

---

## 2. ファネルタイプ一覧

### 2.1 リードマグネットファネル (Lead Magnet Funnel)

**目的**: 見込み客の連絡先情報を収集

**典型的なフロー**:
1. ランディングページ（オプトインページ）
2. サンクスページ（リソース配信）

**主要要素**:
- オプトインフォーム（名前、メールアドレス）
- リードマグネット提供（PDF、チェックリスト、テンプレート等）
- メール配信トリガー

### 2.2 書籍ファネル (Book Funnel)

**目的**: 書籍販売を通じた顧客獲得とアップセル

**典型的なフロー**:
1. 書籍オファーページ
2. 注文フォーム（送料のみ等）
3. アップセルページ
4. サンクスページ

**主要要素**:
- 書籍商品情報
- 配送先情報入力
- 低価格オファー（送料のみ等）
- 関連商品アップセル

### 2.3 カートファネル (Cart Funnel)

**目的**: Eコマースストアのようなショッピング体験

**典型的なフロー**:
1. 商品一覧ページ
2. ショッピングカート
3. チェックアウトページ
4. サンクスページ

**主要要素**:
- 複数商品の追加・削除機能
- カート内容の編集
- 数量調整
- クーポン・割引コード

### 2.4 ウェビナーファネル (Webinar Funnel)

**目的**: ウェビナー登録とコンバージョン

**典型的なフロー**:
1. ウェビナー登録ページ
2. 確認ページ
3. リマインダーメール
4. ウェビナールーム
5. リプレイページ
6. オファーページ

**主要要素**:
- ウェビナースケジュール管理
- 登録フォーム
- カレンダー統合
- ライブ配信統合
- リプレイ機能

### 2.5 ビデオセールスレター(VSL)ファネル

**目的**: ビデオコンテンツによる販売促進

**典型的なフロー**:
1. VSLページ（ビデオ視聴）
2. 注文フォーム
3. アップセル
4. サンクスページ

**主要要素**:
- ビデオプレーヤー統合
- ビデオ視聴トラッキング
- タイミングベースのCTA表示
- ビデオ完了トリガー

### 2.6 ストアフロントファネル (Storefront Funnel)

**目的**: オンラインストアの構築

**典型的なフロー**:
1. ストアフロント（商品一覧）
2. 商品詳細ページ
3. カート
4. チェックアウト

**主要要素**:
- 商品カタログ管理
- カテゴリ分類
- 検索・フィルター機能
- 在庫管理統合

---

## 3. ファネル作成・管理機能

### 3.1 ファネル作成

#### 3.1.1 UI要素

**ファネル作成ボタン**
- 配置: ダッシュボードメインエリア
- スタイル: プライマリカラー（#FEB95F）
- ラベル: "新規ファネルを作成" / "Create New Funnel"

**ファネルタイプ選択モーダル**
- カード形式でファネルタイプを表示
- 各カードに含む情報:
  - ファネルタイプ名
  - アイコン
  - 説明文
  - 推奨用途

**ファネル基本情報入力フォーム**
```
フィールド:
- ファネル名 (必須)
- ファネルタイプ (選択済み、変更可能)
- カテゴリ/タグ
- 説明（任意）
```

#### 3.1.2 ワークフロー

1. ユーザーが「新規ファネルを作成」ボタンをクリック
2. ファネルタイプ選択モーダルが表示
3. ユーザーがファネルタイプを選択
4. 基本情報入力フォームが表示
5. ユーザーが必要情報を入力
6. 「作成」ボタンをクリック
7. ファネルが作成され、ファネル編集画面に遷移
8. デフォルトのファネルステップが自動生成される

#### 3.1.3 データモデル

```typescript
interface Funnel {
  id: string;
  userId: string;
  name: string;
  type: FunnelType;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  settings: FunnelSettings;
  steps: FunnelStep[];
  domain?: string;
  customDomain?: string;
  analyticsEnabled: boolean;
}

enum FunnelType {
  LEAD_MAGNET = 'lead_magnet',
  BOOK = 'book',
  CART = 'cart',
  WEBINAR = 'webinar',
  VSL = 'vsl',
  STOREFRONT = 'storefront',
  CUSTOM = 'custom'
}

interface FunnelSettings {
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  tracking: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    customScripts?: string[];
  };
  redirect: {
    after404?: string;
    afterComplete?: string;
  };
  timezone: string;
  locale: string;
}
```

### 3.2 ファネル一覧・管理

#### 3.2.1 UI要素

**ファネル一覧テーブル/カード表示**

テーブルビューカラム:
- ファネル名
- タイプ
- ステータス（Draft/Published/Archived）
- 作成日
- 最終更新日
- コンバージョン率
- アクション（編集、複製、削除、設定）

カードビュー情報:
- サムネイル（最初のステップのプレビュー）
- ファネル名
- タイプバッジ
- ステータスインジケーター
- 簡易統計（訪問者数、コンバージョン数）
- クイックアクションボタン

**フィルター・検索機能**
- ファネルタイプでフィルター
- ステータスでフィルター
- カテゴリ/タグでフィルター
- テキスト検索（ファネル名、説明）
- 並び替え（作成日、更新日、名前、パフォーマンス）

**ビュー切替**
- リストビュー
- カードビュー（グリッド）
- ボードビュー（カンバン形式）

#### 3.2.2 ユーザーアクション

- ファネル作成
- ファネル編集
- ファネル複製
- ファネル削除（アーカイブ）
- ファネル公開/非公開切替
- ファネル設定アクセス
- ファネルアナリティクス表示
- ファネル共有（チームメンバーへ）
- ファネルクローン（URLからインポート）
- 一括操作（複数選択して削除、アーカイブ等）

### 3.3 ファネル設定

#### 3.3.1 一般設定

**基本情報**
- ファネル名（編集可能）
- ファネルタイプ（変更可能、警告表示）
- 説明
- カテゴリ
- タグ

**公開設定**
- ステータス（Draft/Published/Archived）
- 公開日時スケジュール
- 非公開パスワード保護
- IPアドレス制限

#### 3.3.2 SEO設定

```
フィールド:
- ページタイトル
- メタディスクリプション
- メタキーワード
- OGイメージ
- Twitter Card設定
- Canonical URL
- noindex/nofollow設定
```

#### 3.3.3 トラッキング・アナリティクス設定

**統合可能なツール**:
- Google Analytics (GA4)
- Google Tag Manager
- Facebook Pixel
- カスタムJavaScriptコード（ヘッダー/フッター）

**イベントトラッキング**:
- ページビュー
- ステップ遷移
- フォーム送信
- ボタンクリック
- 購入完了
- カスタムイベント

#### 3.3.4 ドメイン設定

**ドメイン接続オプション**:
1. システムデフォルトドメイン（yourfunnel.systemdomain.com）
2. カスタムドメイン接続
3. サブドメイン接続

**カスタムドメイン設定手順**:
1. ドメインを入力
2. DNS設定確認
3. SSL証明書自動発行
4. 接続確認

**データモデル**:
```typescript
interface DomainSettings {
  type: 'default' | 'custom' | 'subdomain';
  domain: string;
  verified: boolean;
  sslEnabled: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    verified: boolean;
  }[];
}
```

#### 3.3.5 リダイレクト設定

```
設定項目:
- 404エラー時のリダイレクト先
- ファネル完了後のリダイレクト先
- ステップ間のリダイレクトルール
- 条件付きリダイレクト（コンバージョン有無等）
```

---

## 4. ファネルステップ管理

### 4.1 ステップ追加・編集

#### 4.1.1 UI要素

**ステップビルダーインターフェース**

ビジュアルフロー表示:
- ステップをカード形式で横並び表示
- ステップ間の矢印で遷移を表現
- ドラッグ&ドロップで順序変更
- ステップカードに表示する情報:
  - ステップ番号
  - ステップ名
  - ページタイプ
  - サムネイルプレビュー
  - 統計情報（訪問数、コンバージョン率）
  - クイックアクションボタン

**ステップ追加ボタン**
- 各ステップ間に「+」ボタン配置
- 最後尾に「ステップを追加」ボタン
- クリックでステップタイプ選択モーダル表示

**ステップタイプ選択モーダル**

利用可能なステップタイプ:
1. **オプトインページ** - リード情報収集
2. **セールスページ** - 商品紹介・販売
3. **チェックアウトページ** - 注文フォーム
4. **アップセルページ** - 追加商品オファー
5. **ダウンセルページ** - 代替商品オファー
6. **ワンクリックアップセル(OTO)** - 決済情報不要の追加購入
7. **サンクスページ** - 購入完了・感謝
8. **ウェビナー登録ページ**
9. **ウェビナールームページ**
10. **ビデオページ** - VSL等
11. **カスタムページ** - 自由設計

#### 4.1.2 ステップ設定

**基本設定**
```
フィールド:
- ステップ名
- ページタイプ
- URL スラッグ（/step-name）
- 説明
```

**ページビルダー設定**
- テンプレート選択
- ページエディターへのリンク
- プレビュー機能

**アクション設定**
- 次のステップへの遷移条件
- フォーム送信後のアクション
- ワークフロートリガー設定

**表示設定**
- ヘッダー/フッター表示切替
- ナビゲーション表示切替
- モバイル最適化設定

#### 4.1.3 データモデル

```typescript
interface FunnelStep {
  id: string;
  funnelId: string;
  name: string;
  slug: string;
  order: number;
  type: StepType;
  pageId?: string; // ページビルダーで作成したページID
  settings: StepSettings;
  conditions?: StepCondition[];
  createdAt: Date;
  updatedAt: Date;
}

enum StepType {
  OPTIN = 'optin',
  SALES = 'sales',
  CHECKOUT = 'checkout',
  UPSELL = 'upsell',
  DOWNSELL = 'downsell',
  OTO = 'oto', // One-Time Offer
  THANK_YOU = 'thank_you',
  WEBINAR_REGISTRATION = 'webinar_registration',
  WEBINAR_ROOM = 'webinar_room',
  VIDEO = 'video',
  CUSTOM = 'custom'
}

interface StepSettings {
  url: {
    slug: string;
    fullPath: string;
  };
  display: {
    showHeader: boolean;
    showFooter: boolean;
    showNavigation: boolean;
  };
  seo: {
    title?: string;
    description?: string;
    noindex?: boolean;
  };
  actions: {
    onSubmit?: StepAction[];
    onLoad?: StepAction[];
    onExit?: StepAction[];
  };
  products?: string[]; // チェックアウト、アップセル等で使用
  splitTest?: SplitTestConfig;
}

interface StepAction {
  type: 'redirect' | 'workflow' | 'email' | 'webhook' | 'tag';
  config: any;
  conditions?: any[];
}

interface StepCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  nextStepId?: string;
}
```

### 4.2 ステップ順序管理

#### 4.2.1 機能

- ドラッグ&ドロップでステップ順序変更
- ステップの挿入（途中に追加）
- ステップの削除
- ステップの複製
- ステップの移動（別ファネルへ）

#### 4.2.2 分岐・条件付きステップ

**分岐ロジック**:
- フォーム回答に基づく分岐
- 購入有無による分岐
- タグ・セグメントによる分岐
- カスタム条件による分岐

**実装方法**:
```typescript
interface ConditionalStep {
  stepId: string;
  conditions: {
    if: Condition[];
    then: string; // 次のステップID
    else?: string; // 条件不一致時のステップID
  }[];
  defaultNextStep: string;
}

interface Condition {
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}
```

### 4.3 特殊ステップタイプの詳細

#### 4.3.1 チェックアウトステップ

**必須要素**:
- 商品選択・表示
- 注文フォーム
  - 連絡先情報（名前、メール、電話）
  - 請求先住所
  - 配送先住所
  - 支払い情報
- 注文サマリー
- 合計金額計算
- クーポン・割引コード入力

**データモデル**:
```typescript
interface CheckoutStep extends FunnelStep {
  products: CheckoutProduct[];
  form: CheckoutForm;
  payment: PaymentSettings;
  shipping?: ShippingSettings;
}

interface CheckoutProduct {
  productId: string;
  quantity: number;
  variants?: ProductVariant[];
  price: number;
  compareAtPrice?: number;
}

interface CheckoutForm {
  fields: FormField[];
  layout: 'single_column' | 'two_column';
  requiredFields: string[];
}

interface PaymentSettings {
  gateway: 'stripe' | 'paypal' | 'square' | 'custom';
  acceptedMethods: ('card' | 'paypal' | 'apple_pay' | 'google_pay')[];
  currency: string;
  testMode: boolean;
}
```

#### 4.3.2 ワンクリックアップセル/ダウンセル(OTO)ステップ

**特徴**:
- 既存の支払い情報を使用
- ワンクリックで購入完了
- 「はい」「いいえ」の明確なCTA
- タイマー表示オプション

**UI要素**:
- 商品オファー表示
- 「今すぐ追加」ボタン（プライマリ）
- 「スキップ」ボタン（セカンダリ）
- カウントダウンタイマー（任意）
- 商品詳細・ベネフィット

**データモデル**:
```typescript
interface OTOStep extends FunnelStep {
  offerType: 'upsell' | 'downsell';
  product: {
    productId: string;
    specialPrice?: number;
    limitedTimeOffer?: {
      duration: number; // 秒
      showTimer: boolean;
    };
  };
  actions: {
    onAccept: {
      nextStepId: string;
      workflows?: string[];
    };
    onDecline: {
      nextStepId: string;
      workflows?: string[];
    };
  };
}
```

#### 4.3.3 ウェビナーステップ

**ウェビナー登録ステップ**:
- 登録フォーム
- ウェビナー日時選択
- カレンダー追加ボタン
- リマインダー設定

**ウェビナールームステップ**:
- ビデオ配信エリア
- チャット機能
- Q&Aセクション
- CTA表示エリア
- ハンドアウト・リソースダウンロード

**データモデル**:
```typescript
interface WebinarStep extends FunnelStep {
  webinar: {
    type: 'live' | 'automated' | 'evergreen';
    schedule?: {
      date: Date;
      timezone: string;
      duration: number;
    };
    videoSource?: {
      platform: 'youtube' | 'vimeo' | 'custom';
      videoId: string;
    };
    features: {
      chat: boolean;
      qa: boolean;
      polls: boolean;
      handouts: boolean;
    };
  };
}
```

---

## 5. 商品・決済統合

### 5.1 ファネルステップへの商品追加

#### 5.1.1 商品選択UI

**商品ライブラリモーダル**:
- 既存商品一覧表示
- 商品検索・フィルター
- 商品プレビュー
- 新規商品作成ボタン

**商品カード情報**:
- 商品画像
- 商品名
- 価格
- 在庫状況
- カテゴリ

#### 5.1.2 商品設定

**ステップごとの商品設定**:
```typescript
interface ProductInStep {
  productId: string;
  displaySettings: {
    showImage: boolean;
    showDescription: boolean;
    showPrice: boolean;
    showVariants: boolean;
  };
  pricing: {
    price: number;
    compareAtPrice?: number;
    specialOffer?: {
      type: 'percentage' | 'fixed';
      value: number;
      label?: string;
    };
  };
  variants?: {
    variantId: string;
    selected: boolean;
  }[];
  quantity: {
    default: number;
    min: number;
    max?: number;
    allowChange: boolean;
  };
  subscription?: {
    enabled: boolean;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialDays?: number;
  };
}
```

### 5.2 決済ゲートウェイ統合

#### 5.2.1 サポート決済プロバイダー

1. **Stripe**
   - クレジットカード
   - デビットカード
   - Apple Pay
   - Google Pay
   - Link

2. **PayPal**
   - PayPalチェックアウト
   - PayPal Credit

3. **Square**

4. **カスタムゲートウェイ**

#### 5.2.2 テストモード・サンドボックス

**機能**:
- テストモード切替スイッチ
- サンドボックス環境での決済テスト
- テストカード番号の自動入力
- テスト注文の識別（ダッシュボード表示）
- テストデータのクリア機能

**UI要素**:
- テストモードインジケーター（画面上部にバー表示）
- テストモード有効化トグル（設定画面）
- テスト注文の一覧フィルター

**データモデル**:
```typescript
interface PaymentGatewayConfig {
  provider: 'stripe' | 'paypal' | 'square' | 'custom';
  testMode: boolean;
  credentials: {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  testCredentials?: {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
}

interface Order {
  id: string;
  funnelId: string;
  customerId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  isTest: boolean; // テストモードでの注文
  items: OrderItem[];
  total: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## 6. ワークフロー自動化

### 6.1 ファネルステップへのワークフロー追加

#### 6.1.1 トリガーポイント

**ステップレベルのトリガー**:
- ステップ訪問時（ページロード）
- フォーム送信時
- ステップ完了時
- ステップ離脱時
- 特定時間経過後
- 特定要素クリック時

#### 6.1.2 ワークフローアクション

**利用可能なアクション**:
1. メール送信
2. タグ追加/削除
3. リスト追加/削除
4. Webhook送信
5. CRM更新
6. 外部サービス統合（Zapier等）
7. 条件分岐
8. 待機（時間指定）
9. カスタムフィールド更新

#### 6.1.3 UI設計

**ワークフロービルダー**:
- ビジュアルフローエディター
- ドラッグ&ドロップでアクション追加
- トリガー選択ドロップダウン
- アクション設定パネル
- テスト実行機能

**データモデル**:
```typescript
interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  active: boolean;
}

interface WorkflowTrigger {
  type: 'step_enter' | 'form_submit' | 'step_exit' | 'time_delay' | 'element_click';
  config: any;
}

interface WorkflowAction {
  id: string;
  type: 'email' | 'tag' | 'webhook' | 'crm' | 'wait' | 'condition' | 'custom_field';
  config: any;
  order: number;
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}
```

---

## 7. A/Bスプリットテスト

### 7.1 スプリットテスト設定

#### 7.1.1 UI要素

**スプリットテスト有効化**:
- ステップ設定内にトグルスイッチ
- 「スプリットテストを追加」ボタン

**バリエーション管理画面**:
- オリジナル（コントロール）表示
- バリエーション追加ボタン
- 各バリエーションカード:
  - バリエーション名
  - トラフィック配分スライダー（%）
  - プレビューボタン
  - 編集ボタン
  - 統計情報（訪問数、コンバージョン率、勝率）

**トラフィック配分UI**:
- スライダーで各バリエーションの配分を調整
- 合計が100%になるように自動調整
- 均等配分ボタン

#### 7.1.2 機能要件

**バリエーション作成**:
1. オリジナルページのコピーを作成
2. ページビルダーで編集
3. バリエーション名を設定
4. トラフィック配分を設定

**テスト実行**:
- テスト開始/停止ボタン
- テスト期間設定
- 最小サンプルサイズ設定
- 統計的有意性の自動計算

**勝者の決定**:
- 手動で勝者を選択
- 自動で勝者を選択（統計的有意性基準）
- 勝者を適用（すべてのトラフィックを勝者に）

#### 7.1.3 データモデル

```typescript
interface SplitTestConfig {
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  variations: SplitTestVariation[];
  metrics: {
    primaryMetric: 'conversion_rate' | 'revenue' | 'engagement';
    minimumSampleSize?: number;
    confidenceLevel: number; // 95%, 99%等
  };
  winner?: {
    variationId: string;
    selectedAt: Date;
    auto: boolean;
  };
}

interface SplitTestVariation {
  id: string;
  name: string;
  pageId: string;
  trafficPercentage: number;
  isControl: boolean;
  stats: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
  };
}
```

### 7.2 スプリットテスト分析

#### 7.2.1 表示データ

**比較テーブル**:
| バリエーション | 訪問者数 | コンバージョン数 | コンバージョン率 | 改善率 | 信頼度 |
|--------------|----------|------------------|------------------|--------|--------|
| オリジナル   | 1,000    | 50               | 5.0%             | -      | -      |
| バリエーションA | 1,020 | 61              | 6.0%             | +20%   | 95%    |

**グラフ表示**:
- 時系列でのコンバージョン率推移
- バリエーション別の比較グラフ
- 統計的有意性の可視化

---

## 8. ファネル共有・クローン機能

### 8.1 ファネル共有

#### 8.1.1 チームメンバーへの共有

**UI要素**:
- 「共有」ボタン（ファネル設定内）
- 共有モーダル:
  - メンバー検索・選択
  - 権限設定（閲覧のみ、編集可能）
  - 共有リンク生成

**権限レベル**:
- 閲覧のみ: 統計表示、プレビュー可能
- 編集可能: ステップ編集、設定変更可能
- 管理者: すべての操作可能、削除可能

#### 8.1.2 外部共有（ファネルテンプレート）

**共有URL生成**:
- 「共有URLを生成」ボタン
- ファネル構造のエクスポート（ページデザイン含む/含まない選択）
- 共有URLの有効期限設定
- パスワード保護オプション

**データモデル**:
```typescript
interface FunnelShare {
  id: string;
  funnelId: string;
  shareType: 'team' | 'public_link';
  sharedWith?: string[]; // ユーザーID（チーム共有の場合）
  shareUrl?: string; // 公開リンク
  permissions: 'view' | 'edit' | 'admin';
  expiresAt?: Date;
  password?: string;
  includeDesign: boolean;
  includeProducts: boolean;
  includeWorkflows: boolean;
  createdAt: Date;
}
```

### 8.2 ファネルクローン

#### 8.2.1 ファネル複製（自分のファネル）

**UI要素**:
- ファネル一覧のアクションメニューに「複製」オプション
- クリック後、複製確認モーダル表示
- 新しいファネル名入力フィールド
- 複製オプション:
  - ページデザインを複製
  - 商品設定を複製
  - ワークフローを複製
  - 統計データをリセット

**処理フロー**:
1. ユーザーが「複製」をクリック
2. 確認モーダル表示
3. ファネル名、オプション設定
4. 「複製」ボタンクリック
5. バックグラウンドで複製処理実行
6. 完了通知表示
7. 新しいファネルがファネル一覧に追加

#### 8.2.2 ファネルクローン（共有URLから）

**UI要素**:
- 「ファネルをインポート」ボタン（ダッシュボード）
- インポートモーダル:
  - 共有URL入力フィールド
  - パスワード入力（必要な場合）
  - プレビュー表示
  - インポートオプション選択

**処理フロー**:
1. ユーザーが共有URLを入力
2. システムが共有ファネルデータを取得
3. プレビュー表示（ステップ構成、ページ数等）
4. ユーザーがインポートオプションを選択
5. 「インポート」ボタンクリック
6. 新しいファネルとして保存
7. 必要に応じてページ編集へ誘導

**データ処理**:
```typescript
interface CloneOperation {
  sourceFunnelId: string;
  options: {
    cloneName: string;
    includePages: boolean;
    includeProducts: boolean;
    includeWorkflows: boolean;
    resetAnalytics: boolean;
  };
}

async function cloneFunnel(operation: CloneOperation): Promise<Funnel> {
  // 1. ソースファネルデータ取得
  // 2. 新しいファネルオブジェクト作成
  // 3. ステップを複製
  // 4. ページを複製（オプション）
  // 5. 商品関連付けを複製（オプション）
  // 6. ワークフローを複製（オプション）
  // 7. 新しいIDを割り当て
  // 8. データベースに保存
  // 9. 複製されたファネルを返す
}
```

---

## 9. ファネル公開・URL管理

### 9.1 ファネル公開

#### 9.1.1 公開プロセス

**UI要素**:
- 「公開」ボタン（ファネル編集画面上部）
- 公開前チェックリスト表示:
  - すべてのステップにページが設定されているか
  - ドメインが接続されているか
  - 決済設定が完了しているか（商品ファネルの場合）
  - テストモードが無効化されているか

**公開確認モーダル**:
- チェックリスト結果表示
- 警告・エラー表示
- 公開確認ボタン

**公開後**:
- ステータスが「Published」に変更
- ファネルURLが有効化
- 公開日時が記録される

#### 9.1.2 公開設定

**公開スケジュール**:
- 即座に公開
- 指定日時に公開
- 手動で公開（準備完了後）

**公開範囲**:
- 全員に公開
- パスワード保護
- 特定IPアドレスのみ
- 招待者のみ（メール認証）

### 9.2 ファネルURL構造

#### 9.2.1 URL形式

**デフォルトドメイン使用時**:
```
https://yourdomain.systemdomain.com/funnel-slug/step-slug
```

**カスタムドメイン使用時**:
```
https://yourcustomdomain.com/step-slug
```

または

```
https://yourcustomdomain.com/funnel-slug/step-slug
```

#### 9.2.2 スラッグ管理

**ファネルスラッグ**:
- 自動生成（ファネル名から）
- 手動編集可能
- 一意性チェック
- URLフレンドリー文字のみ（a-z, 0-9, ハイフン）

**ステップスラッグ**:
- ステップごとに設定
- デフォルトはステップタイプ名
- 編集可能

### 9.3 URLシェア機能

#### 9.3.1 シェアオプション

**UI要素**:
- 「シェア」ボタン（公開済みファネルに表示）
- シェアモーダル:
  - ファネルURL表示
  - コピーボタン
  - ソーシャルメディアシェアボタン
  - QRコード生成
  - 埋め込みコード生成

**ソーシャルメディア統合**:
- Facebook
- Twitter
- LinkedIn
- メールシェア
- WhatsApp

**データモデル**:
```typescript
interface PublishSettings {
  status: 'draft' | 'scheduled' | 'published' | 'unpublished';
  publishedAt?: Date;
  scheduledFor?: Date;
  access: {
    type: 'public' | 'password' | 'ip_restricted' | 'invite_only';
    password?: string;
    allowedIPs?: string[];
    invitedEmails?: string[];
  };
  url: {
    domain: string;
    funnelSlug: string;
    fullUrl: string;
  };
}
```

---

## 10. ファネルアナリティクス

### 10.1 アナリティクスダッシュボード

#### 10.1.1 概要メトリクス

**主要KPI（上部表示）**:
- 総訪問者数
- ユニーク訪問者数
- 総コンバージョン数
- コンバージョン率
- 総収益（商品ファネルの場合）
- 平均注文額

**期間選択**:
- 今日
- 昨日
- 過去7日間
- 過去30日間
- 過去90日間
- カスタム期間

#### 10.1.2 ファネル可視化

**ファネルフローチャート**:
```
ステップ1          ステップ2          ステップ3          完了
[1,000人]    →    [500人]     →    [250人]     →    [50人]
100%              50%               25%               5%
                  ↓ 離脱500人        ↓ 離脱250人        ↓ 離脱200人
```

**表示要素**:
- 各ステップの訪問者数
- ステップ間のコンバージョン率
- 離脱率
- 平均滞在時間
- クリックヒートマップへのリンク

#### 10.1.3 詳細レポート

**ステップ別パフォーマンス**:

テーブル表示:
| ステップ名 | 訪問者数 | ユニーク | 次へ進んだ数 | コンバージョン率 | 平均滞在時間 |
|-----------|---------|---------|-------------|-----------------|------------|
| オプトイン | 1,000   | 850     | 500         | 50%             | 1:30       |
| セールス  | 500     | 480     | 250         | 50%             | 3:45       |
| チェックアウト | 250 | 240   | 50          | 20%             | 2:20       |

**トラフィックソース分析**:
- ダイレクト
- オーガニック検索
- ソーシャルメディア
- リファラル
- 広告キャンペーン

**デバイス・ブラウザ分析**:
- デスクトップ vs モバイル vs タブレット
- ブラウザ別（Chrome, Safari, Firefox等）
- OS別（Windows, Mac, iOS, Android）

**地域分析**:
- 国別
- 都市別
- タイムゾーン別

#### 10.1.4 コンバージョントラッキング

**トラッキングイベント**:
```typescript
interface FunnelEvent {
  eventType: 'page_view' | 'step_enter' | 'step_exit' | 'form_submit' | 'button_click' | 'purchase';
  funnelId: string;
  stepId?: string;
  sessionId: string;
  userId?: string;
  visitorId: string; // 匿名ユーザー識別用
  timestamp: Date;
  metadata: {
    url: string;
    referrer?: string;
    device: string;
    browser: string;
    os: string;
    country?: string;
    city?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  conversionData?: {
    productIds?: string[];
    revenue?: number;
    currency?: string;
  };
}
```

**コンバージョン属性**:
- ファーストタッチ（最初の流入元）
- ラストタッチ（最後の流入元）
- マルチタッチ（すべての接触点）

### 10.2 リアルタイムアナリティクス

**表示データ**:
- 現在アクティブな訪問者数
- 現在どのステップにいるか
- リアルタイムコンバージョン
- 最近のアクティビティフィード

**UI要素**:
- リアルタイムカウンター
- アクティビティタイムライン
- ライブファネルフロー図

### 10.3 レポートエクスポート

**エクスポート形式**:
- CSV
- Excel
- PDF（ビジュアルレポート）

**エクスポートデータ**:
- 概要メトリクス
- ステップ別詳細
- トラフィックソースデータ
- コンバージョンデータ
- カスタムレポート

---

## 11. API要件

### 11.1 REST API エンドポイント

#### 11.1.1 ファネル管理API

**ファネル一覧取得**
```
GET /api/v1/funnels
Query Parameters:
  - page: number
  - limit: number
  - type: FunnelType
  - status: 'draft' | 'published' | 'archived'
  - search: string

Response: {
  data: Funnel[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**ファネル詳細取得**
```
GET /api/v1/funnels/:id

Response: Funnel
```

**ファネル作成**
```
POST /api/v1/funnels
Body: {
  name: string,
  type: FunnelType,
  description?: string,
  settings?: Partial<FunnelSettings>
}

Response: Funnel
```

**ファネル更新**
```
PUT /api/v1/funnels/:id
Body: Partial<Funnel>

Response: Funnel
```

**ファネル削除**
```
DELETE /api/v1/funnels/:id

Response: { success: boolean }
```

**ファネル複製**
```
POST /api/v1/funnels/:id/duplicate
Body: {
  name: string,
  includePages: boolean,
  includeProducts: boolean,
  includeWorkflows: boolean
}

Response: Funnel
```

**ファネル公開**
```
POST /api/v1/funnels/:id/publish
Body: {
  scheduledFor?: Date,
  accessSettings?: AccessSettings
}

Response: Funnel
```

#### 11.1.2 ファネルステップAPI

**ステップ一覧取得**
```
GET /api/v1/funnels/:funnelId/steps

Response: FunnelStep[]
```

**ステップ作成**
```
POST /api/v1/funnels/:funnelId/steps
Body: {
  name: string,
  type: StepType,
  order?: number,
  settings?: Partial<StepSettings>
}

Response: FunnelStep
```

**ステップ更新**
```
PUT /api/v1/funnels/:funnelId/steps/:stepId
Body: Partial<FunnelStep>

Response: FunnelStep
```

**ステップ削除**
```
DELETE /api/v1/funnels/:funnelId/steps/:stepId

Response: { success: boolean }
```

**ステップ順序変更**
```
PUT /api/v1/funnels/:funnelId/steps/reorder
Body: {
  stepOrders: { stepId: string, order: number }[]
}

Response: FunnelStep[]
```

#### 11.1.3 アナリティクスAPI

**ファネル統計取得**
```
GET /api/v1/funnels/:funnelId/analytics
Query Parameters:
  - startDate: string (ISO date)
  - endDate: string (ISO date)
  - metrics: string[] (visitors, conversions, revenue等)

Response: {
  summary: {
    visitors: number,
    uniqueVisitors: number,
    conversions: number,
    conversionRate: number,
    revenue?: number
  },
  stepAnalytics: {
    stepId: string,
    stepName: string,
    visitors: number,
    conversions: number,
    conversionRate: number,
    avgTimeOnPage: number
  }[],
  timeline: {
    date: string,
    visitors: number,
    conversions: number
  }[]
}
```

**イベントトラッキング**
```
POST /api/v1/analytics/events
Body: FunnelEvent

Response: { success: boolean }
```

#### 11.1.4 A/BテストAPI

**スプリットテスト作成**
```
POST /api/v1/funnels/:funnelId/steps/:stepId/split-test
Body: {
  variations: {
    name: string,
    trafficPercentage: number,
    pageId: string
  }[]
}

Response: SplitTestConfig
```

**スプリットテスト結果取得**
```
GET /api/v1/funnels/:funnelId/steps/:stepId/split-test/results

Response: {
  variations: SplitTestVariation[],
  winner?: {
    variationId: string,
    confidenceLevel: number
  }
}
```

**勝者を適用**
```
POST /api/v1/funnels/:funnelId/steps/:stepId/split-test/apply-winner
Body: {
  variationId: string
}

Response: { success: boolean }
```

### 11.2 Webhook API

#### 11.2.1 Webhookイベント

**サポートするイベント**:
- `funnel.published` - ファネル公開時
- `funnel.unpublished` - ファネル非公開時
- `step.completed` - ステップ完了時
- `form.submitted` - フォーム送信時
- `order.created` - 注文作成時
- `order.completed` - 注文完了時
- `split_test.winner` - A/Bテスト勝者決定時

**Webhookペイロード例**:
```json
{
  "event": "order.completed",
  "timestamp": "2025-12-09T10:00:00Z",
  "data": {
    "orderId": "order_123",
    "funnelId": "funnel_456",
    "customerId": "customer_789",
    "total": 99.00,
    "currency": "USD",
    "items": [...]
  }
}
```

#### 11.2.2 Webhook設定

**Webhook登録**
```
POST /api/v1/webhooks
Body: {
  url: string,
  events: string[],
  secret?: string
}

Response: {
  id: string,
  url: string,
  events: string[],
  active: boolean
}
```

---

## 12. データベーススキーマ

### 12.1 主要テーブル

#### 12.1.1 funnels テーブル

```sql
CREATE TABLE funnels (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags JSON,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  settings JSON,
  domain VARCHAR(255),
  custom_domain VARCHAR(255),
  analytics_enabled BOOLEAN DEFAULT true,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
);
```

#### 12.1.2 funnel_steps テーブル

```sql
CREATE TABLE funnel_steps (
  id VARCHAR(36) PRIMARY KEY,
  funnel_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  order INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  page_id VARCHAR(36),
  settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE,
  INDEX idx_funnel_id (funnel_id),
  INDEX idx_order (funnel_id, order),
  UNIQUE KEY unique_slug (funnel_id, slug)
);
```

#### 12.1.3 funnel_analytics テーブル

```sql
CREATE TABLE funnel_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  funnel_id VARCHAR(36) NOT NULL,
  step_id VARCHAR(36),
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(36),
  visitor_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  conversion_data JSON,
  INDEX idx_funnel_id (funnel_id),
  INDEX idx_step_id (step_id),
  INDEX idx_session_id (session_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_event_type (event_type)
);
```

#### 12.1.4 split_tests テーブル

```sql
CREATE TABLE split_tests (
  id VARCHAR(36) PRIMARY KEY,
  step_id VARCHAR(36) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  primary_metric VARCHAR(50) NOT NULL,
  minimum_sample_size INT,
  confidence_level DECIMAL(5,2),
  winner_variation_id VARCHAR(36),
  winner_selected_at TIMESTAMP,
  winner_auto BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (step_id) REFERENCES funnel_steps(id) ON DELETE CASCADE,
  INDEX idx_step_id (step_id)
);
```

#### 12.1.5 split_test_variations テーブル

```sql
CREATE TABLE split_test_variations (
  id VARCHAR(36) PRIMARY KEY,
  split_test_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  page_id VARCHAR(36) NOT NULL,
  traffic_percentage DECIMAL(5,2) NOT NULL,
  is_control BOOLEAN DEFAULT false,
  visitors INT DEFAULT 0,
  conversions INT DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  revenue DECIMAL(10,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (split_test_id) REFERENCES split_tests(id) ON DELETE CASCADE,
  INDEX idx_split_test_id (split_test_id)
);
```

#### 12.1.6 funnel_shares テーブル

```sql
CREATE TABLE funnel_shares (
  id VARCHAR(36) PRIMARY KEY,
  funnel_id VARCHAR(36) NOT NULL,
  share_type VARCHAR(20) NOT NULL,
  shared_with JSON,
  share_url VARCHAR(500),
  permissions VARCHAR(20) NOT NULL,
  expires_at TIMESTAMP,
  password VARCHAR(255),
  include_design BOOLEAN DEFAULT true,
  include_products BOOLEAN DEFAULT true,
  include_workflows BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE,
  INDEX idx_funnel_id (funnel_id),
  INDEX idx_share_url (share_url)
);
```

---

## 13. 非機能要件

### 13.1 パフォーマンス

- ページロード時間: 3秒以内（初回）、1秒以内（キャッシュ後）
- API応答時間: 200ms以内（95パーセンタイル）
- 同時アクティブユーザー: 10,000以上をサポート
- ファネルステップ遷移: 瞬時（100ms以内）

### 13.2 スケーラビリティ

- 水平スケーリング対応（ロードバランサー使用）
- データベース読み取りレプリカ対応
- CDNによる静的アセット配信
- キャッシュ戦略（Redis使用）

### 13.3 セキュリティ

- HTTPS強制
- CSRF保護
- XSS対策
- SQLインジェクション対策（パラメータ化クエリ）
- レート制限（API呼び出し）
- 認証トークンの有効期限管理
- 権限ベースのアクセス制御（RBAC）

### 13.4 可用性

- アップタイム: 99.9%以上
- 自動バックアップ（日次）
- 災害復旧計画
- ヘルスチェック監視
- エラーログ収集・アラート

### 13.5 ユーザビリティ

- レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- アクセシビリティ準拠（WCAG 2.1 AA）
- 多言語対応（国際化対応）
- オンボーディングチュートリアル
- コンテキストヘルプ・ツールチップ

---

## 14. 実装優先順位

### Phase 1: コア機能（MVP）
1. ファネル作成・編集・削除
2. 基本的なファネルタイプのサポート（Lead Magnet, Sales, Checkout）
3. ファネルステップ管理（追加、編集、削除、順序変更）
4. ファネル公開機能
5. 基本的なアナリティクス（訪問者数、コンバージョン率）

### Phase 2: 高度な機能
1. A/Bスプリットテスト
2. ワークフロー自動化
3. 商品・決済統合
4. 高度なアナリティクス（トラフィックソース、デバイス分析）
5. カスタムドメイン接続

### Phase 3: 拡張機能
1. ファネル共有・クローン
2. ウェビナーファネル
3. VSLファネル
4. ストアフロントファネル
5. リアルタイムアナリティクス
6. 高度なレポート・エクスポート

### Phase 4: エンタープライズ機能
1. チーム・権限管理
2. 高度なワークフロー（条件分岐、複雑な自動化）
3. API・Webhook拡張
4. カスタムインテグレーション
5. ホワイトラベル機能

---

## 15. まとめ

本要件定義書は、ClickFunnelsを参考にした包括的なファネルビルダーシステムの実装に必要な機能を網羅しています。

### 主要な実装ポイント

1. **柔軟なファネル設計**: 多様なビジネスモデルに対応できる複数のファネルタイプ
2. **直感的なUI/UX**: ドラッグ&ドロップ、ビジュアルフロー表示による操作性
3. **強力なアナリティクス**: データドリブンな意思決定を支援する詳細な統計情報
4. **自動化機能**: ワークフローによる業務効率化
5. **最適化ツール**: A/Bテストによる継続的な改善
6. **拡張性**: API・Webhook対応による外部サービス連携

この要件定義をベースに、段階的な実装を進めることで、競争力のあるファネルビルダーシステムを構築できます。
