# アフィリエイト機能要件定義書

## 1. 概要

### 1.1 目的
アフィリエイトプログラム管理機能は、外部パートナー（アフィリエイター）がプロダクトを宣伝し、売上に応じたコミッションを獲得できる仕組みを提供します。これにより、ビジネスオーナーは販売チャネルを拡大し、アフィリエイターは収益を得ることができます。

### 1.2 主要機能
- アフィリエイター登録・認証システム
- 2段階コミッションプラン（Tier 1 & Tier 2）
- アフィリエイトキャンペーン管理
- コミッション対象商品設定
- ペイアウト（支払い）管理
- アフィリエイター管理ダッシュボード
- プロモーション素材管理
- カスタムアフィリエイトコード
- リアルタイムトラッキング・レポーティング
- Cookieベースのアトリビューション（45日間）

### 1.3 ビジネス価値
- 販売チャネルの拡大
- パフォーマンスベースのマーケティング
- ブランド認知度の向上
- リスク分散された集客手法

---

## 2. 機能一覧

### 2.1 アフィリエイター向け機能
- アフィリエイター登録
- ログイン・認証
- ダッシュボード
- アフィリエイトリンク生成
- プロモーション素材ダウンロード
- パフォーマンストラッキング
- コミッション履歴確認
- ペイアウト情報管理
- プロフィール設定

### 2.2 ビジネスオーナー向け機能
- コミッションプラン設定
- アフィリエイトキャンペーン作成
- コミッション対象商品設定
- アフィリエイター管理
- ペイアウト処理
- プロモーション素材アップロード
- レポート・分析
- 承認フロー管理
- 不正行為検出

---

## 3. 各機能の詳細要件

### 3.1 アフィリエイター登録・認証

#### 3.1.1 アフィリエイター登録
**機能名**: アフィリエイター新規登録

**説明**:
新規アフィリエイターがプログラムに参加するための登録フォーム。承認制または自動承認を選択可能。

**UI要素**:
- 登録フォーム
  - 氏名（姓・名）
  - メールアドレス
  - パスワード
  - 電話番号
  - 会社名（任意）
  - ウェブサイトURL（任意）
  - ソーシャルメディアアカウント
  - 税務情報（SSN/EIN）
  - 支払い先情報
  - アフィリエイト規約同意チェックボックス
- reCAPTCHA認証
- 送信ボタン

**ユーザーアクション**:
1. 登録フォームに情報を入力
2. 規約に同意
3. 送信ボタンをクリック
4. 確認メールを受信
5. メール内のリンクをクリックして認証
6. 承認待ち（承認制の場合）または即座にアクセス可能

**データモデル**:
```typescript
interface AffiliateRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  taxInfo: {
    type: 'SSN' | 'EIN' | 'ITIN';
    number: string;
    country: string;
  };
  paymentInfo: {
    method: 'PayPal' | 'BankTransfer' | 'Stripe' | 'Wise';
    email?: string;
    bankAccount?: {
      accountHolder: string;
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  affiliateCode: string; // 自動生成される一意のコード
  referredBy?: string; // Tier 2用の紹介者ID
  emailVerified: boolean;
  termsAccepted: boolean;
  termsAcceptedAt: Date;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}
```

#### 3.1.2 アフィリエイターログイン
**機能名**: アフィリエイターログイン

**説明**:
登録済みアフィリエイターがダッシュボードにアクセスするための認証機能。

**UI要素**:
- メールアドレス入力フィールド
- パスワード入力フィールド
- 「ログイン状態を保持」チェックボックス
- ログインボタン
- パスワードリセットリンク
- 新規登録リンク
- ソーシャルログインボタン（Google, Facebook）

**ユーザーアクション**:
1. メールアドレスとパスワードを入力
2. ログインボタンをクリック
3. 2FA認証（有効な場合）
4. ダッシュボードにリダイレクト

**データモデル**:
```typescript
interface AffiliateSession {
  id: string;
  affiliateId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}
```

---

### 3.2 コミッションプラン

#### 3.2.1 コミッションプラン設定
**機能名**: コミッションプラン作成・編集

**説明**:
ビジネスオーナーが複数のコミッションプランを作成・管理できる機能。Tier 1（直接販売）とTier 2（サブアフィリエイト）の両方に対応。

**UI要素**:
- プラン名入力フィールド
- プラン説明テキストエリア
- Tier 1コミッション設定
  - タイプ選択（パーセンテージ/固定額）
  - 金額/パーセンテージ入力
  - 初回支払いのみ/継続支払いトグル
- Tier 2コミッション設定
  - 有効/無効トグル
  - タイプ選択
  - 金額/パーセンテージ入力
- Cookie有効期間設定（デフォルト45日）
- 最低ペイアウト金額設定
- 適用商品・ファネル選択
- 自動承認/手動承認トグル
- 有効期間設定（開始日・終了日）
- ステータストグル（有効/無効）

**ユーザーアクション**:
1. 「新規プラン作成」ボタンをクリック
2. プラン情報を入力
3. コミッション率を設定
4. 適用対象を選択
5. 保存ボタンをクリック

**データモデル**:
```typescript
interface CommissionPlan {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  tier1: {
    enabled: boolean;
    type: 'percentage' | 'fixed';
    value: number;
    recurringEnabled: boolean; // 継続課金商品の場合
    recurringMonths?: number; // 何ヶ月分のコミッションを支払うか
  };
  tier2: {
    enabled: boolean;
    type: 'percentage' | 'fixed';
    value: number;
    recurringEnabled: boolean;
    recurringMonths?: number;
  };
  cookieDuration: number; // 日数
  minimumPayout: number;
  payoutThreshold: number; // 支払い最低金額
  applicableProducts: string[]; // プロダクトID配列
  applicableFunnels: string[]; // ファネルID配列
  autoApprove: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommissionTier {
  tier: 1 | 2;
  type: 'percentage' | 'fixed';
  value: number;
  calculatedAmount: number;
  orderId: string;
  productId: string;
  orderAmount: number;
}
```

#### 3.2.2 コミッション計算ロジック
**機能名**: コミッション自動計算

**説明**:
注文発生時に適切なコミッション金額を計算し、アフィリエイターに割り当てる。

**計算ルール**:
1. **Tier 1（直接販売）**:
   - パーセンテージ型: `注文金額 × コミッション率`
   - 固定額型: `設定された固定額`

2. **Tier 2（サブアフィリエイト）**:
   - Tier 1アフィリエイターを紹介したアフィリエイターに支払われる
   - パーセンテージ型: `注文金額 × Tier 2コミッション率`
   - 固定額型: `設定された固定額`

3. **継続課金の場合**:
   - 初回のみ: 最初の支払い時のみコミッション発生
   - 継続支払い: 設定された月数分のコミッション発生

**データモデル**:
```typescript
interface CommissionCalculation {
  id: string;
  orderId: string;
  affiliateId: string;
  tier: 1 | 2;
  planId: string;
  orderAmount: number;
  commissionType: 'percentage' | 'fixed';
  commissionRate?: number;
  commissionAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  isRecurring: boolean;
  recurringMonth?: number; // 何ヶ月目のコミッションか
  parentCommissionId?: string; // Tier 2の場合、元となるTier 1コミッションID
  calculatedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  notes?: string;
}
```

---

### 3.3 アフィリエイトキャンペーン

#### 3.3.1 キャンペーン作成
**機能名**: アフィリエイトキャンペーン管理

**説明**:
特定のプロモーション期間や商品に対してキャンペーンを作成し、専用のトラッキングとレポートを提供。

