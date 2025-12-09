# LINE セキュリティ・分析機能 要件定義書

## 1. 概要

LINEアカウントの運用安定性を確保し、配信状況を監視・分析するための機能群。アカウントBAN検知、メッセージ通数管理、自動切り替え、経路分析、コンバージョン計測などの包括的なセキュリティ・分析機能を提供する。

### 1.1 目的

- **リスク管理**: LINE公式アカウントのBAN（凍結）を早期検知し、ビジネス継続性を確保
- **配信管理**: メッセージ通数上限を監視し、配信失敗を未然に防止
- **事業継続性**: BAN発生時に自動的にバックアップアカウントへ切り替え
- **効果測定**: 登録経路やコンバージョンを正確に計測し、マーケティング施策を最適化
- **データ分析**: 多チャネル展開における各流入元のパフォーマンスを可視化

### 1.2 主要機能一覧

1. **BAN検知・対策機能** - アカウント凍結の自動検知とアラート
2. **通数管理・アラート機能** - メッセージ送信上限の監視と通知
3. **アカウント切替機能（β版）** - BAN時の自動バックアップ切り替え
4. **登録経路分析機能** - チャネル別のトラフィック・登録数計測
5. **LINEログイン認証** - 高精度な経路分析のための認証設定
6. **Meta コンバージョンAPI連携** - 広告プラットフォームへの計測データ送信

---

## 2. BAN検知・対策機能

### 2.1 機能概要

LINE公式アカウントがBAN（凍結・停止）された際に自動検知し、管理画面にアラートを表示する機能。

### 2.2 検知メカニズム

#### 2.2.1 検知トリガー
- LINE配信APIからのエラーレスポンス監視
- 配信失敗パターンの分析
- アカウント状態の定期的なヘルスチェック

#### 2.2.2 アラート表示
```
メッセージ: "LINE公式アカウントのBAN（凍結）可能性があります"
表示場所: 管理ダッシュボード（目立つ位置）
重要度: Critical
```

### 2.3 通知設定

#### 2.3.1 通知チャネル
- **チャット通知**: LINE通知設定機能を通じて管理者に送信
- **ダッシュボード**: 管理画面上部に警告バナー表示
- **メール通知**: （オプション）登録メールアドレスへの通知

#### 2.3.2 通知タイミング
- BAN検知時: 即座に通知
- 再チェック: 定期的な状態確認と通知

### 2.4 重要な制限事項

#### 2.4.1 アカウント置き換え不可
**制限**: BANされたLINE公式アカウントの接続情報（Messaging API、LINEログインチャネル情報）を、既存の配信アカウント設定で新しいアカウントに単純に上書き・置き換えることは**不可**

**理由**: 直接置き換えると配信機能が正常に動作しなくなる

#### 2.4.2 推奨対応手順
1. メール/LINE配信アカウント全体を複製
2. 複製したアカウントに新しいLINE公式アカウントの認証情報を設定
3. シナリオ・設定を再構築
4. 新アカウントでの配信開始

### 2.5 関連機能との連携
- LINE配信エラー管理機能
- アカウント切替機能（β版）との統合

---

## 3. 通数管理・アラート機能

### 3.1 機能概要

LINE公式アカウントの月次メッセージ送信上限到達を検知し、アラートを表示する機能。配信失敗を未然に防ぐための重要な監視機能。

### 3.2 上限到達アラート

#### 3.2.1 アラートメッセージ
```
メッセージ: "LINE公式アカウントの通数が送信上限に到達しました"
表示場所: メール/LINE配信管理画面
影響範囲: すべてのLINE配信（一斉配信/ステップ配信/リマインド配信）が送信不可
```

#### 3.2.2 配信への影響
- **配信失敗**: すべてのLINE配信が停止
- **キュー保持**: 配信予約は保持されるが実行されない
- **復旧条件**: プラン変更またはメッセージ追加購入まで配信不可

### 3.3 メッセージカウント表示

#### 3.3.1 表示場所
```
場所: メール/LINE配信インターフェース右上
表示名: "LINE公式配信通数"
データソース: LINEサーバーから取得
```

#### 3.3.2 更新ロジック
- **自動更新**: 1日1回自動更新
- **手動更新**: 更新矢印アイコンをクリックで即座に最新データ取得
- **リアルタイム性**: LINEサーバーとの同期により正確な残数を表示

#### 3.3.3 表示情報
```typescript
interface LineMessageCount {
  currentMonthSent: number;      // 当月送信数
  monthlyLimit: number;          // 月次上限
  remainingCount: number;        // 残数
  resetDate: string;             // リセット日（次回リセット）
  planType: string;              // プランタイプ
  lastUpdated: Date;             // 最終更新日時
}
```

### 3.4 通知設定

#### 3.4.1 閾値アラート
```typescript
interface ThresholdAlert {
  warningThreshold: number;      // 警告閾値（例: 80%）
  criticalThreshold: number;     // 危険閾値（例: 95%）
  reachedThreshold: number;      // 到達閾値（100%）
}
```

#### 3.4.2 通知方法
- **LINE通知設定機能**: チャット経由で管理者に通知
- **段階的アラート**:
  - 80%到達: 警告通知
  - 95%到達: 危険通知
  - 100%到達: 上限到達通知

### 3.5 対応アクション

#### 3.5.1 推奨対応
1. **プラン変更**: より上位プランへのアップグレード
2. **メッセージ追加購入**: 月次メッセージの追加購入
3. **配信計画見直し**: 次月までの配信スケジュール調整

#### 3.5.2 緊急時対応
- 重要度の低い配信の一時停止
- ステップ配信の間隔調整
- セグメント配信による対象者絞り込み

---

## 4. アカウントBAN時切替設定（β版機能）

### 4.1 機能概要

LINE公式アカウントがBAN検知された際、新規友だち登録を自動的に別のメール/LINE配信アカウントにリダイレクトする機能。β版機能として提供。

### 4.2 自動切替メカニズム

#### 4.2.1 切替フロー
```
1. 新規友だち登録リクエスト受信
   ↓
2. 主アカウントのBAN状態チェック
   ↓（BANの場合）
3. バックアップアカウント内で「同名シナリオ」を検索
   ↓
4-A. 同名シナリオが存在 → そのシナリオに登録
4-B. 同名シナリオが不存在 → デフォルトシナリオに登録
```

#### 4.2.2 シナリオマッチング
```typescript
interface ScenarioMatching {
  matchingMethod: 'exact_name';           // 完全一致
  primaryScenarioName: string;            // 主アカウントシナリオ名
  backupScenarioName: string;             // バックアップシナリオ名
  fallbackScenario: string;               // フォールバックシナリオ
}
```

### 4.3 バックアップアカウント設定要件

