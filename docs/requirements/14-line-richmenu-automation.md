# LINEリッチメニュー自動化機能 要件定義書

## 1. 概要 (Overview)

LINEリッチメニューは、LINE公式アカウントに接続されたカスタマイズ可能なメニューで、ユーザーがチャットを開いたときに表示されます。本機能は、リッチメニューの作成、自動切替、手動変更、非表示化、タップ数分析、自動応答などの包括的なLINE連携機能を提供します。

### 1.1 主要機能
- リッチメニューの作成と設定
- 自動切替（日時指定、登録後日数、イベント日基準）
- 手動変更（一括・個別）
- 非表示化
- タップ数分析とユーザー行動追跡
- 自動応答設定
- カスタム送信者設定

---

## 2. リッチメニュー機能要件 (Rich Menu Requirements)

### 2.1 メニュー作成・設定

#### 2.1.1 基本設定項目

| 項目 | 説明 | 必須 | 制限事項 |
|------|------|------|----------|
| 管理名 | リッチメニューリスト内での表示ラベル | ○ | - |
| 背景画像 | メニューの背景となる画像 | ○ | 2500×1686px または 2500×843px、1MB以内、JPG/PNG |
| メニューボタンテキスト | 開閉ボタンのラベル | ○ | - |
| デフォルトメニュー設定 | 友だち追加時に表示されるデフォルトメニューとして指定 | - | Yes/No |
| 初期表示状態 | メニューを表示するか非表示にするか | ○ | 「表示する」「表示しない」 |
| レイアウト | メニューのレイアウトパターン | ○ | プリセットまたはカスタム |

#### 2.1.2 メニューアクション

各エリアに設定可能なアクション：

1. **URLを開く** - 外部URLを開く
   - **制限事項**: シナリオ内アンケートURLは使用不可（「メッセージを送信」を使用）

2. **メッセージを送信** - 定義されたメッセージを送信

3. **ユーザーメッセージ送信** - ユーザーからのメッセージとして送信

4. **アクションを実行** - 事前定義されたアクションを実行

5. **テンプレート送信** - メッセージテンプレートを送信

6. **リッチメニュー切り替え** - 他のリッチメニューに切り替え

#### 2.1.3 カスタムレイアウト

- エリアの追加・削除が可能
- エリアの範囲調整が可能
- LINEが提供するデザインガイドを活用可能
  - アクセス: LINE Official Account Manager > トークルーム管理 > リッチメニュー > デザインガイド

#### 2.1.4 前提条件

- LINE公式アカウント連携が完了していること
- 保存時に「500エラー」が発生する場合はLINEアカウント連携を確認

---

### 2.2 自動切替機能

リッチメニューの自動切替は、事前設定されたアクションを通じて各種タイミングで実行可能です。

#### 2.2.1 切替トリガー

##### 一括配信（Bulk Distribution）
- **指定日時での切替**
- 設定項目: 年、月、日、時、分

##### ステップ配信（Step Distribution）
- **登録後日数ベースの切替**
- 例: 「登録後X日目のY時」に切替

##### リマインダー配信（Reminder Distribution）
- **イベント日基準の切替**
- トリガー: イベント前日、当日、翌日など

#### 2.2.2 実装方法

##### メッセージ配信と同時実行
- メール・LINE配信時に「送信後に実行するアクション」フィールドでリッチメニューアクションを指定

##### 独立実行（メッセージなし）
- 一括配信、ステップ配信、リマインダー配信画面の専用アクションボタンを使用
- メッセージを送信せずにメニューだけを切り替え可能

##### 個別変更
- LINEチャット画面から特定のLINE友だちに対してアクションを手動実行

---

### 2.3 手動変更機能

#### 2.3.1 一括適用（複数ユーザー対象）

**手順:**

1. **アクションの作成**
   - ナビゲーション: メール・LINE配信 > アカウント選択 > アクション管理 > 追加
   - 設定項目:
     - 管理名称: アクション名
     - タイプ: 「LINEリッチメニュー変更」を選択
     - リッチメニュー: 変更先のメニューを選択

2. **アクションの実行**
   - 対象シナリオにアクセス
   - 「予定」メニューからアクション実行を追加
   - タイミングを指定し、ステータスを「有効」に設定

