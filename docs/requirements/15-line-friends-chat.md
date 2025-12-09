# LINE友だち・チャット管理機能 要件定義書

## 1. 概要 (Overview)

### 1.1 目的
UTAGE型のLINE公式アカウント管理システムにおける、友だち管理とチャット機能の要件を定義する。本システムは、メールとLINEを統合した配信アカウント管理を実現し、リアルタイムな1対1コミュニケーション、友だち情報の一元管理、他システムからの移行機能を提供する。

### 1.2 適用範囲
- LINE友だち一覧表示・管理
- 1対1チャット機能
- 友だち詳細情報管理
- メールアドレスとLINEアカウントの統合
- LINE通知設定
- 他システムからのLINE友だち移行

### 1.3 前提条件
- LINE公式アカウント(LINE Official Account)との連携
- LINE Login認証方式の使用
- 配信アカウントタイプ: 「メールとLINE統合型」または「LINE専用型」

---

## 2. 友だち管理機能 (Friend Management)

### 2.1 友だち一覧表示

#### 2.1.1 表示条件
- 配信アカウントが「メールとLINE統合型」または「LINE専用型」の場合のみ表示
- メール/LINE配信アカウント単位で友だちを整理して表示

#### 2.1.2 一覧表示項目
各友だちエントリには以下の情報を表示:

| 表示項目 | 説明 | 必須 |
|---------|------|------|
| LINE登録名 | 友だちのLINE名 | Yes |
| ステータス | アカウントの現在の状態 | Yes |
| 登録経路 | LINE型シナリオの登録経路のみ | Yes |
| 登録日時 | アカウント作成日時 | Yes |

#### 2.1.3 フィルター機能
```typescript
interface FriendListFilter {
  // LINE登録名での絞り込み
  lineName?: string;

  // ラベルでの絞り込み
  labels?: string[];

  // ステータスでの絞り込み
  status?: FriendStatus;

  // 登録経路での絞り込み
  registrationPath?: string;

  // 登録日時での絞り込み
  registrationDateRange?: {
    from: Date;
    to: Date;
  };
}

enum FriendStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELIVERY_EXCLUDED = 'delivery_excluded',
  TEST_ACCOUNT = 'test_account'
}
```

#### 2.1.4 検索機能
- LINE登録名による検索
- 部分一致検索をサポート
- リアルタイム検索結果更新

### 2.2 友だちアクション

#### 2.2.1 個別アクション
各友だちのアクションメニュー(⋯)から実行可能な操作:

1. **1対1メッセージ送信**
   - チャット画面への遷移
   - リアルタイムメッセージング

2. **配信除外設定**
   - 全配信からの除外
   - 配信対象への復帰

3. **テスト対象設定**
   - テストアカウントとして指定
   - 配信前テスト用

#### 2.2.2 一括アクション
```typescript
interface BulkFriendActions {
  // 選択された友だちID
  selectedFriendIds: string[];

  // アクション種別
  action: 'addLabel' | 'removeLabel' | 'excludeFromDelivery' | 'setTestAccount' | 'delete';

  // アクションパラメータ
  params?: {
    labelIds?: string[];
    reason?: string;
  };
}
```

### 2.3 CSV出力機能

#### 2.3.1 エクスポート項目
CSV出力ボタンから以下のフィールドを含むデータをエクスポート:

```typescript
interface FriendCsvExport {
  // 読者ID(シナリオ横断で共通)
  readerId: string;

  // LINE友だちID
  lineFriendId: string;

  // アカウントレベルのLINE友だちID
  accountLineFriendId: string;

  // 登録名
  registrationName: string;

  // 現在のステータス
  currentStatus: FriendStatus;

  // 登録経路
  registrationSource: string;

  // ブロック日時
  blockTimestamp?: Date;

  // 登録日時
  registrationDate: Date;
}
```

#### 2.3.2 エクスポート仕様
- 文字コード: UTF-8 with BOM
- 改行コード: CRLF
- 日時フォーマット: YYYY-MM-DD HH:mm:ss
- NULL値の表現: 空文字列

### 2.4 友だち数推移

#### 2.4.1 統計情報
```typescript
interface FriendStatistics {
  // 新規追加数
  newAdditions: number;

  // ブロック数
  blocks: number;

  // 日次増減
  dayOverDayChange: number;

  // 登録済み友だち数
  registeredFriends: number;

  // 総友だち数
  totalFriends: number;

  // 集計日時
  dateTime: Date;
}
```

#### 2.4.2 推移グラフ
- 期間指定可能(日次/週次/月次)
- 折れ線グラフ表示
- CSVエクスポート対応

---

## 3. チャット機能 (1to1 Chat)

### 3.1 チャット画面構成

#### 3.1.1 UI コンポーネント
```typescript
interface ChatInterface {
  // チャットヘッダー
  header: {
    friendInfo: {
      lineName: string;
      profileImage?: string;
      status: FriendStatus;
    };
    actions: ChatHeaderAction[];
  };

  // メッセージ表示エリア
  messageArea: {
    messages: Message[];
    unreadCount: number;
    autoReadEnabled: boolean;
  };

  // メッセージ入力エリア
  inputArea: {
    textInput: string;
    attachments: Attachment[];
    availableActions: MessageAction[];
  };

  // サイドバー
  sidebar?: {
    labels: Label[];
    responseStatus: ResponseStatus;
    pinnedInfo: boolean;
  };
}

type ChatHeaderAction =
  | 'markAllAsRead'
  | 'addLabel'
  | 'changeResponseStatus'
  | 'pinToTop'
  | 'executeAction'
  | 'openFriendDetail';
```

#### 3.1.2 リアルタイム通信
- WebSocket接続による双方向通信
- 新規メッセージの即時表示
- 既読状態のリアルタイム同期
- タイピングインジケーター表示

### 3.2 メッセージ表示・管理

#### 3.2.1 メッセージタイプ
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'user' | 'system' | 'custom';
  messageType: MessageType;
  content: MessageContent;
  timestamp: Date;
  readStatus: boolean;
  isAutoResponse: boolean;
  customSenderInfo?: CustomSender;
}

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  STICKER = 'sticker',
  TEMPLATE = 'template',
  FILE = 'file'
}

interface MessageContent {
  text?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  stickerId?: string;
  templateData?: TemplateData;
  fileName?: string;
  fileSize?: number;
}
```

#### 3.2.2 未読管理
```typescript
interface UnreadManagement {
  // 未読カウント表示
  unreadCount: number;

  // 自動既読機能
  autoRead: {
    enabled: boolean;
    triggerOnOpen: boolean; // チャット画面を開いたら自動既読
  };

  // 一括既読
  markAllAsRead: () => Promise<void>;

