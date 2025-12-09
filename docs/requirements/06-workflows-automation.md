# ワークフロー・自動化機能 要件定義書

## 1. 概要

### 1.1 目的
ClickFunnelsのワークフロー・自動化機能は、ユーザーの行動（オプトイン、購入、ページ閲覧など）に基づいて、マーケティングおよびセールスプロセスを自動化する強力なツールです。トリガーとアクションを組み合わせることで、メール送信、タグ付け、コース登録、ウェブフック送信など、複雑な自動化シーケンスを構築できます。

### 1.2 自動化の2つのタイプ

#### クイックアクション（Quick Actions）
- **定義**: 単一のトリガーに基づいて即座に実行される1ステップの自動化
- **用途**: イベント駆動型の迅速な応答（例：オプトイン時のウェルカムメール送信）
- **特徴**: シンプルで即時性が高い

#### ワークフロー（Workflows）
- **定義**: 複数のトリガーとアクションを含む多段階のシーケンス
- **用途**: 複雑で長期的な自動化戦略（例：リードナーチャリング、カート放棄回復）
- **特徴**: 高度な条件分岐、遅延、複数ステップの組み合わせが可能

### 1.3 主要な利点
- リード育成の自動化
- カート放棄の回復
- オーディエンスのセグメント化
- 購入後のアップセル
- 自動リード評価
- ドリップキャンペーンの実行
- サードパーティツールとの連携

---

## 2. ワークフロー機能一覧

### 2.1 ワークフロー基本機能

#### 2.1.1 ワークフロー作成
- **機能**: 新規ワークフローの作成
- **UI要素**:
  - ダッシュボード左側メニュー「Automations」アプリ
  - 「Workflows」メニュー
  - 「Create Workflow」ボタン
  - ワークフロー名入力フィールド
- **ユーザーアクション**:
  1. Automationsアプリを開く
  2. Workflowsセクションに移動
  3. 新規ワークフロー作成ボタンをクリック
  4. ワークフロー名を入力
  5. トリガーを設定
  6. ステップを追加

#### 2.1.2 ワークフロー編集
- **機能**: 既存ワークフローの変更
- **UI要素**:
  - ワークフローリスト
  - ワークフロー名（クリック可能）
  - ドラッグ&ドロップインターフェース
  - ステップ追加ボタン（+アイコン）
- **ユーザーアクション**:
  - ワークフロー名をクリックして開く
  - ステップを追加、編集、削除
  - 自動保存（保存ボタン不要）
- **重要な仕様**:
  - ワークフローがトリガーされた後でも、メールがまだ送信されていない場合は編集可能
  - 変更は即座に反映される（ライブ更新）

#### 2.1.3 ワークフロー有効化/無効化
- **機能**: ワークフローのオン/オフ切り替え
- **UI要素**:
  - ワークフローエディター右上のステータストグルスイッチ
  - 青色 = 有効、グレー = 無効
- **ユーザーアクション**:
  - トグルスイッチをクリックして切り替え
  - 無効化により、大規模な変更作業中の誤作動を防止

#### 2.1.4 ワークフロー複製
- **機能**: 既存ワークフローのコピー作成
- **UI要素**:
  - ワークフローリストの各ワークフロー横にある歯車アイコン（⚙️）
  - 「Duplicate」ボタン
- **ユーザーアクション**:
  1. 歯車アイコンをクリック
  2. 「Duplicate」を選択
  3. すべてのトリガーとステップを含む完全なコピーが作成される
- **用途**:
  - 成功した戦略の反復
  - 基礎ワークフローのバリエーション作成

#### 2.1.5 ワークフロー管理
- **機能**: ワークフローの一覧表示とフィルタリング
- **UI要素**:
  - ワークフローリストビュー
  - ステータスフィルター: All、Live、Draft、Imported、Archived
  - アーカイブタブ
- **ユーザーアクション**:
  - ステータス別にワークフローを表示
  - アーカイブされたワークフローを確認
- **制限**:
  - 作成可能なワークフロー数に制限なし（現行プラン）

#### 2.1.6 ワークフロー共有
- **機能**: ワークフローを他のユーザーやワークスペースと共有
- **用途**:
  - コラボレーション
  - 成功した自動化戦略の活用
  - 複数のワークスペース間での展開

---

## 3. トリガー要件

### 3.1 トリガーの概念
トリガーは、ワークフローを開始する特定のイベントです。ユーザーの行動やワークスペース内のアクションに基づいて、自動化シーケンスがいつ開始されるかを定義します。

### 3.2 トリガーの設定要素

#### Event Type（イベントタイプ）
利用可能なイベント:
- **Opt-In**: オプトインフォーム送信
- **Order - Successful Purchase**: 購入成功
- **Applied Tag**: タグの適用
- **Page View**: ページ閲覧
- **Abandoned Cart**: カート放棄
- **Course Enrollment**: コース登録
- **Course Completion**: コース完了
- **Appointment Scheduled**: アポイントメント予約
- **Community Join**: コミュニティ参加

#### Event Location（イベント発生場所）
イベントタイプに応じた発生場所:
- ファネル名
- コース名
- タグ名
- ページ名
- 製品名

### 3.3 複数トリガー対応
- **機能**: 単一のワークフローに複数のトリガーを設定可能
- **用途例**:
  - 特定のフォームへのオプトイン、購入、カート放棄のいずれかで同じワークフローを開始
- **利点**: 柔軟性の向上、ワークフロー数の削減

### 3.4 ファネルステップへのワークフロー追加
- **機能**: ファネルの特定のステップにワークフローを紐付け
- **利点**:
  - 単一のワークフローを複数のファネルで活用
  - 重複ワークフロー作成の必要がない

---