**適用範囲:** 特定シナリオの読者（LINE登録済み）全員

#### 2.3.2 個別適用（単一ユーザー対象）

**手順:**

1. ナビゲーション: メール・LINE配信 > アカウント選択 > LINE友だち > 友だちリスト > 特定の友だちを選択

2. 友だち詳細画面でリッチメニュードロップダウンから新しいメニューを選択

3. 「変更」ボタンをクリック

**適用範囲:** 選択した個別ユーザーのみ

---

### 2.4 非表示化機能

#### 2.4.1 前提条件（重要）

**必須要件:** すべてのリッチメニューで「デフォルトメニューとして設定」を「いいえ」に設定する必要があります。

- いずれかのメニューが「はい」に設定されている場合、そのデフォルトメニューが表示され、非表示にできません

#### 2.4.2 非表示化方法

##### 方法1: 一括適用（複数ユーザー）

1. メール・LINE配信 > アクション管理でアクションを作成
2. 「タイプ」を「LINEリッチメニュー変更」に設定
3. 「デフォルトメニューに変更」を選択
4. 対象シナリオでアクションを実行

**適用範囲:** 特定シナリオ内のすべてのLINEユーザー

##### 方法2: 個別適用（単一ユーザー）

1. メール・LINE配信 > LINE友だち > 友だちリスト
2. 対象ユーザー名をクリック
3. リッチメニュードロップダウンから「デフォルト」を選択
4. 「変更」ボタンをクリック

**結果:** 対象ユーザーのリッチメニュー表示が消えます

#### 2.4.3 設定チェックリスト

- [ ] すべてのリッチメニューで「デフォルトメニューとして設定」= 「いいえ」
- [ ] 前提条件が満たされていることを確認
- [ ] LINEアプリで変更をテスト確認

---

## 3. タップ数分析機能 (Tap Analytics)

### 3.1 概要

タップ数分析機能により、LINEリッチメニューエリアとのインタラクションを追跡し、エンゲージメントを測定し、どのメニューセクションが最も注目を集めているかを特定できます。

### 3.2 主要機能

#### 3.2.1 タップメトリクス

- **エリア別タップ数**: 各エリアのタップ回数を記録
- **データ収集開始**: 機能を有効化して設定を保存した後からデータ収集開始
- **履歴データ**: 有効化前のデータは含まれません

#### 3.2.2 ユーザーレベルトラッキング

分析により以下の情報が特定可能:
- **誰がタップしたか**: ユーザー識別
- **いつタップしたか**: タップ日時
- **どのエリアをタップしたか**: 特定エリア情報

### 3.3 レポート機能

#### 3.3.1 タップユーザーリスト

**アクセス:** メニューオプションから利用可能

**表示内容:**
- タップ日付
- LINEユーザー名
- タップされた特定エリア

**フィルター機能:**
- 期間フィルター
- メニューエリアフィルター

#### 3.3.2 タップ推移トレンド

**レポート内容:**
- 各エリアの日別タップ数
- 時系列パターンの可視化

**重要な注意点:**
- カウントは総タップ数（ユニークユーザー数ではない）
- 同一ユーザーによる複数タップは個別にカウント

### 3.4 連携機能

タップ分析が有効な場合、特定のメニューインタラクションに紐付いたアクションを設定可能:

- 他のシナリオへの誘導
- 登録フォームへの誘導
- ファネルページへの誘導
- 読者情報の保持

**制限事項:** 「LINE友だちがメッセージ送信」アクションには追加アクションを設定できません

---

## 4. 自動応答機能 (Auto-Response Features)

### 4.1 概要

LINE自動応答機能は、友だちが指定されたキーワードを含むメッセージを送信したときに自動的に返信します。これにより、カスタマーサポートが合理化され、アクション連携を通じたオーディエンスセグメンテーションが可能になります。

### 4.2 利用シーン

**実装推奨ケース:**
- 特定のキーワードが送られてきたら特典を自動で送る
- 「メールで質問したい」などの問い合わせを問い合わせフォームに誘導

**スキップ可能ケース:**
- メッセージに手動で返信する場合
- LINE機能を使用しない場合

### 4.3 設定項目

#### 4.3.1 基本設定