**UI要素**:
- キャンペーン名入力
- キャンペーン説明
- キャンペーン期間（開始日・終了日）
- 対象商品・ファネル選択
- 特別コミッションプラン設定
- キャンペーンコード生成
- ランディングページURL
- プロモーション素材アップロード
- 参加アフィリエイター制限（全員/選択したアフィリエイターのみ）
- パフォーマンスゴール設定
- 自動通知設定

**ユーザーアクション**:
1. 「新規キャンペーン」ボタンをクリック
2. キャンペーン情報を入力
3. 対象商品を選択
4. コミッション設定（通常プランと異なる場合）
5. プロモーション素材をアップロード
6. 参加アフィリエイターを選択（または全員に公開）
7. 保存して公開

**データモデル**:
```typescript
interface AffiliateCampaign {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startDate: Date;
  endDate: Date;
  targetProducts: string[];
  targetFunnels: string[];
  customCommissionPlan?: CommissionPlan;
  campaignCode: string;
  landingPageUrl: string;
  assets: CampaignAsset[];
  eligibility: {
    type: 'all' | 'selected' | 'tier';
    selectedAffiliates?: string[];
    minimumTier?: number;
  };
  goals: {
    type: 'revenue' | 'sales' | 'clicks';
    target: number;
    bonus?: {
      threshold: number;
      amount: number;
      type: 'percentage' | 'fixed';
    };
  };
  notifications: {
    onStart: boolean;
    onMilestone: boolean;
    onEnd: boolean;
  };
  tracking: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignAsset {
  id: string;
  type: 'banner' | 'email' | 'social' | 'video' | 'other';
  name: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  size: number; // バイト数
  format: string;
  createdAt: Date;
}
```

---

### 3.4 コミッション対象商品設定

#### 3.4.1 商品コミッション設定
**機能名**: 商品別コミッション設定

**説明**:
個別の商品やファネルに対してコミッション設定を行い、どの商品がアフィリエイトプログラムの対象かを管理。

**UI要素**:
- 商品一覧テーブル
  - 商品名
  - 価格
  - コミッション有効/無効トグル
  - 適用コミッションプラン選択
  - 特別コミッション設定
- 一括設定機能
- フィルター・検索機能
- プレビュー機能

**ユーザーアクション**:
1. 商品一覧から対象商品を選択
2. コミッション有効化トグルをON
3. コミッションプランを選択（または個別設定）
4. 特別条件がある場合は設定
5. 保存