## 4. ワークフローステップ要件

### 4.1 ステップの追加方法
- **UI要素**:
  - ワークフローエディター内のプラス（+）アイコン
  - トリガーステップの後、または既存ステップの間に配置
  - 右側パネルにステップオプションウィジェット表示
- **ステップカテゴリ**:
  - MessageHub Steps
  - Send Steps
  - Workflow Steps
  - Internal Steps
  - Other Steps

### 4.2 Send Email Step（メール送信ステップ）

#### 機能概要
コンタクトに自動的にメールを送信します。ウェルカムメール、感謝メール、プロモーションコンテンツなどに使用されます。

#### 設定項目
- **Subject Line（件名）**: メールの件名
- **Sender Email Address（送信者メールアドレス）**: 送信元アドレス
- **Body Content（本文）**: メール本文
- **Personalization Options（パーソナライゼーションオプション）**: コンタクト情報の動的挿入

#### 用途
- ニュースレター
- プロモーションオファー
- トランザクショナルメール
- ウェルカムシーケンス
- フォローアップメール

#### データモデル
```
SendEmailStep {
  id: string
  workflowId: string
  stepOrder: number
  subjectLine: string
  senderEmail: string
  senderName: string
  bodyContent: string (HTML/Text)
  personalizationTokens: array
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.3 Delay Step（遅延ステップ）

#### 機能概要
ワークフローの次のステップに進む前に、指定された時間コンタクトを待機させます。ドリップキャンペーンに有効です。

#### 遅延タイプ

##### Relative Delay（相対遅延）
- **設定単位**: 分、時間、日、週、月、年
- **機能**: 前のステップから相対的に遅延を設定
- **オプション**: Execution Window（実行ウィンドウ）
  - 特定の曜日を指定
  - 特定の時間帯を指定
  - タイムゾーン設定

##### Day of Week（曜日指定）
- **機能**: 特定の曜日まで待機
- **用途**: 週次キャンペーン

##### Day of Month（日付指定）
- **機能**: 特定の日付まで待機
- **用途**: 月次キャンペーン、請求サイクル

#### UI要素
- 遅延タイプ選択ドロップダウン
- 時間/日数入力フィールド
- 実行ウィンドウ設定パネル
- 曜日選択チェックボックス
- 時刻範囲ピッカー
- タイムゾーン選択

#### データモデル
```
DelayStep {
  id: string
  workflowId: string
  stepOrder: number
  delayType: enum ['relative', 'dayOfWeek', 'dayOfMonth']
  delayValue: number
  delayUnit: enum ['minutes', 'hours', 'days', 'weeks', 'months', 'years']
  executionWindow: {
    enabled: boolean
    daysOfWeek: array [0-6] // 0=Sunday
    startTime: string (HH:MM)
    endTime: string (HH:MM)
    timezone: string
  }
  specificDayOfWeek: number (0-6)
  specificDayOfMonth: number (1-31)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.4 Conditional Split Path Step（条件分岐ステップ）

#### 機能概要
コンタクトの特定の条件や属性に基づいて、ワークフロー内に動的なパスウェイを作成します。ユーザージャーニーのパーソナライゼーションに必須です。

#### 動作仕様
- **評価タイミング**: ワークフローがこのステップに到達した瞬間
- **分岐パス**:
  - **Yes Path（はいパス）**: 条件を満たす場合
  - **No Path（いいえパス）**: 条件を満たさない場合

#### 条件タイプ
- タグの有無
- カスタムフィールドの値
- 購入履歴
- コース進捗状況
- アポイントメントステータス
- コミュニティメンバーシップ

#### UI要素
- 条件設定パネル
- 条件タイプドロップダウン
- 比較演算子選択（等しい、含む、より大きい、より小さい等）
- 値入力フィールド
- Yes/Noパスの視覚的表示
- 各パスへのステップ追加ボタン

#### 用途例
- 購入者と非購入者の分岐
- タグベースのセグメンテーション
- エンゲージメントレベル別の対応
- 再エンゲージメントキャンペーン

#### データモデル
```
ConditionalSplitPathStep {
  id: string
  workflowId: string
  stepOrder: number
  conditions: array [
    {
      field: string
      operator: enum ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'exists', 'notExists']
      value: any
      logicalOperator: enum ['AND', 'OR'] // for multiple conditions
    }
  ]
  yesPathSteps: array [stepId]
  noPathSteps: array [stepId]
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.5 Tag Contact Step（コンタクトタグ付けステップ）

#### 機能概要
コンタクトに自動的にタグを追加または削除します。オーディエンスのセグメント化、コンタクトリスト管理、行動や属性に基づく特定アクションのトリガーに必須です。

#### 機能
- **タグの追加**: コンタクトに1つまたは複数のタグを適用
- **タグの削除**: コンタクトから1つまたは複数のタグを削除

#### UI要素
- アクションタイプ選択（追加/削除）
- タグ選択ドロップダウン（既存タグ）
- 新規タグ作成フィールド
- 複数タグ選択可能なインターフェース

#### 用途
- 他のワークフローのトリガーとして使用
- セグメント化とターゲティング
- 購入者/非購入者の識別
- エンゲージメントレベルの追跡
- カスタマージャーニーステージの管理

#### データモデル
```
TagContactStep {
  id: string
  workflowId: string
  stepOrder: number
  action: enum ['add', 'remove']
  tags: array [
    {
      tagId: string
      tagName: string
    }
  ]
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.6 Trigger Another Workflow Step（別ワークフロートリガーステップ）

#### 機能概要
別のワークフローに接続し、1つのワークフローから別のワークフローへのシームレスな自動化フローを実現します。ワークフローをチェーン接続することで、複雑な自動化を構築できます。

#### 動作仕様
- **強制トリガー**: コンタクトが通常のトリガー条件を満たしているかどうかに関わらず、選択されたワークフローを強制的にトリガー
- **即時実行**: 遅延なく次のワークフローを開始

#### UI要素
- ワークフロー選択ドロップダウン
- 利用可能なワークフローリスト
- プレビュー機能（選択されたワークフローの概要）

#### 用途
1. **シーケンシャルキャンペーン**:
   - ウェルカムシーケンス完了後にプロモーションシーケンスを自動開始

2. **複雑な自動化フロー**:
   - 単一のワークフローで扱えるステップ数を超える場合
   - プロセスを複数のワークフローに分割して接続

3. **モジュール化された自動化**:
   - 再利用可能なワークフローモジュールの作成
   - メンテナンス性の向上

#### データモデル
```
TriggerAnotherWorkflowStep {
  id: string
  workflowId: string
  stepOrder: number
  targetWorkflowId: string
  targetWorkflowName: string
  forceEnrollment: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.7 Webhook Step（ウェブフックステップ）

#### 機能概要
POSTリクエストを使用して、ClickFunnelsから外部アプリケーションにデータを渡します。リアルタイムでコンタクト詳細やその他の関連情報を別のシステムに転送する際に有用です。

#### 設定項目
- **Webhook URL**: データ送信先のエンドポイント
  - 既存のウェブフックURLをドロップダウンから選択
  - 新しいURLを直接入力
- **Request Method**: HTTP POST（デフォルト）
- **Payload Format**: JSON形式

#### ペイロード内容
- イベントタイプ
- コンタクトID
- 関連メタデータ
- カスタムフィールド
- トランザクション情報

#### UI要素
- URL入力フィールド
- 既存ウェブフックドロップダウン
- テストウェブフックボタン
- ペイロードプレビュー
- レスポンスログ

#### 用途
- CRMシステムとの連携
- カスタムアプリケーションへのデータ送信
- サードパーティツールのトリガー
- データ同期
- 外部API呼び出し

#### データモデル
```
WebhookStep {
  id: string
  workflowId: string
  stepOrder: number
  webhookUrl: string
  webhookName: string
  method: enum ['POST', 'GET', 'PUT', 'DELETE']
  headers: object {
    [key: string]: string
  }
  payloadTemplate: object
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    retryDelay: number (seconds)
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4.8 その他のワークフローステップ

#### Send Asset Step（アセット送信ステップ）
- **機能**: 事前にアップロードされたデジタルアセットをコンタクトに配信
- **アセット例**: eBook、ガイド、チェックリスト、ダウンロード可能なリソース
- **UI要素**: アセット選択ドロップダウン

#### Until Triggered Step（トリガーまで待機ステップ）
- **機能**: 特定のイベントがコンタクトによってトリガーされるまでワークフロー実行を一時停止
- **用途**: 特定のアクションや条件が満たされるまで待機
- **UI要素**: トリガーイベント選択、タイムアウト設定

#### Split Test Step（スプリットテストステップ）
- **機能**: ワークフロー内に2つのパスを作成し、各パスにパーセンテージ重みを割り当て
- **用途**: A/Bテスト、パフォーマンス比較
- **UI要素**: パーセンテージスライダー、各パスのステップ設定

#### Send MessageHub Message Step（MessageHub送信ステップ）
- **機能**: SMS、メール、またはWebプッシュ通知をコンタクトに送信
- **UI要素**: メッセージタイプ選択、メッセージ作成エディター

#### Enroll/Unenroll in Courses Step（コース登録/登録解除ステップ）
- **機能**: コース登録の自動管理
- **UI要素**: コース選択、登録/登録解除アクション選択

#### Grant/Revoke Community Access Step（コミュニティアクセス付与/取り消しステップ）
- **機能**: コミュニティ機能へのアクセス管理
- **UI要素**: コミュニティ選択、アクション選択

#### Notify Step（通知ステップ）
- **機能**: チームメンバーに通知を送信
- **UI要素**: 通知先チームメンバー選択、通知内容入力

#### Calendar Event Delay Step（カレンダーイベント遅延ステップ）
- **機能**: カレンダーイベントに基づいてアクションを遅延
- **UI要素**: カレンダー選択、イベントタイプ選択、遅延条件設定

#### Conditional Goal Step（条件付きゴールステップ）
- **機能**: 特定の条件が満たされた場合、残りのワークフローステップをスキップ
- **用途**: 購入完了後のフォローアップメール停止など
- **配置**: シーケンスの最後に配置することを推奨
- **UI要素**: ゴール条件設定、条件演算子選択

---

## 5. クイックアクション要件

### 5.1 クイックアクションの概念
クイックアクションは、ユーザーインタラクションに基づいて特定のアクションをトリガーする、シンプルな1ステップの自動化です。

### 5.2 クイックアクションの構成要素

#### Triggers（トリガー）
クイックアクションを開始する特定のイベントまたはアクション。「if-then」ステートメントの「if」部分に相当します。

#### Effects（エフェクト/実行アクション）
トリガーイベントが発生した際に実行される関連アクション。

### 5.3 利用可能なクイックアクショントリガー

#### Appointments（アポイントメント）
- アポイントメントがスケジュールされた時
- アポイントメントが変更された時
- アポイントメントがキャンセルされた時

#### Communities（コミュニティ）
- メンバーがコミュニティに参加した時
- メンバーが投稿とインタラクトした時

#### Courses（コース）
- ユーザーがコースに登録した時
- ユーザーがコースを完了した時
- ユーザーがモジュールを完了した時
- ユーザーがレッスンを完了した時

#### Pages（ページ）
- ページオプトインが発生した時
- ページが閲覧された時
- サイトページ、テーマページ、ランディングページ、ファネルページ

#### Products（製品）
- 購入が発生した時
- サブスクリプションが変更された時
- 支払いイベントが発生した時

#### Pipeline Stages（パイプラインステージ）
- リードがステージに入った時
- リードがステージから退出した時

### 5.4 利用可能なクイックアクションエフェクト

#### Send an Email（メール送信）
- コンタクトに直接メールを送信
- 即時配信

#### Trigger a Workflow（ワークフロートリガー）
- 事前定義されたワークフローを開始
- フルワークフローへのエントリーポイント

#### Add/Remove Contact Tag（コンタクトタグ追加/削除）
- セグメント化目的でコンタクトのプロフィールにタグを適用または削除

#### Add Note（ノート追加）
- 将来の参照用にコンタクトのレコードにノートを追加

#### Notify Team Member(s)（チームメンバーへの通知）
- トリガーされたアクションについて指定されたチームメンバーに通知を送信

#### Create Opportunity（オポチュニティ作成）
- パイプライン内に新しいオポチュニティを生成

### 5.5 クイックアクション管理

#### UI要素
- 各セクション（Pages、Courses、Products等）内のクイックアクション設定エリア
- 「Add Quick Action」ボタン
- トリガー選択ドロップダウン
- エフェクト選択ドロップダウン
- 設定パネル

#### ユーザーアクション
1. 対象のページ、コース、製品等の設定を開く
2. クイックアクションセクションに移動
3. 新規クイックアクション追加ボタンをクリック
4. トリガーを選択
5. エフェクトを選択
6. 必要な設定を入力
7. 保存

#### データモデル
```
QuickAction {
  id: string
  name: string
  triggerType: enum ['optin', 'pageView', 'purchase', 'courseEnrollment', 'appointmentScheduled', etc.]
  triggerLocation: string (pageId, courseId, productId, etc.)
  effectType: enum ['sendEmail', 'triggerWorkflow', 'addTag', 'removeTag', 'addNote', 'notify', 'createOpportunity']
  effectConfig: object {
    // Varies based on effectType
    emailTemplate?: string
    workflowId?: string
    tags?: array [string]
    note?: string
    notifyUsers?: array [userId]
    pipelineId?: string
    stageId?: string
  }
  enabled: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 6. ワークフロー実装例

### 6.1 ダブルオプトインシーケンス

#### 概要
メールマーケティングにおいて、サブスクライバーが本物で熱心であることを確保するための重要なプラクティス。ユーザーがサインアップ後にメールアドレスを確認することで、収集されたメールアドレスが有効であることを保証します。

#### 仕組み
1. ユーザーがサインアップ
2. 確認メールを自動送信（確認リンク付き）
3. ユーザーが確認リンクをクリック
4. サブスクリプション確定

#### ClickFunnelsでの実装手順

##### Step 1: ワークフロー作成
- Automationsアプリに移動
- 新規ワークフローを作成
- オプトインページをトリガーとして設定

##### Step 2: Conditional Split Pathの使用
- **条件**: 「contact-verified」タグの有無をチェック
- **Yesパス**: すでに確認済みのユーザー → 確認プロセスをスキップ
- **Noパス**: 未確認のユーザー → 確認メールを送信

##### Step 3: 確認プロセス
- Send Emailステップを追加
- メール内に確認ランディングページのURLをハイパーリンク
- ユーザーがリンクをクリック → 確認ページにリダイレクト
- 確認ページのクイックアクションで「contact-verified」タグを適用

##### Step 4: 2つ目のワークフロー作成
- ユーザーが確認ページを閲覧した際にタグを追加
- このワークフローは確認ページビューをトリガーとして設定

#### データフロー図
```
[User Signs Up]
    ↓
[Workflow 1 Triggered]
    ↓
[Check: Has "contact-verified" tag?]
    ├─ YES → [Skip verification] → [Continue to main content]
    └─ NO → [Send Confirmation Email]
              ↓
          [User Clicks Link]
              ↓
          [Lands on Confirmation Page]
              ↓
          [Quick Action: Add "contact-verified" tag]
              ↓
          [Workflow 2 Triggered by page view]
              ↓
          [Continue to main content]
```

#### 利点
- スパム苦情の減少
- 良好な送信者評判の構築
- 有効なメールアドレスのみを収集

#### 重要な注意点
- **セッション制限**: 初回オプトインと2回目のページビューは同じセッションから行う必要がある（別のシークレットウィンドウやブラウザは使用しない）
- **Android/Chrome/Gmailの問題**: Android端末のChromeとGmailでは、現在のプロセスが正常に機能しない場合がある（ページビューベースの制限）

#### データモデル要件
```
DoubleOptInWorkflow {
  workflowId: string
  name: string
  triggers: [
    {
      eventType: 'optin'
      eventLocation: 'optinPageId'
    }
  ]
  steps: [
    {
      stepType: 'conditionalSplitPath'
      condition: {
        field: 'tags'
        operator: 'contains'
        value: 'contact-verified'
      }
      yesPath: [...mainContentSteps]
      noPath: [
        {
          stepType: 'sendEmail'
          emailTemplate: 'confirmationEmailId'
          emailConfig: {
            confirmationLink: 'https://example.com/confirm-page'
          }
        }
      ]
    }
  ]
}

ConfirmationPageQuickAction {
  triggerType: 'pageView'
  triggerLocation: 'confirmationPageId'
  effectType: 'addTag'
  effectConfig: {
    tags: ['contact-verified']
  }
}
```

### 6.2 カート放棄シーケンス

#### 概要
カートに商品を入れたまま購入を完了しなかった顧客に対して、自動フォローアップメッセージを送信し、売上損失を回復する。

#### 目的
- カートに残した商品を思い出させる
- 購入完了へのインセンティブを提供
- 潜在的な障害や問題に対処

#### 実装手順

##### Step 1: ワークフロー作成
- Automationsアプリに移動
- 新規ワークフロー作成
- ドラッグ&ドロップインターフェースを使用

##### Step 2: トリガー設定
顧客が商品に興味を示すが購入を完了しない以下のアクション:
- チェックアウトページの閲覧
- 関連オファーへのオプトイン
- カート放棄イベント

##### Step 3: 自動化シーケンス構築

**1st Email: 即時リマインダー**
- Delayステップ: 1時間待機
- Send Emailステップ: リマインダーメール送信
- 内容: 購入完了を促す

**2nd Email: インセンティブオファー**
- Delayステップ: さらに24時間待機
- Send Emailステップ: 割引オファーメール送信
- 内容: 期間限定ディスカウントでアクションを促す

**3rd Email: カスタマーサポート**
- Delayステップ: さらに48時間待機
- Send Emailステップ: サポートオファーメール送信
- 内容: 一般的な懸念事項や製品に関する質問に対応

##### Step 4: Conditional Goalステップの追加
- **配置**: シーケンスの最後
- **条件**: 顧客が購入を完了したか確認
- **動作**: ゴール条件が満たされた場合、ゴール前の残りのステップを即座にスキップ
- **目的**: 購入を完了した顧客に不要なフォローアップメールが送信されないようにする

#### シーケンス戦略のタイムライン
```
[Cart Abandoned - Wednesday 4:00 PM]
    ↓
[Delay: 1 hour]
    ↓
[Email 1: Reminder - Wednesday 5:00 PM]
    ↓
[Check Goal: Purchase completed?]
    ├─ YES → [End Workflow]
    └─ NO → [Continue]
          ↓
      [Delay: 24 hours]
          ↓
      [Email 2: Discount Offer - Thursday 5:00 PM]
          ↓
      [Check Goal: Purchase completed?]
          ├─ YES → [End Workflow]
          └─ NO → [Continue]
                ↓
            [Delay: 48 hours]
                ↓
            [Email 3: Support Offer - Saturday 5:00 PM]
                ↓
            [Conditional Goal: Purchase completed?]
                ├─ YES → [End Workflow]
                └─ NO → [End Workflow]
```

#### 重要な要件
カート放棄メールが機能するためには、以下のいずれかが必要:
- **事前のメールキャプチャ**: オーダーページの前のステップ（オプトインページなど）で顧客のメールが取得されている
- **2ステップオーダーフォーム**: オーダーページに2ステップのオーダーフォームがあり、購入前に顧客のメールを取得する

#### 遅延の計算方法（Classic ClickFunnels）
- システムは常に、訪問者がファネルとインタラクトした時間から遅延を計算
- 例: 顧客が水曜日の午後4:00にオーダーフォームページを購入せずに離れた場合
  - 1st Email: 即時送信 → 水曜日、顧客がオーダーフォームページを購入せずに離れた直後にトリガー
  - 2nd Email: 1時間遅延 → 木曜日午後4:00に送信（最初のインタラクションから24時間後）

#### データモデル要件
```
AbandonedCartWorkflow {
  workflowId: string
  name: string
  triggers: [
    {
      eventType: 'abandonedCart'
      eventLocation: 'checkoutPageId'
    },
    {
      eventType: 'pageView'
      eventLocation: 'checkoutPageId'
    }
  ]
  steps: [
    {
      stepType: 'delay'
      delayType: 'relative'
      delayValue: 1
      delayUnit: 'hours'
    },
    {
      stepType: 'sendEmail'
      emailTemplate: 'reminderEmailId'
    },
    {
      stepType: 'conditionalGoal'
      condition: {
        field: 'purchaseCompleted'
        operator: 'equals'
        value: true
      }
    },
    {
      stepType: 'delay'
      delayType: 'relative'
      delayValue: 24
      delayUnit: 'hours'
    },
    {
      stepType: 'sendEmail'
      emailTemplate: 'discountOfferEmailId'
    },
    {
      stepType: 'conditionalGoal'
      condition: {
        field: 'purchaseCompleted'
        operator: 'equals'
        value: true
      }
    },
    {
      stepType: 'delay'
      delayType: 'relative'
      delayValue: 48
      delayUnit: 'hours'
    },
    {
      stepType: 'sendEmail'
      emailTemplate: 'supportOfferEmailId'
    },
    {
      stepType: 'conditionalGoal'
      condition: {
        field: 'purchaseCompleted'
        operator: 'equals'
        value: true
      }
    }
  ]
}
```

---

## 7. ワークスペース設定でのウェブフック管理

### 7.1 ウェブフック作成（グローバルレベル）

#### アクセス方法
1. 左側ナビゲーションの「Workspace Settings」を開く
2. 「Webhooks」メニューを選択
3. 「Add New Endpoint」ボタンをクリック

#### 設定項目

##### Event Types（イベントタイプ）
ウェブフックをトリガーするイベントを選択:
- `contact.created`: 新しいコンタクトが作成された時
- `order.completed`: 注文が完了した時
- `course.enrolled`: コースに登録された時
- `page.viewed`: ページが閲覧された時
- その他多数のイベント

##### Endpoint URL
- ウェブフックデータを送信するURL
- HTTPS推奨

##### Endpoint Scopes（エンドポイントスコープ）
- **機能**: 特定のファネルやページにウェブフックを制限
- **用途**: 特定の部分でのみウェブフックをトリガーしたい場合
- **設定**: ファネルID、ページIDの指定

##### Headers（カスタムヘッダー）
- 認証トークン
- API キー
- カスタムヘッダー

##### Payload Format
- JSON形式（デフォルト）
- イベントタイプ、コンタクトID、関連メタデータを含む

#### UI要素
- イベントタイプ複数選択チェックボックス
- エンドポイントURL入力フィールド
- スコープ設定パネル（ファネル/ページ選択）
- カスタムヘッダー追加フィールド
- テストウェブフック送信ボタン
- ウェブフックリストビュー
- 有効/無効トグル
- 編集/削除アクション

#### データモデル
```
GlobalWebhook {
  id: string
  workspaceId: string
  name: string
  endpointUrl: string
  eventTypes: array [string]
  scopes: {
    funnelIds: array [string]
    pageIds: array [string]
    productIds: array [string]
    courseIds: array [string]
  }
  headers: object {
    [key: string]: string
  }
  enabled: boolean
  createdAt: timestamp
  updatedAt: timestamp
  lastTriggeredAt: timestamp
  totalTriggers: number
}
```

---

## 8. 統合とエコシステム

### 8.1 ネイティブ統合
ClickFunnels Automationsは、以下を含む様々なサードパーティアプリとシームレスに統合:
- メールマーケティングプラットフォーム（ActiveCampaign、Mailchimp等）
- CRMシステム（HubSpot等）
- ウェビナーツール
- その他のマーケティングツール

### 8.2 統合方法
- **ネイティブ統合**: 事前構築されたコネクター
- **ウェブフック**: カスタム統合とAPI連携
- **Zapier連携**: 数千のアプリとの接続

### 8.3 データ連携要件
- **双方向同期**: コンタクト情報の同期
- **イベントトリガー**: 外部システムからのイベントでワークフローをトリガー
- **データマッピング**: カスタムフィールドのマッピング

---

## 9. データモデル全体像

### 9.1 Workflow（ワークフロー）
```typescript
interface Workflow {
  id: string
  workspaceId: string
  name: string
  description?: string
  status: 'draft' | 'live' | 'archived' | 'imported'
  triggers: array [Trigger]
  steps: array [WorkflowStep]
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: userId
  lastEditedBy: userId
  totalRuns: number
  activeRuns: number
  completedRuns: number
}
```

### 9.2 Trigger（トリガー）
```typescript
interface Trigger {
  id: string
  workflowId: string
  eventType: 'optin' | 'purchase' | 'pageView' | 'tagApplied' | 'courseEnrollment' | 'abandonedCart' | etc.
  eventLocation: string // funnelId, pageId, tagId, etc.
  conditions?: array [Condition]
  enabled: boolean
  createdAt: timestamp
}
```

### 9.3 WorkflowStep（ワークフローステップ）基底クラス
```typescript
interface WorkflowStepBase {
  id: string
  workflowId: string
  stepType: string
  stepOrder: number
  name: string
  description?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 9.4 WorkflowRun（ワークフロー実行）
```typescript
interface WorkflowRun {
  id: string
  workflowId: string
  contactId: string
  status: 'active' | 'completed' | 'paused' | 'stopped' | 'failed'
  currentStepId: string
  currentStepOrder: number
  startedAt: timestamp
  completedAt?: timestamp
  pausedAt?: timestamp
  stoppedAt?: timestamp
  failedAt?: timestamp
  failureReason?: string
  executionHistory: array [
    {
      stepId: string
      stepType: string
      executedAt: timestamp
      status: 'success' | 'failed' | 'skipped'
      data?: object
      error?: string
    }
  ]
}
```

### 9.5 Contact（コンタクト）関連フィールド
```typescript
interface Contact {
  id: string
  workspaceId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  tags: array [Tag]
  customFields: object
  activeWorkflowRuns: array [workflowRunId]
  completedWorkflowRuns: array [workflowRunId]
  createdAt: timestamp
  updatedAt: timestamp
  lastActivityAt: timestamp
}
```

### 9.6 Tag（タグ）
```typescript
interface Tag {
  id: string
  workspaceId: string
  name: string
  description?: string
  color?: string
  contactCount: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 10. UI/UX要件

### 10.1 ワークフローエディター

#### ビジュアルエディター
- **インターフェース**: ドラッグ&ドロップ
- **表示形式**: 垂直フロー（上から下）
- **要素**:
  - トリガーカード（上部、独特のアイコン）
  - ステップカード（順序付き）
  - プラス（+）ボタン（ステップ間）
  - コネクターライン
  - 分岐パス（Conditional Split Path用）

#### ステップカード
- **表示内容**:
  - ステップタイプアイコン
  - ステップ名
  - 簡易設定サマリー
  - 編集ボタン
  - 削除ボタン
  - ドラッグハンドル

#### 右側パネル
- **機能**: ステップ詳細設定
- **動的表示**: 選択されたステップに応じて内容変更
- **要素**:
  - 設定フォーム
  - 保存/キャンセルボタン（自動保存の場合は不要）
  - プレビュー（メールステップの場合）

#### トップバー
- **要素**:
  - ワークフロー名（編集可能）
  - ステータストグル（Live/Draft）
  - 「戻る」ボタン
  - 設定ボタン（歯車アイコン）
  - 複製ボタン
  - 削除ボタン

### 10.2 ワークフローリストビュー

#### リストカラム
- ワークフロー名
- ステータス（Live、Draft、Archived）
- 総実行回数
- アクティブな実行数
- 最終更新日
- 作成者
- アクションボタン（編集、複製、削除、歯車メニュー）

#### フィルター
- ステータスフィルター（All、Live、Draft、Imported、Archived）
- 検索バー（名前で検索）
- 日付範囲フィルター

#### アクション
- 「Create Workflow」ボタン
- 一括操作（複数選択して有効化/無効化/削除）

### 10.3 クイックアクション設定UI

#### 各セクション内（Page、Course、Product等）
- **セクション**: Quick Actions
- **表示**: 既存クイックアクションリスト
- **アクション**:
  - 「Add Quick Action」ボタン
  - 各クイックアクションの編集/削除

#### クイックアクション設定モーダル
- **ステップ1**: トリガー選択
  - ドロップダウンまたはカードビュー
- **ステップ2**: エフェクト選択
  - ドロップダウンまたはカードビュー
- **ステップ3**: 詳細設定
  - エフェクトタイプに応じた設定フォーム
- **ボタン**: 保存、キャンセル

---

## 11. パフォーマンスとスケーラビリティ要件

### 11.1 実行パフォーマンス
- **ワークフロートリガー応答時間**: 1秒以内
- **メール送信遅延**: 設定された遅延時間 ± 5分の精度
- **ウェブフック送信**: リアルタイム（1秒以内）
- **条件評価**: 100ミリ秒以内

### 11.2 スケーラビリティ
- **同時実行ワークフロー**: 制限なし（ワークスペースプランによる）
- **1ワークフローあたりの最大ステップ数**: 推奨50ステップ（技術的制限はないが、パフォーマンスとメンテナンス性のため）
- **1コンタクトあたりの同時アクティブワークフロー数**: 制限なし

### 11.3 データ保持
- **ワークフロー実行履歴**: 最低6ヶ月保持
- **メール送信ログ**: 12ヶ月保持
- **ウェブフックログ**: 30日間保持

---

## 12. セキュリティとプライバシー要件

### 12.1 データ保護
- **コンタクト情報の暗号化**: 送信時および保存時
- **ウェブフックセキュリティ**: HTTPS必須、署名検証オプション
- **アクセス制御**: ロールベースアクセス制御（RBAC）

### 12.2 GDPR/プライバシー対応
- **コンタクト削除**: ワークフローから即座に削除、実行停止
- **データエクスポート**: コンタクトのワークフロー履歴エクスポート可能
- **オプトアウト**: ワークフローからの自動オプトアウト機能

### 12.3 監査ログ
- ワークフロー作成/編集/削除の記録
- ステータス変更（有効化/無効化）の記録
- トリガー設定変更の記録
- 実行者と実行時刻の記録

---

## 13. エラーハンドリングと通知

### 13.1 ワークフロー実行エラー
- **エラータイプ**:
  - メール送信失敗
  - ウェブフックタイムアウト
  - 無効なステップ設定
  - 外部API連携エラー

### 13.2 リトライポリシー
- **メール送信**: 最大3回リトライ（5分、15分、60分後）
- **ウェブフック**: 最大3回リトライ（指数バックオフ: 1分、5分、15分）

### 13.3 通知
- **管理者通知**:
  - ワークフロー実行エラー（閾値: 10%以上の失敗率）
  - ウェブフックエンドポイントのダウン
  - メール配信問題
- **通知方法**:
  - アプリ内通知
  - メール通知
  - Slackインテグレーション（オプション）

---

## 14. テストとデバッグ機能

### 14.1 ワークフローテスト
- **テストモード**: 本番データに影響を与えずにワークフローをテスト
- **テストコンタクト**: 専用のテストコンタクトを使用
- **ステップバイステップ実行**: 各ステップを個別に実行して確認

### 14.2 デバッグツール
- **実行ログ**: 各ワークフロー実行の詳細ログ
- **ステップ実行履歴**: 各ステップの実行時間、ステータス、データ
- **エラーメッセージ**: 詳細なエラー情報と推奨される修正方法

### 14.3 プレビュー機能
- **メールプレビュー**: 送信前のメール内容確認
- **パーソナライゼーションプレビュー**: トークンが実際のデータでどう表示されるか確認
- **分岐パスプレビュー**: 条件に基づいてどのパスが選択されるか確認

---

## 15. 分析とレポート要件

### 15.1 ワークフロー分析
- **総実行回数**: ワークフローがトリガーされた総回数
- **アクティブな実行**: 現在実行中のワークフロー数
- **完了率**: 最後まで完了したワークフロー実行の割合
- **平均完了時間**: ワークフロー開始から完了までの平均時間

### 15.2 ステップ別分析
- **ステップ到達率**: 各ステップに到達したコンタクトの割合
- **ステップ完了時間**: 各ステップの平均実行時間
- **ドロップオフポイント**: コンタクトがワークフローを離脱したステップ

### 15.3 メールパフォーマンス
- **送信数**: 送信されたメール総数
- **開封率**: メールを開封したコンタクトの割合
- **クリック率**: メール内のリンクをクリックしたコンタクトの割合
- **バウンス率**: 配信失敗メールの割合
- **オプトアウト率**: メールからオプトアウトしたコンタクトの割合

### 15.4 コンバージョン追跡
- **ゴール達成率**: Conditional Goalステップのゴール達成率
- **収益アトリビューション**: ワークフローによって生成された収益
- **ROI計算**: ワークフローの投資対効果

### 15.5 レポートダッシュボード
- **リアルタイムダッシュボード**: 現在のワークフローパフォーマンス
- **日付範囲選択**: 特定期間のデータ表示
- **比較ビュー**: 複数のワークフローを比較
- **エクスポート機能**: CSV/PDFでレポートをエクスポート

---

## 16. モバイル対応要件

### 16.1 モバイルビュー
- **レスポンシブデザイン**: すべてのデバイスサイズに対応
- **タッチ最適化**: タッチジェスチャーに対応したインターフェース

### 16.2 モバイル制限事項
- **ワークフロー編集**: モバイルでは閲覧のみ、編集はデスクトップ推奨
- **複雑な設定**: タブレット以上のデバイス推奨

---

## 17. 料金プランと制限

### 17.1 Startup Plan（$97/月）
- **ワークフロー数**: 無制限
- **月間ワークフロー実行**: 制限なし
- **メール送信**: プランに含まれる送信数まで
- **基本サポート**: あり

### 17.2 Pro Plan（$297/月）
- **すべてのStartup機能**: 含む
- **高度な機能**: API アクセス、アフィリエイト管理
- **優先サポート**: あり
- **チームメンバー**: 最大3名

### 17.3 無料トライアル
- **期間**: 14日間
- **機能**: すべての機能を試用可能

---

## 18. サポートとドキュメント要件

### 18.1 ヘルプリソース
- **ナレッジベース**: 各機能の詳細ドキュメント
- **ビデオチュートリアル**: ステップバイステップのビデオガイド
- **テンプレートライブラリ**: 事前構築されたワークフローテンプレート

### 18.2 カスタマーサポート
- **サポートチャネル**:
  - メールサポート
  - ライブチャット（Pro Plan）
  - コミュニティフォーラム
- **応答時間**:
  - Startup: 24時間以内
  - Pro: 4時間以内（営業時間内）

---

## 19. 技術仕様

### 19.1 システムアーキテクチャ
- **フロントエンド**: React/Angular（推測）
- **バックエンド**: スケーラブルなクラウドインフラ
- **データベース**: リレーショナルデータベース + NoSQLキャッシュ
- **メッセージキュー**: 非同期ワークフロー実行用

### 19.2 API仕様
- **RESTful API**: ワークフロー管理、実行、モニタリング
- **Webhook API**: 受信ウェブフック処理
- **認証**: OAuth 2.0、API キー

### 19.3 統合ポイント
- **ファネル統合**: ファネルステップからのワークフロートリガー
- **コンタクト管理統合**: コンタクトデータベースとの同期
- **メールシステム統合**: メール配信インフラとの連携
- **決済統合**: 購入イベントのトリガー

---

## 20. 実装優先順位

### Phase 1: コア機能（MVP）
1. ワークフロー作成・編集・削除
2. 基本トリガー（Opt-In、Purchase、Page View）
3. 基本ステップ（Send Email、Delay、Tag Contact）
4. ワークフロー有効化/無効化
5. 基本的なワークフロー実行エンジン

### Phase 2: 高度な機能
1. Conditional Split Path
2. Trigger Another Workflow
3. Webhook Step
4. Until Triggered Step
5. Conditional Goal Step
6. ワークフロー複製
7. クイックアクション

### Phase 3: 分析とレポート
1. ワークフロー実行統計
2. メールパフォーマンストラッキング
3. ステップ別分析
4. ダッシュボード

### Phase 4: 高度な統合とスケーリング
1. Split Test Step
2. Calendar Event Delay
3. 外部システム統合
4. API拡張
5. モバイル最適化

---

## 21. 参考リソース

### 公式ドキュメント
- [ClickFunnels Workflows Overview](https://www.clickfunnels.com/features/workflows)
- [Getting Started with Workflows](https://support.myclickfunnels.com/docs/getting-started-with-workflows)
- [How to Create a Workflow](https://support.myclickfunnels.com/docs/how-to-create-a-workflow)
- [Exploring Workflow Steps](https://support.myclickfunnels.com/docs/exploring-workflow-steps)
- [Managing Workflows](https://support.myclickfunnels.com/docs/managing-workflows)

### ワークフローステップドキュメント
- [Send Email Step](https://support.myclickfunnels.com/docs/send-email-step-automate-your-email-campaigns)
- [Delay Step](https://support.myclickfunnels.com/docs/delay-step-introduce-time-gaps-between-workflow-actions)
- [Conditional Split Path Step](https://support.myclickfunnels.com/docs/conditional-split-path-step-create-conditional-pathways)
- [Tag Contact Step](https://support.myclickfunnels.com/docs/workflows-tag-contact-step-apply-or-remove-tags-to-contacts)
- [Trigger Another Workflow Step](https://support.myclickfunnels.com/docs/trigger-another-workflow-step-chain-multiple-workflows)
- [Webhook Step](https://support.myclickfunnels.com/docs/workflows-webhook-step-streamline-complex-data-transfers)

### クイックアクションとユースケース
- [Quick Actions Management](https://support.myclickfunnels.com/docs/automations-how-to-add-and-manage-quick-actions)
- [Double Opt-In Sequence](https://support.myclickfunnels.com/docs/creating-a-double-opt-in-sequence-in-clickfunnels)
- [Abandoned Cart Sequence](https://support.myclickfunnels.com/docs/creating-an-abandoned-cart-sequence-in-clickfunnels)

---

## 22. まとめ

このドキュメントは、ClickFunnelsのワークフロー・自動化機能の完全なクローンを構築するための包括的な要件定義です。以下の主要な側面をカバーしています:

1. **ワークフローとクイックアクションの2つの自動化タイプ**
2. **12種類以上のワークフローステップ**（Send Email、Delay、Conditional Split Path、Tag Contact、Trigger Another Workflow、Webhook等）
3. **複数のトリガータイプ**（Opt-In、Purchase、Page View、Tag Applied等）
4. **完全なワークフロー管理機能**（作成、編集、複製、有効化/無効化）
5. **実装例**（ダブルオプトイン、カート放棄シーケンス）
6. **詳細なデータモデル**
7. **UI/UX要件**
8. **パフォーマンス、セキュリティ、分析要件**

この要件定義を基に、段階的な実装計画（Phase 1-4）に従って開発を進めることで、ClickFunnelsと同等の強力なワークフロー・自動化システムを構築できます。