| 項目 | 説明 | オプション |
|------|------|-----------|
| 管理名称 | リスト表示用のラベル | テキスト入力 |
| 一致タイプ | キーワードマッチング方式 | 部分一致 / 完全一致 |
| キーワード | トリガーとなる単語 | テキスト入力 |
| 動作 | トリガー時のアクション | メッセージ送信 / アクション実行 / テンプレート送信 |

#### 4.3.2 一致タイプの詳細

##### 部分一致（Partial Match）
- メッセージ内のどこかにキーワードが含まれていればトリガー
- 例: キーワード「質問」→「質問があります」でもトリガー

##### 完全一致（Exact Match）
- 完全なキーワード一致のみトリガー
- 埋め込まれたキーワードではトリガーしない
- 例: キーワード「質問」→「質問」のみトリガー、「質問があります」ではトリガーしない

### 4.4 管理機能

#### 4.4.1 グループ管理
- 複数の自動応答をカテゴリに整理可能

#### 4.4.2 表示順序
- ドラッグ&ドロップで応答の順序を変更可能

#### 4.4.3 自動既読
- キーワードメッセージを自動的に既読にする

### 4.5 設定手順

1. **ナビゲート**: メール・LINE配信メニューからLINEアカウントにアクセス
2. **ルール作成**: LINE自動応答をクリックし、「追加」をクリック
3. **オプション設定**: 上記の設定項目を入力
4. **保存**: 設定を保存して有効化

---

## 5. カスタム送信者機能 (Custom Sender Features)

### 5.1 概要

LINEカスタム送信者機能により、LINE送信者を変更し、アイコンと名前を修正できます。これにより、「1つのアカウントを複数人で運用」することが可能になります。

### 5.2 設定項目

| 項目 | 説明 | 必須 | 制限事項 |
|------|------|------|----------|
| プロフィール画像 | 送信者として表示されるアイコン | ○ | 1MB以内、PNG形式、1:1のアスペクト比 |
| 名前 | LINEチャット画面で送信者名として表示 | ○ | 最大20文字 |

### 5.3 設定手順

**ステップ1:** 対象シナリオを選択し、右メニューから「LINEカスタム送信者」をクリック、「追加」を押す

**ステップ2:** 必須フィールドを入力
- プロフィール画像をアップロード
- 名前を入力（最大20文字）

**ステップ3:** 「保存しました」と表示されたら設定完了

### 5.4 使用可能箇所

カスタム送信者は以下の機能で使用可能:

- LINE一括配信
- ステップ配信
- リマインダー配信
- LINEテンプレート
- LINEチャット（1対1会話）機能

**設定方法:** メッセージ配信設定内の「カスタム送信者」オプションから設定済みカスタム送信者を選択

### 5.5 制限事項

- **作成上限**: カスタム送信者の作成数に上限なし

### 5.6 利用シーン

**推奨ケース:**
- 1つのLINEアカウントを複数人で運用する場合

**不要なケース:**
- 単独でアカウント管理する場合はデフォルト設定で十分

---

## 6. API要件 (API Requirements)

### 6.1 リッチメニューAPI

#### 6.1.1 リッチメニュー作成API

```typescript
POST /api/line/richmenu
Content-Type: application/json

Request:
{
  "managementName": string,          // 管理名
  "backgroundImage": File,            // 背景画像 (2500x1686 or 2500x843, max 1MB)
  "menuButtonText": string,           // メニューボタンテキスト
  "isDefault": boolean,               // デフォルトメニュー設定
  "initialDisplayState": "show" | "hide", // 初期表示状態
  "layout": {
    "type": "preset" | "custom",
    "areas": Array<{
      "bounds": {
        "x": number,
        "y": number,
        "width": number,
        "height": number
      },
      "action": {
        "type": "url" | "message" | "userMessage" | "action" | "template" | "switchMenu",
        "data": string | object
      }
    }>
  }
}

Response:
{
  "richMenuId": string,
  "createdAt": string,
  "status": "active" | "inactive"
}
```

#### 6.1.2 リッチメニュー切替API