#### 4.3.1 必須要件
```typescript
interface BackupAccountRequirements {
  // 必須設定
  separateLineOfficialAccount: boolean;   // 別のLINE公式アカウント必須
  scenarioNamesMatch: boolean;            // シナリオ名の一致必須
  lineLoginAuth: boolean;                 // LINEログイン認証必須

  // 禁止事項
  reuseMessagingAPI: false;               // 元アカウントのMessaging API再利用禁止
  reuseLoginChannel: false;               // 元アカウントのLINEログインチャネル再利用禁止
}
```

#### 4.3.2 推奨セットアップ手順
1. **新規LINE公式アカウント作成**: バックアップ専用アカウントを用意
2. **配信アカウント複製**: 既存のメール/LINE配信アカウントを複製
3. **シナリオ名統一**: 主アカウントとバックアップアカウントでシナリオ名を完全一致させる
4. **LINEログイン認証設定**: 経路分析のためLINEログイン認証を設定（必須）
5. **認証情報設定**: 新しいMessaging APIとLINEログインチャネルを設定

#### 4.3.3 認証タイプ制限
- **対応**: LINEログイン認証アカウント
- **非対応**: 簡易認証、画像認証アカウント（バックアップとして使用不可）

### 4.4 重要な制限事項

#### 4.4.1 切替対象の制限
```typescript
interface SwitchingLimitations {
  newRegistrationsOnly: boolean;          // 新規登録のみ対象
  existingReadersNotAffected: boolean;    // 既存読者は移行されない
  pathSwitchingConditional: boolean;      // 経路は同名が存在する場合のみ切替
}
```

**重要**: 既にBANされたアカウントに登録済みの読者・友だちは、自動的にはバックアップアカウントに移行されない

#### 4.4.2 シナリオ・経路マッチング
- **シナリオ**: 同名シナリオが存在しない場合、「友だち追加後に登録するシナリオ」に設定されたデフォルトシナリオに登録
- **登録経路**: 同名の経路が存在する場合のみ切り替わる
- **事前準備必須**: BAN発生前にマッチングシナリオ・経路を準備しておく必要がある

### 4.5 設定場所
```
ナビゲーション:
メール/LINE配信 > 対象アカウント > LINEアカウント > アカウントBAN時切替設定
```

### 4.6 データモデル

```typescript
interface AccountBanSwitchingConfig {
  enabled: boolean;                       // 機能有効化
  primaryAccountId: string;               // 主アカウントID
  backupAccountId: string;                // バックアップアカウントID

  scenarioMapping: ScenarioMapping[];     // シナリオマッピング
  pathMapping: PathMapping[];             // 経路マッピング

  fallbackSettings: {
    defaultScenarioId: string;            // デフォルトシナリオID
    notificationEnabled: boolean;         // 切替時通知
  };

  betaFeature: true;                      // β版フラグ
}

interface ScenarioMapping {
  primaryScenarioName: string;
  backupScenarioName: string;
  backupScenarioId: string;
}

interface PathMapping {
  primaryPathName: string;
  backupPathName: string;
  backupPathId: string;
}
```

---

## 5. 登録経路分析機能

### 5.1 機能概要

複数のチャネル（Facebook、Instagram、YouTube、X、メルマガ等）からのLINE登録を計測し、どの流入元が最も効果的かを分析する機能。各チャネルごとの専用トラッキングURLを発行し、PV・UU・登録数を詳細に計測。

### 5.2 使用シーン

#### 5.2.1 必要なケース
- 複数のプラットフォームでLINE公式アカウントを展開
- チャネル別のコンバージョン率を比較分析したい
- マーケティング施策のROI測定が必要
- 流入元ごとのバックエンド（購入・成約）パフォーマンスを分析

#### 5.2.2 不要なケース
- 単一チャネルのみでの運用
- 流入元のアトリビューション分析が不要
- シンプルな登録数のみを把握したい場合

### 5.3 設定プロセス

#### 5.3.1 経路設定フロー
```
ナビゲーション:
メール/LINE配信 > アカウント > シナリオ > 右メニュー >
シナリオ設定 > 登録経路
```

#### 5.3.2 チャネル登録手順
1. **新規登録**: "追加"ボタンをクリック
2. **管理名入力**: チャネル識別名を設定（例: "Facebook広告", "YouTube概要欄"）
3. **チャネルタイプ選択**: "LINE"を選択
4. **URL生成**: システムが一意のトラッキングURLを自動生成
5. **URL配布**: 各チャネルに専用URLを設置

#### 5.3.3 広告連携設定
```typescript
interface RegistrationSourceConfig {
  managementName: string;                 // 管理名
  channelType: 'LINE';                    // チャネルタイプ
  trackingUrl: string;                    // トラッキングURL（自動生成）

  // 広告プラットフォーム連携（オプション）
  adIntegration: 'not_connected' | 'meta' | 'google' | 'yahoo';

  createdAt: Date;
  scenarioId: string;
}
```

**重要**: 広告プラットフォーム連携を使用しない場合は「未連携」のまま保持

### 5.4 計測データ

#### 5.4.1 計測指標
```typescript
interface RegistrationSourceMetrics {
  // アクセス指標
  pageViews: number;                      // PV（ページビュー）
  uniqueUsers: number;                    // UU（ユニークユーザー）

  // コンバージョン指標
  registrations: number;                  // 新規LINE登録数
  registrationRate: number;               // 登録率（登録数 / UU）

  // 期間指定
  dateRange: {
    startDate: Date;
    endDate: Date;
  };

  // チャネル情報
  sourceName: string;
  sourceUrl: string;
}
```

#### 5.4.2 UUカウントロジック
```typescript
interface UniqueUserTracking {
  trackingMethod: 'ip_address';           // IPアドレスベース
  behavior: {
    sameDeviceSameNetwork: 1;             // 同一デバイス・同一ネットワーク = 1カウント
    sameDeviceDifferentNetwork: 2;        // 同一デバイス・異なるネットワーク = 2カウント
  };
  deduplicationPeriod: 'per_date_range';  // 期間内での重複排除
}
```

**注意**: UUはIPアドレスで識別されるため、同じデバイスでも異なるネットワーク（自宅Wi-Fi、モバイルデータ、会社Wi-Fi等）からアクセスすると別ユーザーとしてカウントされる

### 5.5 レポート・分析

#### 5.5.1 アクセス方法
```
ナビゲーション:
シナリオ設定 > 登録経路分析
```

#### 5.5.2 分析機能
- **期間フィルター**: 日付範囲を指定してメトリクス表示
- **チャネル比較**: 複数チャネルのパフォーマンス比較
- **トレンド分析**: 時系列でのアクセス・登録推移

