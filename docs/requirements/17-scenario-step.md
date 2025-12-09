# シナリオ・ステップ配信機能 要件定義書

## 1. 概要

### 1.1 目的

本ドキュメントは、UTAGEのシナリオ・ステップ配信機能のクローンアプリケーション開発における機能要件を定義する。シナリオ管理は、メール・LINE配信を時系列で自動化し、リードナーチャリング、顧客育成、エンゲージメント向上を実現する重要な機能である。

### 1.2 シナリオ配信とは

シナリオ配信は、登録したユーザーに対して、事前に設定したタイミングで自動的にメッセージを配信する機能である。以下のような用途に使用される:

- **ステップメール配信**: 登録後、1日目、3日目、7日目というように段階的に情報提供
- **リマインダ配信**: イベント開催前日や当日朝など、特定のタイミングで通知
- **ドリップキャンペーン**: 長期的な顧客教育・ナーチャリング
- **オンボーディング**: 新規ユーザーの教育とエンゲージメント
- **アップセル・クロスセル**: 既存顧客への商品提案

### 1.3 UTAGEとClickFunnelsの比較

| 機能 | UTAGE | ClickFunnels |
|------|-------|--------------|
| 配信チャネル | メール・LINE両対応 | 主にメール（SMSオプション） |
| 配信タイミング | 即時/相対時間/絶対時刻 | 相対時間/曜日/日付 |
| グループ管理 | シナリオグループで階層管理 | フォルダ・タグで管理 |
| リマインダ | 専用のリマインダ配信機能 | ワークフロー内のDelayステップ |
| 配信条件 | 詳細な条件設定可能 | Conditional Split Path |
| 置き換え文字 | 豊富な日本語対応タグ | Merge Tags（英語中心） |

### 1.4 対象ユーザー

- マーケティング担当者
- セールスファネル運営者
- オンラインスクール運営者
- コーチ・コンサルタント
- EC事業者

### 1.5 システム構成

- フロントエンド: シナリオ管理UI、ステップ設定エディター
- バックエンド: シナリオエンジン、スケジューラー、配信システム
- データベース: シナリオ定義、読者管理、配信履歴
- 外部連携: メール配信サービス、LINE Messaging API

---

## 2. シナリオ管理機能

### 2.1 シナリオグループ管理

#### 2.1.1 シナリオグループとは

シナリオグループは、複数のシナリオを分類・整理するためのフォルダ機能である。プロジェクト別、商品別、キャンペーン別など、用途に応じてシナリオを階層化して管理できる。

#### 2.1.2 UIコンポーネント

**シナリオグループ一覧**
- ページタイトル: 「シナリオ管理」
- 左サイドバー: シナリオグループツリー
  - 展開/折りたたみ可能
  - ドラッグ&ドロップで並び替え
  - 階層の深さ: 最大3階層
- メインエリア: 選択されたグループ内のシナリオ一覧

**シナリオグループ追加モーダル**
- モーダルタイトル: 「シナリオグループ追加」
- 入力フィールド:
  - グループ名（必須、最大100文字）
  - 説明（オプション、最大500文字）
  - 親グループ選択（階層化する場合）
  - カラー選択（識別用）
- アクションボタン:
  - キャンセル
  - 追加

**シナリオグループ編集**
- 編集フォーム:
  - グループ名変更
  - 説明変更
  - カラー変更
  - 親グループ変更（移動）
- 削除機能:
  - 削除確認ダイアログ
  - 注意: グループ内にシナリオがある場合は削除不可
  - 代替案: シナリオを他グループに移動後、削除

#### 2.1.3 データモデル

```typescript
interface ScenarioGroup {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string; // HEX color code
  parentGroupId?: string; // 親グループID（階層化）
  order: number; // 表示順序
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // 関連カウント
  scenarioCount: number;
  totalReaders: number;
}
```

#### 2.1.4 ワークフロー

1. 「シナリオグループ追加」ボタンをクリック
2. モーダルが表示される
3. グループ名を入力
4. オプション: 説明、親グループ、カラーを設定
5. 「追加」ボタンをクリック
6. システムがシナリオグループレコードを作成
7. サイドバーに新しいグループが表示される

### 2.2 シナリオ管理

#### 2.2.1 シナリオ作成

**UIコンポーネント**

**シナリオ一覧ページ**
- ヘッダー:
  - ページタイトル: 「シナリオ一覧」
  - 「新規シナリオ作成」ボタン
- フィルター:
  - シナリオグループで絞り込み
  - ステータス: すべて / 有効 / 無効
  - 検索バー: シナリオ名で検索
- 一覧テーブル:
  - 列: シナリオ名、ステータス、読者数、ステップ数、最終更新日、アクション
  - ソート機能
  - ページネーション

**シナリオ作成モーダル**
- モーダルタイトル: 「新規シナリオ作成」
- 入力フィールド:
  - シナリオ名（必須、最大255文字）
  - シナリオグループ選択（オプション）
  - 説明（オプション、最大1000文字）
- アクションボタン:
  - キャンセル
  - 作成

#### 2.2.2 シナリオ設定

**基本設定**

*シナリオ情報:*
- シナリオ名
- シナリオグループ
- 説明
- ステータス（有効/無効）トグル

*配信設定:*
- 配信チャネル選択:
  - メールのみ
  - LINEのみ
  - メール・LINE両方
- 配信開始条件:
  - 手動登録時
  - フォーム送信時
  - 商品購入時
  - 特定のアクション実行時
  - 他シナリオ完了時

*除外設定:*
- チェックボックス:
  - 配信停止済みの読者を除外
  - ブロック済みの読者を除外
  - 他の実行中シナリオがある読者を除外

*通知設定:*
- 管理者通知:
  - 読者登録時に通知
  - 配信エラー時に通知
  - 完了時に通知
- 通知先メールアドレス（複数設定可）

#### 2.2.3 データモデル

```typescript
interface Scenario {
  id: string;
  workspaceId: string;
  scenarioGroupId?: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';

  // 配信設定
  channels: ('email' | 'line')[];
  startTriggers: ScenarioTrigger[];

  // 除外設定
  excludeUnsubscribed: boolean;
  excludeBlocked: boolean;
  excludeActiveScenarios: boolean;

  // 通知設定
  notifications: {
    onReaderRegistration: boolean;
    onDeliveryError: boolean;
    onCompletion: boolean;
    emails: string[];
  };

  // 統計
  totalReaders: number;
  activeReaders: number;
  completedReaders: number;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ScenarioTrigger {
  type: 'manual' | 'form_submit' | 'purchase' | 'action' | 'scenario_complete';
  formId?: string;
  productId?: string;
  actionId?: string;
  scenarioId?: string;
}
```