  // 自動応答メッセージの自動既読
  autoResponseAutoRead: boolean; // 常にtrue
}
```

#### 3.2.3 メッセージ履歴
- 時系列順に表示(新しいメッセージが下)
- スクロールによる過去メッセージの読み込み(ページネーション)
- 送受信メッセージの視覚的区別
- プロフィール画像の表示(カスタム送信者)

### 3.3 メッセージ送信

#### 3.3.1 テキストメッセージ
```typescript
interface TextMessageInput {
  text: string;
  maxLength: number; // LINE制限に準拠
  customSenderId?: string; // カスタム送信者として送信
}
```

#### 3.3.2 画像送信
```typescript
interface ImageMessageInput {
  imageFile: File;
  allowedFormats: ['jpg', 'jpeg', 'png'];
  maxFileSize: number; // MB単位
  previewUrl?: string;
  customSenderId?: string;
}
```

#### 3.3.3 動画送信
```typescript
interface VideoMessageInput {
  videoFile: File;
  allowedFormats: ['mp4', 'mov'];
  maxFileSize: number;
  maxDuration: number; // 秒単位
  thumbnail?: {
    customThumbnail?: File;
    aspectRatio: '16:9'; // 推奨アスペクト比
  };
  customSenderId?: string;
}
```

#### 3.3.4 音声送信
```typescript
interface AudioMessageInput {
  audioFile: File;
  allowedFormats: ['m4a', 'mp3', 'wav'];
  maxFileSize: number;
  maxDuration: number;
  customSenderId?: string;
}
```

#### 3.3.5 スタンプ送信
```typescript
interface StickerMessageInput {
  stickerId: string;
  packageId: string;
  stickerResourceType: 'STATIC' | 'ANIMATION' | 'SOUND';
  customSenderId?: string;
}

interface StickerSelector {
  availablePackages: StickerPackage[];
  recentStickers: Sticker[];
  favoriteStickers: Sticker[];
}
```

#### 3.3.6 LINEテンプレート送信
```typescript
interface TemplateMessage {
  templateId: string;
  templateType: 'buttons' | 'confirm' | 'carousel' | 'imageCarousel';
  templateData: {
    title?: string;
    text: string;
    actions: TemplateAction[];
    thumbnailImageUrl?: string;
  };
  customSenderId?: string;
}

interface TemplateAction {
  type: 'message' | 'uri' | 'postback';
  label: string;
  data?: string;
  uri?: string;
}
```

### 3.4 カスタム送信者機能

#### 3.4.1 カスタム送信者設定
```typescript
interface CustomSender {
  id: string;
  name: string;
  profileImage: string;
  description?: string;
  accountId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomSenderSelector {
  availableSenders: CustomSender[];
  defaultSender?: CustomSender;
  currentSender: CustomSender;
}
```

#### 3.4.2 送信者切り替え
- チャット画面から送信者を選択可能
- 送信者ごとにプロフィール画像表示
- 複数の担当者による対応をサポート

### 3.5 チャット整理機能

#### 3.5.1 ラベル管理
```typescript
interface Label {
  id: string;
  name: string;
  color: string;
  accountId: string;
  order: number;
  createdAt: Date;
}

interface ChatLabelOperations {
  // ラベル追加
  addLabel: (chatId: string, labelId: string) => Promise<void>;

  // ラベル削除
  removeLabel: (chatId: string, labelId: string) => Promise<void>;

  // ラベル一括更新
  updateLabels: (chatId: string, labelIds: string[]) => Promise<void>;
}
```

#### 3.5.2 ピン留め機能
```typescript
interface PinToTop {
  chatId: string;
  isPinned: boolean;
  pinnedAt?: Date;
  pinnedBy?: string;
}

// UTAGE独自機能
// よく連絡する友だちを一覧の上部に固定表示
```

#### 3.5.3 対応ステータス管理
```typescript
interface ResponseStatus {
  id: string;
  name: string;
  color: string;
  displayOrder: number;
  accountId: string;
  isDefault: boolean;
}

interface ChatResponseStatus {
  chatId: string;
  statusId: string;
  status: ResponseStatus;
  updatedAt: Date;
  updatedBy: string;
}
```

### 3.6 フィルター・検索機能

#### 3.6.1 チャットフィルター
```typescript
interface ChatFilter {
  // ステータスフィルター
  responseStatus?: string[];

  // ラベルフィルター
  labels?: string[];

  // 未読フィルター
  unreadOnly?: boolean;

  // ピン留めフィルター
  pinnedOnly?: boolean;

  // 配信除外フィルター
  excludeDeliveryExcluded?: boolean;
}
```

#### 3.6.2 メッセージ検索
```typescript
interface MessageSearch {
  // 検索キーワード
  keyword: string;

  // 検索対象
  searchIn: 'all' | 'text' | 'fileName';

  // 送信者フィルター
  senderType?: 'user' | 'system' | 'custom';

  // 日時範囲
  dateRange?: {
    from: Date;
    to: Date;
  };

  // メッセージタイプ
  messageTypes?: MessageType[];
}
```

### 3.7 アクション実行機能

```typescript
interface ChatAction {
  id: string;
  name: string;
  description: string;
  actionType: 'addToScenario' | 'addLabel' | 'changeStatus' | 'sendTemplate' | 'custom';
  parameters: Record<string, any>;
  accountId: string;
}

interface ExecuteAction {
  chatId: string;
  actionId: string;
  parameters?: Record<string, any>;
  executedBy: string;
}

// チャット画面から登録済みの自動化アクションを直接トリガー可能
```

### 3.8 モバイル対応

#### 3.8.1 モバイルアクセス
- スマートフォンからUTAGEアカウントでログイン
- 完全なチャット機能を利用可能
- レスポンシブデザイン対応
- タッチ操作最適化

#### 3.8.2 プッシュ通知
```typescript
interface MobilePushNotification {
  enabled: boolean;
  notificationTypes: {
    newMessage: boolean;
    mention: boolean;
    importantStatus: boolean;
  };
  sound: boolean;
  vibration: boolean;
}
```

---

## 4. 友だち詳細情報 (Friend Profile)

### 4.1 基本情報表示

#### 4.1.1 識別情報
```typescript
interface FriendProfile {
  // 基本識別情報
  id: string;
  readerId: string; // シナリオ横断で共通
  lineFriendId: string;
  accountLineFriendId: string;

  // LINE情報
  lineName: string;
  profileImageUrl?: string;
  statusMessage?: string;

  // アカウント情報
  accountId: string;
  accountType: 'email_line_combined' | 'line_only';

  // ステータス
  status: FriendStatus;
  responseStatus?: ResponseStatus;