#### 5.5.3 レポートデータ構造
```typescript
interface SourceAnalyticsReport {
  channels: ChannelPerformance[];
  summary: {
    totalPV: number;
    totalUU: number;
    totalRegistrations: number;
    overallConversionRate: number;
  };
  dateRange: DateRange;
}

interface ChannelPerformance {
  channelName: string;
  pageViews: number;
  uniqueUsers: number;
  registrations: number;
  conversionRate: number;
  backendMetrics?: {                      // バックエンド指標（オプション）
    purchases: number;
    revenue: number;
    roi: number;
  };
}
```

### 5.6 制限事項

#### 5.6.1 シナリオ遷移との関係
**重要な制限**: 登録経路データはシナリオ間で引き継がれない

**理由**: 登録経路はシナリオ単位で管理されるため、ユーザーが別シナリオに遷移すると元の経路情報が失われる

**代替手段**: シナリオ遷移を含む経路分析が必要な場合は、ファネル登録経路機能を使用

#### 5.6.2 計測期間
- リアルタイム性: アクセスは即座に計測
- 登録反映: LINE認証完了後に計測
- データ保持: 過去データは無期限で保持

---

## 6. LINEログイン認証設定

### 6.1 機能概要

友だち追加時の登録経路を最も正確に判定するための認証方式。UTAGEでは簡易認証とLINEログイン認証の2つのオプションを提供しているが、**LINEログイン認証が最も正確に動作するため推奨**される。

### 6.2 認証方式の比較

```typescript
interface AuthenticationMethods {
  simple: {
    name: '簡易認証';
    accuracy: 'medium';
    setupComplexity: 'low';
    lineLoginRequired: false;
  };

  lineLogin: {
    name: 'LINEログイン認証';
    accuracy: 'highest';                   // 最高精度
    setupComplexity: 'medium';
    lineLoginRequired: true;
    recommended: true;                     // 推奨
  };
}
```

### 6.3 使用シーン

#### 6.3.1 必須ケース
- 登録経路の正確なトラッキングが必要
- アカウントBAN時切替機能（β版）を使用する場合（**必須要件**）
- 複数チャネル展開でのアトリビューション分析
- 高精度なコンバージョン計測

#### 6.3.2 不要なケース
- 登録経路の詳細が不要
- シンプルな友だち追加のみで十分
- テスト・検証用アカウント

### 6.4 必要な認証情報

#### 6.4.1 LINE Developers から取得
```typescript
interface LineLoginCredentials {
  channelId: string;                      // チャネルID
  channelSecret: string;                  // チャネルシークレット

  // 重要: Messaging API とは異なる
  separateFromMessagingAPI: true;
}
```

**重要**: LINEログインのチャネルID/シークレットは、Messaging APIのチャネル情報とは**別物**

### 6.5 セットアッププロセス

#### 6.5.1 LINE Developers での設定
```
1. LINE Developers プラットフォームにアクセス
   ↓
2. 新規LINEログインチャネルを作成（Messaging APIとは別）
   ↓
3. アプリケーションタイプ: "Webアプリ" を選択
   ↓
4. 地域設定:
   - サービス提供地域の設定
   - ビジネス拠点の設定
   ↓
5. チャネルステータス: "開発中" → "公開" に変更
   ↓
6. チャネルID・シークレットをコピー
```

#### 6.5.2 UTAGE での設定
```
1. メール/LINE配信 > アカウント > LINEアカウント設定
   ↓
2. 経路分析設定セクション
   ↓
3. "LINEログイン認証" を選択
   ↓
4. チャネルID・チャネルシークレットを入力
   ↓
5. 保存・認証テスト
```

### 6.6 データモデル

```typescript
interface LineLoginAuthConfig {
  // 基本設定
  authenticationType: 'simple' | 'line_login';

  // LINEログイン認証情報
  lineLogin: {
    channelId: string;
    channelSecret: string;                // 暗号化保存
    channelStatus: 'development' | 'published';

    // アプリケーション設定
    appType: 'web_app';
    serviceRegion: string;
    businessLocation: string;
  };

  // 連携設定
  integrations: {
    sourceTracking: boolean;              // 経路分析との連携
    banSwitching: boolean;                // BAN時切替との連携
    conversionAPI: boolean;               // コンバージョンAPI連携
  };

  // セキュリティ
  credentials: {
    encrypted: boolean;
    lastRotated?: Date;
    expiresAt?: Date;
  };
}
```

### 6.7 認証フロー

```typescript
interface LineLoginAuthFlow {
  // ユーザーフロー
  userJourney: [
    'LINE友だち追加ボタンクリック',
    'LINEアプリへリダイレクト',
    'LINEログイン認証画面',
    'ユーザー認証・承認',
    '友だち追加確認',
    'シナリオ登録完了'
  ];

  // バックエンド処理
  backendProcess: {
    step1: 'LINEログインSDKで認証リクエスト生成';
    step2: 'ユーザー認証後のコールバック受信';
    step3: 'アクセストークン取得';
    step4: 'ユーザープロフィール取得';
    step5: '登録経路情報の紐付け';
    step6: 'シナリオへの登録処理';
  };
}
```

### 6.8 セキュリティ考慮事項

```typescript
interface SecurityConsiderations {
  // 認証情報の保護
  credentialStorage: {
    encryption: 'AES-256';
    storage: 'encrypted_database';
    accessControl: 'role_based';
  };

  // 通信セキュリティ
  communication: {
    protocol: 'HTTPS';
    certificateValidation: true;
    tokenExpiration: '30_days';
  };

  // 監査
  audit: {
    authAttempts: 'logged';
    failedAuthentications: 'monitored';
    credentialChanges: 'tracked';
  };
}
```

---

## 7. Meta コンバージョンAPI LINE計測

### 7.1 機能概要

Meta（Facebook/Instagram）広告経由でのLINE登録を計測し、Metaのコンバージョンデータとして送信する機能。広告効果測定の精度向上とキャンペーン最適化に必須。

### 7.2 使用シーン

#### 7.2.1 必須ケース
- Meta広告でLINE登録をコンバージョンとして計測する場合
- Facebook/Instagram広告のROAS（広告費用対効果）を正確に測定
- Meta広告マネージャーでのキャンペーン最適化
- LINEリード獲得キャンペーンの効果分析

#### 7.2.2 不要なケース
- Meta広告を使用していない
- LINE登録の詳細な広告計測が不要
- オーガニック流入のみを扱う場合

### 7.3 セットアップ方法

### 方法1: 友だち追加ボタン設定

#### 7.3.1 設定フロー
```
ステップ1: 広告連携設定でコンバージョンAPI統合を有効化
   ↓
ステップ2: ファネルページエディタでLINE友だち追加ボタンを追加
   ↓
ステップ3: ボタン選択 → 左サブメニューで「広告連携設定」を調整
   ↓
ステップ4: イベントパラメータ設定
   ↓
ステップ5: テスト登録でMetaデータソースダッシュボードを確認
```