#### 2.2.4 ワークフロー

1. 「新規シナリオ作成」ボタンをクリック
2. モーダルでシナリオ名などを入力
3. 「作成」ボタンをクリック
4. システムがシナリオレコードを作成（status: 'draft'）
5. シナリオ詳細ページへリダイレクト
6. 基本設定を入力
7. ステップを追加（後述）
8. 配信条件を設定（後述）
9. 「有効化」トグルをONにして公開

### 2.3 シナリオ読者管理

#### 2.3.1 読者追加方法

**手動追加**
- UIコンポーネント:
  - シナリオ詳細ページ内「読者」タブ
  - 「読者を追加」ボタン
  - 読者選択モーダル:
    - コンタクト検索
    - 複数選択可能
    - セグメント一括追加
- ワークフロー:
  1. 「読者を追加」をクリック
  2. コンタクトを検索・選択
  3. 「追加」ボタンをクリック
  4. シナリオ実行が開始される

**自動追加（トリガー）**
- フォーム送信時:
  - フォーム設定で追加するシナリオを指定
  - フォーム送信完了時に自動登録
- 商品購入時:
  - 商品設定で追加するシナリオを指定
  - 決済完了時に自動登録
- アクション実行時:
  - ワークフロー内のアクションで登録
  - 条件分岐での登録
- 他シナリオ完了時:
  - シナリオAが完了したら、シナリオBに自動登録

**CSV一括インポート**
- UIコンポーネント:
  - 「CSVインポート」ボタン
  - ファイルアップロード
  - カラムマッピング
  - プレビュー
  - インポート実行
- フォーマット:
  - 必須列: メールアドレス または LINE USER ID
  - オプション列: 名前、カスタム属性
- バリデーション:
  - 重複チェック
  - 既に登録済みの読者はスキップ

#### 2.3.2 読者ステータス

| ステータス | 説明 |
|-----------|------|
| active | シナリオ実行中 |
| completed | シナリオ完了 |
| stopped | 管理者により停止 |
| unsubscribed | 読者が配信停止 |
| error | 配信エラー |

#### 2.3.3 読者一覧

**UIコンポーネント**
- テーブル:
  - 列: 読者名、メールアドレス、登録日時、現在のステップ、ステータス、アクション
  - フィルター: ステータスで絞り込み
  - 検索: 名前・メールアドレスで検索
- アクション:
  - 詳細表示
  - 停止
  - 再開
  - 削除

**読者詳細**
- 基本情報:
  - 名前
  - メールアドレス
  - LINE USER ID
  - 登録日時
- シナリオ進捗:
  - 現在のステップ
  - 次回配信予定日時
  - 完了ステップ数 / 全ステップ数
- 配信履歴:
  - 配信日時
  - ステップ名
  - 配信結果（成功/失敗）
  - 開封状況（メールの場合）
  - クリック状況

#### 2.3.4 データモデル

```typescript
interface ScenarioReader {
  id: string;
  scenarioId: string;
  contactId: string;
  status: 'active' | 'completed' | 'stopped' | 'unsubscribed' | 'error';

  // 進捗情報
  currentStepId?: string;
  currentStepOrder: number;
  completedSteps: string[]; // ステップIDの配列

  // スケジュール情報
  nextDeliveryAt?: Date;
  startedAt: Date;
  completedAt?: Date;
  stoppedAt?: Date;

  // エラー情報
  lastError?: {
    stepId: string;
    message: string;
    occurredAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface ScenarioDeliveryLog {
  id: string;
  scenarioId: string;
  readerId: string;
  stepId: string;

  // 配信情報
  channel: 'email' | 'line';
  status: 'success' | 'failed' | 'pending';
  deliveredAt?: Date;

  // メール専用
  emailId?: string;
  opened?: boolean;
  openedAt?: Date;
  clicked?: boolean;
  clickedAt?: Date;

  // エラー情報
  errorMessage?: string;

  createdAt: Date;
}
```

---

## 3. ステップ配信機能

### 3.1 メールステップ配信

#### 3.1.1 ステップ追加

**UIコンポーネント**
- シナリオ詳細ページ内「ステップ」タブ
- 「メールステップ追加」ボタン
- ステップ作成モーダル:
  - ステップ名（必須）
  - 配信タイミング設定
  - メール内容設定
  - 配信条件設定（オプション）

#### 3.1.2 配信タイミング設定

**タイミングタイプ**

*即時配信:*
- シナリオ登録直後に配信
- 設定項目なし

*相対時間配信:*
- 設定項目:
  - 日数: 0-365日
  - 時間: 0-23時間
  - 分: 0-59分
- 例: 「登録3日後の14:00に配信」
- 計算方法: シナリオ登録日時 + 設定日時

*絶対日時配信:*
- 設定項目:
  - 年月日
  - 時刻
- 例: 「2025年12月25日 10:00に配信」
- 用途: イベントやキャンペーン開始日時

*曜日・時刻指定:*
- 設定項目:
  - 曜日選択（月-日）
  - 時刻
- 例: 「毎週月曜日の09:00に配信」
- 繰り返し: 1回のみ / 毎週

**登録当日の処理**
- 設定した配信時刻が既に過ぎている場合:
  - オプション1: 配信しない
  - オプション2: 翌日の指定時刻に配信（全ステップを1日ずつ後ろ倒し）
- UIコンポーネント:
  - ラジオボタンで選択
  - 選択した処理の説明文を表示

#### 3.1.3 メール内容設定

**基本設定**
- 件名（必須、最大255文字）
- 送信者名（デフォルト値設定可能）
- 送信元メールアドレス（認証済みドメイン）
- 返信先メールアドレス（オプション）

**メール本文**
- メールエディター:
  - リッチテキストエディター（HTML形式）
  - プレーンテキストモード
  - テンプレート選択
- 利用可能な機能:
  - テキスト装飾（太字、斜体、下線、色）
  - 画像挿入
  - リンク挿入
  - ボタン挿入
  - 置き換え文字挿入（後述）
  - 配信停止リンク挿入（必須）

**プレビュー機能**
- デスクトップビュー
- モバイルビュー
- テスト送信:
  - 送信先メールアドレス入力
  - 置き換え文字はサンプルデータで表示
  - 「テスト送信」ボタン