**データモデル**:
```typescript
interface CommissionableProduct {
  id: string;
  productId: string;
  funnelId?: string;
  enabled: boolean;
  commissionPlanId: string;
  customCommission?: {
    tier1: CommissionTier;
    tier2?: CommissionTier;
  };
  restrictions?: {
    maxCommissionAmount?: number;
    excludedAffiliates?: string[];
    requireApproval: boolean;
  };
  trackingSettings: {
    allowDeepLinking: boolean;
    customParameters: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCommissionOverride {
  productId: string;
  affiliateId?: string; // 特定アフィリエイターへの特別レート
  overrideType: 'percentage' | 'fixed';
  overrideValue: number;
  reason?: string;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

---

### 3.5 アフィリエイトペイアウト

#### 3.5.1 ペイアウト管理
**機能名**: アフィリエイトペイアウト処理

**説明**:
承認されたコミッションをアフィリエイターに支払う機能。一括処理と個別処理の両方に対応。

**UI要素**:
- ペイアウト予定一覧
  - アフィリエイター名
  - 支払い予定額
  - 未払いコミッション数
  - 支払い方法
  - ステータス
- フィルター
  - 期間選択
  - 支払い方法
  - 最低金額以上
  - ステータス
- 一括選択チェックボックス
- 「ペイアウト実行」ボタン
- 個別ペイアウトボタン
- ペイアウト履歴
- エクスポート機能（CSV, PDF）

**ユーザーアクション**:
1. ペイアウト予定を確認
2. 支払い対象を選択（一括または個別）
3. 支払い方法を確認
4. 「ペイアウト実行」をクリック
5. 確認ダイアログでOK
6. 処理完了通知

**データモデル**:
```typescript
interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  commissionIds: string[]; // このペイアウトに含まれるコミッションID
  paymentMethod: 'PayPal' | 'BankTransfer' | 'Stripe' | 'Wise' | 'Check';
  paymentDetails: {
    email?: string;
    accountNumber?: string;
    transactionId?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  taxWithholding?: {
    amount: number;
    type: 'federal' | 'state' | 'foreign';
    percentage: number;
  };
  fees?: {
    processingFee: number;
    otherFees: number;
  };
  netAmount: number; // 手数料控除後の金額
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PayoutSchedule {
  id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'manual';
  dayOfWeek?: number; // 0-6 (日曜-土曜)
  dayOfMonth?: number; // 1-31
  minimumAmount: number;
  autoProcess: boolean;
  nextPayoutDate: Date;
  lastPayoutDate?: Date;
  enabled: boolean;
}

interface PayoutThreshold {
  id: string;
  affiliateId?: string; // null = デフォルト設定
  minimumAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.5.2 税務レポート
**機能名**: 1099フォーム生成

**説明**:
米国在住アフィリエイターに対する1099フォームの自動生成機能。

**UI要素**:
- 年度選択
- アフィリエイター一覧（年間$600以上の支払い）
- 「1099フォーム生成」ボタン
- プレビュー機能
- 一括ダウンロード
- 個別ダウンロード
- メール送信機能

**データモデル**:
```typescript
interface TaxForm1099 {
  id: string;
  affiliateId: string;
  year: number;
  totalPaid: number;
  formType: '1099-NEC' | '1099-MISC';
  payerInfo: {
    name: string;
    ein: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  recipientInfo: {
    name: string;
    ssn?: string;
    ein?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  box1Amount: number; // Non-employee compensation
  stateIncome?: {
    state: string;
    stateIdNumber: string;
    stateIncome: number;
  }[];
  generatedAt: Date;
  sentAt?: Date;
  downloadUrl: string;
  status: 'draft' | 'final' | 'sent' | 'corrected';
}
```

---

### 3.6 アフィリエイター管理

#### 3.6.1 アフィリエイターダッシュボード（管理者側）
**機能名**: アフィリエイター管理画面

**説明**:
管理者が全アフィリエイターの情報、パフォーマンス、ステータスを管理する画面。

**UI要素**:
- アフィリエイター一覧テーブル
  - ID
  - 氏名
  - メール
  - アフィリエイトコード
  - ステータス
  - 総売上
  - 未払いコミッション
  - 総支払い額
  - 登録日
  - 最終活動日
- アクションボタン
  - 詳細表示
  - 承認/却下
  - 停止/復活
  - コミッション調整
  - メッセージ送信
- フィルター・検索
  - ステータス
  - 期間
  - パフォーマンス
  - タグ
- エクスポート機能

**ユーザーアクション**:
1. アフィリエイター一覧を確認
2. フィルターで絞り込み
3. 詳細を表示
4. 必要に応じてアクション実行

**データモデル**:
```typescript
interface Affiliate {
  id: string;
  userId: string;
  affiliateCode: string;
  customCode?: string; // カスタムアフィリエイトコード
  status: 'pending' | 'active' | 'suspended' | 'banned' | 'inactive';
  tier: number; // アフィリエイターのランク
  referredBy?: string; // Tier 2の場合の紹介者ID
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    bio?: string;
    avatar?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
  taxInfo: {
    type: 'SSN' | 'EIN' | 'ITIN' | 'Foreign';
    number?: string;
    country: string;
    w9Submitted: boolean;
    w9FileUrl?: string;
  };
  paymentInfo: {
    method: 'PayPal' | 'BankTransfer' | 'Stripe' | 'Wise' | 'Check';
    email?: string;
    bankAccount?: {
      accountHolder: string;
      accountNumber: string;
      routingNumber: string;
      bankName: string;
      swift?: string;
    };
  };
  statistics: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCommissionsEarned: number;
    totalCommissionsPaid: number;
    pendingCommissions: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  settings: {
    emailNotifications: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    customDomain?: string;
  };
  tags: string[];
  notes?: string;
  createdAt: Date;
  approvedAt?: Date;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  updatedAt: Date;
}

interface AffiliateActivity {
  id: string;
  affiliateId: string;
  type: 'login' | 'link_generated' | 'click' | 'conversion' | 'payout' | 'profile_update';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

#### 3.6.2 アフィリエイターダッシュボード（アフィリエイター側）
**機能名**: アフィリエイターダッシュボード

**説明**:
アフィリエイターが自身のパフォーマンス、リンク、コミッションを確認・管理する画面。

**UI要素**:
- サマリーカード
  - 今月のクリック数
  - 今月のコンバージョン数
  - 今月の収益
  - 未払いコミッション残高
  - 総収益
- パフォーマンスグラフ
  - クリック数推移
  - コンバージョン推移
  - 収益推移
- 最近の成約一覧
- アフィリエイトリンク生成ツール
- プロモーション素材ダウンロード
- コミッション履歴
- ペイアウト履歴
- プロフィール設定リンク

**データモデル**:
```typescript
interface AffiliateDashboardStats {
  affiliateId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    clicks: number;
    uniqueClicks: number;
    conversions: number;
    revenue: number;
    commissionsEarned: number;
    conversionRate: number;
    averageOrderValue: number;
    epc: number; // Earnings Per Click
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  topCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  recentConversions: Array<{
    orderId: string;
    productName: string;
    orderAmount: number;
    commissionAmount: number;
    status: string;
    createdAt: Date;
  }>;
}
```

---

### 3.7 アフィリエイトアセット（素材）

#### 3.7.1 プロモーション素材管理
**機能名**: アフィリエイト素材ライブラリ

**説明**:
ビジネスオーナーがアフィリエイター向けのプロモーション素材をアップロード・管理し、アフィリエイターがダウンロードできる機能。

**UI要素**:
- 素材カテゴリ
  - バナー広告
  - メールテンプレート
  - ソーシャルメディア投稿
  - 動画
  - ランディングページテンプレート
  - その他
- アップロード機能
  - ドラッグ&ドロップ
  - ファイル選択
  - 一括アップロード
- 素材プレビュー
- 素材詳細
  - タイトル
  - 説明
  - サイズ/形式
  - 推奨用途
  - ダウンロード数
- フィルター・検索
- ダウンロードボタン
- 使用統計

**ユーザーアクション（ビジネスオーナー）**:
1. 「素材アップロード」をクリック
2. ファイルを選択またはドラッグ&ドロップ
3. カテゴリを選択
4. タイトルと説明を入力
5. 公開設定（全員/特定キャンペーンのみ）
6. アップロード実行

**ユーザーアクション（アフィリエイター）**:
1. 素材ライブラリにアクセス
2. カテゴリまたは検索で素材を探す
3. プレビューで内容確認
4. ダウンロードボタンをクリック
5. 使用方法を確認

**データモデル**:
```typescript
interface AffiliateAsset {
  id: string;
  type: 'banner' | 'email' | 'social' | 'video' | 'landing_page' | 'other';
  category: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  fileFormat: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // 動画の場合（秒）
  tags: string[];
  campaignId?: string; // 特定キャンペーン専用の場合
  visibility: 'public' | 'campaign_only' | 'restricted';
  restrictedTo?: string[]; // 特定アフィリエイターID
  recommendedUse?: string;
  statistics: {
    downloads: number;
    views: number;
    lastDownloadedAt?: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AssetDownload {
  id: string;
  assetId: string;
  affiliateId: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
}
```

---

### 3.8 カスタムアフィリエイトコード

#### 3.8.1 カスタムコード設定
**機能名**: カスタムアフィリエイトコード

**説明**:
アフィリエイターが自動生成されたコードの代わりに、覚えやすいカスタムコードを設定できる機能。

**UI要素**:
- 現在のアフィリエイトコード表示
- カスタムコード入力フィールド
- 利用可能性チェック
- 「コード変更」ボタン
- コード使用例プレビュー

**ユーザーアクション**:
1. プロフィール設定からカスタムコードセクションにアクセス
2. 希望するコードを入力
3. 利用可能性をチェック
4. 利用可能な場合、「コード変更」をクリック
5. 確認して保存

**データモデル**:
```typescript
interface AffiliateCodeChange {
  id: string;
  affiliateId: string;
  oldCode: string;
  newCode: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AffiliateCodeValidation {
  code: string;
  isAvailable: boolean;
  isValid: boolean;
  errors?: string[];
  suggestions?: string[];
}
```

**検証ルール**:
- 3文字以上20文字以内
- 英数字とハイフンのみ
- 既存のコードと重複していない
- 予約語を使用していない
- 不適切な言葉を含んでいない

---

### 3.9 トラッキング・アトリビューション

#### 3.9.1 クリックトラッキング
**機能名**: アフィリエイトリンククリックトラッキング

**説明**:
アフィリエイトリンクのクリックを記録し、Cookie（45日間有効）を設定してコンバージョンを追跡。

**UI要素**:
- アフィリエイトリンク生成ツール
  - ベースURL選択
  - カスタムパラメータ追加
  - 短縮URLオプション
  - QRコード生成
- 生成されたリンク表示
- コピーボタン
- ソーシャルシェアボタン

**トラッキングフロー**:
1. アフィリエイターがリンクを生成
2. ユーザーがリンクをクリック
3. サーバーがクリックを記録
4. 45日間有効なCookieを設定
5. リダイレクト先URLへ転送
6. Cookie期間内にコンバージョンが発生した場合、アフィリエイトに紐付け

**データモデル**:
```typescript
interface AffiliateClick {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  campaignId?: string;
  clickedUrl: string;
  destinationUrl: string;
  referrerUrl?: string;
  ipAddress: string;
  userAgent: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  customParams?: Record<string, string>;
  cookieId: string;
  isUnique: boolean; // 同じユーザーの初回クリックかどうか
  convertedOrderId?: string;
  clickedAt: Date;
}

interface AffiliateCookie {
  id: string;
  cookieId: string;
  affiliateId: string;
  clickId: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
}

interface AffiliateLink {
  id: string;
  affiliateId: string;
  baseUrl: string;
  trackingUrl: string;
  shortUrl?: string;
  qrCodeUrl?: string;
  campaignId?: string;
  productId?: string;
  customParams?: Record<string, string>;
  statistics: {
    clicks: number;
    uniqueClicks: number;
    conversions: number;
  };
  createdAt: Date;
  lastClickedAt?: Date;
}
```

#### 3.9.2 コンバージョンアトリビューション
**機能名**: アフィリエイトアトリビューション

**説明**:
注文とアフィリエイターを紐付けるロジック。ラストクリックアトリビューションモデルを使用。

**アトリビューションルール**:
1. Cookie期間内（45日以内）の最新のアフィリエイトクリックを採用
2. 複数のアフィリエイトリンクをクリックした場合、最後のクリックが優先
3. Cookie期間外の場合、アフィリエイトコミッションは発生しない
4. 同じアフィリエイターが複数回クリックされた場合、最新のクリックで更新

**データモデル**:
```typescript
interface ConversionAttribution {
  id: string;
  orderId: string;
  clickId: string;
  affiliateId: string;
  campaignId?: string;
  productId: string;
  orderAmount: number;
  commissionAmount: number;
  attributionModel: 'last_click' | 'first_click' | 'linear';
  cookieAge: number; // クリックから注文までの日数
  conversionPath?: {
    clickId: string;
    affiliateId: string;
    clickedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  attributedAt: Date;
  approvedAt?: Date;
}

interface FraudDetection {
  id: string;
  affiliateId: string;
  type: 'duplicate_click' | 'click_fraud' | 'cookie_stuffing' | 'self_referral' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, any>;
  status: 'flagged' | 'reviewed' | 'confirmed' | 'dismissed';
  actionTaken?: string;
  detectedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
```

---

### 3.10 レポート・分析

#### 3.10.1 アフィリエイトレポート
**機能名**: アフィリエイトパフォーマンスレポート

**説明**:
アフィリエイターとビジネスオーナー向けの詳細なパフォーマンスレポート。

**UI要素**:
- 期間選択
  - 今日
  - 昨日
  - 過去7日間
  - 過去30日間
  - 今月
  - 先月
  - カスタム期間
- メトリクス選択
- グラフ表示
  - クリック数
  - コンバージョン数
  - 収益
  - コンバージョン率
  - EPC（Earnings Per Click）
- データテーブル
- エクスポート機能（CSV, PDF, Excel）
- スケジュール配信設定

**レポート種類**:
1. **パフォーマンスサマリー**
   - 総クリック数
   - 総コンバージョン数
   - 総収益
   - 平均コンバージョン率
   - 平均注文額
   - EPC

2. **商品別レポート**
   - 商品ごとのクリック、コンバージョン、収益

3. **キャンペーン別レポート**
   - キャンペーンごとのパフォーマンス

4. **時系列レポート**
   - 日別、週別、月別の推移

5. **地理的レポート**
   - 国別、地域別のパフォーマンス

6. **デバイス別レポート**
   - デスクトップ、モバイル、タブレット

**データモデル**:
```typescript
interface AffiliateReport {
  id: string;
  affiliateId?: string; // null = 全体レポート
  reportType: 'performance' | 'product' | 'campaign' | 'geographic' | 'device';
  period: {
    start: Date;
    end: Date;
  };
  data: {
    summary: {
      clicks: number;
      uniqueClicks: number;
      conversions: number;
      revenue: number;
      commissions: number;
      conversionRate: number;
      averageOrderValue: number;
      epc: number;
    };
    breakdown: Array<{
      dimension: string; // 商品ID、キャンペーンID、国コードなど
      dimensionName: string;
      clicks: number;
      conversions: number;
      revenue: number;
      commissions: number;
    }>;
    timeSeries?: Array<{
      date: Date;
      clicks: number;
      conversions: number;
      revenue: number;
    }>;
  };
  generatedAt: Date;
  generatedBy?: string;
}

interface ScheduledReport {
  id: string;
  affiliateId?: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay: string; // HH:MM形式
  recipients: string[]; // メールアドレス
  format: 'pdf' | 'csv' | 'excel';
  enabled: boolean;
  lastSentAt?: Date;
  nextScheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 4. コミッション計算要件

### 4.1 コミッションタイプ

#### 4.1.1 パーセンテージコミッション
```typescript
function calculatePercentageCommission(
  orderAmount: number,
  commissionRate: number
): number {
  return orderAmount * (commissionRate / 100);
}

// 例: 注文額$100、コミッション率30%
// コミッション = $100 * 0.30 = $30
```

#### 4.1.2 固定額コミッション
```typescript
function calculateFixedCommission(
  fixedAmount: number
): number {
  return fixedAmount;
}

// 例: 固定コミッション$25
// コミッション = $25
```

### 4.2 Tier構造

#### 4.2.1 Tier 1（直接販売）
- アフィリエイターのリンクから直接購入された場合
- 最も高いコミッション率

```typescript
interface Tier1Commission {
  affiliateId: string;
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tier: 1;
}
```

#### 4.2.2 Tier 2（サブアフィリエイト）
- Tier 1アフィリエイターを紹介したアフィリエイターへの報酬
- Tier 1よりも低いコミッション率（通常10-20%）

```typescript
interface Tier2Commission {
  affiliateId: string; // Tier 2アフィリエイター
  tier1AffiliateId: string; // 紹介したTier 1アフィリエイター
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tier: 2;
}
```

**計算例**:
```typescript
// 注文額: $1000
// Tier 1コミッション率: 30%
// Tier 2コミッション率: 10%

const tier1Commission = 1000 * 0.30; // $300
const tier2Commission = 1000 * 0.10; // $100

// Tier 1アフィリエイターは$300を獲得
// Tier 2アフィリエイター（Tier 1を紹介した人）は$100を獲得
```

### 4.3 継続課金コミッション

#### 4.3.1 初回のみ
- サブスクリプションの初回支払い時のみコミッション発生

```typescript
function calculateInitialCommission(
  initialAmount: number,
  commissionRate: number
): number {
  return initialAmount * (commissionRate / 100);
}
```

#### 4.3.2 継続支払い
- 設定された月数分、毎月コミッション発生

```typescript
interface RecurringCommission {
  affiliateId: string;
  subscriptionId: string;
  monthlyAmount: number;
  commissionRate: number;
  maxMonths: number; // 例: 12ヶ月
  currentMonth: number;
  monthlyCommission: number;
  remainingMonths: number;
}

function calculateRecurringCommission(
  monthlyAmount: number,
  commissionRate: number,
  month: number,
  maxMonths: number
): number | null {
  if (month > maxMonths) {
    return null; // コミッション期間終了
  }
  return monthlyAmount * (commissionRate / 100);
}
```

### 4.4 Cookieトラッキング（45日間）

#### 4.4.1 Cookie設定
```typescript
interface AffiliateCookieSettings {
  name: string; // Cookie名
  duration: number; // 45日間（日数）
  domain: string;
  secure: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
}

const AFFILIATE_COOKIE_CONFIG: AffiliateCookieSettings = {
  name: 'aff_ref',
  duration: 45,
  domain: '.yourdomain.com',
  secure: true,
  sameSite: 'Lax'
};
```

#### 4.4.2 Cookie検証
```typescript
function isAffiliateCookieValid(
  cookieCreatedAt: Date,
  orderCreatedAt: Date
): boolean {
  const daysDifference = Math.floor(
    (orderCreatedAt.getTime() - cookieCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDifference <= 45;
}
```

### 4.5 アトリビューションルール

#### 4.5.1 ラストクリックアトリビューション
- Cookie期間内の最後のアフィリエイトクリックを採用

```typescript
function getLastClickAttribution(
  clicks: AffiliateClick[],
  orderDate: Date
): AffiliateClick | null {
  const validClicks = clicks
    .filter(click => {
      const cookieAge = (orderDate.getTime() - click.clickedAt.getTime()) / (1000 * 60 * 60 * 24);
      return cookieAge <= 45;
    })
    .sort((a, b) => b.clickedAt.getTime() - a.clickedAt.getTime());

  return validClicks[0] || null;
}
```

#### 4.5.2 重複防止
```typescript
interface DuplicatePreventionRule {
  sameAffiliateSameProduct: boolean; // 同じアフィリエイト、同じ商品
  sameCustomerSameProduct: boolean; // 同じ顧客、同じ商品
  timeWindow: number; // 日数
}

function isDuplicateCommission(
  newOrder: Order,
  existingCommissions: CommissionCalculation[],
  rule: DuplicatePreventionRule
): boolean {
  // 実装ロジック
  return false;
}
```

---

## 5. ペイアウト要件

### 5.1 ペイアウト閾値

#### 5.1.1 最低ペイアウト金額
- デフォルト: $50
- カスタマイズ可能（アフィリエイターごと）

```typescript
interface PayoutThresholdRule {
  defaultMinimum: number; // $50
  currency: string; // 'USD'
  allowCustomThreshold: boolean;
  customThresholds: Map<string, number>; // affiliateId -> threshold
}

function isEligibleForPayout(
  affiliateId: string,
  pendingCommissions: number,
  threshold: PayoutThresholdRule
): boolean {
  const minimumAmount = threshold.customThresholds.get(affiliateId) || threshold.defaultMinimum;
  return pendingCommissions >= minimumAmount;
}
```

### 5.2 支払い方法

#### 5.2.1 対応支払い方法
- PayPal
- 銀行振込（ACH、Wire Transfer）
- Stripe
- Wise（TransferWise）
- 小切手（Check）

```typescript
interface PaymentMethodConfig {
  method: 'PayPal' | 'BankTransfer' | 'Stripe' | 'Wise' | 'Check';
  enabled: boolean;
  fees?: {
    percentage?: number;
    fixed?: number;
    minimum?: number;
    maximum?: number;
  };
  processingTime: {
    min: number; // 日数
    max: number;
  };
  minimumAmount?: number;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    method: 'PayPal',
    enabled: true,
    fees: { percentage: 2.9, fixed: 0.30 },
    processingTime: { min: 1, max: 3 },
    minimumAmount: 10
  },
  {
    method: 'BankTransfer',
    enabled: true,
    fees: { fixed: 25 },
    processingTime: { min: 3, max: 5 },
    minimumAmount: 100
  },
  {
    method: 'Stripe',
    enabled: true,
    fees: { percentage: 2.9, fixed: 0.30 },
    processingTime: { min: 1, max: 2 },
    minimumAmount: 10
  },
  {
    method: 'Wise',
    enabled: true,
    fees: { percentage: 0.5 },
    processingTime: { min: 1, max: 3 },
    minimumAmount: 20
  },
  {
    method: 'Check',
    enabled: true,
    fees: { fixed: 5 },
    processingTime: { min: 7, max: 14 },
    minimumAmount: 50
  }
];
```

### 5.3 ペイアウトスケジュール

#### 5.3.1 スケジュールオプション
- 毎週
- 隔週
- 毎月
- 手動

```typescript
interface PayoutScheduleConfig {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'manual';
  dayOfWeek?: number; // 0-6（日曜-土曜）、weeklyとbiweeklyの場合
  dayOfMonth?: number; // 1-31、monthlyの場合
  autoProcess: boolean;
  notifyBeforeDays: number; // ペイアウト前の通知（日数）
}

function getNextPayoutDate(schedule: PayoutScheduleConfig, currentDate: Date): Date {
  // 実装ロジック
  const nextDate = new Date(currentDate);

  switch (schedule.frequency) {
    case 'weekly':
      // 次の指定曜日を計算
      break;
    case 'biweekly':
      // 2週間後の指定曜日を計算
      break;
    case 'monthly':
      // 次の月の指定日を計算
      break;
    case 'manual':
      // 手動のため、nullまたは未設定
      break;
  }

  return nextDate;
}
```

### 5.4 税務レポート

#### 5.4.1 1099フォーム要件
- 年間$600以上の支払いがある米国在住アフィリエイターに発行
- 1099-NECフォーム（Non-Employee Compensation）
- 翌年1月31日までに発行

```typescript
interface Tax1099Requirement {
  minimumAmount: number; // $600
  formType: '1099-NEC' | '1099-MISC';
  deadline: {
    month: number; // 1 (January)
    day: number; // 31
  };
  recipientCriteria: {
    country: string; // 'US'
    minimumPayout: number; // $600
    entityType: 'individual' | 'business';
  };
}

function shouldGenerate1099(
  affiliate: Affiliate,
  totalPayoutsYear: number,
  year: number
): boolean {
  const isUSResident = affiliate.taxInfo.country === 'US';
  const meetsThreshold = totalPayoutsYear >= 600;
  const hasValidTaxInfo = affiliate.taxInfo.w9Submitted;

  return isUSResident && meetsThreshold && hasValidTaxInfo;
}
```

#### 5.4.2 W-9フォーム収集
- アフィリエイター登録時または初回ペイアウト前に収集

```typescript
interface W9Form {
  id: string;
  affiliateId: string;
  businessName?: string;
  taxClassification: 'individual' | 'sole_proprietor' | 'llc' | 'corporation' | 'partnership';
  ssn?: string;
  ein?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  signatureDate: Date;
  fileUrl: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
}
```

### 5.5 ペイアウト処理フロー

```typescript
interface PayoutProcessFlow {
  steps: Array<{
    order: number;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
  }>;
}

const PAYOUT_PROCESS_STEPS = [
  '1. 対象アフィリエイター特定',
  '2. コミッション集計',
  '3. 閾値確認',
  '4. 税務確認（W-9等）',
  '5. 支払い情報確認',
  '6. 手数料計算',
  '7. ペイアウト実行',
  '8. 通知送信',
  '9. 記録更新'
];

async function processPayouts(
  payoutDate: Date
): Promise<PayoutProcessResult[]> {
  const results: PayoutProcessResult[] = [];

  // 1. 対象アフィリエイター特定
  const eligibleAffiliates = await getEligibleAffiliates(payoutDate);

  for (const affiliate of eligibleAffiliates) {
    // 2. コミッション集計
    const pendingCommissions = await getPendingCommissions(affiliate.id);
    const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    // 3. 閾値確認
    if (!meetsThreshold(totalAmount, affiliate)) {
      continue;
    }

    // 4-9. 残りのステップを実行
    const result = await executePayout(affiliate, pendingCommissions, totalAmount);
    results.push(result);
  }

  return results;
}
```

---

## 6. API要件

### 6.1 REST APIエンドポイント

#### 6.1.1 アフィリエイター管理

```typescript
// アフィリエイター登録
POST /api/v1/affiliates/register
Request Body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
  taxInfo: TaxInfo;
  paymentInfo: PaymentInfo;
  termsAccepted: boolean;
}
Response: {
  affiliateId: string;
  affiliateCode: string;
  status: 'pending' | 'approved';
  message: string;
}

// アフィリエイター認証
POST /api/v1/affiliates/login
Request Body: {
  email: string;
  password: string;
  rememberMe?: boolean;
}
Response: {
  token: string;
  refreshToken: string;
  affiliate: Affiliate;
  expiresAt: Date;
}

// アフィリエイター情報取得
GET /api/v1/affiliates/:affiliateId
Headers: Authorization: Bearer {token}
Response: Affiliate

// アフィリエイター情報更新
PATCH /api/v1/affiliates/:affiliateId
Headers: Authorization: Bearer {token}
Request Body: Partial<Affiliate>
Response: Affiliate

// アフィリエイター一覧取得（管理者のみ）
GET /api/v1/admin/affiliates
Headers: Authorization: Bearer {token}
Query Params: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
Response: {
  affiliates: Affiliate[];
  total: number;
  page: number;
  limit: number;
}

// アフィリエイター承認/却下（管理者のみ）
POST /api/v1/admin/affiliates/:affiliateId/approve
Headers: Authorization: Bearer {token}
Request Body: {
  approve: boolean;
  reason?: string;
}
Response: {
  success: boolean;
  affiliate: Affiliate;
}
```

#### 6.1.2 コミッション管理

```typescript
// コミッション一覧取得
GET /api/v1/affiliates/:affiliateId/commissions
Headers: Authorization: Bearer {token}
Query Params: {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
Response: {
  commissions: CommissionCalculation[];
  total: number;
  summary: {
    totalEarned: number;
    totalPending: number;
    totalPaid: number;
  };
}

// コミッション詳細取得
GET /api/v1/affiliates/:affiliateId/commissions/:commissionId
Headers: Authorization: Bearer {token}
Response: CommissionCalculation

// コミッション承認/却下（管理者のみ）
POST /api/v1/admin/commissions/:commissionId/review
Headers: Authorization: Bearer {token}
Request Body: {
  approve: boolean;
  reason?: string;
}
Response: {
  success: boolean;
  commission: CommissionCalculation;
}
```

#### 6.1.3 ペイアウト管理

```typescript
// ペイアウト履歴取得
GET /api/v1/affiliates/:affiliateId/payouts
Headers: Authorization: Bearer {token}
Query Params: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
Response: {
  payouts: AffiliatePayout[];
  total: number;
}

// ペイアウト詳細取得
GET /api/v1/affiliates/:affiliateId/payouts/:payoutId
Headers: Authorization: Bearer {token}
Response: AffiliatePayout

// ペイアウト実行（管理者のみ）
POST /api/v1/admin/payouts/process
Headers: Authorization: Bearer {token}
Request Body: {
  affiliateIds?: string[]; // 指定がない場合は全対象者
  paymentMethod?: string;
  scheduledDate?: Date;
}
Response: {
  payoutsCreated: number;
  totalAmount: number;
  payouts: AffiliatePayout[];
}

// 個別ペイアウト実行（管理者のみ）
POST /api/v1/admin/affiliates/:affiliateId/payout
Headers: Authorization: Bearer {token}
Request Body: {
  commissionIds: string[];
  paymentMethod: string;
  scheduledDate?: Date;
}
Response: AffiliatePayout
```

#### 6.1.4 キャンペーン管理

```typescript
// キャンペーン一覧取得
GET /api/v1/campaigns
Headers: Authorization: Bearer {token}
Query Params: {
  status?: string;
  page?: number;
  limit?: number;
}
Response: {
  campaigns: AffiliateCampaign[];
  total: number;
}

// キャンペーン詳細取得
GET /api/v1/campaigns/:campaignId
Headers: Authorization: Bearer {token}
Response: AffiliateCampaign

// キャンペーン作成（管理者のみ）
POST /api/v1/admin/campaigns
Headers: Authorization: Bearer {token}
Request Body: Partial<AffiliateCampaign>
Response: AffiliateCampaign

// キャンペーン更新（管理者のみ）
PATCH /api/v1/admin/campaigns/:campaignId
Headers: Authorization: Bearer {token}
Request Body: Partial<AffiliateCampaign>
Response: AffiliateCampaign

// キャンペーン削除（管理者のみ）
DELETE /api/v1/admin/campaigns/:campaignId
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

#### 6.1.5 リンク・トラッキング

```typescript
// アフィリエイトリンク生成
POST /api/v1/affiliates/:affiliateId/links
Headers: Authorization: Bearer {token}
Request Body: {
  destinationUrl: string;
  campaignId?: string;
  productId?: string;
  customParams?: Record<string, string>;
  generateShortUrl?: boolean;
  generateQrCode?: boolean;
}
Response: AffiliateLink

// アフィリエイトリンク一覧取得
GET /api/v1/affiliates/:affiliateId/links
Headers: Authorization: Bearer {token}
Response: AffiliateLink[]

// クリック統計取得
GET /api/v1/affiliates/:affiliateId/clicks
Headers: Authorization: Bearer {token}
Query Params: {
  startDate?: Date;
  endDate?: Date;
  linkId?: string;
  campaignId?: string;
}
Response: {
  clicks: AffiliateClick[];
  summary: {
    totalClicks: number;
    uniqueClicks: number;
    conversionRate: number;
  };
}
```

#### 6.1.6 レポート・分析

```typescript
// ダッシュボード統計取得
GET /api/v1/affiliates/:affiliateId/dashboard
Headers: Authorization: Bearer {token}
Query Params: {
  startDate?: Date;
  endDate?: Date;
}
Response: AffiliateDashboardStats

// パフォーマンスレポート取得
GET /api/v1/affiliates/:affiliateId/reports/performance
Headers: Authorization: Bearer {token}
Query Params: {
  startDate: Date;
  endDate: Date;
  groupBy?: 'day' | 'week' | 'month';
}
Response: AffiliateReport

// 商品別レポート取得
GET /api/v1/affiliates/:affiliateId/reports/products
Headers: Authorization: Bearer {token}
Query Params: {
  startDate: Date;
  endDate: Date;
}
Response: AffiliateReport

// レポートエクスポート
POST /api/v1/affiliates/:affiliateId/reports/export
Headers: Authorization: Bearer {token}
Request Body: {
  reportType: string;
  format: 'csv' | 'pdf' | 'excel';
  startDate: Date;
  endDate: Date;
}
Response: {
  downloadUrl: string;
  expiresAt: Date;
}
```

#### 6.1.7 素材管理

```typescript
// 素材一覧取得
GET /api/v1/assets
Headers: Authorization: Bearer {token}
Query Params: {
  type?: string;
  category?: string;
  campaignId?: string;
  page?: number;
  limit?: number;
}
Response: {
  assets: AffiliateAsset[];
  total: number;
}

// 素材詳細取得
GET /api/v1/assets/:assetId
Headers: Authorization: Bearer {token}
Response: AffiliateAsset

// 素材アップロード（管理者のみ）
POST /api/v1/admin/assets
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Request Body: FormData {
  file: File;
  type: string;
  category: string;
  title: string;
  description?: string;
  campaignId?: string;
  tags?: string[];
}
Response: AffiliateAsset

// 素材ダウンロード記録
POST /api/v1/assets/:assetId/download
Headers: Authorization: Bearer {token}
Response: {
  downloadUrl: string;
  expiresAt: Date;
}
```

---

## 7. データベーススキーマ

### 7.1 テーブル定義

#### 7.1.1 affiliates（アフィリエイター）
```sql
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(50) UNIQUE NOT NULL,
  custom_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  tier INTEGER DEFAULT 1,
  referred_by UUID REFERENCES affiliates(id),

  -- プロフィール
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  company VARCHAR(255),
  website VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,

  -- ソーシャルメディア
  social_facebook VARCHAR(255),
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  social_youtube VARCHAR(255),
  social_tiktok VARCHAR(255),

  -- 税務情報
  tax_type VARCHAR(20),
  tax_number VARCHAR(50),
  tax_country VARCHAR(2),
  w9_submitted BOOLEAN DEFAULT FALSE,
  w9_file_url TEXT,

  -- 支払い情報
  payment_method VARCHAR(50),
  payment_email VARCHAR(255),
  payment_account_holder VARCHAR(255),
  payment_account_number VARCHAR(100),
  payment_routing_number VARCHAR(50),
  payment_bank_name VARCHAR(255),
  payment_swift VARCHAR(20),

  -- 統計
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_commissions_earned DECIMAL(12, 2) DEFAULT 0,
  total_commissions_paid DECIMAL(12, 2) DEFAULT 0,
  pending_commissions DECIMAL(12, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  average_order_value DECIMAL(12, 2) DEFAULT 0,

  -- 設定
  email_notifications BOOLEAN DEFAULT TRUE,
  weekly_reports BOOLEAN DEFAULT TRUE,
  monthly_reports BOOLEAN DEFAULT TRUE,
  custom_domain VARCHAR(255),

  -- メタデータ
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- インデックス
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'suspended', 'banned', 'inactive')),
  CONSTRAINT valid_tax_type CHECK (tax_type IN ('SSN', 'EIN', 'ITIN', 'Foreign')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('PayPal', 'BankTransfer', 'Stripe', 'Wise', 'Check'))
);

CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_custom_code ON affiliates(custom_code);
CREATE INDEX idx_affiliates_referred_by ON affiliates(referred_by);
CREATE INDEX idx_affiliates_email ON affiliates(email);
```

#### 7.1.2 commission_plans（コミッションプラン）
```sql
CREATE TABLE commission_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  -- Tier 1設定
  tier1_enabled BOOLEAN DEFAULT TRUE,
  tier1_type VARCHAR(20) NOT NULL,
  tier1_value DECIMAL(12, 2) NOT NULL,
  tier1_recurring_enabled BOOLEAN DEFAULT FALSE,
  tier1_recurring_months INTEGER,

  -- Tier 2設定
  tier2_enabled BOOLEAN DEFAULT FALSE,
  tier2_type VARCHAR(20),
  tier2_value DECIMAL(12, 2),
  tier2_recurring_enabled BOOLEAN DEFAULT FALSE,
  tier2_recurring_months INTEGER,

  -- その他設定
  cookie_duration INTEGER DEFAULT 45,
  minimum_payout DECIMAL(12, 2) DEFAULT 50.00,
  payout_threshold DECIMAL(12, 2) DEFAULT 50.00,
  auto_approve BOOLEAN DEFAULT FALSE,

  -- 適用範囲
  applicable_products UUID[],
  applicable_funnels UUID[],

  -- 有効期間
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- メタデータ
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'archived')),
  CONSTRAINT valid_tier1_type CHECK (tier1_type IN ('percentage', 'fixed')),
  CONSTRAINT valid_tier2_type CHECK (tier2_type IN ('percentage', 'fixed'))
);

CREATE INDEX idx_commission_plans_status ON commission_plans(status);
```

#### 7.1.3 affiliate_campaigns（キャンペーン）
```sql
CREATE TABLE affiliate_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  -- 期間
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- 対象
  target_products UUID[],
  target_funnels UUID[],

  -- コミッション
  custom_commission_plan_id UUID REFERENCES commission_plans(id),

  -- キャンペーン設定
  campaign_code VARCHAR(50) UNIQUE NOT NULL,
  landing_page_url TEXT,

  -- 参加資格
  eligibility_type VARCHAR(20) NOT NULL DEFAULT 'all',
  selected_affiliates UUID[],
  minimum_tier INTEGER,

  -- ゴール
  goal_type VARCHAR(20),
  goal_target DECIMAL(12, 2),
  bonus_threshold DECIMAL(12, 2),
  bonus_amount DECIMAL(12, 2),
  bonus_type VARCHAR(20),

  -- 通知
  notify_on_start BOOLEAN DEFAULT TRUE,
  notify_on_milestone BOOLEAN DEFAULT TRUE,
  notify_on_end BOOLEAN DEFAULT TRUE,

  -- トラッキング
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,

  -- メタデータ
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  CONSTRAINT valid_eligibility CHECK (eligibility_type IN ('all', 'selected', 'tier')),
  CONSTRAINT valid_goal_type CHECK (goal_type IN ('revenue', 'sales', 'clicks')),
  CONSTRAINT valid_bonus_type CHECK (bonus_type IN ('percentage', 'fixed'))
);

CREATE INDEX idx_campaigns_status ON affiliate_campaigns(status);
CREATE INDEX idx_campaigns_dates ON affiliate_campaigns(start_date, end_date);
```

#### 7.1.4 affiliate_clicks（クリック）
```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(50) NOT NULL,
  campaign_id UUID REFERENCES affiliate_campaigns(id),

  -- URL情報
  clicked_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  referrer_url TEXT,

  -- ユーザー情報
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  device_os VARCHAR(50),
  device_browser VARCHAR(50),

  -- 位置情報
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),

  -- UTMパラメータ
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),

  -- カスタムパラメータ
  custom_params JSONB,

  -- トラッキング
  cookie_id UUID NOT NULL,
  is_unique BOOLEAN DEFAULT TRUE,
  converted_order_id UUID,

  -- タイムスタンプ
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet'))
);