#### 7.3.2 イベント送信タイミング
```typescript
interface ConversionEventTiming {
  trigger: 'complete_user_journey';

  journey: [
    'Meta広告クリック',
    'UTAGE/外部ページ表示',
    'LINEアプリ認証',
    '友だち追加確認',
    'シナリオ登録完了'                    // ← この時点でイベント送信
  ];

  // 重要: 完全なユーザージャーニー完了後のみ送信
  partialJourneyTracking: false;
}
```

#### 7.3.3 ボタン設定データモデル
```typescript
interface LineFriendAddButton {
  // ボタン設定
  buttonText: string;
  buttonStyle: ButtonStyle;
  placement: {
    pageId: string;
    position: 'header' | 'content' | 'footer' | 'popup';
  };

  // 広告連携設定
  adIntegration: {
    enabled: boolean;
    platform: 'meta';
    conversionAPI: {
      enabled: boolean;
      eventName: 'Lead' | 'CompleteRegistration';
      eventParameters: EventParameters;
    };
  };

  // LINE設定
  lineConfig: {
    officialAccountId: string;
    scenarioId: string;
    redirectUrl: string;
  };
}

interface EventParameters {
  // 標準パラメータ
  value?: number;                         // コンバージョン価値
  currency?: string;                      // 通貨（例: JPY）

  // カスタムパラメータ
  content_name?: string;                  // コンテンツ名
  content_category?: string;              // カテゴリ

  // UTMパラメータ
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
```

### 方法2: シナリオ登録経路設定

#### 7.3.2.1 設定フロー
```
ステップ1: UTAGE広告連携設定でコンバージョンAPIを接続
   ↓
ステップ2: メール/LINE配信設定 > シナリオ選択
   ↓
ステップ3: シナリオ内の「登録経路」を設定
   ↓
ステップ4: 広告連携・イベント設定を構成
   ↓
ステップ5: テスト登録で確認
```

#### 7.3.2.2 登録経路連携設定
```typescript
interface ScenarioRegistrationPathConfig {
  // シナリオ情報
  scenarioId: string;
  scenarioName: string;

  // 登録経路設定
  registrationPath: {
    pathName: string;                     // 経路管理名
    pathUrl: string;                      // トラッキングURL

    // 広告連携
    adIntegration: {
      platform: 'meta';
      conversionAPI: {
        enabled: boolean;
        pixelId: string;
        accessToken: string;              // 暗号化保存
        testEventCode?: string;           // テストイベントコード
      };
    };
  };

  // イベント設定
  conversionEvent: {
    eventName: 'Lead';
    eventSourceUrl: string;
    userData: UserDataParameters;
    customData: CustomDataParameters;
  };
}
```

### 7.4 送信データ構造

```typescript
interface MetaConversionAPIPayload {
  // イベント基本情報
  event_name: 'Lead' | 'CompleteRegistration';
  event_time: number;                     // UNIXタイムスタンプ
  event_source_url: string;               // イベント発生URL
  action_source: 'website';

  // ユーザーデータ（ハッシュ化）
  user_data: {
    em?: string;                          // メールアドレス（SHA256）
    ph?: string;                          // 電話番号（SHA256）
    external_id?: string;                 // 外部ID
    client_ip_address?: string;
    client_user_agent?: string;

    // LINEユーザー情報
    fbc?: string;                         // Facebook Click ID
    fbp?: string;                         // Facebook Browser ID
  };

  // カスタムデータ
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;

    // LINE固有
    line_registration_source?: string;
    line_scenario_id?: string;
  };

  // オプション
  opt_out?: boolean;
  event_id?: string;                      // 重複排除用
}
```

### 7.5 データ反映タイミング

```typescript
interface MetricsReflectionTiming {
  // テスト登録後
  testEvents: {
    immediateReflection: 'real_time';     // テストイベントは即座
    dashboardLocation: 'Meta Events Manager > Test Events';
  };

  // 本番イベント
  productionEvents: {
    minReflectionTime: '30_minutes';
    maxReflectionTime: '24_hours';
    averageReflectionTime: '1-2_hours';
  };

  // 広告ダッシュボード
  advertisingDashboard: {
    initialAppearance: '30_minutes_to_1_day';
    fullDataAvailability: '24_hours';
  };
}
```

**重要**: テスト登録後、メトリクスが広告ダッシュボードに表示されるまで30分〜1日程度かかる

### 7.6 イベント検証

#### 7.6.1 テスト方法
```typescript
interface EventValidation {
  // テストイベントコード設定
  testEventCode: {
    generation: 'Meta Events Manager';
    usage: 'UTAGE広告連携設定に入力';
    validation: 'Events Manager > Test Events で確認';
  };

  // 検証項目
  checkPoints: [
    'イベント受信確認',
    'パラメータ正確性',
    'ユーザーデータハッシュ化',
    'タイムスタンプ正確性',
    'イベントID重複なし'
  ];
}
```

#### 7.6.2 トラブルシューティング
```typescript
interface TroubleshootingChecklist {
  noEventReceived: [
    'コンバージョンAPI有効化確認',
    'ピクセルID・アクセストークン確認',
    '完全なユーザージャーニー完了確認',
    'ネットワークエラーログ確認'
  ];

  incorrectData: [
    'イベントパラメータ設定確認',
    'ユーザーデータハッシュ化確認',
    'タイムゾーン設定確認'
  ];

  duplicateEvents: [
    'イベントID生成ロジック確認',
    '重複送信防止機構確認'
  ];
}
```

### 7.7 プライバシー・コンプライアンス

```typescript
interface PrivacyCompliance {
  // データ処理
  dataProcessing: {
    userConsent: 'required';              // ユーザー同意必須
    dataMinimization: 'collect_only_necessary';
    hashing: {
      algorithm: 'SHA256';
      fields: ['email', 'phone'];
    };
  };

  // オプトアウト
  optOut: {
    mechanism: 'user_preference';
    honored: true;
    propagated: 'to_meta_api';
  };

  // コンプライアンス
  compliance: [
    'GDPR',                                // EU一般データ保護規則
    'CCPA',                                // カリフォルニア州消費者プライバシー法
    '個人情報保護法（日本）'
  ];
}
```

---

## 8. API要件

### 8.1 LINE Platform API