  // 登録情報
  registrationSource: string;
  registrationDate: Date;
  blockDate?: Date;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4.1.2 シナリオ登録状況
```typescript
interface ScenarioEnrollment {
  scenarioId: string;
  scenarioName: string;
  enrollmentDate: Date;
  currentStep?: number;
  stepStatus: 'active' | 'paused' | 'completed';

  // 配信設定
  emailDeliveryEnabled: boolean;
  lineDeliveryEnabled: boolean;
  reminderDeliveryEnabled: boolean;

  // 進捗情報
  completedSteps: number;
  totalSteps: number;
  lastActivityDate?: Date;
}

interface FriendScenarios {
  enrolledScenarios: ScenarioEnrollment[];
  totalEnrollments: number;
  activeEnrollments: number;
}
```

### 4.2 対応ステータス管理

#### 4.2.1 ステータス設定
```typescript
interface ResponseStatusManagement {
  // 現在のステータス
  currentStatus?: ResponseStatus;

  // ステータス変更
  changeStatus: (statusId: string) => Promise<void>;

  // ステータス履歴
  statusHistory: Array<{
    statusId: string;
    status: ResponseStatus;
    changedAt: Date;
    changedBy: string;
  }>;
}

interface ResponseStatusCustomization {
  // カスタマイズ可能項目
  name: string;
  color: string; // HEX色コード
  displayOrder: number;
  isDefault: boolean;

  // システム定義項目
  accountId: string;
}
```

### 4.3 実行可能アクション

#### 4.3.1 シナリオ管理アクション
```typescript
interface ScenarioActions {
  // 新規シナリオ追加
  addScenario: {
    scenarioId: string;
    targetStepDelivery?: boolean;
    reminderDelivery?: boolean;
  };

  // シナリオ削除(配信解除)
  removeScenario: {
    scenarioId: string;
    reason?: string;
  };

  // シナリオ一時停止
  pauseScenario: {
    scenarioId: string;
  };

  // シナリオ再開
  resumeScenario: {
    scenarioId: string;
  };
}
```

#### 4.3.2 配信制御アクション
```typescript
interface DeliveryControlActions {
  // 配信除外
  excludeFromDelivery: {
    reason?: string;
    excludeEmail: boolean;
    excludeLine: boolean;
  };

  // 配信対象に戻す
  restoreToDelivery: {
    restoreEmail: boolean;
    restoreLine: boolean;
  };

  // テスト対象設定
  setAsTestAccount: {
    testTypes: ('email' | 'line' | 'both')[];
  };

  // テスト対象解除
  removeFromTestAccounts: {};
}
```

### 4.4 検索・フィルター機能

#### 4.4.1 友だち検索
```typescript
interface FriendSearch {
  // LINE名検索
  lineName?: string;

  // ラベル検索
  labels?: string[];

  // ステータス検索
  status?: FriendStatus[];

  // 対応ステータス検索
  responseStatus?: string[];

  // 登録経路検索
  registrationSource?: string[];

  // 日時範囲検索
  dateRange?: {
    field: 'registrationDate' | 'blockDate' | 'lastActivityDate';
    from: Date;
    to: Date;
  };

  // シナリオ検索
  enrolledScenarios?: string[];
}
```

### 4.5 データ階層構造

#### 4.5.1 ナビゲーション階層
```
トップメニュー
└── アカウント選択
    └── 左メニュー
        └── LINE友だち一覧
            └── 個別友だち詳細
```

#### 4.5.2 詳細画面構成
```typescript
interface FriendDetailPage {
  // ヘッダーセクション
  header: {
    friendBasicInfo: FriendProfile;
    quickActions: QuickAction[];
  };

  // タブセクション
  tabs: {
    overview: OverviewTab;
    scenarios: ScenariosTab;
    chatHistory: ChatHistoryTab;
    activityLog: ActivityLogTab;
    customFields: CustomFieldsTab;
  };

  // サイドバー
  sidebar: {
    labels: Label[];
    responseStatus: ResponseStatus;
    statistics: FriendStatistics;
  };
}

type QuickAction =
  | 'sendMessage'
  | 'addToScenario'
  | 'excludeFromDelivery'
  | 'setAsTest'
  | 'exportData';
```

---

## 5. データ統合機能 (Data Integration)

### 5.1 メールとLINEアカウント統合

#### 5.1.1 統合プロセス(5ステップ)

**ステップ1: 統合型配信アカウント作成**
```typescript
interface CombinedAccount {
  accountType: 'email_line_combined';
  accountName: string;
  emailSettings: EmailAccountSettings;
  lineSettings: LineAccountSettings;
}
```

**ステップ2: LINE公式アカウント接続**
```typescript
interface LineAccountConnection {
  // LINE Official Account情報
  lineOfficialAccountId: string;

  // 認証方式(必須)
  authenticationType: 'LINE_LOGIN_AUTHENTICATION';

  // LINE Login Channel情報
  channelId: string;
  channelSecret: string;

  // 接続ステータス
  connectionStatus: 'connected' | 'disconnected' | 'error';
  connectedAt?: Date;
}

// 注意: 個人アカウントは非対応
```

**ステップ3: シナリオ作成と登録ページ連携**
```typescript
interface ScenarioIntegrationSetup {
  scenarioId: string;

  // ファネルページ連携
  linkedPages: {
    registrationForms: string[];
    paymentForms: string[];
  };

  // 統合設定
  integrationEnabled: boolean;
  singleScenarioTracking: boolean; // 必須: 同一シナリオで追跡
}
```

**ステップ4: サンクスページにLINE友だち追加ボタン設置**
```typescript
interface LineAddFriendButton {
  elementType: 'LINE_FRIEND_ADD_BUTTON';
  placement: 'thank_you_page';

  // 連携シナリオ(重要)
  linkedScenarioId: string; // ステップ3と同一シナリオを選択必須

  // ボタン設定
  buttonText?: string;
  buttonColor?: string;
  buttonSize?: 'small' | 'medium' | 'large';
}

// 重要: 異なるシナリオを選択すると統合が機能しない
```

**ステップ5: テスト登録実施**
```typescript
interface IntegrationTest {
  testSteps: [
    {
      step: 1;
      action: 'メールアドレス登録';
      verify: 'メール配信開始確認';
    },
    {
      step: 2;
      action: 'サンクスページのLINE友だち追加ボタンをクリック';
      verify: 'LINE公式アカウントを友だち追加';
    },
    {
      step: 3;
      action: '読者リスト確認';
      verify: 'メールとLINEが1つの連絡先レコードに統合されていることを確認';
    }
  ];
}
```

#### 5.1.2 データ統合ロジック

**マッチング機構**
```typescript
interface IntegrationMatching {
  // 統合条件
  matchingCriteria: {
    // 同一シナリオ経由での登録
    sameScenario: boolean; // 必須条件

    // ユーザージャーニーの連続性
    sessionTracking: boolean;

    // タイムアウト設定
    integrationTimeout?: number; // 分単位
  };

  // 統合結果
  integrationResult: {
    readerId: string; // 統合後の単一読者ID
    emailIdentifier: string;
    lineIdentifier: string;
    integratedAt: Date;
  };
}
```

**データマージング**
```typescript
interface DataMerging {
  // 統合されるデータ
  mergedData: {
    // 識別情報
    readerId: string; // 共通読者ID
    emailAddress: string;
    lineFriendId: string;

    // 登録情報
    emailRegistrationDate: Date;
    lineRegistrationDate: Date;

    // シナリオ進捗(同期される)
    scenarioProgress: {
      scenarioId: string;
      currentStep: number;

      // 配信期限の同期
      emailDeliveryDeadline: Date;
      lineDeliveryDeadline: Date;
      syncedDeadline: Date; // 統合後は同一期限
    };
  };

  // 自動同期項目
  autoSyncFields: string[];
}
```

#### 5.1.3 主要ユースケース

**ステップ配信の期限同期**
```typescript
interface DeliveryDeadlineSync {
  // 問題: 統合前
  beforeIntegration: {
    emailDeadline: Date; // 例: 2日後
    lineDeadline: Date;  // 例: 3日後
    issue: 'ステップ配信期限のズレ';
  };

  // 解決: 統合後
  afterIntegration: {
    unifiedDeadline: Date; // 統合後は同一期限
    benefit: 'メール・LINE両チャネルで期限を統一';
  };
}
```

#### 5.1.4 制約事項

```typescript
interface IntegrationConstraints {
  // 必須条件
  requirements: {
    accountType: 'email_line_combined'; // 統合型アカウント必須
    authenticationType: 'LINE_LOGIN_AUTHENTICATION'; // LINE Login認証必須
    singleScenario: boolean; // 全接点で同一シナリオ使用必須
  };

  // 制限事項
  limitations: {
    noManualConflictResolution: true; // 手動での競合解決不可
    noMultiScenarioIntegration: true; // 複数シナリオ跨ぎ統合不可
    sequentialRegistrationOnly: true; // 同一ユーザージャーニー内での登録のみ
  };
}
```

#### 5.1.5 統合状態管理

```typescript
interface IntegrationStatus {
  readerId: string;

  // 統合状態
  isIntegrated: boolean;

  // 統合済みチャネル
  integratedChannels: {
    email: boolean;
    line: boolean;
  };

  // 統合詳細
  integrationDetails?: {
    integratedAt: Date;
    integrationMethod: 'auto' | 'manual';
    scenarioId: string;

    // 整合性チェック
    dataConsistency: boolean;
    lastSyncedAt: Date;
  };

  // 未統合理由(該当する場合)
  nonIntegrationReason?:
    | 'different_scenario'
    | 'timeout_exceeded'
    | 'manual_registration'
    | 'account_type_mismatch';
}
```

---

## 6. LINE通知設定機能 (LINE Notification Settings)

### 6.1 通知先プラットフォーム

#### 6.1.1 サポートプラットフォーム
```typescript
enum NotificationPlatform {
  CHATWORK = 'chatwork',
  SLACK = 'slack',
  DISCORD = 'discord'
}

interface NotificationDestination {
  platform: NotificationPlatform;
  enabled: boolean;
  config: ChatworkConfig | SlackConfig | DiscordConfig;
  testMode: boolean;
}
```

### 6.2 通知タイプ

#### 6.2.1 通知シナリオ
```typescript
enum NotificationType {
  // 1. LINEメッセージ受信時
  INCOMING_MESSAGE = 'incoming_message',

  // 2. メッセージ送信上限到達時
  MESSAGE_LIMIT_REACHED = 'message_limit_reached',

  // 3. アカウントBAN検知時
  ACCOUNT_BAN_DETECTED = 'account_ban_detected'
}

interface NotificationSettings {
  accountId: string;

  notifications: {
    [NotificationType.INCOMING_MESSAGE]: {
      enabled: boolean;
      destinations: NotificationPlatform[];
      excludeAutoResponses: boolean; // 常にtrue
    };

    [NotificationType.MESSAGE_LIMIT_REACHED]: {
      enabled: boolean;
      destinations: NotificationPlatform[];
      threshold?: number;
    };

    [NotificationType.ACCOUNT_BAN_DETECTED]: {
      enabled: boolean;
      destinations: NotificationPlatform[];
      immediateAlert: boolean;
    };
  };
}
```

#### 6.2.2 通知除外条件
```typescript
interface NotificationExclusions {
  // 自動応答メッセージは通知対象外
  autoResponses: {
    keywordBased: boolean; // キーワード自動応答は除外
  };

  // 通知されるメッセージ
  includedMessages: {
    userGeneratedText: boolean; // ユーザーテキストメッセージ
    buttonClicks: boolean; // ボタンクリックは除外
    imageClicks: boolean; // 画像クリックは除外
    richMenuActions: boolean; // リッチメニュー操作は除外
  };
}
```

### 6.3 Chatwork設定

#### 6.3.1 設定要件
```typescript
interface ChatworkConfig {
  platform: 'chatwork';

  // 1. 通知専用アカウント作成(個人利用と分離)
  notificationAccount: {
    accountId: string;
    accountName: string;
    isPersonalAccount: false; // 個人アカウント使用不可
  };

  // 2. グループチャット作成
  groupChat: {
    roomId: string; // グループチャットURLから取得
    roomName: string;
    members: string[];
  };

  // 3. APIトークン取得
  apiToken: string; // サービス連携設定から生成

  // 接続状態
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: Date;
}

// 設定手順
interface ChatworkSetupSteps {
  step1: '通知専用Chatworkアカウントを作成';
  step2: 'グループチャットを作成し、チームメンバーを追加';
  step3: 'グループチャットのURLからルームIDを取得';
  step4: 'サービス連携設定からAPIトークンを生成・保存';
  step5: 'UTAGEにルームIDとAPIトークンを設定';
}
```

### 6.4 Slack設定

#### 6.4.1 設定要件
```typescript
interface SlackConfig {
  platform: 'slack';

  // 1. Slack APIアプリケーション作成
  app: {
    appId: string;
    appName: string;
    workspaceId: string;
  };

  // 2. OAuth権限設定
  oauth: {
    scopes: ['chat:write']; // 必須スコープ
    botUserOAuthToken: string;
  };

  // 3. 通知チャンネル設定
  channel: {
    channelId: string;
    channelName: string;
    members: string[];
  };

  // 接続状態
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: Date;
}

// 設定手順
interface SlackSetupSteps {
  step1: 'Slack APIポータルでアプリケーション作成';
  step2: 'OAuth権限で「chat:write」スコープを設定';
  step3: 'Bot User OAuth Tokenを生成';
  step4: 'ワークスペースに通知用チャンネルを作成';
  step5: 'チャンネルにチームメンバーを追加';
  step6: 'UTAGEにOAuthトークンとチャンネルIDを設定';
}
```

### 6.5 Discord設定

#### 6.5.1 設定要件
```typescript
interface DiscordConfig {
  platform: 'discord';

  // 1. テキストチャンネル作成
  channel: {
    serverId: string;
    channelId: string;
    channelName: string;
  };

  // 2. Webhook設定
  webhook: {
    webhookUrl: string;
    webhookId?: string;
    webhookToken?: string;
  };

  // 接続状態
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: Date;
}

// 設定手順
interface DiscordSetupSteps {
  step1: 'Discordサーバー内にテキストチャンネルを作成';
  step2: 'チャンネル設定からWebhookを作成';
  step3: 'Webhook URLをコピー';
  step4: 'UTAGEにWebhook URLを設定';
}
```

### 6.6 通知管理機能

#### 6.6.1 テスト機能
```typescript
interface NotificationTest {
  // テスト送信
  sendTest: (
    platform: NotificationPlatform,
    notificationType: NotificationType
  ) => Promise<TestResult>;

  // テスト結果
  testResult: {
    success: boolean;
    message?: string;
    errorDetails?: string;
    timestamp: Date;
  };
}
```

#### 6.6.2 設定保存・管理
```typescript
interface NotificationManagement {
  // 設定保存
  saveSettings: (settings: NotificationSettings) => Promise<void>;

  // 有効化/無効化
  toggleNotification: (
    notificationType: NotificationType,
    enabled: boolean
  ) => Promise<void>;

  // 複数配信先管理
  destinations: NotificationDestination[];

  // アカウントレベルでの制御
  accountLevel: {
    globalEnabled: boolean;
    perAccountSettings: Map<string, NotificationSettings>;
  };
}
```

#### 6.6.3 通知フォーマット
```typescript
interface NotificationMessage {
  // 共通フィールド
  timestamp: Date;
  accountName: string;
  notificationType: NotificationType;

  // メッセージ受信通知
  incomingMessage?: {
    friendName: string;
    messagePreview: string;
    chatUrl: string;
  };

  // 送信上限通知
  messageLimitAlert?: {
    currentCount: number;
    limit: number;
    resetDate: Date;
  };

  // アカウントBAN通知
  accountBanAlert?: {
    detectedAt: Date;
    possibleReason?: string;
    actionRequired: string;
  };
}
```

---

## 7. 他システムからの移行機能 (Migration Features)

### 7.1 移行の目的と概要

#### 7.1.1 移行目的
```typescript
interface MigrationPurpose {
  // 既存LINE友だちのUTAGE認識
  purpose: 'UTAGE実装前から存在するLINE公式アカウントの友だちをUTAGEシステムに認識させる';

  // 再エンゲージメント不要
  benefit: 'スタンプやメッセージによる再登録を要求せず、友だち情報を移行';

  // 使用タイミング
  useCase: '既存友だち移行時のみ(新規の場合は不要)';
}
```

### 7.2 移行フロー(3段階プロセス)

#### 7.2.1 移行プロセス
```typescript
interface MigrationFlow {
  // ステージ1: UTAGE側での移行リンク作成
  stage1: {
    action: 'UTAGE移行リンク作成';
    recommendation: 'コンテンツページへのリンク推奨';
    output: 'ユニークな移行URL';
  };

  // ステージ2: LINE公式アカウントからメッセージ配信
  stage2: {
    action: 'LINE公式アカウントから移行リンクを含むメッセージ配信';
    target: '既存の全友だち';
    message: '移行リンクを埋め込んだメッセージ';
  };

  // ステージ3: 友だちによるリンククリック
  stage3: {
    action: '友だちが移行リンクをタップ';
    result: 'UTAGEシステムへの移行完了';
    automation: '自動的に友だち情報が登録';
  };
}
```

### 7.3 LINE Login Channel設定

#### 7.3.1 チャンネル要件
```typescript
interface LineLoginChannel {
  // Messaging APIとは別のチャンネル
  channelType: 'LINE_LOGIN';
  separateFromMessagingAPI: true;

  // チャンネル情報
  channelId: string;
  channelSecret: string;

  // LINE Developers設定
  developerConsole: {
    // アプリケーションタイプ
    applicationType: 'WEB_APP';

    // チャンネルステータス
    channelStatus: 'PUBLISHED'; // Development → Public へ移行必須

    // 作成場所
    createAt: 'LINE Developers Console';
  };
}
```

#### 7.3.2 セットアップ手順
```typescript
interface LineLoginSetupSteps {
  step1: {
    location: 'LINE Developers Console';
    action: '新規LINE Loginチャンネルを作成';
  };

  step2: {
    setting: 'アプリケーションタイプ';
    value: 'Web App を選択';
  };

  step3: {
    action: 'Channel IDとChannel Secretを取得';
  };

  step4: {
    status: 'チャンネルステータス';
    transition: 'Development → Published へ移行';
    requirement: '本番利用には公開状態が必須';
  };
}
```

### 7.4 UTAGE側の設定

#### 7.4.1 認証設定
```typescript
interface UTAGEAuthenticationConfig {
  // ルート分析設定
  routeAnalysis: {
    authenticationType: 'LINE_LOGIN_AUTHENTICATION';
    channelId: string;
    channelSecret: string;
    saveRequired: true;
  };

  // LINEアカウント設定
  lineAccountSettings: {
    // 実装前友だち用シナリオ設定
    preImplementationFriendsScenario: {
      scenarioId: string;
      scenarioName: string;
      isConfigured: boolean;
    };

    // 重要: 未設定の場合の影響
    validation: {
      critical: true;
      consequence: 'シナリオ未設定の場合、後で手動でシナリオ登録が必要';
      recommendation: '設定を事前に確認・検証すること';
    };
  };
}
```

#### 7.4.2 移行リンク作成
```typescript
interface MigrationLink {
  // 管理情報
  managementName: string;
  description?: string;

  // リンク先URL
  destinationUrl: string;
  recommendedDestination: 'コンテンツページ(ランディングページやウェビナー登録など)';

  // 生成される移行URL
  migrationUrl: string;
  uniqueToken: string;

  // アクセス場所
  accessPath: '右メニュー > 他システム移行リンク';

  // リンク設定
  settings: {
    expirationDate?: Date;
    maxUses?: number;
    trackingEnabled: boolean;
  };

  // 作成日時
  createdAt: Date;
  createdBy: string;
}

interface MigrationLinkCreation {
  // 入力フィールド
  input: {
    managementName: string; // 管理用名称
    destinationUrl: string; // 遷移先URL
  };

  // 出力
  output: {
    migrationUrl: string; // LINE配信用のURL
    qrCode?: string; // QRコード(オプション)
  };
}
```

### 7.5 配信と移行実行

#### 7.5.1 LINE公式アカウントからの配信
```typescript
interface MigrationDistribution {
  // 配信方法
  distributionMethod: 'LINE_OFFICIAL_ACCOUNT_MESSAGE';

  // メッセージ構成
  message: {
    text: string;
    migrationLinkEmbedded: boolean;
    migrationUrl: string;

    // 推奨メッセージ要素
    elements: {
      purpose: '移行の目的説明';
      benefit: 'ユーザーメリット';
      callToAction: 'リンククリックの促進';
      reassurance: '個人情報保護の説明';
    };
  };

  // 配信対象
  target: {
    audienceType: 'ALL_EXISTING_FRIENDS';
    excludeTestAccounts?: boolean;
    estimatedReach: number;
  };
}
```

#### 7.5.2 移行実行と追跡
```typescript
interface MigrationExecution {
  migrationLinkId: string;

  // 移行統計
  statistics: {
    totalSent: number;
    linkClicks: number;
    successfulMigrations: number;
    failedMigrations: number;
    pendingMigrations: number;

    // コンバージョン率
    clickRate: number; // linkClicks / totalSent
    migrationRate: number; // successfulMigrations / linkClicks
  };

  // 移行詳細
  migrationDetails: MigrationDetail[];
}

interface MigrationDetail {
  lineFriendId: string;
  lineName?: string;

  // 移行ステータス
  status: 'pending' | 'clicked' | 'migrated' | 'failed';

  // タイムスタンプ
  linkClickedAt?: Date;
  migratedAt?: Date;

  // エラー情報
  errorReason?: string;

  // 割り当てられたシナリオ
  assignedScenarioId?: string;
}
```

### 7.6 移行後の処理

#### 7.6.1 自動シナリオ割り当て
```typescript
interface PostMigrationProcessing {
  // 自動シナリオ登録
  autoScenarioAssignment: {
    enabled: boolean;
    scenarioId: string; // LINEアカウント設定で指定したシナリオ
    autoEnroll: boolean;
  };

  // データ同期
  dataSynchronization: {
    friendInfo: boolean;
    profileImage: boolean;
    statusMessage: boolean;

    // UTAGE独自データ
    utageMetadata: {
      migrationDate: Date;
      migrationSource: 'other_system_migration';
      originalSystem?: string;
    };
  };
}
```

#### 7.6.2 検証と確認
```typescript
interface MigrationValidation {
  // 必須検証項目
  criticalChecks: {
    // シナリオ設定確認
    preImplementationScenarioConfigured: {
      check: 'LINEアカウント設定で実装前友だち用シナリオが設定されているか';
      consequence: '未設定の場合、手動シナリオ登録が後で必要';
      severity: 'CRITICAL';
    };

    // LINE Login Channel設定確認
    lineLoginChannelPublished: {
      check: 'LINE Login ChannelがPublished状態か';
      consequence: 'Development状態では移行が機能しない';
      severity: 'CRITICAL';
    };

    // 移行リンク有効性確認
    migrationLinkValid: {
      check: '移行リンクが正しく生成されているか';
      testMethod: 'テストアカウントでクリックテスト実施';
      severity: 'HIGH';
    };
  };

  // 移行後確認
  postMigrationChecks: {
    friendCountMatch: boolean;
    scenarioAssignmentSuccess: boolean;
    dataIntegrityVerified: boolean;
  };
}
```

### 7.7 移行機能の制約と注意事項

#### 7.7.1 使用条件
```typescript
interface MigrationConstraints {
  // 使用タイミング
  timing: {
    required: '既存友だち移行時のみ';
    notRequired: '新規でLINE公式アカウントを開始する場合';
  };

  // 技術要件
  requirements: {
    lineLoginChannel: 'LINE Login Channelの作成・公開が必須';
    separateChannel: 'Messaging APIチャンネルとは別のチャンネルが必要';
    publishedStatus: 'チャンネルステータスがPublishedであること';
  };

  // 制限事項
  limitations: {
    oneTimeOperation: '移行は基本的に1回限りの操作';
    manualIntervention: 'シナリオ未設定の場合は手動登録が必要';
    noRollback: '移行後のロールバック機能なし';
  };
}
```

---

## 8. API要件 (API Requirements)

### 8.1 友だち管理API

```typescript
// 友だち一覧取得
interface GetFriendsRequest {
  accountId: string;
  filter?: FriendListFilter;
  pagination: {
    page: number;
    pageSize: number;
  };
  sort?: {
    field: 'lineName' | 'registrationDate' | 'lastActivityDate';
    order: 'asc' | 'desc';
  };
}

interface GetFriendsResponse {
  friends: FriendProfile[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 友だち詳細取得
interface GetFriendDetailRequest {
  friendId: string;
  include?: ('scenarios' | 'chatHistory' | 'activityLog' | 'customFields')[];
}

interface GetFriendDetailResponse {
  friend: FriendProfile;
  scenarios?: ScenarioEnrollment[];
  chatHistory?: Message[];
  activityLog?: ActivityLogEntry[];
  customFields?: CustomField[];
}

// 友だちアクション実行
interface ExecuteFriendActionRequest {
  friendId: string;
  action: FriendAction;
  parameters?: Record<string, any>;
}

interface FriendAction {
  type: 'addLabel' | 'removeLabel' | 'excludeFromDelivery' | 'setTestAccount' | 'addToScenario' | 'removeFromScenario';
  data: any;
}

// 友だちCSVエクスポート
interface ExportFriendsCSVRequest {
  accountId: string;
  filter?: FriendListFilter;
  fields?: string[];
}

interface ExportFriendsCSVResponse {
  downloadUrl: string;
  expiresAt: Date;
  recordCount: number;
}
```

### 8.2 チャットAPI

```typescript
// チャット一覧取得
interface GetChatsRequest {
  accountId: string;
  filter?: ChatFilter;
  pagination: PaginationParams;
}

interface GetChatsResponse {
  chats: ChatSummary[];
  pagination: PaginationResult;
}

interface ChatSummary {
  chatId: string;
  friend: {
    id: string;
    lineName: string;
    profileImageUrl?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  labels: Label[];
  responseStatus?: ResponseStatus;
  isPinned: boolean;
  updatedAt: Date;
}

// メッセージ履歴取得
interface GetMessagesRequest {
  chatId: string;
  pagination: {
    beforeMessageId?: string;
    limit: number;
  };
  filter?: {
    messageTypes?: MessageType[];
    dateRange?: DateRange;
  };
}

interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

// メッセージ送信
interface SendMessageRequest {
  chatId: string;
  message: {
    type: MessageType;
    content: MessageContent;
  };
  customSenderId?: string;
}

interface SendMessageResponse {
  message: Message;
  deliveryStatus: 'sent' | 'failed';
  errorMessage?: string;
}

// メッセージ既読
interface MarkMessagesAsReadRequest {
  chatId: string;
  messageIds?: string[]; // 未指定の場合は全て既読
}

// WebSocket接続(リアルタイムチャット)
interface WebSocketChatEvents {
  // サーバー → クライアント
  'message:new': (message: Message) => void;
  'message:read': (data: { messageIds: string[] }) => void;
  'typing:start': (data: { userId: string }) => void;
  'typing:stop': (data: { userId: string }) => void;
  'chat:updated': (chat: ChatSummary) => void;

  // クライアント → サーバー
  'message:send': (request: SendMessageRequest) => void;
  'message:markRead': (request: MarkMessagesAsReadRequest) => void;
  'typing:notify': (data: { chatId: string; isTyping: boolean }) => void;
}
```

### 8.3 統合管理API

```typescript
// 統合ステータス取得
interface GetIntegrationStatusRequest {
  readerId?: string;
  email?: string;
  lineFriendId?: string;
}

interface GetIntegrationStatusResponse {
  integrationStatus: IntegrationStatus;
}

// 統合実行(手動)
interface ExecuteIntegrationRequest {
  emailReaderId: string;
  lineFriendId: string;
  scenarioId: string;
  mergeStrategy?: 'email_primary' | 'line_primary' | 'latest';
}

interface ExecuteIntegrationResponse {
  success: boolean;
  integratedReaderId: string;
  conflicts?: DataConflict[];
}

interface DataConflict {
  field: string;
  emailValue: any;
  lineValue: any;
  resolvedValue: any;
}
```

### 8.4 通知設定API

```typescript
// 通知設定取得
interface GetNotificationSettingsRequest {
  accountId: string;
}

interface GetNotificationSettingsResponse {
  settings: NotificationSettings;
}

// 通知設定更新
interface UpdateNotificationSettingsRequest {
  accountId: string;
  settings: Partial<NotificationSettings>;
}

// 通知テスト送信
interface SendTestNotificationRequest {
  accountId: string;
  platform: NotificationPlatform;
  notificationType: NotificationType;
}

interface SendTestNotificationResponse {
  success: boolean;
  message?: string;
  errorDetails?: string;
}

// 通知履歴取得
interface GetNotificationHistoryRequest {
  accountId: string;
  filter?: {
    platform?: NotificationPlatform;
    notificationType?: NotificationType;
    dateRange?: DateRange;
  };
  pagination: PaginationParams;
}

interface GetNotificationHistoryResponse {
  notifications: NotificationLog[];
  pagination: PaginationResult;
}

interface NotificationLog {
  id: string;
  accountId: string;
  platform: NotificationPlatform;
  notificationType: NotificationType;
  message: NotificationMessage;
  sentAt: Date;
  status: 'sent' | 'failed';
  errorMessage?: string;
}
```

### 8.5 移行API

```typescript
// 移行リンク作成
interface CreateMigrationLinkRequest {
  accountId: string;
  managementName: string;
  destinationUrl: string;
  settings?: {
    expirationDate?: Date;
    maxUses?: number;
  };
}

interface CreateMigrationLinkResponse {
  migrationLink: MigrationLink;
  qrCodeUrl?: string;
}

// 移行リンク一覧取得
interface GetMigrationLinksRequest {
  accountId: string;
  includeExpired?: boolean;
}

interface GetMigrationLinksResponse {
  migrationLinks: MigrationLink[];
}

// 移行統計取得
interface GetMigrationStatisticsRequest {
  migrationLinkId: string;
  dateRange?: DateRange;
}

interface GetMigrationStatisticsResponse {
  statistics: MigrationExecution;
}

// 移行詳細取得
interface GetMigrationDetailsRequest {
  migrationLinkId: string;
  filter?: {
    status?: ('pending' | 'clicked' | 'migrated' | 'failed')[];
  };
  pagination: PaginationParams;
}

interface GetMigrationDetailsResponse {
  details: MigrationDetail[];
  pagination: PaginationResult;
}

// 移行実行(内部API - リンククリック時に自動実行)
interface ExecuteMigrationRequest {
  migrationToken: string;
  lineFriendId: string;
  lineProfile: {
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  };
}

interface ExecuteMigrationResponse {
  success: boolean;
  readerId?: string;
  assignedScenarioId?: string;
  errorMessage?: string;
}
```

### 8.6 ラベル管理API

```typescript
// ラベル作成
interface CreateLabelRequest {
  accountId: string;
  name: string;
  color: string;
  order?: number;
}

interface CreateLabelResponse {
  label: Label;
}

// ラベル一覧取得
interface GetLabelsRequest {
  accountId: string;
}

interface GetLabelsResponse {
  labels: Label[];
}

// ラベル更新
interface UpdateLabelRequest {
  labelId: string;
  name?: string;
  color?: string;
  order?: number;
}

// ラベル削除
interface DeleteLabelRequest {
  labelId: string;
  reassignToLabelId?: string; // 既存の紐付きを別ラベルに移行
}

// 友だち・チャットへのラベル付与
interface AssignLabelRequest {
  targetType: 'friend' | 'chat';
  targetId: string;
  labelIds: string[];
  operation: 'add' | 'remove' | 'replace';
}
```

### 8.7 対応ステータス管理API

```typescript
// 対応ステータス作成
interface CreateResponseStatusRequest {
  accountId: string;
  name: string;
  color: string;
  displayOrder?: number;
  isDefault?: boolean;
}

interface CreateResponseStatusResponse {
  responseStatus: ResponseStatus;
}

// 対応ステータス一覧取得
interface GetResponseStatusesRequest {
  accountId: string;
}

interface GetResponseStatusesResponse {
  responseStatuses: ResponseStatus[];
}

// 対応ステータス更新
interface UpdateResponseStatusRequest {
  statusId: string;
  name?: string;
  color?: string;
  displayOrder?: number;
  isDefault?: boolean;
}

// チャットの対応ステータス変更
interface UpdateChatResponseStatusRequest {
  chatId: string;
  statusId: string;
}

interface UpdateChatResponseStatusResponse {
  chatResponseStatus: ChatResponseStatus;
}
```

### 8.8 共通型定義

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginationResult {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  actorType: 'user' | 'system' | 'admin';
  actorId?: string;
  actionType: string;
  actionDescription: string;
  metadata?: Record<string, any>;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  value: any;
  updatedAt: Date;
}
```

---

## 9. データモデル (Data Models)

### 9.1 コアエンティティ

```typescript
// 友だちエンティティ
interface Friend {
  // 識別情報
  id: string;
  readerId: string;
  lineFriendId: string;
  accountLineFriendId: string;