CREATE INDEX idx_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_clicks_campaign ON affiliate_clicks(campaign_id);
CREATE INDEX idx_clicks_cookie ON affiliate_clicks(cookie_id);
CREATE INDEX idx_clicks_date ON affiliate_clicks(clicked_at);
CREATE INDEX idx_clicks_converted ON affiliate_clicks(converted_order_id);
```

#### 7.1.5 affiliate_cookies（Cookie）
```sql
CREATE TABLE affiliate_cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cookie_id UUID UNIQUE NOT NULL,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  click_id UUID NOT NULL REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cookies_id ON affiliate_cookies(cookie_id);
CREATE INDEX idx_cookies_affiliate ON affiliate_cookies(affiliate_id);
CREATE INDEX idx_cookies_active ON affiliate_cookies(is_active, expires_at);
```

#### 7.1.6 commissions（コミッション）
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL DEFAULT 1,
  plan_id UUID NOT NULL REFERENCES commission_plans(id),

  -- 金額情報
  order_amount DECIMAL(12, 2) NOT NULL,
  commission_type VARCHAR(20) NOT NULL,
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- 継続課金
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_month INTEGER,
  parent_commission_id UUID REFERENCES commissions(id),

  -- タイムスタンプ
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- メモ
  notes TEXT,

  CONSTRAINT valid_tier CHECK (tier IN (1, 2)),
  CONSTRAINT valid_commission_type CHECK (commission_type IN ('percentage', 'fixed')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'paid'))
);

CREATE INDEX idx_commissions_affiliate ON commissions(affiliate_id);
CREATE INDEX idx_commissions_order ON commissions(order_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_dates ON commissions(calculated_at, approved_at, paid_at);
```