#### 8.1.1 Messaging API
```typescript
interface MessagingAPIEndpoints {
  // アカウント状態確認
  getAccountStatus: {
    endpoint: 'GET /v2/bot/info';
    purpose: 'BAN検知用アカウント状態取得';
    frequency: '定期的（5分間隔推奨）';
  };

  // メッセージ配信
  pushMessage: {
    endpoint: 'POST /v2/bot/message/push';
    purpose: 'メッセージ送信';
    rateLimiting: true;
  };

  // 通数取得
  getMessageQuota: {
    endpoint: 'GET /v2/bot/message/quota';
    purpose: '月次メッセージ上限・使用数取得';
    response: {
      type: 'limited' | 'unlimited';
      value: number;                      // 上限数
    };
  };

  getMessageConsumption: {
    endpoint: 'GET /v2/bot/message/quota/consumption';
    purpose: '当月送信済みメッセージ数取得';
    response: {
      totalUsage: number;
    };
  };
}
```

#### 8.1.2 LINE Login API
```typescript
interface LineLoginAPIEndpoints {
  // 認証
  authorize: {
    endpoint: 'GET /oauth2/v2.1/authorize';
    purpose: 'LINEログイン認証開始';
    parameters: {
      response_type: 'code';
      client_id: string;
      redirect_uri: string;
      state: string;
      scope: 'profile openid email';
    };
  };

  // トークン取得
  getToken: {
    endpoint: 'POST /oauth2/v2.1/token';
    purpose: 'アクセストークン取得';
    parameters: {
      grant_type: 'authorization_code';
      code: string;
      redirect_uri: string;
      client_id: string;
      client_secret: string;
    };
  };

  // プロフィール取得
  getProfile: {
    endpoint: 'GET /v2/profile';
    purpose: 'ユーザープロフィール取得';
    headers: {
      Authorization: 'Bearer {access_token}';
    };
    response: {
      userId: string;
      displayName: string;
      pictureUrl?: string;
      statusMessage?: string;
    };
  };
}
```

### 8.2 Meta Conversion API

```typescript
interface MetaConversionAPIEndpoints {
  // イベント送信
  sendEvent: {
    endpoint: 'POST /v18.0/{pixel_id}/events';
    purpose: 'コンバージョンイベント送信';
    authentication: 'access_token';

    requestBody: {
      data: ConversionEvent[];
      test_event_code?: string;
    };

    responseValidation: {
      events_received: number;
      events_dropped: number;
      messages: string[];
    };
  };

  // テストイベント確認
  getTestEvents: {
    endpoint: 'GET /v18.0/{pixel_id}/test_events';
    purpose: 'テストイベント確認';
  };
}
```

### 8.3 内部API設計

#### 8.3.1 BAN検知API
```typescript
interface BanDetectionAPI {
  // BAN状態チェック
  'POST /api/v1/line/accounts/{accountId}/check-ban': {
    request: {
      accountId: string;
      forceCheck?: boolean;               // 強制チェック
    };
    response: {
      isBanned: boolean;
      detectedAt?: Date;
      errorCode?: string;
      errorMessage?: string;
      lastChecked: Date;
    };
  };

  // BAN履歴取得
  'GET /api/v1/line/accounts/{accountId}/ban-history': {
    response: {
      history: BanEvent[];
      totalCount: number;
    };
  };

  // アラート設定
  'PUT /api/v1/line/accounts/{accountId}/ban-alerts': {
    request: {
      enabled: boolean;
      notificationChannels: ('dashboard' | 'chat' | 'email')[];
      recipients: string[];
    };
  };
}
```

#### 8.3.2 通数管理API
```typescript
interface MessageQuotaAPI {
  // 通数取得
  'GET /api/v1/line/accounts/{accountId}/quota': {
    response: {
      monthlyLimit: number;
      currentUsage: number;
      remainingCount: number;
      usagePercentage: number;
      resetDate: Date;
      lastUpdated: Date;
    };
  };

  // 手動更新
  'POST /api/v1/line/accounts/{accountId}/quota/refresh': {
    response: {
      quota: MessageQuotaInfo;
      refreshedAt: Date;
    };
  };

  // アラート設定
  'PUT /api/v1/line/accounts/{accountId}/quota-alerts': {
    request: {
      thresholds: {
        warning: number;                  // 例: 80
        critical: number;                 // 例: 95
      };
      notificationEnabled: boolean;
    };
  };
}
```

#### 8.3.3 アカウント切替API
```typescript
interface AccountSwitchingAPI {
  // 切替設定
  'PUT /api/v1/line/accounts/{accountId}/ban-switching': {
    request: {
      enabled: boolean;
      backupAccountId: string;
      scenarioMapping: ScenarioMapping[];
      pathMapping: PathMapping[];
      fallbackScenarioId: string;
    };
  };

  // 切替テスト
  'POST /api/v1/line/accounts/{accountId}/ban-switching/test': {
    request: {
      simulateBan: boolean;
    };
    response: {
      switchingWorks: boolean;
      matchedScenarios: string[];
      fallbackUsed: boolean;
      errors?: string[];
    };
  };

  // 切替履歴
  'GET /api/v1/line/accounts/{accountId}/ban-switching/history': {
    response: {
      switches: SwitchEvent[];
      totalSwitched: number;
    };
  };
}
```

#### 8.3.4 登録経路API
```typescript
interface RegistrationSourceAPI {
  // 経路作成
  'POST /api/v1/scenarios/{scenarioId}/registration-sources': {
    request: {
      managementName: string;
      channelType: 'LINE';
      adIntegration?: 'not_connected' | 'meta' | 'google';
    };
    response: {
      sourceId: string;
      trackingUrl: string;
      createdAt: Date;
    };
  };

  // 経路分析取得
  'GET /api/v1/scenarios/{scenarioId}/registration-sources/{sourceId}/analytics': {
    query: {
      startDate: string;
      endDate: string;
    };
    response: {
      metrics: RegistrationSourceMetrics;
      breakdown: DailyBreakdown[];
    };
  };

  // トラッキングイベント記録
  'POST /api/v1/tracking/registration-source': {
    request: {
      sourceId: string;
      eventType: 'page_view' | 'registration';
      userIp: string;
      userAgent: string;
      referrer?: string;
    };
  };
}
```

#### 8.3.5 コンバージョンAPI連携
```typescript
interface ConversionTrackingAPI {
  // Meta連携設定
  'PUT /api/v1/integrations/meta/conversion-api': {
    request: {
      pixelId: string;
      accessToken: string;
      testEventCode?: string;
    };
  };

  // イベント送信
  'POST /api/v1/integrations/meta/send-event': {
    request: {
      accountId: string;
      eventName: 'Lead' | 'CompleteRegistration';
      eventTime: number;
      userData: UserDataParameters;
      customData?: CustomDataParameters;
    };
    response: {
      success: boolean;
      eventsReceived: number;
      eventsDropped: number;
      messages: string[];
    };
  };
}
```

---

## 9. データモデル

### 9.1 コアエンティティ