  // プロフィール
  lineName: string;
  profileImageUrl?: string;
  statusMessage?: string;

  // アカウント関連
  accountId: string;
  accountType: 'email_line_combined' | 'line_only';

  // ステータス
  status: FriendStatus;
  responseStatusId?: string;

  // 登録情報
  registrationSource: string;
  registrationDate: Date;
  blockDate?: Date;

  // 配信制御
  isDeliveryExcluded: boolean;
  isTestAccount: boolean;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// チャットエンティティ
interface Chat {
  id: string;
  friendId: string;
  accountId: string;

  // チャット状態
  unreadCount: number;
  lastMessageId?: string;
  lastMessageAt?: Date;
  isPinned: boolean;
  pinnedAt?: Date;

  // 分類
  labelIds: string[];
  responseStatusId?: string;

  // 設定
  autoReadEnabled: boolean;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// メッセージエンティティ
interface Message {
  id: string;
  chatId: string;

  // 送信者情報
  senderId: string;
  senderType: 'user' | 'system' | 'custom';
  customSenderId?: string;

  // メッセージ内容
  messageType: MessageType;
  content: MessageContent;

  // ステータス
  readStatus: boolean;
  readAt?: Date;
  isAutoResponse: boolean;

  // LINE関連
  lineMessageId?: string;