#### 7.1.7 affiliate_payouts（ペイアウト）
```sql
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,

  -- 金額
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  commission_ids UUID[] NOT NULL,

  -- 支払い情報
  payment_method VARCHAR(50) NOT NULL,
  payment_email VARCHAR(255),
  payment_account_number VARCHAR(100),
  payment_transaction_id VARCHAR(255),

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- 日付
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,

  -- 失敗情報
  failure_reason TEXT,

  -- 税金
  tax_withholding_amount DECIMAL(12, 2) DEFAULT 0,
  tax_withholding_type VARCHAR(20),
  tax_withholding_percentage DECIMAL(5, 2),

  -- 手数料
  processing_fee DECIMAL(12, 2) DEFAULT 0,
  other_fees DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,

  -- メタデータ
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_payment_method CHECK (payment_method IN ('PayPal', 'BankTransfer', 'Stripe', 'Wise', 'Check')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT valid_tax_type CHECK (tax_withholding_type IN ('federal', 'state', 'foreign'))
);

CREATE INDEX idx_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON affiliate_payouts(status);
CREATE INDEX idx_payouts_dates ON affiliate_payouts(scheduled_date, completed_date);
```

#### 7.1.8 affiliate_assets（素材）
```sql
CREATE TABLE affiliate_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- ファイル情報
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  file_format VARCHAR(20) NOT NULL,

  -- メタデータ
  dimensions_width INTEGER,
  dimensions_height INTEGER,
  duration INTEGER,
  tags TEXT[],

  -- 公開設定
  campaign_id UUID REFERENCES affiliate_campaigns(id),
  visibility VARCHAR(20) DEFAULT 'public',
  restricted_to UUID[],

  -- 推奨用途
  recommended_use TEXT,

  -- 統計
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,

  -- メタデータ
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_type CHECK (type IN ('banner', 'email', 'social', 'video', 'landing_page', 'other')),
  CONSTRAINT valid_visibility CHECK (visibility IN ('public', 'campaign_only', 'restricted'))
);

CREATE INDEX idx_assets_type ON affiliate_assets(type);
CREATE INDEX idx_assets_campaign ON affiliate_assets(campaign_id);
CREATE INDEX idx_assets_visibility ON affiliate_assets(visibility);
```