#### 3.1.4 データモデル

```typescript
interface EmailStep {
  id: string;
  scenarioId: string;
  stepOrder: number;
  name: string;

  // 配信タイミング
  deliveryTiming: {
    type: 'immediate' | 'relative' | 'absolute' | 'day_of_week';

    // 相対時間配信
    relativeDays?: number;
    relativeHours?: number;
    relativeMinutes?: number;

    // 絶対日時配信
    absoluteDate?: Date;

    // 曜日・時刻指定
    dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=日曜
    timeOfDay?: string; // "HH:MM" format
    recurring?: boolean;

    // 登録当日の処理
    sameDay: 'skip' | 'next_day';
  };

  // メール設定
  email: {
    subject: string;
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    htmlContent: string;
    plainTextContent?: string;
  };

  // 配信条件（後述）
  conditions?: StepCondition[];

  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 LINEステップ配信

#### 3.2.1 LINE配信の特徴

- メール配信と同様のタイミング設定が可能
- LINE独自のメッセージタイプをサポート:
  - テキストメッセージ
  - 画像メッセージ
  - 動画メッセージ
  - 音声メッセージ
  - スタンプ
  - ボタンメッセージ
  - カルーセルメッセージ

#### 3.2.2 UIコンポーネント

**LINEステップ追加**
- 「LINEステップ追加」ボタン
- ステップ作成モーダル:
  - ステップ名
  - 配信タイミング設定（メールと同様）
  - LINEメッセージ設定

**LINEメッセージエディター**
- メッセージタイプ選択:
  - ドロップダウンで選択
  - タイプごとに異なる設定フォーム表示

*テキストメッセージ:*
- テキスト入力エリア（最大5000文字）
- 絵文字ピッカー
- 置き換え文字挿入ボタン

*画像メッセージ:*
- 画像アップロード
- または画像URL入力
- プレビュー表示

*ボタンメッセージ:*
- タイトルテキスト
- テキストメッセージ
- ボタン追加（最大4つ）:
  - ボタンテキスト
  - アクションタイプ:
    - URLを開く
    - ポストバック（後続アクション設定用）
    - 電話をかける

*カルーセルメッセージ:*
- カラム追加（最大10カラム）
- 各カラム設定:
  - 画像
  - タイトル
  - テキスト
  - アクションボタン（最大3つ）

**プレビュー機能**
- LINEシミュレーター表示
- 実際のLINEトーク画面のような見た目でプレビュー
- テスト送信:
  - 自分のLINEアカウントに送信
  - QRコードでテストアカウント追加

#### 3.2.3 データモデル

```typescript
interface LineStep {
  id: string;
  scenarioId: string;
  stepOrder: number;
  name: string;

  // 配信タイミング（EmailStepと同様）
  deliveryTiming: DeliveryTiming;

  // LINEメッセージ
  lineMessage: {
    type: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'template';

    // テキストメッセージ
    text?: string;

    // 画像メッセージ
    imageUrl?: string;
    previewImageUrl?: string;

    // 動画メッセージ
    videoUrl?: string;
    previewVideoUrl?: string;

    // 音声メッセージ
    audioUrl?: string;
    audioDuration?: number; // ミリ秒

    // スタンプ
    sticker?: {
      packageId: string;
      stickerId: string;
    };

    // テンプレートメッセージ
    template?: {
      type: 'buttons' | 'confirm' | 'carousel';
      // ボタンテンプレート
      buttons?: {
        thumbnailImageUrl?: string;
        title?: string;
        text: string;
        actions: LineAction[];
      };
      // カルーセルテンプレート
      carousel?: {
        columns: {
          thumbnailImageUrl?: string;
          title?: string;
          text: string;
          actions: LineAction[];
        }[];
      };
    };
  };

  // 配信条件
  conditions?: StepCondition[];

  createdAt: Date;
  updatedAt: Date;
}

interface LineAction {
  type: 'uri' | 'postback' | 'message' | 'datetimepicker';
  label: string;

  // URIアクション
  uri?: string;

  // ポストバックアクション
  data?: string;
  displayText?: string;

  // メッセージアクション
  text?: string;
}
```

### 3.3 ステップの並び替え

**UIコンポーネント**
- ステップ一覧表示:
  - 各ステップカード
  - ステップ番号
  - ステップ名
  - 配信タイミング
  - ステータス（有効/無効）
- 並び替え機能:
  - ドラッグ&ドロップで順序変更
  - 各ステップカードの右側に「∧∨」アイコン
  - アイコンクリックで1つ上/下に移動
- 自動保存:
  - 並び替え後、自動的に保存
  - 保存完了のトーストメッセージ表示

**注意事項**
- 既に実行中の読者がいる場合:
  - 警告ダイアログ表示
  - 「現在実行中の読者のステップ順序は変更されません。新規登録者から新しい順序が適用されます。」
  - 確認ボタンで続行

---

## 4. リマインダ機能

### 4.1 メールリマインダ配信

#### 4.1.1 リマインダとは

リマインダは、特定のイベントやアクションに対して、事前または事後に通知メッセージを送信する機能である。ステップ配信とは異なり、基準日時からの相対時間で配信される。

**ユースケース**
- ウェビナー開催リマインダ:
  - 開催3日前
  - 開催前日
  - 開催1時間前
- 商品発送リマインダ:
  - 発送日の翌日にフォローアップ
- イベント参加リマインダ:
  - 参加前日の夜
  - 参加当日の朝

#### 4.1.2 UIコンポーネント

**リマインダ設定ページ**
- ナビゲーション: シナリオ詳細 → リマインダタブ
- 「リマインダ追加」ボタン
- リマインダ一覧:
  - リマインダ名
  - トリガー
  - 配信タイミング
  - ステータス（有効/無効）
  - アクション（編集/削除）

**リマインダ作成モーダル**
- リマインダ名（必須）
- トリガー設定:
  - トリガータイプ選択:
    - イベント日時
    - 商品購入日
    - フォーム送信日
    - カスタム日付フィールド
  - トリガー対象選択:
    - 特定のイベント
    - 特定の商品
    - 特定のフォーム
    - カスタムフィールド名
- 配信タイミング設定:
  - 基準日からの相対時間:
    - 日数: -365 ~ +365日
    - 時間: 0-23時間
    - 分: 0-59分
  - 例: 「イベント開催3日前の10:00」→ -3日 10:00
  - 例: 「商品購入1時間後」→ +0日 +1時間
- 配信時刻指定:
  - 時刻を指定（例: 10:00）
  - または「トリガー時刻から相対的に」
- メール内容設定（メールステップと同様）

#### 4.1.3 データモデル

```typescript
interface Reminder {
  id: string;
  scenarioId: string;
  name: string;
  status: 'active' | 'inactive';