  // タイムスタンプ
  timestamp: Date;
  createdAt: Date;
}

// シナリオ登録エンティティ
interface ScenarioEnrollment {
  id: string;
  scenarioId: string;
  readerId: string;

  // 登録情報
  enrollmentDate: Date;
  enrollmentSource: string;

  // 進捗
  currentStep: number;
  stepStatus: 'active' | 'paused' | 'completed';
  completedSteps: number;

  // 配信設定
  emailDeliveryEnabled: boolean;
  lineDeliveryEnabled: boolean;
  reminderDeliveryEnabled: boolean;

  // 期限管理(統合時に同期)
  deliveryDeadline?: Date;

  // ステータス
  isActive: boolean;
  lastActivityDate?: Date;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// 統合情報エンティティ
interface Integration {
  id: string;
  readerId: string;

  // 統合チャネル
  emailIdentifier?: string;
  lineFriendId?: string;

  // 統合情報
  isIntegrated: boolean;
  integratedAt?: Date;
  integrationMethod: 'auto' | 'manual';
  integrationScenarioId?: string;

  // 同期情報
  lastSyncedAt?: Date;
  dataConsistency: boolean;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// ラベルエンティティ
interface Label {
  id: string;
  accountId: string;
  name: string;
  color: string;
  order: number;