#### 7.1.9 tax_forms_1099（1099フォーム）
```sql
CREATE TABLE tax_forms_1099 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_paid DECIMAL(12, 2) NOT NULL,
  form_type VARCHAR(20) NOT NULL,

  -- 支払者情報
  payer_name VARCHAR(255) NOT NULL,
  payer_ein VARCHAR(20) NOT NULL,
  payer_address TEXT NOT NULL,
  payer_city VARCHAR(100) NOT NULL,
  payer_state VARCHAR(2) NOT NULL,
  payer_zip VARCHAR(10) NOT NULL,

  -- 受取人情報
  recipient_name VARCHAR(255) NOT NULL,
  recipient_ssn VARCHAR(20),
  recipient_ein VARCHAR(20),
  recipient_address TEXT NOT NULL,
  recipient_city VARCHAR(100) NOT NULL,
  recipient_state VARCHAR(2) NOT NULL,
  recipient_zip VARCHAR(10) NOT NULL,

  -- フォーム内容
  box1_amount DECIMAL(12, 2) NOT NULL,
  state_income JSONB,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  download_url TEXT,

  -- タイムスタンプ
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_form_type CHECK (form_type IN ('1099-NEC', '1099-MISC')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'final', 'sent', 'corrected')),
  CONSTRAINT unique_affiliate_year UNIQUE (affiliate_id, year)
);

CREATE INDEX idx_1099_affiliate ON tax_forms_1099(affiliate_id);
CREATE INDEX idx_1099_year ON tax_forms_1099(year);
```