#### 9.1.1 LINEアカウント
```typescript
interface LineAccount {
  // 基本情報
  id: string;
  name: string;
  accountType: 'official' | 'verified' | 'premium';

  // Messaging API
  messagingAPI: {
    channelId: string;
    channelSecret: string;                // 暗号化
    channelAccessToken: string;           // 暗号化
    webhookUrl: string;
  };

  // LINEログイン認証
  lineLogin?: {
    channelId: string;
    channelSecret: string;                // 暗号化
    authenticationType: 'simple' | 'line_login';
  };

  // ステータス
  status: {
    isActive: boolean;
    isBanned: boolean;
    lastChecked: Date;
    banDetectedAt?: Date;
  };

  // 通数情報
  messageQuota: {
    monthlyLimit: number;
    currentUsage: number;
    remainingCount: number;
    usagePercentage: number;
    resetDate: Date;
    lastUpdated: Date;
  };

  // アラート設定
  alerts: {
    banDetection: AlertConfig;
    quotaWarning: QuotaAlertConfig;
  };

  // BAN時切替設定
  banSwitching?: BanSwitchingConfig;

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface AlertConfig {
  enabled: boolean;
  notificationChannels: ('dashboard' | 'chat' | 'email')[];
  recipients: string[];
}

interface QuotaAlertConfig extends AlertConfig {
  thresholds: {
    warning: number;                      // 例: 80%
    critical: number;                     // 例: 95%
  };
}
```

#### 9.1.2 BAN切替設定
```typescript
interface BanSwitchingConfig {
  enabled: boolean;
  primaryAccountId: string;
  backupAccountId: string;

  // シナリオマッピング
  scenarioMappings: ScenarioMapping[];

  // 経路マッピング
  pathMappings: PathMapping[];

  // フォールバック設定
  fallbackSettings: {
    defaultScenarioId: string;
    notifyOnFallback: boolean;
  };

  // β版フラグ
  betaFeature: true;

  // 統計
  stats: {
    totalSwitches: number;
    lastSwitchedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface ScenarioMapping {
  primaryScenarioId: string;
  primaryScenarioName: string;
  backupScenarioId: string;
  backupScenarioName: string;
  isActive: boolean;
}

interface PathMapping {
  primaryPathId: string;
  primaryPathName: string;
  backupPathId: string;
  backupPathName: string;
  isActive: boolean;
}
```

#### 9.1.3 登録経路
```typescript
interface RegistrationSource {
  id: string;
  scenarioId: string;

  // 基本情報
  managementName: string;                 // 例: "Facebook広告"
  channelType: 'LINE';
  trackingUrl: string;                    // 一意のトラッキングURL

  // 広告連携
  adIntegration: {
    platform: 'not_connected' | 'meta' | 'google' | 'yahoo';
    config?: AdPlatformConfig;
  };

  // 計測データ
  metrics: {
    totalPageViews: number;
    totalUniqueUsers: number;
    totalRegistrations: number;
    conversionRate: number;
    lastAccessedAt?: Date;
  };

  // 状態
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface AdPlatformConfig {
  // Meta用
  meta?: {
    pixelId: string;
    accessToken: string;                  // 暗号化
    testEventCode?: string;
  };

  // Google用
  google?: {
    conversionId: string;
    conversionLabel: string;
  };

  // Yahoo用
  yahoo?: {
    accountId: string;
    conversionId: string;
  };
}
```

#### 9.1.4 トラッキングイベント
```typescript
interface TrackingEvent {
  id: string;
  sourceId: string;
  scenarioId: string;

  // イベント情報
  eventType: 'page_view' | 'registration';
  occurredAt: Date;

  // ユーザー情報
  userIp: string;                         // UU計測用
  userAgent: string;
  referrer?: string;

  // セッション情報
  sessionId: string;

  // 登録情報（registrationの場合）
  userId?: string;
  lineUserId?: string;

  // UTMパラメータ
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };

  createdAt: Date;
}
```

#### 9.1.5 BAN検知イベント
```typescript
interface BanDetectionEvent {
  id: string;
  accountId: string;

  // 検知情報
  detectedAt: Date;
  detectionMethod: 'api_error' | 'manual_check' | 'scheduled_check';

  // エラー詳細
  errorCode?: string;
  errorMessage?: string;
  apiResponse?: object;                   // 元のAPIレスポンス

  // 状態
  status: 'detected' | 'false_positive' | 'confirmed' | 'resolved';

  // 通知
  notificationsSent: NotificationRecord[];

  // アクション
  actionsPerformed: {
    switchingTriggered: boolean;
    backupAccountActivated?: string;
    adminNotified: boolean;
  };

  // メタデータ
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

interface NotificationRecord {
  channel: 'dashboard' | 'chat' | 'email';
  recipient: string;
  sentAt: Date;
  delivered: boolean;
}
```

#### 9.1.6 メッセージ通数履歴
```typescript
interface MessageQuotaHistory {
  id: string;
  accountId: string;

  // 記録日時
  recordedAt: Date;

  // 通数情報
  monthlyLimit: number;
  currentUsage: number;
  remainingCount: number;
  usagePercentage: number;

  // 変更情報
  changeFromPrevious?: {
    usageChange: number;
    limitChange: number;
  };

  // アラート
  alertTriggered?: {
    level: 'warning' | 'critical' | 'limit_reached';
    threshold: number;
  };
}
```

#### 9.1.7 アカウント切替履歴
```typescript
interface AccountSwitchEvent {
  id: string;

  // アカウント情報
  primaryAccountId: string;
  backupAccountId: string;

  // 切替情報
  switchedAt: Date;
  reason: 'ban_detected' | 'manual_trigger' | 'test';

  // ユーザー情報
  affectedUserId?: string;
  lineUserId?: string;

  // シナリオ情報
  primaryScenarioId: string;
  backupScenarioId?: string;
  scenarioMatched: boolean;
  fallbackUsed: boolean;

  // 経路情報
  primaryPathId?: string;
  backupPathId?: string;
  pathMatched: boolean;

  // 結果
  success: boolean;
  errorMessage?: string;
}
```

#### 9.1.8 コンバージョンイベント
```typescript
interface ConversionEvent {
  id: string;
  accountId: string;
  scenarioId: string;
  sourceId?: string;

  // イベント基本情報
  eventName: 'Lead' | 'CompleteRegistration';
  eventTime: number;                      // UNIXタイムスタンプ
  eventSourceUrl: string;
  actionSource: 'website';

  // ユーザー情報
  userId: string;
  lineUserId: string;
  userData: {
    email?: string;                       // ハッシュ化前
    emailHashed?: string;                 // SHA256
    phone?: string;
    phoneHashed?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;                         // Facebook Click ID
    fbp?: string;                         // Facebook Browser ID
  };

  // カスタムデータ
  customData?: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentCategory?: string;
    lineRegistrationSource?: string;
    lineScenarioId?: string;
  };

  // 送信情報
  platforms: ConversionPlatformRecord[];

  // メタデータ
  eventId: string;                        // 重複排除用
  createdAt: Date;
}

interface ConversionPlatformRecord {
  platform: 'meta' | 'google' | 'yahoo';
  sentAt: Date;
  success: boolean;
  eventsReceived?: number;
  eventsDropped?: number;
  errorMessage?: string;
  response?: object;
}
```