```typescript
POST /api/line/richmenu/switch
Content-Type: application/json

Request:
{
  "richMenuId": string,              // 切替先リッチメニューID
  "targetType": "bulk" | "individual" | "scenario",
  "targets": {
    // bulk: all users in distribution
    "distributionId"?: string,

    // individual: specific user IDs
    "userIds"?: string[],

    // scenario: all users in scenario
    "scenarioId"?: string
  },
  "timing": {
    "type": "immediate" | "scheduled" | "step" | "reminder",

    // for scheduled
    "datetime"?: string,  // ISO 8601 format

    // for step
    "daysAfterRegistration"?: number,
    "executeTime"?: string,  // HH:mm format

    // for reminder
    "relativeToEvent"?: "before" | "on" | "after",
    "daysOffset"?: number,
    "executeTime"?: string
  }
}

Response:
{
  "switchId": string,
  "status": "scheduled" | "completed" | "failed",
  "affectedUserCount": number,
  "scheduledAt": string | null
}
```

#### 6.1.3 リッチメニュー非表示API

```typescript
POST /api/line/richmenu/hide
Content-Type: application/json

Request:
{
  "targetType": "bulk" | "individual",
  "targets": {
    "scenarioId"?: string,
    "userIds"?: string[]
  }
}

Response:
{
  "status": "success" | "failed",
  "affectedUserCount": number,
  "errors": Array<{
    "userId": string,
    "reason": string
  }>
}
```

#### 6.1.4 リッチメニュー取得API

```typescript
GET /api/line/richmenu/{richMenuId}

Response:
{
  "richMenuId": string,
  "managementName": string,
  "backgroundImageUrl": string,
  "menuButtonText": string,
  "isDefault": boolean,
  "initialDisplayState": "show" | "hide",
  "layout": {
    "type": "preset" | "custom",
    "areas": Array<{
      "bounds": { x: number, y: number, width: number, height: number },
      "action": { type: string, data: any }
    }>
  },
  "createdAt": string,
  "updatedAt": string
}
```

### 6.2 タップ分析API

#### 6.2.1 タップデータ記録API

```typescript
POST /api/line/richmenu/tap
Content-Type: application/json

Request:
{
  "richMenuId": string,
  "userId": string,
  "areaIndex": number,
  "tappedAt": string  // ISO 8601 format
}

Response:
{
  "tapId": string,
  "recorded": boolean
}
```

#### 6.2.2 タップユーザーリスト取得API

```typescript
GET /api/line/richmenu/analytics/tapped-users

Query Parameters:
- richMenuId: string (required)
- areaIndex: number (optional)
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)
- limit: number (optional, default: 100)
- offset: number (optional, default: 0)

Response:
{
  "total": number,
  "data": Array<{
    "tapId": string,
    "userId": string,
    "userName": string,
    "areaIndex": number,
    "tappedAt": string
  }>,
  "pagination": {
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

#### 6.2.3 タップ推移トレンド取得API

```typescript
GET /api/line/richmenu/analytics/tap-trends

Query Parameters:
- richMenuId: string (required)
- startDate: string (required, ISO 8601)
- endDate: string (required, ISO 8601)
- groupBy: "day" | "hour" (optional, default: "day")

Response:
{
  "richMenuId": string,
  "period": {
    "startDate": string,
    "endDate": string
  },
  "trends": Array<{
    "date": string,
    "areas": Array<{
      "areaIndex": number,
      "tapCount": number,
      "uniqueUserCount": number
    }>,
    "totalTaps": number
  }>
}
```

### 6.3 自動応答API

#### 6.3.1 自動応答ルール作成API

```typescript
POST /api/line/auto-response
Content-Type: application/json

Request:
{
  "managementName": string,          // 管理名称
  "matchType": "partial" | "exact",  // 一致タイプ
  "keywords": string[],              // キーワード配列
  "action": {
    "type": "message" | "action" | "template",
    "data": {
      // for message type
      "message"?: string,

      // for action type
      "actionId"?: string,

      // for template type
      "templateId"?: string
    }
  },
  "groupId": string | null,          // グループID（オプション）
  "autoRead": boolean,               // 自動既読設定
  "isActive": boolean                // 有効/無効
}

Response:
{
  "autoResponseId": string,
  "createdAt": string,
  "status": "active" | "inactive"
}
```

#### 6.3.2 自動応答ルール更新API

```typescript
PUT /api/line/auto-response/{autoResponseId}
Content-Type: application/json