  // 統計
  friendCount?: number;
  chatCount?: number;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// 対応ステータスエンティティ
interface ResponseStatus {
  id: string;
  accountId: string;
  name: string;
  color: string;
  displayOrder: number;
  isDefault: boolean;

  // 統計
  chatCount?: number;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// カスタム送信者エンティティ
interface CustomSender {
  id: string;
  accountId: string;
  name: string;
  profileImage: string;
  description?: string;
  isActive: boolean;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// 移行リンクエンティティ
interface MigrationLink {
  id: string;
  accountId: string;

  // リンク情報
  managementName: string;
  destinationUrl: string;
  migrationUrl: string;
  uniqueToken: string;

  // 設定
  expirationDate?: Date;
  maxUses?: number;

  // 統計
  totalClicks: number;
  successfulMigrations: number;

  // ステータス
  isActive: boolean;

  // タイムスタンプ
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// 移行詳細エンティティ
interface MigrationDetail {
  id: string;
  migrationLinkId: string;

  // LINE情報
  lineFriendId: string;
  lineName?: string;
  lineProfileImageUrl?: string;

  // 移行状態
  status: 'pending' | 'clicked' | 'migrated' | 'failed';

  // 割り当て
  readerId?: string;
  assignedScenarioId?: string;

  // エラー情報
  errorReason?: string;
  errorDetails?: string;