  // トリガー設定
  trigger: {
    type: 'event_date' | 'purchase_date' | 'form_submit_date' | 'custom_date_field';
    eventId?: string;
    productId?: string;
    formId?: string;
    customFieldName?: string;
  };

  // 配信タイミング
  deliveryTiming: {
    relativeDays: number; // 負の値は「前」、正の値は「後」
    relativeHours: number;
    relativeMinutes: number;

    // 時刻指定
    timeMode: 'relative' | 'fixed';
    fixedTime?: string; // "HH:MM" format
  };

  // メール設定
  email: {
    subject: string;
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    htmlContent: string;
    plainTextContent?: string;
  };

  // 配信条件
  conditions?: StepCondition[];

  createdAt: Date;
  updatedAt: Date;
}

interface ReminderSchedule {
  id: string;
  reminderId: string;
  contactId: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

#### 4.1.4 リマインダスケジューリング

**スケジュール生成プロセス**
1. トリガーイベント発生（例: イベント登録完了）
2. システムがトリガーを検知
3. 該当するリマインダを取得
4. 基準日時を計算（例: イベント開催日時）
5. リマインダ配信タイミングを計算
6. ReminderScheduleレコードを作成
7. バックグラウンドジョブでスケジュール管理

**スケジュール実行**
- Cronジョブ（毎分実行）:
  1. 現在時刻 ≦ scheduledAt のレコードを取得
  2. ステータスが 'pending' のものを処理
  3. メール配信実行
  4. ステータスを 'sent' に更新
  5. sentAt に現在時刻を記録

**キャンセル処理**
- トリガーイベントがキャンセルされた場合:
  - 該当するReminderScheduleのステータスを 'cancelled' に更新
  - 配信されない

---

## 5. 配信条件設定

### 5.1 配信条件とは

配信条件は、ステップやリマインダの配信時に、読者の状態や属性に基づいて配信可否を判定する機能である。条件を満たさない読者には配信されず、次のステップに進む。

**ユースケース**
- 性別によるメッセージ出し分け
- 購入履歴がある読者のみに特別オファー
- 開封・クリックしていない読者にフォローアップ
- 年齢層別のコンテンツ配信

### 5.2 条件タイプ

#### 5.2.1 基本条件

**コンタクト属性**
- フィールド選択:
  - 名前
  - メールアドレス
  - 電話番号
  - カスタム属性（ユーザー定義フィールド）
- オペレーター:
  - 等しい
  - 等しくない
  - 含む
  - 含まない
  - 空である
  - 空でない
  - より大きい（数値・日付）
  - より小さい（数値・日付）
- 値:
  - テキスト入力
  - 数値入力
  - 日付ピッカー
  - ドロップダウン（選択肢がある場合）

**タグ条件**
- フィールド: タグ
- オペレーター:
  - 持っている
  - 持っていない
  - いずれかを持っている
  - すべてを持っている
- 値: タグ選択（複数選択可）

**購入履歴**
- フィールド: 購入商品
- オペレーター:
  - 購入したことがある
  - 購入したことがない
- 値: 商品選択（複数選択可）

#### 5.2.2 エンゲージメント条件

**メール開封**
- 条件:
  - 特定のメールを開封した
  - 特定のメールを開封していない
  - 過去N日間にメールを開封した
  - 過去N日間にメールを開封していない
- 設定:
  - メール選択（同シナリオ内のステップ）
  - 日数指定

**メールクリック**
- 条件:
  - 特定のメール内のリンクをクリックした
  - 特定のメール内のリンクをクリックしていない
- 設定:
  - メール選択
  - リンクURL指定（オプション）

**LINEアクション**
- 条件:
  - 特定のLINEメッセージに返信した
  - 特定のボタンをクリックした
- 設定:
  - LINEメッセージ選択
  - ボタン選択（ボタンメッセージの場合）

#### 5.2.3 日付・時刻条件

**現在の日時**
- 条件:
  - 現在の曜日が（月-日）
  - 現在の時刻が（HH:MM - HH:MM）の範囲内
  - 現在の日付が（YYYY/MM/DD）より前/後
- 用途: 営業時間外の配信を避ける、曜日限定配信

**カスタム日付フィールド**
- 条件:
  - カスタム日付フィールドが特定の日付より前/後
  - カスタム日付フィールドが今日から±N日以内
- 用途: 誕生日、契約日、有効期限などに基づく配信

### 5.3 条件の組み合わせ

**論理演算子**
- AND: すべての条件を満たす
- OR: いずれかの条件を満たす

**条件グループ**
- 複数の条件をグループ化
- グループ内の論理演算子を指定
- グループ間の論理演算子を指定
- 最大3階層までネスト可能

**例:**
```
(条件1 AND 条件2) OR (条件3 AND 条件4)
```

### 5.4 UIコンポーネント

**条件設定ビルダー**
- 「配信条件を追加」ボタン
- 条件ルール追加インターフェース:
  - フィールド選択（ドロップダウン）
  - オペレーター選択（ドロップダウン）
  - 値入力（フィールドタイプに応じて変化）
  - 論理演算子選択（AND/OR）
  - 削除ボタン
- 「条件グループ追加」ボタン（ネスト）
- 条件プレビュー:
  - 自然言語での条件表示
  - 例: 「性別が『男性』で、かつ、購入履歴が『あり』」

**推定対象者数表示**
- 条件設定後、リアルタイムで該当する読者数を表示
- APIで計算（debounce 500ms）
- 表示例: 「この条件に該当する読者: 123人」

### 5.5 データモデル

```typescript
interface StepCondition {
  id: string;
  stepId: string;

  // 条件ルール
  rules: ConditionRule[];

  // ルールグループ（ネスト対応）
  groups?: ConditionGroup[];

  // ルート論理演算子
  logicalOperator: 'AND' | 'OR';
}

interface ConditionRule {
  id: string;
  field: string; // 'name', 'email', 'custom_field_name', 'tags', 'purchase_history', etc.
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR'; // 次のルールとの論理演算子
}

type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'exists'
  | 'not_exists'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'has_tag'
  | 'not_has_tag'
  | 'purchased'
  | 'not_purchased'
  | 'opened'
  | 'not_opened'
  | 'clicked'
  | 'not_clicked';

interface ConditionGroup {
  id: string;
  rules: ConditionRule[];
  groups?: ConditionGroup[]; // ネスト対応
  logicalOperator: 'AND' | 'OR';
}
```

### 5.6 条件評価プロセス

**評価タイミング**
- ステップ配信予定時刻の直前（5分前）
- リアルタイムで条件評価

**評価フロー**
1. 読者のコンタクト情報を取得
2. 読者のエンゲージメント履歴を取得
3. 条件ルールを順次評価
4. 論理演算子に従って結果を統合
5. 最終結果が `true` の場合のみ配信
6. `false` の場合は配信スキップ、次のステップへ

**スキップログ**
- 配信スキップ時、理由を記録:
  - ScenarioDeliveryLog にレコード作成
  - status: 'skipped'
  - skipReason: '配信条件を満たさないため'
  - 詳細な条件評価結果を保存（デバッグ用）

---

## 6. 置き換え文字（マージタグ）

### 6.1 置き換え文字とは

置き換え文字は、メールやLINEメッセージの本文中に挿入するプレースホルダーであり、配信時に読者ごとの実際のデータに置き換えられる。パーソナライゼーションを実現する重要な機能である。

**形式**
- UTAGE形式: `%name%`、`%email%`
- ClickFunnels形式: `{{contact.first_name}}`

本仕様では、両方の形式をサポートすることを推奨する。

### 6.2 標準置き換え文字

#### 6.2.1 読者情報

| 置き換え文字 | 説明 | 例 |
|------------|------|-----|
| `%name%` | 読者の名前（姓名） | 山田太郎 |
| `%sei%` | 姓 | 山田 |
| `%mei%` | 名 | 太郎 |
| `%email%` | メールアドレス | taro@example.com |
| `%tel%` | 電話番号 | 090-1234-5678 |
| `%birthday%` | 誕生日 | 1990/01/01 |
| `%age%` | 年齢 | 35 |
| `%gender%` | 性別 | 男性 |
| `%prefecture%` | 都道府県 | 東京都 |
| `%address%` | 住所 | 渋谷区1-2-3 |
| `%zipcode%` | 郵便番号 | 150-0001 |

#### 6.2.2 カスタムフィールド

ユーザー定義のカスタムフィールドも置き換え文字として使用可能:
- 形式: `%custom_field_name%`
- 例: `%company_name%`、`%job_title%`、`%membership_level%`

**注意事項**
- カスタムフィールド名は英数字とアンダースコアのみ
- スペースは自動的にアンダースコアに変換
- 値が存在しない場合は空文字列に置き換え

#### 6.2.3 日付・時刻

| 置き換え文字 | 説明 | 例 |
|------------|------|-----|
| `%today%` | 今日の日付 | 2025/12/09 |
| `%now%` | 現在の日時 | 2025/12/09 10:30 |
| `%year%` | 現在の年 | 2025 |
| `%month%` | 現在の月 | 12 |
| `%day%` | 現在の日 | 9 |
| `%weekday%` | 曜日 | 火曜日 |
| `%time%` | 現在の時刻 | 10:30 |

#### 6.2.4 シナリオ・ステップ情報

| 置き換え文字 | 説明 | 例 |
|------------|------|-----|
| `%scenario_name%` | シナリオ名 | ウェビナー参加者フォローアップ |
| `%step_name%` | ステップ名 | ウェビナー3日前リマインダ |
| `%step_number%` | ステップ番号 | 3 |
| `%registration_date%` | シナリオ登録日 | 2025/12/01 |

#### 6.2.5 商品・注文情報

| 置き換え文字 | 説明 | 例 |
|------------|------|-----|
| `%product_name%` | 商品名 | オンライン講座ベーシックコース |
| `%product_price%` | 商品価格 | 9,800円 |
| `%order_id%` | 注文ID | ORD-20251209-0001 |
| `%order_date%` | 注文日 | 2025/12/09 |
| `%order_total%` | 注文合計金額 | 10,780円（税込） |

#### 6.2.6 イベント情報

| 置き換え文字 | 説明 | 例 |
|------------|------|-----|
| `%event_name%` | イベント名 | マーケティングセミナー |
| `%event_date%` | イベント開催日 | 2025/12/15 |
| `%event_time%` | イベント開催時刻 | 14:00-16:00 |
| `%event_location%` | 開催場所 | オンライン（Zoom） |
| `%event_url%` | イベントURL | https://example.com/event/123 |

#### 6.2.7 システムリンク

| 置き換え文字 | 説明 |
|------------|------|
| `%unsubscribe_url%` | 配信停止URL |
| `%preferences_url%` | 配信設定URL |
| `%login_url%` | ログインURL |
| `%mypage_url%` | マイページURL |

### 6.3 置き換え文字の高度な機能

#### 6.3.1 フォールバック（デフォルト値）

値が存在しない場合のデフォルト値を設定:
- 形式: `%name|お客様%`
- 例: 名前が未設定の場合、「お客様」と表示

#### 6.3.2 条件分岐

置き換え文字の値に応じて表示内容を変更:
- 形式: `%if:gender=男性%男性向けメッセージ%else%女性向けメッセージ%endif%`
- ネスト可能

#### 6.3.3 日付フォーマット

日付の表示形式をカスタマイズ:
- 形式: `%today:format=Y年m月d日%`
- 例: `2025年12月09日`
- 利用可能なフォーマット:
  - `Y`: 4桁の年
  - `m`: 2桁の月
  - `d`: 2桁の日
  - `H`: 2桁の時（24時間）
  - `i`: 2桁の分

#### 6.3.4 計算

数値の簡単な計算:
- 形式: `%age+10%`
- 例: 年齢が35の場合、「45」と表示
- 対応演算: `+`, `-`, `*`, `/`

### 6.4 UIコンポーネント

**置き換え文字挿入ボタン**
- メールエディター・LINEメッセージエディター内に配置
- ボタンテキスト: 「置き換え文字を挿入」

**置き換え文字選択ドロップダウン**
- カテゴリ分け:
  - 読者情報
  - カスタムフィールド
  - 日付・時刻
  - シナリオ・ステップ
  - 商品・注文
  - イベント
  - システムリンク
- 検索機能:
  - 置き換え文字名で検索
- 各項目にホバーで説明ツールチップ表示
- クリックで挿入

**高度な設定モーダル**
- 「高度な設定」リンク（ドロップダウン下部）
- フォールバック値設定
- 条件分岐設定
- 日付フォーマット設定
- プレビュー表示

### 6.5 データ処理

**配信時の置き換えプロセス**
1. メール本文をパース
2. すべての置き換え文字を検出（正規表現）
3. 各読者のデータを取得:
   - コンタクト情報
   - カスタムフィールド
   - エンゲージメント履歴
   - 関連する商品・イベント情報
4. 置き換え文字を実際の値に置き換え:
   - 値が存在する場合: 値を挿入
   - 値が存在しない場合:
     - フォールバック値があればフォールバック値
     - なければ空文字列
5. 条件分岐を評価・置き換え
6. 日付フォーマットを適用
7. 計算式を評価
8. 最終的なメール本文を生成

**テストメール・プレビュー時の挙動**
- サンプルデータを使用:
  ```typescript
  const SAMPLE_DATA = {
    name: '山田太郎',
    sei: '山田',
    mei: '太郎',
    email: 'sample@example.com',
    tel: '090-1234-5678',
    gender: '男性',
    age: 35,
    // ...その他のフィールド
  };
  ```
- または、特定の読者を選択してプレビュー

### 6.6 バリデーション

**配信前チェック**
- 必須置き換え文字の存在確認:
  - `%unsubscribe_url%`（メール配信の場合）
- 存在しないカスタムフィールド名の警告:
  - 「警告: %unknown_field% は存在しないフィールドです」
- 置き換え文字の構文エラーチェック:
  - 閉じタグ忘れ、不正なフォーマット等

---

## 7. API要件

### 7.1 シナリオAPI

```
# シナリオグループ
GET    /api/scenario-groups                    # 一覧取得
POST   /api/scenario-groups                    # 新規作成
GET    /api/scenario-groups/:id                # 詳細取得
PUT    /api/scenario-groups/:id                # 更新
DELETE /api/scenario-groups/:id                # 削除

# シナリオ
GET    /api/scenarios                          # 一覧取得
POST   /api/scenarios                          # 新規作成
GET    /api/scenarios/:id                      # 詳細取得
PUT    /api/scenarios/:id                      # 更新
DELETE /api/scenarios/:id                      # 削除
POST   /api/scenarios/:id/activate             # 有効化
POST   /api/scenarios/:id/deactivate           # 無効化
POST   /api/scenarios/:id/duplicate            # 複製

# ステップ
GET    /api/scenarios/:id/steps                # ステップ一覧取得
POST   /api/scenarios/:id/steps                # ステップ追加
GET    /api/scenarios/:id/steps/:stepId        # ステップ詳細取得
PUT    /api/scenarios/:id/steps/:stepId        # ステップ更新
DELETE /api/scenarios/:id/steps/:stepId        # ステップ削除
PUT    /api/scenarios/:id/steps/reorder        # ステップ並び替え

# 読者
GET    /api/scenarios/:id/readers              # 読者一覧取得
POST   /api/scenarios/:id/readers              # 読者追加
GET    /api/scenarios/:id/readers/:readerId    # 読者詳細取得
DELETE /api/scenarios/:id/readers/:readerId    # 読者削除
POST   /api/scenarios/:id/readers/:readerId/stop    # 読者停止
POST   /api/scenarios/:id/readers/:readerId/resume  # 読者再開
POST   /api/scenarios/:id/readers/import       # CSV一括インポート
GET    /api/scenarios/:id/readers/export       # CSV一括エクスポート

# リマインダ
GET    /api/scenarios/:id/reminders            # リマインダ一覧取得
POST   /api/scenarios/:id/reminders            # リマインダ追加
GET    /api/scenarios/:id/reminders/:reminderId  # リマインダ詳細取得
PUT    /api/scenarios/:id/reminders/:reminderId  # リマインダ更新
DELETE /api/scenarios/:id/reminders/:reminderId # リマインダ削除

# 配信ログ
GET    /api/scenarios/:id/delivery-logs        # 配信ログ取得
GET    /api/scenarios/:id/readers/:readerId/logs # 読者別配信ログ

# 分析
GET    /api/scenarios/:id/analytics            # シナリオ分析データ取得
GET    /api/scenarios/:id/steps/:stepId/analytics # ステップ別分析

# テスト送信
POST   /api/scenarios/:id/steps/:stepId/test   # ステップのテスト送信
```

### 7.2 データモデル全体像

```typescript
// シナリオグループ
interface ScenarioGroup {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  parentGroupId?: string;
  order: number;
  scenarioCount: number;
  totalReaders: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// シナリオ
interface Scenario {
  id: string;
  workspaceId: string;
  scenarioGroupId?: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  channels: ('email' | 'line')[];
  startTriggers: ScenarioTrigger[];
  excludeUnsubscribed: boolean;
  excludeBlocked: boolean;
  excludeActiveScenarios: boolean;
  notifications: ScenarioNotifications;
  totalReaders: number;
  activeReaders: number;
  completedReaders: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ステップ（基底）
interface ScenarioStepBase {
  id: string;
  scenarioId: string;
  stepOrder: number;
  name: string;
  type: 'email' | 'line';
  deliveryTiming: DeliveryTiming;
  conditions?: StepCondition[];
  createdAt: Date;
  updatedAt: Date;
}

// メールステップ
interface EmailStep extends ScenarioStepBase {
  type: 'email';
  email: {
    subject: string;
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    htmlContent: string;
    plainTextContent?: string;
  };
}

// LINEステップ
interface LineStep extends ScenarioStepBase {
  type: 'line';
  lineMessage: LineMessage;
}

// 読者
interface ScenarioReader {
  id: string;
  scenarioId: string;
  contactId: string;
  status: 'active' | 'completed' | 'stopped' | 'unsubscribed' | 'error';
  currentStepId?: string;
  currentStepOrder: number;
  completedSteps: string[];
  nextDeliveryAt?: Date;
  startedAt: Date;
  completedAt?: Date;
  stoppedAt?: Date;
  lastError?: {
    stepId: string;
    message: string;
    occurredAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 配信ログ
interface ScenarioDeliveryLog {
  id: string;
  scenarioId: string;
  readerId: string;
  stepId: string;
  channel: 'email' | 'line';
  status: 'success' | 'failed' | 'pending' | 'skipped';
  deliveredAt?: Date;
  emailId?: string;
  opened?: boolean;
  openedAt?: Date;
  clicked?: boolean;
  clickedAt?: Date;
  errorMessage?: string;
  skipReason?: string;
  createdAt: Date;
}

// リマインダ
interface Reminder {
  id: string;
  scenarioId: string;
  name: string;
  status: 'active' | 'inactive';
  trigger: ReminderTrigger;
  deliveryTiming: ReminderTiming;
  email: EmailContent;
  conditions?: StepCondition[];
  createdAt: Date;
  updatedAt: Date;
}

// リマインダスケジュール
interface ReminderSchedule {
  id: string;
  reminderId: string;
  contactId: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. 技術仕様

### 8.1 推奨技術スタック

**フロントエンド**
- React 18+ または Next.js 14+
- TypeScript
- 状態管理: Zustand、Redux Toolkit
- UIコンポーネント: shadcn/ui、Ant Design
- フォーム: React Hook Form + Zod
- ドラッグ&ドロップ: dnd-kit、react-beautiful-dnd

**バックエンド**
- Node.js + NestJS または Fastify
- TypeScript
- ORM: Prisma、TypeORM

**データベース**
- PostgreSQL（推奨）
  - JSONBフィールド活用（LINEメッセージ、配信条件等）
  - インデックス最適化
  - パーティショニング（配信ログテーブル）

**ジョブキュー・スケジューラー**
- BullMQ（Node.js）
- Redis（キュー管理）
- Cronジョブ（スケジュール実行）

**メッセージング**
- メール: SendGrid、Mailgun、Amazon SES
- LINE: LINE Messaging API

**インフラ**
- クラウド: AWS、GCP
- コンテナ化: Docker、Kubernetes
- ストレージ: S3、GCS

### 8.2 データベーススキーマ（概要）

```sql
-- シナリオグループ
CREATE TABLE scenario_groups (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  parent_group_id UUID,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  INDEX idx_workspace_parent (workspace_id, parent_group_id)
);

-- シナリオ
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  scenario_group_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  channels TEXT[], -- ['email', 'line']
  start_triggers JSONB NOT NULL,
  exclude_unsubscribed BOOLEAN DEFAULT TRUE,
  exclude_blocked BOOLEAN DEFAULT TRUE,
  exclude_active_scenarios BOOLEAN DEFAULT FALSE,
  notifications JSONB,
  total_readers INTEGER DEFAULT 0,
  active_readers INTEGER DEFAULT 0,
  completed_readers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  INDEX idx_workspace_status (workspace_id, status),
  INDEX idx_scenario_group (scenario_group_id)
);