Request: (same as create)

Response:
{
  "autoResponseId": string,
  "updatedAt": string,
  "status": "active" | "inactive"
}
```

#### 6.3.3 自動応答ルール取得API

```typescript
GET /api/line/auto-response

Query Parameters:
- groupId: string (optional)
- isActive: boolean (optional)
- limit: number (optional, default: 100)
- offset: number (optional, default: 0)

Response:
{
  "total": number,
  "data": Array<{
    "autoResponseId": string,
    "managementName": string,
    "matchType": "partial" | "exact",
    "keywords": string[],
    "action": object,
    "groupId": string | null,
    "autoRead": boolean,
    "isActive": boolean,
    "displayOrder": number,
    "createdAt": string,
    "updatedAt": string
  }>,
  "pagination": {
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

#### 6.3.4 自動応答順序変更API

```typescript
PUT /api/line/auto-response/reorder
Content-Type: application/json

Request:
{
  "orders": Array<{
    "autoResponseId": string,
    "displayOrder": number
  }>
}

Response:
{
  "status": "success" | "failed",
  "updatedCount": number
}
```

### 6.4 カスタム送信者API

#### 6.4.1 カスタム送信者作成API

```typescript
POST /api/line/custom-sender
Content-Type: multipart/form-data

Request:
{
  "name": string,                    // 名前（最大20文字）
  "profileImage": File,              // プロフィール画像 (PNG, 1:1, max 1MB)
  "scenarioId": string               // 所属シナリオID
}

Response:
{
  "customSenderId": string,
  "name": string,
  "profileImageUrl": string,
  "createdAt": string
}
```

#### 6.4.2 カスタム送信者更新API

```typescript
PUT /api/line/custom-sender/{customSenderId}
Content-Type: multipart/form-data

Request:
{
  "name": string,
  "profileImage": File (optional)
}

Response:
{
  "customSenderId": string,
  "name": string,
  "profileImageUrl": string,
  "updatedAt": string
}
```

#### 6.4.3 カスタム送信者取得API

```typescript
GET /api/line/custom-sender

Query Parameters:
- scenarioId: string (optional)
- limit: number (optional, default: 100)
- offset: number (optional, default: 0)

Response:
{
  "total": number,
  "data": Array<{
    "customSenderId": string,
    "name": string,
    "profileImageUrl": string,
    "scenarioId": string,
    "createdAt": string,
    "updatedAt": string
  }>,
  "pagination": {
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

---

## 7. データモデル (TypeScript Interfaces)

### 7.1 リッチメニューモデル

```typescript
/**
 * リッチメニュー
 */
interface RichMenu {
  richMenuId: string;
  managementName: string;
  backgroundImageUrl: string;
  menuButtonText: string;
  isDefault: boolean;
  initialDisplayState: 'show' | 'hide';
  layout: RichMenuLayout;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * リッチメニューレイアウト
 */
interface RichMenuLayout {
  type: 'preset' | 'custom';
  areas: RichMenuArea[];
}

/**
 * リッチメニューエリア
 */
interface RichMenuArea {
  areaIndex: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: RichMenuAction;
}

/**
 * リッチメニューアクション
 */
interface RichMenuAction {
  type: 'url' | 'message' | 'userMessage' | 'action' | 'template' | 'switchMenu';
  data: string | ActionData | TemplateData | SwitchMenuData;
}

interface ActionData {
  actionId: string;
  actionName: string;
}

interface TemplateData {
  templateId: string;
  templateName: string;
}

interface SwitchMenuData {
  targetRichMenuId: string;
}

/**
 * リッチメニュー切替スケジュール
 */
interface RichMenuSwitch {
  switchId: string;
  richMenuId: string;
  targetType: 'bulk' | 'individual' | 'scenario';
  targets: {
    distributionId?: string;
    userIds?: string[];
    scenarioId?: string;
  };
  timing: RichMenuSwitchTiming;
  status: 'scheduled' | 'completed' | 'failed' | 'cancelled';
  affectedUserCount: number;
  scheduledAt: string | null;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * リッチメニュー切替タイミング
 */
interface RichMenuSwitchTiming {
  type: 'immediate' | 'scheduled' | 'step' | 'reminder';
  datetime?: string;  // ISO 8601 format
  daysAfterRegistration?: number;
  executeTime?: string;  // HH:mm format
  relativeToEvent?: 'before' | 'on' | 'after';
  daysOffset?: number;
}
```

### 7.2 タップ分析モデル

```typescript
/**
 * リッチメニュータップイベント
 */
interface RichMenuTap {
  tapId: string;
  richMenuId: string;
  userId: string;
  areaIndex: number;
  tappedAt: string;  // ISO 8601 format
  sessionId: string;
  deviceType: 'ios' | 'android' | 'web';
  createdAt: string;
}

/**
 * タップユーザー情報
 */
interface TappedUser {
  tapId: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  areaIndex: number;
  tappedAt: string;
}

/**
 * タップトレンドデータ
 */
interface TapTrend {
  date: string;  // YYYY-MM-DD or YYYY-MM-DD HH:00
  areas: AreaTapCount[];
  totalTaps: number;
}

interface AreaTapCount {
  areaIndex: number;
  tapCount: number;
  uniqueUserCount: number;
}

/**
 * タップ分析設定
 */
interface TapAnalyticsConfig {
  richMenuId: string;
  isEnabled: boolean;
  trackingStartedAt: string | null;
  enabledAt: string;
  disabledAt: string | null;
}

/**
 * タップ分析サマリー
 */
interface TapAnalyticsSummary {
  richMenuId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalTaps: number;
  totalUniqueUsers: number;
  topAreas: Array<{
    areaIndex: number;
    tapCount: number;
    percentage: number;
  }>;
  averageTapsPerUser: number;
}
```

### 7.3 自動応答モデル

```typescript
/**
 * 自動応答ルール
 */
interface AutoResponse {
  autoResponseId: string;
  managementName: string;
  matchType: 'partial' | 'exact';
  keywords: string[];
  action: AutoResponseAction;
  groupId: string | null;
  autoRead: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * 自動応答アクション
 */
interface AutoResponseAction {
  type: 'message' | 'action' | 'template';
  data: MessageActionData | ActionActionData | TemplateActionData;
}

interface MessageActionData {
  message: string;
}

interface ActionActionData {
  actionId: string;
  actionName: string;
}

interface TemplateActionData {
  templateId: string;
  templateName: string;
}

/**
 * 自動応答グループ
 */
interface AutoResponseGroup {
  groupId: string;
  groupName: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 自動応答実行ログ
 */
interface AutoResponseLog {
  logId: string;
  autoResponseId: string;
  userId: string;
  userMessage: string;
  matchedKeyword: string;
  executedAction: AutoResponseAction;
  executedAt: string;
  status: 'success' | 'failed';
  errorMessage: string | null;
}
```

### 7.4 カスタム送信者モデル

```typescript
/**
 * カスタム送信者
 */
interface CustomSender {
  customSenderId: string;
  name: string;
  profileImageUrl: string;
  scenarioId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * カスタム送信者使用履歴
 */
interface CustomSenderUsage {
  usageId: string;
  customSenderId: string;
  distributionType: 'bulk' | 'step' | 'reminder' | 'template' | 'chat';
  distributionId: string;
  usedAt: string;
  messageCount: number;
}

/**
 * カスタム送信者統計
 */
interface CustomSenderStats {
  customSenderId: string;
  totalUsageCount: number;
  totalMessagesSent: number;
  lastUsedAt: string | null;
  usageByType: {
    bulk: number;
    step: number;
    reminder: number;
    template: number;
    chat: number;
  };
}
```

### 7.5 共通モデル

```typescript
/**
 * LINE公式アカウント
 */
interface LineOfficialAccount {
  accountId: string;
  accountName: string;
  lineChannelId: string;
  lineChannelSecret: string;
  lineAccessToken: string;
  isConnected: boolean;
  connectedAt: string | null;
  disconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * LINE友だち
 */
interface LineFriend {
  friendId: string;
  userId: string;
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  statusMessage: string | null;
  currentRichMenuId: string | null;
  friendedAt: string;
  blockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * LINEアクション
 */
interface LineAction {
  actionId: string;
  actionType: 'changeRichMenu' | 'sendMessage' | 'addTag' | 'removeTag' | 'changeScenario';
  actionName: string;
  actionData: Record<string, any>;
  scenarioId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ページネーション結果
 */
interface PaginatedResult<T> {
  total: number;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * API共通レスポンス
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

---

## 8. エラーハンドリング

### 8.1 共通エラーコード

| エラーコード | 説明 | HTTPステータス |
|-------------|------|---------------|
| `LINE_NOT_CONNECTED` | LINE公式アカウントが接続されていません | 400 |
| `RICHMENU_NOT_FOUND` | 指定されたリッチメニューが見つかりません | 404 |
| `RICHMENU_IMAGE_INVALID` | 背景画像のサイズまたは形式が無効です | 400 |
| `RICHMENU_IMAGE_TOO_LARGE` | 背景画像が1MBを超えています | 400 |
| `DEFAULT_MENU_EXISTS` | デフォルトメニューが既に存在します | 409 |
| `CANNOT_HIDE_DEFAULT_MENU` | デフォルトメニューは非表示にできません | 400 |
| `USER_NOT_FOUND` | 指定されたユーザーが見つかりません | 404 |
| `SCENARIO_NOT_FOUND` | 指定されたシナリオが見つかりません | 404 |
| `ACTION_NOT_FOUND` | 指定されたアクションが見つかりません | 404 |
| `TEMPLATE_NOT_FOUND` | 指定されたテンプレートが見つかりません | 404 |
| `CUSTOM_SENDER_NOT_FOUND` | 指定されたカスタム送信者が見つかりません | 404 |
| `CUSTOM_SENDER_IMAGE_INVALID` | プロフィール画像の形式が無効です（PNG必須） | 400 |
| `CUSTOM_SENDER_IMAGE_RATIO_INVALID` | プロフィール画像のアスペクト比が無効です（1:1必須） | 400 |
| `CUSTOM_SENDER_NAME_TOO_LONG` | カスタム送信者名が20文字を超えています | 400 |
| `AUTO_RESPONSE_NOT_FOUND` | 指定された自動応答ルールが見つかりません | 404 |
| `KEYWORD_EMPTY` | キーワードが空です | 400 |
| `TAP_ANALYTICS_NOT_ENABLED` | タップ分析が有効化されていません | 400 |
| `INVALID_DATE_RANGE` | 日付範囲が無効です | 400 |
| `RATE_LIMIT_EXCEEDED` | レート制限を超えました | 429 |

### 8.2 エラーレスポンス例

```typescript
{
  "success": false,
  "error": {
    "code": "RICHMENU_IMAGE_INVALID",
    "message": "背景画像のサイズは2500×1686pxまたは2500×843pxである必要があります",
    "details": {
      "providedSize": "2000x1500",
      "requiredSizes": ["2500x1686", "2500x843"]
    }
  },
  "timestamp": "2025-12-09T10:30:00Z"
}
```

---

## 9. セキュリティ要件

### 9.1 認証・認可

- すべてのAPI呼び出しには有効な認証トークンが必要
- ユーザーは自分のアカウントに紐付いたLINE公式アカウントのみアクセス可能
- ロールベースアクセス制御（RBAC）の実装
  - 管理者: すべての操作が可能
  - 編集者: リッチメニュー・自動応答の作成・編集が可能
  - 閲覧者: 分析データの閲覧のみ可能

### 9.2 データ保護

- LINE公式アカウントの認証情報（チャネルシークレット、アクセストークン）は暗号化して保存
- ユーザーの個人情報（LINE User ID、表示名など）は適切に保護
- 画像ファイルのアップロード時にウイルススキャンを実施

### 9.3 レート制限

- API呼び出しにレート制限を実装
  - リッチメニュー作成: 100回/時間
  - タップデータ記録: 10,000回/分
  - 分析データ取得: 1,000回/時間

### 9.4 監査ログ

以下の操作について監査ログを記録:
- リッチメニューの作成・更新・削除
- 自動応答ルールの作成・更新・削除
- カスタム送信者の作成・更新・削除
- リッチメニューの一括切替
- LINE公式アカウントの接続・切断

---

## 10. パフォーマンス要件

### 10.1 レスポンスタイム

- リッチメニュー取得: < 200ms (95パーセンタイル)
- リッチメニュー作成: < 1秒 (95パーセンタイル)
- タップデータ記録: < 100ms (95パーセンタイル)
- 分析データ取得: < 500ms (95パーセンタイル)

### 10.2 スケーラビリティ

- 1アカウントあたり最大100個のリッチメニューをサポート
- 1アカウントあたり最大1,000個の自動応答ルールをサポート
- タップイベントの処理: 10,000イベント/秒
- 同時リッチメニュー切替: 100,000ユーザー/分

### 10.3 データ保持

- タップイベントログ: 1年間保持
- 自動応答実行ログ: 6ヶ月間保持
- カスタム送信者使用履歴: 1年間保持

---

## 11. テスト要件

### 11.1 単体テスト

- すべてのAPI エンドポイントに対する単体テストを実装
- カバレッジ目標: 80%以上

### 11.2 統合テスト

- LINE Messaging APIとの連携テスト
- リッチメニュー切替のエンドツーエンドテスト
- 自動応答のトリガーテスト

### 11.3 負荷テスト

- 大量のタップイベント処理の負荷テスト
- 一括リッチメニュー切替の負荷テスト
- 同時API呼び出しの負荷テスト

---

## 12. デプロイメント要件

### 12.1 環境

- 開発環境（Development）
- ステージング環境（Staging）
- 本番環境（Production）

### 12.2 デプロイメントプロセス

1. コードレビュー
2. 自動テストの実行
3. ステージング環境へのデプロイ
4. QA検証
5. 本番環境へのデプロイ
6. 監視とロールバック準備

### 12.3 監視とアラート

以下のメトリクスを監視:
- API レスポンスタイム
- エラーレート
- タップイベント処理レート
- リッチメニュー切替成功率
- 自動応答実行成功率

アラート条件:
- エラーレート > 5%
- APIレスポンスタイム > 1秒
- リッチメニュー切替失敗率 > 10%

---

## 13. 参考資料

### 13.1 UTAGE公式ドキュメント

1. [LINEリッチメニュー設定方法](https://help.utage-system.com/archives/4902)
2. [LINEリッチメニュー表示の自動切替方法](https://help.utage-system.com/archives/9457)
3. [LINEリッチメニュー表示の手動変更方法](https://help.utage-system.com/archives/11469)
4. [LINEリッチメニュー非表示化](https://help.utage-system.com/archives/8712)
5. [LINEリッチメニューのタップ数分析](https://help.utage-system.com/archives/19212)
6. [LINE自動応答の設定方法](https://help.utage-system.com/archives/2072)
7. [LINEカスタム送信者の設定方法](https://help.utage-system.com/archives/6473)

### 13.2 LINE公式ドキュメント

- [LINE Messaging API Documentation](https://developers.line.biz/ja/docs/messaging-api/)
- [Rich Menu API Reference](https://developers.line.biz/ja/reference/messaging-api/#rich-menu)

---

## 14. 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|--------|
| 1.0 | 2025-12-09 | 初版作成 | システム |

---

## 15. 備考

### 15.1 実装優先順位

**Phase 1 (MVP):**
1. リッチメニュー作成・設定
2. リッチメニュー手動変更（個別・一括）
3. 基本的なタップ分析

**Phase 2:**
4. リッチメニュー自動切替
5. 自動応答機能
6. 高度なタップ分析（トレンド、レポート）

**Phase 3:**
7. カスタム送信者機能
8. 高度な分析機能
9. パフォーマンス最適化

### 15.2 既知の制限事項

1. シナリオ内アンケートURLは「URLを開く」アクションでは使用不可
2. 「LINE友だちがメッセージ送信」アクションには追加アクションを設定不可
3. デフォルトメニューが設定されている場合、リッチメニューを完全に非表示にできない
4. タップ分析は有効化後のデータのみ収集（履歴データなし）

### 15.3 今後の拡張予定

- リッチメニューのA/Bテスト機能
- ユーザーセグメント別のリッチメニュー自動切替
- 機械学習を用いたタップ予測・最適化
- リッチメニューテンプレートライブラリ
- ドラッグ&ドロップUIでのリッチメニューデザイナー

---

**文書終了**