### 9.2 集計・分析モデル

#### 9.2.1 経路分析レポート
```typescript
interface RegistrationSourceAnalytics {
  sourceId: string;
  sourceName: string;

  // 期間
  dateRange: {
    startDate: Date;
    endDate: Date;
  };

  // 集計指標
  summary: {
    totalPageViews: number;
    totalUniqueUsers: number;
    totalRegistrations: number;
    conversionRate: number;                // 登録数 / UU
  };

  // 日別内訳
  dailyBreakdown: DailyMetrics[];

  // 時間帯分析
  hourlyDistribution: HourlyMetrics[];

  // バックエンド指標（オプション）
  backendMetrics?: {
    purchases: number;
    revenue: number;
    averageOrderValue: number;
    roi: number;
  };
}

interface DailyMetrics {
  date: Date;
  pageViews: number;
  uniqueUsers: number;
  registrations: number;
  conversionRate: number;
}

interface HourlyMetrics {
  hour: number;                           // 0-23
  pageViews: number;
  registrations: number;
}
```

#### 9.2.2 アカウント健全性ダッシュボード
```typescript
interface AccountHealthDashboard {
  accountId: string;
  accountName: string;

  // 総合ステータス
  overallHealth: 'healthy' | 'warning' | 'critical' | 'banned';

  // BAN状態
  banStatus: {
    isBanned: boolean;
    lastChecked: Date;
    checkFrequency: string;               // 例: "5分ごと"
    recentEvents: BanDetectionEvent[];
  };

  // 通数状況
  quotaStatus: {
    usagePercentage: number;
    remainingCount: number;
    daysUntilReset: number;
    alertLevel: 'none' | 'warning' | 'critical';
    trend: 'increasing' | 'stable' | 'decreasing';
  };

  // 配信パフォーマンス
  distributionPerformance: {
    last24Hours: {
      messagesSent: number;
      deliveryRate: number;
      errorCount: number;
    };
    last7Days: {
      messagesSent: number;
      deliveryRate: number;
      errorCount: number;
    };
  };

  // バックアップ設定
  backupConfig?: {
    isConfigured: boolean;
    backupAccountId?: string;
    scenariosMapped: number;
    lastTestedAt?: Date;
  };

  // 推奨アクション
  recommendedActions: RecommendedAction[];

  generatedAt: Date;
}

interface RecommendedAction {
  priority: 'high' | 'medium' | 'low';
  category: 'quota' | 'ban_risk' | 'configuration' | 'optimization';
  title: string;
  description: string;
  actionUrl?: string;
}
```

---

## 10. セキュリティ要件

### 10.1 認証情報の保護

```typescript
interface CredentialSecurity {
  // 暗号化
  encryption: {
    algorithm: 'AES-256-GCM';
    keyManagement: 'AWS KMS' | 'HashiCorp Vault';
    rotationPolicy: '90_days';
  };

  // アクセス制御
  accessControl: {
    roleBasedAccess: boolean;
    minimumRole: 'admin' | 'manager';
    auditLogging: boolean;
  };

  // 伝送セキュリティ
  transmission: {
    protocol: 'TLS 1.3';
    certificatePinning: boolean;
  };
}
```

### 10.2 データプライバシー

```typescript
interface DataPrivacy {
  // 個人情報保護
  personalData: {
    lineUserId: {
      hashing: 'SHA256';
      storage: 'encrypted';
      retention: '法定期間に準拠';
    };

    emailPhone: {
      hashing: 'SHA256_before_external_transmission';
      storage: 'encrypted';
      consentRequired: true;
    };
  };

  // コンプライアンス
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    japanPrivacyAct: boolean;
  };

  // データ削除
  dataDeletion: {
    userRequestHonored: boolean;
    automaticDeletion: {
      inactiveUsers: '2_years';
      bannedAccounts: '1_year_after_resolution';
    };
  };
}
```

### 10.3 監査ログ

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;

  // アクション情報
  action: string;                         // 例: "ban_detected", "quota_alert", "account_switched"
  category: 'security' | 'configuration' | 'data_access' | 'api_call';

  // ユーザー情報
  performedBy: {
    userId: string;
    role: string;
    ipAddress: string;
  };

  // リソース情報
  resource: {
    type: 'line_account' | 'registration_source' | 'scenario';
    id: string;
    name: string;
  };

  // 詳細
  details: object;

  // 結果
  result: 'success' | 'failure';
  errorMessage?: string;
}
```

---

## 11. 運用要件

### 11.1 モニタリング

```typescript
interface MonitoringRequirements {
  // BAN検知モニタリング
  banDetection: {
    checkInterval: '5_minutes';
    alertThreshold: 'immediate';
    escalationPolicy: {
      level1: 'dashboard_alert';
      level2: 'chat_notification';
      level3: 'email_to_admin';
    };
  };

  // 通数モニタリング
  quotaMonitoring: {
    updateInterval: '1_hour';
    alertThresholds: {
      warning: 80;                        // %
      critical: 95;                       // %
      limit: 100;                         // %
    };
  };

  // API健全性
  apiHealth: {
    lineAPI: {
      uptimeTarget: '99.9%';
      responseTimeThreshold: '2_seconds';
      errorRateThreshold: '1%';
    };
    metaAPI: {
      uptimeTarget: '99.5%';
      responseTimeThreshold: '5_seconds';
      errorRateThreshold: '2%';
    };
  };
}
```

### 11.2 バックアップ・復旧

```typescript
interface BackupRecovery {
  // データバックアップ
  dataBackup: {
    frequency: 'hourly';
    retention: '30_days';
    scope: [
      'line_accounts',
      'ban_events',
      'quota_history',
      'tracking_events',
      'conversion_events'
    ];
  };

  // 災害復旧
  disasterRecovery: {
    rpo: '1_hour';                        // Recovery Point Objective
    rto: '4_hours';                       // Recovery Time Objective
    backupSites: 'multi_region';
  };

  // BAN時復旧手順
  banRecovery: {
    automaticSwitching: boolean;
    manualProcedure: string[];
    estimatedDowntime: '< 5_minutes';
  };
}
```

### 11.3 パフォーマンス要件

```typescript
interface PerformanceRequirements {
  // レスポンスタイム
  responseTime: {
    banCheck: '< 2_seconds';
    quotaRefresh: '< 3_seconds';
    trackingEvent: '< 500_milliseconds';
    conversionAPI: '< 5_seconds';
  };