-- シナリオステップ
CREATE TABLE scenario_steps (
  id UUID PRIMARY KEY,
  scenario_id UUID NOT NULL,
  step_order INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'email' or 'line'
  delivery_timing JSONB NOT NULL,
  email_content JSONB, -- type='email'の場合
  line_message JSONB, -- type='line'の場合
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scenario_order (scenario_id, step_order)
);

-- シナリオ読者
CREATE TABLE scenario_readers (
  id UUID PRIMARY KEY,
  scenario_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_step_id UUID,
  current_step_order INTEGER DEFAULT 0,
  completed_steps TEXT[], -- ステップIDの配列
  next_delivery_at TIMESTAMP,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  stopped_at TIMESTAMP,
  last_error JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scenario_contact (scenario_id, contact_id),
  INDEX idx_next_delivery (next_delivery_at, status),
  INDEX idx_status (status)
);

-- 配信ログ
CREATE TABLE scenario_delivery_logs (
  id UUID PRIMARY KEY,
  scenario_id UUID NOT NULL,
  reader_id UUID NOT NULL,
  step_id UUID NOT NULL,
  channel VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  delivered_at TIMESTAMP,
  email_id UUID,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  error_message TEXT,
  skip_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scenario_reader (scenario_id, reader_id),
  INDEX idx_step (step_id),
  INDEX idx_created_at (created_at)
) PARTITION BY RANGE (created_at); -- パーティショニング推奨