  // タイムスタンプ
  linkClickedAt?: Date;
  migratedAt?: Date;
  createdAt: Date;
}

// 通知設定エンティティ
interface NotificationSettings {
  id: string;
  accountId: string;

  // Chatwork設定
  chatworkConfig?: ChatworkConfig;
  chatworkEnabled: boolean;

  // Slack設定
  slackConfig?: SlackConfig;
  slackEnabled: boolean;

  // Discord設定
  discordConfig?: DiscordConfig;
  discordEnabled: boolean;

  // 通知タイプ設定
  incomingMessageNotification: boolean;
  messageLimitNotification: boolean;
  accountBanNotification: boolean;

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
  lastTestedAt?: Date;
}
```

### 9.2 リレーション定義

```typescript
// 友だち関連
interface FriendRelations {
  friend: Friend;
  chat: Chat;
  messages: Message[];
  scenarioEnrollments: ScenarioEnrollment[];
  integration: Integration;
  labels: Label[];
  responseStatus?: ResponseStatus;
  activityLogs: ActivityLogEntry[];
  customFields: CustomField[];
}

// チャット関連
interface ChatRelations {
  chat: Chat;
  friend: Friend;
  messages: Message[];
  labels: Label[];
  responseStatus?: ResponseStatus;
}

// メッセージ関連
interface MessageRelations {
  message: Message;
  chat: Chat;
  customSender?: CustomSender;
}

// シナリオ登録関連
interface ScenarioEnrollmentRelations {
  enrollment: ScenarioEnrollment;
  scenario: Scenario;
  reader: Friend;
}

// 統合関連
interface IntegrationRelations {
  integration: Integration;
  reader: Friend;
  scenario?: Scenario;
}
```

### 9.3 インデックス定義

```typescript
interface DatabaseIndexes {
  // Friend indexes
  friends: {
    primary: ['id'];
    unique: [['readerId', 'accountId'], 'lineFriendId'];
    standard: [
      'accountId',
      'status',
      'registrationDate',
      ['accountId', 'status'],
      ['accountId', 'registrationDate']
    ];
    fulltext: ['lineName'];
  };