#### 7.1.10 affiliate_activities（アクティビティログ）
```sql
CREATE TABLE affiliate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_affiliate ON affiliate_activities(affiliate_id);
CREATE INDEX idx_activities_type ON affiliate_activities(type);
CREATE INDEX idx_activities_date ON affiliate_activities(created_at);
```

---

## 8. セキュリティ要件

### 8.1 認証・認可

#### 8.1.1 アフィリエイターアクセス制御
```typescript
interface AffiliatePermissions {
  canViewOwnData: boolean;
  canEditOwnProfile: boolean;
  canGenerateLinks: boolean;
  canDownloadAssets: boolean;
  canViewCommissions: boolean;
  canRequestPayout: boolean;
}

interface AdminPermissions extends AffiliatePermissions {
  canApproveAffiliates: boolean;
  canManageCommissions: boolean;
  canProcessPayouts: boolean;
  canManageCampaigns: boolean;
  canViewAllAffiliates: boolean;
  canEditCommissionPlans: boolean;
  canUploadAssets: boolean;
  canViewReports: boolean;
}
```

### 8.2 データ保護

#### 8.2.1 個人情報保護
- SSN/EIN等の税務情報は暗号化して保存
- PCI DSS準拠（支払い情報）
- GDPR準拠（EU居住者の場合）
- データ削除リクエスト対応