  // スループット
  throughput: {
    trackingEventsPerSecond: 1000;
    conversionEventsPerSecond: 100;
    concurrentUsers: 10000;
  };

  // データ保持
  dataRetention: {
    trackingEvents: '1_year';
    banHistory: '2_years';
    quotaHistory: '2_years';
    conversionEvents: '1_year';
  };
}
```

---

## 12. テスト要件

### 12.1 機能テスト

```typescript
interface FunctionalTests {
  // BAN検知テスト
  banDetection: [
    'BAN状態の正確な検知',
    'アラート表示の確認',
    '通知送信の確認',
    '誤検知の防止',
    '復旧後の状態クリア'
  ];

  // 通数管理テスト
  quotaManagement: [
    '通数取得の正確性',
    '閾値アラートの発火',
    '手動更新の動作',
    '上限到達時の配信停止'
  ];

  // アカウント切替テスト
  accountSwitching: [
    'BAN時の自動切替',
    'シナリオマッチング',
    '経路マッチング',
    'フォールバック動作',
    '既存ユーザーの非移行確認'
  ];

  // 経路分析テスト
  sourceTracking: [
    'PV計測の正確性',
    'UU重複排除',
    '登録数カウント',
    'コンバージョン率計算',
    '日別集計の正確性'
  ];

  // コンバージョン計測テスト
  conversionTracking: [
    'イベント送信成功',
    'データハッシュ化',
    '重複イベント防止',
    'Meta ダッシュボード反映',
    'エラーハンドリング'
  ];
}
```

### 12.2 統合テスト

```typescript
interface IntegrationTests {
  // LINE Platform統合
  linePlatform: [
    'Messaging API連携',
    'LINE Login認証フロー',
    'Webhook受信・処理',
    'エラーレスポンス処理'
  ];

  // Meta Platform統合
  metaPlatform: [
    'Conversion API送信',
    'Test Events確認',
    'ピクセル連携',
    'イベントマッチング品質'
  ];

  // 内部システム統合
  internalSystems: [
    'シナリオ管理との連携',
    'ユーザー管理との連携',
    '配信システムとの連携',
    'アラート通知システムとの連携'
  ];
}
```

### 12.3 負荷テスト

```typescript
interface LoadTests {
  scenarios: [
    {
      name: '通常負荷テスト';
      duration: '1_hour';
      concurrent_users: 1000;
      tracking_events_per_second: 500;
    },
    {
      name: 'ピーク負荷テスト';
      duration: '30_minutes';
      concurrent_users: 5000;
      tracking_events_per_second: 2000;
    },
    {
      name: 'BAN大量発生テスト';
      duration: '15_minutes';
      ban_events_per_minute: 100;
      switching_events_per_minute: 100;
    }
  ];

  acceptanceCriteria: {
    responseTime95Percentile: '< 3_seconds';
    errorRate: '< 0.1%';
    successfulSwitching: '> 99%';
  };
}
```

---

## 13. 実装優先順位

### Phase 1: 基盤機能（必須）
1. **BAN検知・アラート機能**
   - LINE Messaging API連携
   - BAN状態チェックロジック
   - ダッシュボードアラート表示
   - 基本的な通知機能

2. **通数管理機能**
   - メッセージ通数取得API連携
   - 通数表示UI
   - 手動更新機能
   - 閾値アラート

### Phase 2: セキュリティ強化
3. **BAN時アカウント切替（β版）**
   - バックアップアカウント設定
   - シナリオマッピング
   - 自動切替ロジック
   - 切替履歴記録

4. **LINEログイン認証**
   - LINE Login チャネル設定
   - 認証フロー実装
   - 経路分析との統合

### Phase 3: 分析・最適化
5. **登録経路分析機能**
   - トラッキングURL生成
   - PV/UU/登録数計測
   - 経路別レポート
   - チャネル比較分析

6. **Meta コンバージョンAPI連携**
   - Conversion API設定
   - イベント送信ロジック
   - データハッシュ化
   - テストイベント確認

### Phase 4: 運用最適化
7. **監視・アラート強化**
   - 高度な監視ダッシュボード
   - エスカレーションポリシー
   - 自動復旧メカニズム
   - パフォーマンス分析

---

## 14. 参考資料

### 14.1 UTAGE ヘルプドキュメント
- [LINE公式アカウントのBAN検知機能](https://help.utage-system.com/archives/19160)
- [LINEメッセージ通数上限のアラート機能](https://help.utage-system.com/archives/19151)
- [アカウントBAN時切替設定（β版機能）](https://help.utage-system.com/archives/21278)
- [登録経路機能（LINE）](https://help.utage-system.com/archives/6101)
- [LINEログイン認証のチャネル設定方法](https://help.utage-system.com/archives/6005)
- [Meta コンバージョンAPI LINE計測](https://help.utage-system.com/archives/9171)

### 14.2 外部API仕様
- [LINE Messaging API Reference](https://developers.line.biz/ja/reference/messaging-api/)
- [LINE Login API Reference](https://developers.line.biz/ja/reference/line-login/)
- [Meta Conversion API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api/)

### 14.3 コンプライアンス
- [個人情報保護法（日本）](https://www.ppc.go.jp/)
- [GDPR (EU)](https://gdpr-info.eu/)
- [CCPA (California)](https://oag.ca.gov/privacy/ccpa)

---

## 15. まとめ

本要件定義書は、LINEセキュリティ・分析機能の包括的な実装ガイドとして作成されました。

### 15.1 主要な価値提案

1. **リスク最小化**: BAN検知と自動切替により、ビジネス継続性を確保
2. **配信安定性**: 通数管理により、メッセージ送信失敗を未然に防止
3. **データドリブン意思決定**: 経路分析とコンバージョン計測により、マーケティングROIを最大化
4. **高精度計測**: LINEログイン認証により、最も正確な経路トラッキングを実現

### 15.2 重要な技術的考慮事項

- **BAN時のアカウント置き換え制限**: 直接上書き不可、複製が必須
- **既存ユーザーの非移行**: 新規登録のみがバックアップアカウントへ切替
- **シナリオ名の完全一致**: マッピングには厳密な名前一致が必要
- **LINEログイン認証の必須性**: β版機能使用時は必須要件
- **UUのIPベース計測**: ネットワーク変更で重複カウントの可能性
- **コンバージョンデータの反映遅延**: 30分〜24時間の遅延を考慮

### 15.3 次のステップ

1. Phase 1の基盤機能から実装開始
2. 各機能の単体テスト・統合テスト実施
3. β版機能のフィードバック収集
4. 段階的な本番環境ロールアウト
5. 継続的なモニタリングと最適化

本ドキュメントは、実装の進行に伴い継続的に更新されます。