-- リマインダ
CREATE TABLE reminders (
  id UUID PRIMARY KEY,
  scenario_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  trigger JSONB NOT NULL,
  delivery_timing JSONB NOT NULL,
  email_content JSONB NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scenario_status (scenario_id, status)
);

-- リマインダスケジュール
CREATE TABLE reminder_schedules (
  id UUID PRIMARY KEY,
  reminder_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scheduled_at_status (scheduled_at, status),
  INDEX idx_reminder (reminder_id)
);
```

### 8.3 スケジューラー設計

#### 8.3.1 ステップ配信スケジューラー

**Cronジョブ（毎分実行）**
```typescript
// 擬似コード
async function processScheduledSteps() {
  // 1. 配信予定の読者を取得
  const readers = await db.scenarioReaders.findMany({
    where: {
      status: 'active',
      nextDeliveryAt: {
        lte: new Date(),
      },
    },
  });

  // 2. 各読者に対して配信処理
  for (const reader of readers) {
    await processReaderStep(reader);
  }
}

async function processReaderStep(reader: ScenarioReader) {
  // 3. 次のステップを取得
  const step = await db.scenarioSteps.findFirst({
    where: {
      scenarioId: reader.scenarioId,
      stepOrder: reader.currentStepOrder + 1,
    },
  });

  if (!step) {
    // シナリオ完了
    await completeReader(reader);
    return;
  }

  // 4. 配信条件を評価
  const conditionMet = await evaluateConditions(step.conditions, reader);

  if (!conditionMet) {
    // 条件を満たさない場合、スキップして次のステップへ
    await skipStepAndMoveNext(reader, step);
    return;
  }

  // 5. メール/LINE配信
  if (step.type === 'email') {
    await sendEmail(step, reader);
  } else if (step.type === 'line') {
    await sendLineMessage(step, reader);
  }

  // 6. 読者情報を更新
  await updateReaderProgress(reader, step);
}
```

#### 8.3.2 リマインダスケジューラー

**Cronジョブ（毎分実行）**
```typescript
async function processScheduledReminders() {
  // 1. 配信予定のリマインダを取得
  const schedules = await db.reminderSchedules.findMany({
    where: {
      status: 'pending',
      scheduledAt: {
        lte: new Date(),
      },
    },
  });

  // 2. 各リマインダに対して配信処理
  for (const schedule of schedules) {
    await processReminderSchedule(schedule);
  }
}