  // Chat indexes
  chats: {
    primary: ['id'];
    unique: [['friendId', 'accountId']];
    standard: [
      'accountId',
      'friendId',
      'lastMessageAt',
      ['accountId', 'isPinned'],
      ['accountId', 'responseStatusId'],
      ['accountId', 'unreadCount']
    ];
  };

  // Message indexes
  messages: {
    primary: ['id'];
    standard: [
      'chatId',
      'timestamp',
      ['chatId', 'timestamp'],
      ['chatId', 'readStatus'],
      'lineMessageId'
    ];
  };

  // ScenarioEnrollment indexes
  scenarioEnrollments: {
    primary: ['id'];
    unique: [['scenarioId', 'readerId']];
    standard: [
      'scenarioId',
      'readerId',
      'stepStatus',
      'enrollmentDate',
      ['scenarioId', 'stepStatus']
    ];
  };

  // Integration indexes
  integrations: {
    primary: ['id'];
    unique: ['readerId'];
    standard: [
      'emailIdentifier',
      'lineFriendId',
      'isIntegrated',
      'integrationScenarioId'
    ];
  };

  // MigrationLink indexes
  migrationLinks: {
    primary: ['id'];
    unique: ['uniqueToken'];
    standard: [
      'accountId',
      'isActive',
      ['accountId', 'isActive']
    ];
  };

  // MigrationDetail indexes
  migrationDetails: {
    primary: ['id'];
    standard: [
      'migrationLinkId',
      'lineFriendId',
      'status',
      ['migrationLinkId', 'status']
    ];
  };
}
```

---

## 10. 実装優先順位

### 10.1 フェーズ1: 基本機能(MVP)
1. 友だち一覧表示・管理
2. 基本的なチャット機能(テキストメッセージ送受信)
3. 友だち詳細ページ
4. ラベル管理
5. 対応ステータス管理

### 10.2 フェーズ2: 統合機能
1. メール・LINE統合機能
2. シナリオ管理との連携
3. 配信制御機能
4. CSV エクスポート

### 10.3 フェーズ3: 高度な機能
1. リッチメッセージ送信(画像、動画、音声、スタンプ)
2. カスタム送信者機能
3. チャットアクション実行
4. 通知設定(Chatwork, Slack, Discord)

### 10.4 フェーズ4: 移行・分析機能
1. 他システムからの移行機能
2. 友だち数推移分析
3. モバイル最適化
4. リアルタイム通信(WebSocket)

---

## 11. セキュリティ要件

### 11.1 認証・認可
```typescript
interface SecurityRequirements {
  // 認証
  authentication: {
    lineLogin: boolean;
    oauth2: boolean;
    sessionManagement: boolean;
  };

  // 認可
  authorization: {
    rbac: boolean; // Role-Based Access Control
    accountLevelIsolation: boolean;
    dataAccessControl: boolean;
  };

  // データ保護
  dataProtection: {
    encryption: {
      atRest: boolean;
      inTransit: boolean;
    };
    pii: {
      lineFriendId: 'encrypted';
      lineName: 'encrypted';
      messages: 'encrypted';
    };
  };
}
```

### 11.2 APIセキュリティ
- API認証トークンの使用
- レートリミット実装
- CORS設定
- XSS/CSRF対策

### 11.3 プライバシー
- GDPR/個人情報保護法対応
- データ削除機能
- データエクスポート機能
- 同意管理

---

## 12. パフォーマンス要件

### 12.1 応答時間
- API応答時間: < 200ms (p95)
- チャットメッセージ送信: < 500ms
- 友だち一覧表示: < 1s
- CSV エクスポート: バックグラウンド処理

### 12.2 スケーラビリティ
- 同時接続数: 10,000+
- 友だち数: アカウントあたり100,000+
- メッセージスループット: 1,000 msg/sec

### 12.3 可用性
- アップタイム: 99.9%
- データバックアップ: 日次
- 災害復旧計画

---

## 13. テスト要件

### 13.1 テストカバレッジ
- ユニットテスト: 80%+
- 統合テスト: 主要フロー100%
- E2Eテスト: クリティカルパス100%

### 13.2 テストシナリオ
- 友だち管理フロー
- チャット送受信フロー
- 統合フロー
- 移行フロー
- 通知配信フロー

---

## 14. 監視・運用

### 14.1 監視項目
- API応答時間
- エラーレート
- WebSocket接続数
- メッセージ配信成功率
- 通知配信成功率

### 14.2 ログ管理
- アクセスログ
- エラーログ
- 監査ログ
- パフォーマンスログ

---

## 付録A: 用語集

| 用語 | 説明 |
|------|------|
| 友だち | LINE公式アカウントを友だち追加したユーザー |
| 読者 | UTAGE内でのユーザーの識別単位 |
| シナリオ | ステップ配信のシーケンス |
| 配信除外 | すべての配信から除外する設定 |
| テスト対象 | 配信前のテストアカウント |
| 対応ステータス | チャット対応の状態管理 |
| 統合型アカウント | メールとLINEを統合管理するアカウント |
| 移行リンク | 既存友だちをUTAGEに移行するためのURL |

---

## 付録B: 参考資料

### B.1 元となったUTAGEドキュメント
1. LINE友だち一覧: https://help.utage-system.com/archives/19861
2. LINEチャット(1to1トーク)の見方: https://help.utage-system.com/archives/1829
3. LINEの友だち詳細ページの見方: https://help.utage-system.com/archives/1845
4. メールアドレスとLINEアカウント情報を統合する: https://help.utage-system.com/archives/4894
5. LINE通知設定の利用方法: https://help.utage-system.com/archives/5297
6. 他システムからのLINE友だち移行の設定方法: https://help.utage-system.com/archives/5911

### B.2 関連技術ドキュメント
- LINE Messaging API: https://developers.line.biz/ja/docs/messaging-api/
- LINE Login: https://developers.line.biz/ja/docs/line-login/

---

**文書バージョン**: 1.0
**最終更新日**: 2025-12-09
**作成者**: Claude Opus 4.5