#### 8.2.2 不正検出
```typescript
interface FraudDetectionRule {
  name: string;
  type: 'click_fraud' | 'cookie_stuffing' | 'self_referral' | 'duplicate_account';
  threshold: number;
  action: 'flag' | 'block' | 'notify';
  enabled: boolean;
}

const FRAUD_RULES: FraudDetectionRule[] = [
  {
    name: '異常なクリック数',
    type: 'click_fraud',
    threshold: 100, // 1時間に100クリック以上
    action: 'flag',
    enabled: true
  },
  {
    name: 'Cookie Stuffing',
    type: 'cookie_stuffing',
    threshold: 10, // 同一IPから10個以上のCookie
    action: 'block',
    enabled: true
  },
  {
    name: '自己紹介',
    type: 'self_referral',
    threshold: 1,
    action: 'flag',
    enabled: true
  }
];
```

---

## 9. 通知要件

### 9.1 アフィリエイター向け通知

#### 9.1.1 通知タイプ
```typescript
interface AffiliateNotification {
  type:
    | 'registration_approved'
    | 'registration_rejected'
    | 'new_conversion'
    | 'commission_approved'
    | 'payout_processed'
    | 'payout_completed'
    | 'new_campaign'
    | 'campaign_ending'
    | 'weekly_report'
    | 'monthly_report';
  channel: 'email' | 'sms' | 'in_app' | 'webhook';
  template: string;
  variables: Record<string, any>;
}
```

#### 9.1.2 通知例
```typescript
const NOTIFICATION_TEMPLATES = {
  new_conversion: {
    subject: '新しい成約が発生しました！',
    body: `
      おめでとうございます！新しい成約が発生しました。

      商品: {{productName}}
      注文金額: {{orderAmount}}
      コミッション: {{commissionAmount}}

      ダッシュボードで詳細を確認: {{dashboardUrl}}
    `
  },
  payout_completed: {
    subject: 'コミッションの支払いが完了しました',
    body: `
      {{paymentMethod}}への支払いが完了しました。

      金額: {{amount}}
      コミッション数: {{commissionCount}}
      支払日: {{paidDate}}

      詳細: {{payoutDetailsUrl}}
    `
  }
};
```

### 9.2 管理者向け通知

#### 9.2.1 通知タイプ
- 新規アフィリエイター登録
- 不正検出アラート
- ペイアウト処理完了
- キャンペーン目標達成
- システムエラー

---

## 10. パフォーマンス要件

### 10.1 レスポンスタイム目標
- クリックトラッキング: < 100ms
- リダイレクト: < 200ms
- ダッシュボード読み込み: < 1秒
- レポート生成: < 5秒
- ペイアウト処理: バックグラウンド

### 10.2 スケーラビリティ
- 10,000アフィリエイター対応
- 100万クリック/日対応
- 10,000コンバージョン/日対応

---

## 11. 実装優先順位

### Phase 1（MVP）
1. アフィリエイター登録・認証
2. 基本的なコミッションプラン
3. アフィリエイトリンク生成
4. クリックトラッキング
5. コミッション計算
6. 基本ダッシュボード

### Phase 2
1. キャンペーン管理
2. Tier 2コミッション
3. 継続課金コミッション
4. ペイアウト処理
5. レポート機能

### Phase 3
1. プロモーション素材管理
2. 高度なレポート・分析
3. 不正検出
4. 税務レポート（1099）
5. Webhook統合

---

## 12. 技術スタック推奨

### 12.1 フロントエンド
- React + TypeScript
- Tailwind CSS
- React Query（データフェッチング）
- Recharts（グラフ表示）
- React Hook Form（フォーム管理）

### 12.2 バックエンド
- Node.js + Express / NestJS
- PostgreSQL（メインデータベース）
- Redis（キャッシュ、セッション）
- Bull（ジョブキュー）

### 12.3 外部サービス
- Stripe / PayPal（ペイアウト）
- SendGrid（メール送信）
- AWS S3（ファイルストレージ）
- Cloudflare（リダイレクト・CDN）

---

以上、ClickFunnelsクローンのアフィリエイト機能要件定義書です。