async function processReminderSchedule(schedule: ReminderSchedule) {
  // 3. リマインダ設定を取得
  const reminder = await db.reminders.findUnique({
    where: { id: schedule.reminderId },
  });

  if (!reminder || reminder.status !== 'active') {
    // リマインダが無効化されている場合、キャンセル
    await cancelReminderSchedule(schedule);
    return;
  }

  // 4. 配信条件を評価
  const conditionMet = await evaluateConditions(reminder.conditions, schedule.contactId);

  if (!conditionMet) {
    // 条件を満たさない場合、スキップ
    await skipReminderSchedule(schedule);
    return;
  }

  // 5. メール配信
  await sendReminderEmail(reminder, schedule);

  // 6. スケジュール情報を更新
  await updateReminderScheduleStatus(schedule, 'sent');
}
```

### 8.4 配信エンジン

**ジョブキュー（BullMQ）**
```typescript
// メール配信ジョブ
interface SendEmailJob {
  readerId: string;
  stepId: string;
  contactId: string;
  emailContent: EmailContent;
}

emailQueue.process(async (job: Job<SendEmailJob>) => {
  const { readerId, stepId, contactId, emailContent } = job.data;

  try {
    // 1. コンタクト情報取得
    const contact = await db.contacts.findUnique({ where: { id: contactId } });

    // 2. 置き換え文字を処理
    const processedContent = await processMergeTags(emailContent, contact);

    // 3. メール送信（SMTP経由）
    const result = await smtpService.send({
      to: contact.email,
      from: processedContent.fromEmail,
      subject: processedContent.subject,
      html: processedContent.htmlContent,
      text: processedContent.plainTextContent,
    });

    // 4. 配信ログ作成
    await db.scenarioDeliveryLogs.create({
      data: {
        scenarioId: step.scenarioId,
        readerId,
        stepId,
        channel: 'email',
        status: 'success',
        deliveredAt: new Date(),
        emailId: result.messageId,
      },
    });

    return { success: true };
  } catch (error) {
    // エラーログ作成
    await db.scenarioDeliveryLogs.create({
      data: {
        scenarioId: step.scenarioId,
        readerId,
        stepId,
        channel: 'email',
        status: 'failed',
        errorMessage: error.message,
      },
    });

    throw error; // BullMQがリトライ
  }
});
```

### 8.5 パフォーマンス要件

**スケジューラー**
- ステップ配信スケジューラー: 毎分実行、1000読者/分処理
- リマインダスケジューラー: 毎分実行、500スケジュール/分処理

**メール配信**
- 送信速度: SMTP プロバイダーの制限に準拠
- キュー処理: 非同期、並列処理
- リトライ: 最大3回（指数バックオフ）

**データベースクエリ**
- インデックス最適化
- N+1クエリ回避
- 配信ログのパーティショニング（月次）
- 古いログの自動アーカイブ（6ヶ月以上前）

**API応答時間**
- 一覧取得: <500ms
- 詳細取得: <300ms
- 作成/更新: <1s
- 読者一覧取得: <1s（ページネーション100件/ページ）

### 8.6 セキュリティ要件

**認証・認可**
- JWT トークン認証
- ワークスペースレベルの権限管理
- ロールベースアクセス制御（RBAC）

**データ保護**
- SMTP認証情報の暗号化保存（AES-256）
- LINE Channel Secret/Access Tokenの暗号化保存
- HTTPS必須
- 配信停止トークンの署名検証

**レート制限**
- API: 1000リクエスト/分/ワークスペース
- テスト送信: 10通/分/ユーザー

**入力バリデーション**
- メールアドレス形式検証
- SQLインジェクション対策（パラメータ化クエリ）
- XSS対策（HTMLサニタイゼーション）

---

## 9. 実装優先順位

### Phase 1: MVP（基盤機能）
1. シナリオグループ管理
2. シナリオ作成・管理
3. メールステップ配信（基本）
   - 即時配信
   - 相対時間配信
4. 読者管理（手動追加）
5. 基本的な置き換え文字
6. スケジューラー実装

### Phase 2: コア機能
1. LINEステップ配信
2. 配信条件設定
3. 読者自動追加（トリガー）
4. ステップ並び替え
5. 配信ログ・分析
6. テスト送信

### Phase 3: 高度な機能
1. リマインダ配信
2. 高度な置き換え文字（条件分岐、フォールバック）
3. CSV一括インポート
4. 配信停止管理
5. 詳細な分析・レポート

### Phase 4: 拡張機能
1. A/Bテスト（件名）
2. 配信速度制御
3. 複雑な配信条件（ネスト）
4. マルチチャネル配信（メール+LINE同時）
5. API公開

---

## 10. まとめ

本ドキュメントは、UTAGEのシナリオ・ステップ配信機能の完全なクローンを構築するための包括的な要件定義である。以下の主要な側面をカバーしている:

1. **シナリオ管理**: シナリオグループ、シナリオ作成・設定、読者管理
2. **ステップ配信**: メールステップ、LINEステップ、配信タイミング設定
3. **リマインダ機能**: イベント・商品購入等に基づくリマインダ配信
4. **配信条件**: 詳細な条件設定、論理演算子、条件グループ
5. **置き換え文字**: 豊富なマージタグ、フォールバック、条件分岐
6. **API・データモデル**: RESTful API、TypeScriptインターフェース
7. **技術仕様**: スケジューラー、ジョブキュー、配信エンジン

この要件定義を基に、段階的な実装計画（Phase 1-4）に従って開発を進めることで、UTAGEと同等の強力なシナリオ・ステップ配信システムを構築できる。

---

## 11. 参考資料

### UTAGE公式ドキュメント（試行）
- メール・LINE配信機能概要
- シナリオグループ追加
- シナリオ追加
- シナリオ設定
- シナリオ読者追加
- メールステップ配信方法
- LINEステップ配信方法
- メールリマインダ配信
- 配信条件設定
- 置き換え文字一覧

**注**: 本ドキュメント作成時、多くのUTAGEドキュメントURLが404エラーとなりました。そのため、成功したWebFetch結果（LINEステップ配信、メール・LINE配信機能概要）と、ClickFunnelsワークフロー機能、および一般的なマーケティングオートメーションのベストプラクティスを組み合わせて要件を定義しています。

### ClickFunnelsワークフロー機能
- Workflows Overview
- Delay Step
- Conditional Split Path Step
- Trigger Another Workflow Step

---

**ドキュメントバージョン**: 1.0
**最終更新日**: 2025年12月9日
**作成者**: Claude (Anthropic)
