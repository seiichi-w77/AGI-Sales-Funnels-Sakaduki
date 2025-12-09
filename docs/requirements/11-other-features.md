# その他の機能要件定義書

## 概要

本ドキュメントでは、ClickFunnelsの主要なセールスファネル機能を補完する重要な付加機能について詳述します。これらの機能は、マーケティングの効果を最大化し、顧客エンゲージメントを向上させ、ビジネスオペレーションを効率化するための包括的なツールセットを提供します。

## 1. カウントダウンタイマー機能

### 1.1 概要

カウントダウンタイマーは、訪問者に緊急性を作り出し、コンバージョン率を向上させるための強力なツールです。ClickFunnelsは複数のタイマータイプを提供し、さまざまなマーケティングシナリオに対応します。

### 1.2 タイマータイプ

#### 1.2.1 Date Countdown Timer（日付カウントダウンタイマー）
**特徴**：
- 特定の日付までカウントダウン
- 固定の期限設定
- ライブローンチに最適

**設定項目**：
- End Date（終了日）フィールド
- カレンダーインターフェースでの日付選択
- 時間指定（例：2025-01-25 20:56）

**使用例**：
- バレンタインデーセール
- ブラックフライデープロモーション
- 期間限定オファー

#### 1.2.2 Evergreen Timer（エバーグリーンタイマー）
**特徴**：
- 訪問者ごとに個別のカウントダウン
- クッキーベースのトラッキング
- 継続的なセールスファネルに最適

**設定項目**：
- カウントダウン時間数（Hours）
- リセット頻度の選択
- ポリシーオプション

**動作仕様**：
- 訪問者のページインタラクションに基づいて特定の時間までカウントダウン
- クッキーを使用して訪問者のセッションを追跡・記憶
- 同じブラウザで再訪問時、クッキーが残っている場合はカウントダウンが継続またはリセット

**ポリシーオプション**：

1. **Auto Reset Timer（自動リセットタイマー）**
   - 選択したリセット頻度に基づいて自動的にカウントダウンをリセット
   - オプション：
     - Daily（日次）
     - Weekly（週次）
     - Monthly（月次）
     - On Page Load（ページ読み込み時）

2. **Auto Expires X Days（X日後自動期限切れ）**
   - 指定した日数後にタイマーが自動的に期限切れ
   - 設定期間が経過すると、リピート訪問者にはカウントダウンが表示されない
   - 期間限定キャンペーンに有効

**ゼロ到達時のアクション**：
- 別のURLへリダイレクト
- 要素を開く（モーダル表示など）
- 要素を非表示（例：購入ボタンを隠す）

#### 1.2.3 Daily Evergreen Timer（日次エバーグリーンタイマー）
**特徴**：
- 毎日深夜までカウントダウン
- ゼロに達すると翌日に自動リセット
- 日次オファーに最適

**動作仕様**：
- 毎日自動的に開始
- タイムゾーン対応
- 繰り返しプロモーション向け

### 1.3 Countdown Funnelsアプリの機能

#### 個別化された緊急性
- 各訪問者に固有のカウントダウンを付与
- クッキーを使用してユーザーに紐付け
- 何度ページを離れても、再訪問、更新しても、その訪問者固有の終了日時に従ってカウントダウンが継続

#### メールシーケンスでの継続
- 自動化されたメールシーケンス内で訪問者固有のカウントダウンを継続可能
- メールマーケティングとの統合

### 1.4 カウントダウンイベントタイプ

#### 1. One-Time Countdowns（1回限りのカウントダウン）
**特徴**：
- 単一の特定の日時までカウントダウン
- ライブローンチに最適
- 全員に同じ締切

**使用例**：
- 製品ローンチ
- ライブウェビナー
- 期間限定セール

#### 2. Recurring Countdowns（繰り返しカウントダウン）
**特徴**：
- エバーグリーンの緊急性向け
- 各人が独自の購買ジャーニーを経験
- 個別化されたタイムライン

**使用例**：
- オンコースプロモーション
- 継続的なファネル
- 個別化されたオファー

#### 3. Hybrid Countdowns（ハイブリッドカウントダウン）
**特徴**：
- 1回限りのカウントダウンに似ている
- オファー終了後にタイマーが自動リセット
- 繰り返し行われる1回限りのイベントに最適

**使用例**：
- 週次ウェビナー
- 月次プロモーション
- 季節限定オファー

### 1.5 作成と埋め込み手順

#### タイマーの作成
1. 左側メニューからAppsを選択
2. Countdown Funnelsを選択
3. Countdown Funnelsメニュー下のCountdown Timersをクリック
4. 右上のCreate Countdown Timerボタンをクリック
5. タイマータイプと設定を構成
6. 保存

#### ページへの埋め込み
1. ページエディタで目的のページを開く
2. HTML/Custom JS要素をページに追加
3. 埋め込みコードをエディタに貼り付け
4. 埋め込みコード内の"?end=2025-01-25 20:56"を編集してカウントダウン日時を調整
5. ページを保存してプレビューでタイマーの表示を確認

### 1.6 カスタマイズオプション

#### デザインカスタマイズ
- カラースキーム設定
- フォント選択
- 表示フォーマット（日、時間、分、秒）
- サイズと配置

#### 動作設定
- タイマー終了時のアクション
- リダイレクトURL
- 表示/非表示要素の制御
- カスタムメッセージ表示

### 1.7 サードパーティ統合：Deadline Funnel

**機能**：
- ClickFunnelsと統合してランディングページにカウントダウンタイマーを追加
- ローンチ、フラッシュセール、エバーグリーンキャンペーンのコンバージョンを向上

**特徴**：
- シーケンス内の各購読者に自動的に独自のカスタム締切を割り当て
- ウェビナー、メールシーケンス、自動化されたローンチ、あらゆるタイプのキャンペーンに対応

## 2. 予約・アポイントメント機能

### 2.1 概要

ClickFunnels Appointmentsは、会議、コンサルテーション、トレーニングセッションなどのさまざまなタイプのイベントを簡単に管理およびスケジュールできる強力なアプリです。カレンダーを統合し、イベントタイプを設定し、会議接続を追加することで、スケジューリングを効率化します。

### 2.2 主要機能

#### 2.2.1 カレンダー統合
**サポートされるカレンダー**：
- Google Calendar
- Outlook Calendar
- iCloud Calendar
- Office 365 Calendar

**同期機能**：
- リアルタイムの空き状況確認
- 二重予約の防止
- 自動的なカレンダー更新
- 複数カレンダーの統合

#### 2.2.2 イベントタイプ

**無制限のイベントタイプ作成**：
ビジネスニーズに合わせたさまざまなイベントカテゴリを作成可能。

**主要なイベントタイプ**：

1. **One-on-One（1対1ミーティング）**
   - 個別コンサルテーション
   - コーチングセッション
   - 営業ミーティング

2. **Round-Robin Sessions（ラウンドロビンセッション）**
   - チームメンバー間で予約を自動分配
   - 負荷の均等化
   - 効率的なチーム管理

3. **Collective Events（集合イベント）**
   - 複数のチームメンバーが同時に必要なミーティング
   - パネルディスカッション
   - グループコンサルテーション

4. **Group Sessions（グループセッション）**
   - 複数の参加者向けのセッション
   - ウェビナー
   - グループトレーニング

**有料/無料セッション**：
- 有料パワーセッション
- 無料相談
- 組み込み決済機能でコンサルテーション料金を自動徴収

### 2.3 イベントタイプの作成と管理

#### 作成手順
1. Appointmentsアプリ内のEvent Typesサブメニューに移動
2. Add Event Typeをクリック
3. イベントタイプを選択（例：One-on-One、Group Session）
4. 必要な詳細を入力：
   - Event Name（イベント名）
   - Domain（ドメイン）
   - Location Type（場所タイプ）
   - Calendar（カレンダー）
   - Event Duration（イベント期間）
   - After-booking Confirmation（予約後の確認）
   - Event Notifications（イベント通知）
5. Create Event Typeをクリック

#### 設定項目詳細

**Duration Settings（期間設定）**：
- カスタム期間設定（15分、30分、1時間、カスタム）
- Buffer Times（バッファータイム）
  - 前後のバッファー時間設定
  - 移動時間や準備時間の確保

**Availability Rules（空き状況ルール）**：
- 特定の時間帯の設定
- 曜日別の設定
- 例外日の設定
- 祝日の除外

**Booking Limits（予約制限）**：
- 1日あたりの最大予約数
- 週あたりの最大予約数
- 月あたりの最大予約数
- 最小予告期間

**Custom Fields（カスタムフィールド）**：
- 既存のコンタクト属性
- イベントタイプ設定内で直接新規作成
- 必須/オプションフィールドの設定
- 特定の要件の収集

### 2.4 空き状況スケジュール（Availability Schedules）

#### デフォルトスケジュール
- 平日の午前9時〜午後5時
- 新しいEvent Typesに自動適用
- カスタマイズ可能

#### カスタムスケジュール作成
**機能**：
- 利用可能な特定の時間スロットを定義
- カレンダーと同期
- スケジュールの競合を排除
- 予約プロセスの効率化

**設定オプション**：
- 複数の時間帯設定
- 曜日別の異なるスケジュール
- 例外とオーバーライド
- タイムゾーン処理

### 2.5 予約フォームのカスタマイズ

#### 標準フィールド
- Name（氏名）
- Email Address（メールアドレス）
- Phone Number（電話番号）

#### カスタムフィールド
- 特定の要件を収集するためのフィールド
- 既存のコンタクト属性を使用
- イベントタイプ設定内で新規作成
- 条件付きロジック

### 2.6 会議ツール統合（Conferencing Integration）

**サポートされるツール**：
- Google Meet
- Zoom
- Microsoft Teams
- GoToMeeting

**機能**：
- 自動的な会議リンク生成
- カレンダー招待への直接統合
- 確認メールに会議リンクを含める
- シームレスな参加体験

### 2.7 通知とリマインダー

#### 自動メール通知
- 予約確認メール
- リマインダーメール（カスタマイズ可能なタイミング）
- キャンセル通知
- リスケジュール通知

#### クライアントコミュニケーション
- 変更を自動的にクライアントに通知
- スムーズな体験の確保
- 情報の透明性

### 2.8 公開オプション

#### 埋め込みオプション
**ダイレクト埋め込み**：
- ファネル、ウェブサイト、ランディングページに直接埋め込み
- クライアントがサイトから離れる必要なし
- シームレスな予約体験

**Calendar要素**：
- 動的な予約ウィジェットをファネルページに埋め込み
- Appointmentsアプリから事前作成されたEvent Typesとシームレスに統合
- ユーザーがファネルページ上で直接希望の時間スロットを予約
- 効率的な予約体験

#### スタンドアロン予約ページ
- 専用の予約URL
- ソーシャルメディアやメールで共有可能
- ブランド化されたページ

### 2.9 予定済みイベントの管理

#### 管理機能（Scheduled Eventsサブメニュー）
**表示**：
- すべての予定済みイベントの一覧
- カレンダービュー
- リストビュー
- フィルタリングとソート

**リスケジュール**：
- より便利な時間への変更
- 自動的な通知メール
- カレンダーの自動更新

**キャンセル**：
- 必要に応じてキャンセル
- クライアントへの自動通知
- キャンセルポリシーの適用

**編集**：
- イベント詳細の更新
- 参加者情報の変更
- メモの追加

### 2.10 ラウンドロビン機能

**自動分配**：
- 新しい予約をチーム全体で自動的に共有
- ワークロードのバランスを維持
- ローテーション対象者の選択
- Opportunitiesアプリが残りを処理

**メリット**：
- 公平な負荷分散
- チーム効率の最大化
- 顧客の待ち時間短縮

## 3. コミュニティ機能

### 3.1 概要

ClickFunnels Communityは、オーディエンスがコンテンツを共有し、有意義なディスカッションに参加できるインタラクティブなスペースを作成できる機能です。プライベートまたは有料のコミュニティを構築し、メンバーアクセスコントロール、モデレーションツールを提供します。

### 3.2 階層構造

#### コミュニティの組織化
```
Community（コミュニティ）
└── Groups（グループ）
    └── Topics（トピック）
        └── Posts（投稿）
            └── Comments（コメント）
```

#### 3.2.1 Groups（グループ）
**役割**：
- コミュニティ内のメインカテゴリー
- 広範なテーマや関心事に基づいてメンバーを組織化
- 共有目標や特定のセグメントに関連するトピックに基づいてディスカッションとコンテンツをセグメント化

**アクセスタイプ**：

1. **Open（オープン）**
   - コミュニティ内の誰でも参加可能
   - 公開ディスカッション
   - 自由な参加

2. **Private（プライベート）**
   - メンバーはグループを閲覧可能
   - 参加には特別な権限または購入が必要
   - 限定コンテンツ

3. **Secret（シークレット）**
   - グループは非表示
   - 手動で追加されたメンバーのみ表示
   - 最高レベルの排他性

#### 3.2.2 Topics（トピック）
**役割**：
- グループ内に存在
- より具体的なディスカッションに焦点
- メンバーが詳細な主題についてインタラクションする会話スレッド
- グループ内での集中的で整理された会話を維持

**機能**：
- トピック作成
- ディスカッションのスレッド化
- ピン留め投稿
- トピックのアーカイブ

### 3.3 メンバー管理

#### メンバーの追加
**方法**：
- 手動追加
- 自動付与（ワークフロー経由）
- 購入ベースのアクセス
- 招待リンク

#### アクセス管理
メンバー追加後の管理：
- アクセス権限の管理
- モデレーション権限の付与
- コミュニティからのBAN

**BANの実行**：
1. コンタクトのメンバーシップからBan From Communityをクリック
2. 理由を入力（オプション）
3. Banをクリック
4. CONFIRMと入力して確認
5. Proceedをクリック

**BANの効果**：
- すべてのアクセスを削除
- 再参加を防止（パブリックコミュニティでも）

#### メンバーの閲覧
- Communityアプリに移動
- Membersを選択
- メンバーリストの表示
- フィルタリングとソート機能

### 3.4 モデレーション機能

#### モデレーターの設定
**手順**：
1. Membersセクションで対象メンバーのプロフィールに移動
2. "Moderator"オプションを切り替え
3. Update Membershipをクリック

**モデレーター権限**：
- 投稿の管理
- ディスカッションの監視
- コンテンツの承認/拒否
- メンバーの警告

#### コンテンツモデレーション

**Unmoderated（未モデレート）**：
- コミュニティに表示される前に承認が必要な投稿やコメントをレビュー
- 品質管理
- スパム防止

**Declined Posts（拒否された投稿）**：
- 以前に拒否された投稿を再検討
- 編集、承認、または完全削除が可能

**投稿承認の要求**：
- "Require Post Approvals"を切り替えてコミュニティに表示される前に投稿をレビュー・承認
- グループまたはトピックレベルでこの設定をオーバーライド可能

### 3.5 自動化機能

#### ワークフロー統合
**Grant Community Access ステップ**：
- ワークフロー内でコンタクトにコミュニティアクセスを自動付与
- 各コンタクトの権限を手動で調整せずにアクセス管理を効率化

**Send Membership Email**：
- コンタクトがメンバーになったときに自動的にウェルカムメールを送信
- 切り替え可能

**Send Digest Email**：
- メンバーに未読アクティビティの日次サマリーを送信
- メンバーはユーザー設定でこれらのメールをオプトアウト可能
- 切り替え可能

### 3.6 エンゲージメント機能

#### コンテンツタイプ
- テキスト投稿
- 画像・動画の共有
- リンクの共有
- ファイルアップロード

#### インタラクション
- いいね/リアクション
- コメント
- 返信のスレッド化
- メンション機能

#### 通知システム
- 新規投稿通知
- コメント通知
- メンション通知
- ダイジェストメール

### 3.7 コミュニティ設定

#### 全体設定
- コミュニティ名とディスクリプション
- プライバシー設定
- デフォルトアクセスルール
- ブランディング（ロゴ、カラー）

#### グループ/トピックレベル設定
- 個別のモデレーションルール
- カスタム権限
- 通知設定

## 4. MessageHub機能

### 4.1 概要

MessageHubは、さまざまなプラットフォームからの顧客インタラクションを管理するためのClickFunnels CRMソリューションです。異なるチャネルからのメッセージを単一のインターフェースに統合することで、コミュニケーションワークフローを簡素化し、より効果的に応答できるようにします。

### 4.2 マルチチャネルコミュニケーション

#### サポートされるチャネル
**主要プラットフォーム**：
- Website Chat（ウェブサイトチャット）
- Email（メール）
- SMS（テキストメッセージ）
- Facebook Messenger
- WhatsApp
- Telegram

**カスタム統合**：
- カスタムAPI統合
- 専門的なニーズに対応
- ウェブフック経由の接続

**メリット**：
- すべての顧客会話を1つの統一プラットフォームで管理
- アプリ間の切り替えなし
- すべてのコミュニケーションの追跡が簡単

### 4.3 自動化機能

#### ワークフロー統合
**Send MessageHub Message ステップ**：
- Email、SMS、WebWidgetなどのMessageHubアプリで設定された任意のInboxを使用してコンタクトへのメッセージ送信を自動化
- 特定のトリガーまたはワークフロー内のアクションに基づくタイムリーなコミュニケーション

**Automations（自動化ルール）**：
- 特定のトリガーと条件に基づいてタスクを自動的に実行するルールを設定
- カスタマーサポートワークフローの効率化
- 会話の一貫した処理を確保

#### インテリジェント機能
**Response Templates（応答テンプレート）**：
- インテリジェントな応答テンプレートの作成
- よくある質問への迅速な回答
- ブランドの一貫性

**Routing Rules（ルーティングルール）**：
- 適切なチームメンバーに会話を自動的に振り分け
- スキルベースのルーティング
- 負荷分散

**Automated Follow-up Sequences（自動フォローアップシーケンス）**：
- 自動フォローアップシーケンスの確立
- 顧客エンゲージメントの向上
- 応答率の改善

**Webhook Integration（ウェブフック統合）**：
- 既存のビジネスツールとの接続
- 完全に自動化された顧客コミュニケーションエコシステムの構築

### 4.4 ブロードキャストとキャンペーン

#### ライブブロードキャスト
**機能**：
- Live ChatまたはSMS経由でメッセージキャンペーンを送信
- 即座の接続
- リアルタイムエンゲージメント

**使用例**：
- 緊急のお知らせ
- フラッシュセール
- 限定オファー

#### 自動化シーケンス
**機能**：
- 時間をかけてリードを育成する自動化シーケンスの設定
- ドリップキャンペーン
- オンボーディングシーケンス

**メリット**：
- 一貫したコミュニケーション
- リード育成の自動化
- コンバージョン率の向上

### 4.5 アナリティクスとレポーティング

#### パフォーマンストラッキング
**主要メトリクス**：
- Response Times（応答時間）
- Resolution Rates（解決率）
- Customer Satisfaction Scores（顧客満足度スコア）
- Team Productivity Metrics（チーム生産性メトリクス）

**アナリティクスダッシュボード**：
- 顧客コミュニケーションに関する深いインサイト
- 包括的なパフォーマンストラッキング
- すべてのメトリクスの可視化

#### ビジネスインサイト
**分析内容**：
- 何が機能しているか
- 改善できる点
- コミュニケーション戦略がビジネス成長にどのように影響しているか

### 4.6 価格設定に関する注意

**メール送信コスト**：
- ClickFunnelsはメール送信に対してトップアップコストを請求
- 1,000メール送信あたり$0.675
- 広告価格では明確にされていない

## 5. パイプライン（CRM）機能

### 5.1 概要

Opportunitiesアプリは、ClickFunnelsアカウント内でセールスリードを追跡・管理できるビルトインCRMです。パイプラインとステージを使用してコンタクトを整理する視覚的な方法を提供し、より効果的なフォローアップとより多くの取引成立を実現します。

### 5.2 パイプラインとステージ

#### パイプラインの概念
**定義**：
- オポチュニティを最初から最後まで追跡・管理するのに役立つ視覚的なツール
- ワークフローを異なるステージに分割
- 各オポチュニティがどの段階にあるかを一目で確認可能

**メリット**：
- ビジネスを整理された状態に保つ
- タスクが時間通りに完了することを確保
- 注意が必要なボトルネックを特定

#### ステージの構造
**デフォルトステージ例**：
- New leads（新規リード）
- Hot leads（ホットリード）
- Appointments requested（アポイント要求）
- First Contact（初回コンタクト）
- Ready to Close（クロージング準備完了）
- Closed Won（成約）
- Closed Lost（失注）

**カスタマイズオプション**：
- ステージの追加または削除
- 既存のステージの名前変更
- 各ステージにクロージング確率を設定（取引進捗の推定に役立つ）
- ドラッグ&ドロップでステージの順序を並べ替え

### 5.3 オポチュニティ管理

#### オポチュニティの作成
**方法**：
1. **手動作成**
   - ダッシュボードから直接追加
   - 詳細情報の入力

2. **自動化ワークフロー経由**
   - フォーム送信時に自動作成
   - 重要ページ訪問時に自動作成
   - 適切な人に自動割り当て

#### オポチュニティに保存される情報
- Contact Details（コンタクト詳細）
- Deal Value（取引価値）
- Close Date（クロージング予定日）
- Notes（メモ）
- Assignee（担当者）
- Stage（ステージ）
- Close Probability（クロージング確率）

#### オポチュニティの移動
- ステージ間でオポチュニティをドラッグ&ドロップ
- 進捗状況の視覚的な追跡
- 直感的な管理

### 5.4 複数パイプライン

#### ユースケース別パイプライン
**例**：
- コース販売用のパイプライン
- コーチングプログラム用の別パイプライン（異なるステージ）
- DFY（Done-For-You）サービス用の独自パイプライン

**メリット**：
- すべてが整理され追跡しやすい
- 1つのシンプルなダッシュボードから管理
- ビジネスラインごとの明確な分離

### 5.5 チーム割り当て機能

#### ラウンドロビン機能
**機能**：
- 新しいオポチュニティをチーム全体で自動的に共有
- ワークロードのバランスを維持
- ローテーション対象者の選択
- Opportunitiesアプリが残りを処理

**メリット**：
- 公平な負荷分散
- チーム効率の最大化
- 自動化された割り当て

#### 手動割り当て
- 特定のチームメンバーにオポチュニティを割り当て
- 専門知識に基づく割り当て
- 顧客関係の継続

### 5.6 クイックアクション

#### ステージベースの自動化
**機能**：
- パイプラインステージにQuick Actionsを追加
- 誰かがステージに入る、または離れるときにシンプルな自動化をトリガー

**アクション例**：
- コンタクトのタグ付け
- チームメイトへの割り当て
- フォローアップタスクの開始
- 通知の送信

### 5.7 ビューオプション

#### Kanban Board（カンバンボード）
**特徴**：
- パイプラインステージごとの列にオポチュニティを表示（例：New leads、Appointments confirmed、Closed）
- 進捗を視覚的に追跡するのに理想的
- ドラッグ&ドロップでステージ間を移動

**最適な用途**：
- 視覚的な進捗管理
- 迅速なステージ移動
- 全体像の把握

#### Table View（テーブルビュー）
**特徴**：
- Name、Value、Contact、Assignee、Close Dateなどの列を持つソート可能なリストにオポチュニティを表示
- レコードの比較や大きなデータセットの操作に有用

**最適な用途**：
- 詳細なデータ分析
- レコードの比較
- エクスポートとレポーティング

### 5.8 収益予測

#### クロージング確率
- 各ステージにクロージング確率を設定
- 取引進捗の推定
- 各ステージからの収益予測

#### オポチュニティ価値
- 各オポチュニティに価値を設定
- パイプライン全体の総価値を表示
- 予測収益の計算

### 5.9 他のClickFunnels機能との統合

#### 統合される機能
- Sales CRM
- Pipelines
- Appointments
- Calendars
- 2-way Messaging
- Chat
- SMS
- Email
- Social Features

#### プラン
- Opportunitiesアプリはすべてのプランで無料で含まれる

## 6. カスタマーセンター機能

### 6.1 概要

ClickFunnelsのCustomer Centerは、顧客に一元化されたハブを提供することで顧客をエンパワーするために設計された洗練されたセルフサービスポータルです。利用可能なコース、デジタルダウンロード、以前参加したコミュニティを1つの便利な場所から表示します。

### 6.2 主要機能

#### シングルダッシュボードアクセス
**顧客が利用できるもの**：
- 購入したすべてのものへの即座のアクセス
- 単一の直感的なダッシュボード
- 複数のログインや検索は不要
- コース、ダウンロード、サブスクリプションがすべて必要な場所に

#### 顧客ができること
**コンテンツアクセス**：
- 追加の利用可能なコースの表示と登録
- サブスクリプションに関連するデジタルアセットのダウンロード
- コミュニティでのインタラクション
- アカウント詳細の管理

**アカウント管理**：
- "My Account"セクションに移動してアカウント詳細を更新
- 請求情報の更新
- 住所の変更
- 支払い方法の管理

### 6.3 サブスクリプション管理

#### サブスクリプション詳細の表示
**表示される情報**：
- Product Name（商品名）
- Plan Type（プランタイプ）
- Order Status（注文ステータス）
- Billing Status（請求ステータス）
- 次回請求日
- サブスクリプション履歴

#### 管理オプション
**ユーザーができること**：
- Renew（更新）：サブスクリプションの継続
- Upgrade（アップグレード）：上位プランへの切り替えで追加機能にアクセス
- Downgrade（ダウングレード）：下位プランへの変更でコスト削減
- Cancel（キャンセル）：アカウントプランのキャンセルポリシーに基づいてサブスクリプションを終了

#### ClickFunnelsサブスクリプションの管理手順
1. ClickFunnelsダッシュボードからWorkspace Settingsに移動
2. Billingメニューをクリック
3. 新しいタブが開き、Customer Centerに誘導される
4. Subscriptionsタブに移動
5. 管理したいサブスクリプションの商品名"ClickFunnels"を見つける
6. 商品の横にあるThree-Dot（省略記号）アイコンをクリックしてサブスクリプションにアクセス・管理

### 6.4 ログインオプション

#### 認証方法
**メールログイン**：
- メールアドレスを入力
- システムが認証メールを送信
- Magic LinkとAuthentication Token（6桁）の両方を含む

**メリット**：
- 堅牢なセキュリティ
- パスワード不要の一時的アクセス
- ログイン強化機能

#### その他のログイン方法
- パスワードベースのログイン
- ソーシャルログイン（統合されている場合）
- SSO（エンタープライズプラン）

### 6.5 カスタマーセンターへのアクセス

#### 管理者側のアクセス
1. ClickFunnelsアカウントにログイン
2. 左側メニューからSiteアプリをクリック
3. Customer Centerを選択してCustomer Center設定を開く

### 6.6 カスタマイゼーション

#### ブランディング
**カスタマイズ可能な要素**：
- Colors（カラー）
- Logos（ロゴ）
- Layouts（レイアウト）
- Navigation（ナビゲーション）

**メリット**：
- ブランドアイデンティティに合わせた顧客体験の作成
- すべての側面のカスタマイズ
- 購入から配信までの一貫したブランド化されたジャーニー

#### コンテンツ表示のカスタマイズ
- 表示されるコース/商品の選択
- セクションの順序
- ウェルカムメッセージ
- ヘルプリソース

### 6.7 デジタルアセット配信

#### サポートされるコンテンツタイプ
- オンラインコース
- デジタルダウンロード（PDF、ビデオ、オーディオ）
- コミュニティアクセス
- メンバーシップコンテンツ

#### 配信管理
- アクセス制御
- ドリップコンテンツ
- 期限付きアクセス
- 進捗トラッキング

## 7. API機能

### 7.1 概要

ClickFunnelsは現在、V2 REST API、ウェブフック、およびZapierなどの統合を提供しています。開発者がClickFunnelsをカスタムアプリケーション、サービス、およびワークフローと統合できるようにします。

### 7.2 APIバージョン

#### ClickFunnels Classic API (v1)
**機能**：
- ファネル、コンタクト、注文、メール統合への基本的なアクセス
- REST経由で提供
- レガシーサポート

**ステータス**：
- 引き続き利用可能
- 新規開発にはv2推奨

#### ClickFunnels 2.0 API (v2)
**機能**：
- ファネル、コンタクト、eコマース用の新しいエンドポイント
- ウェブフック機能
- チーム/ワークスペースサポート
- 強化されたバージョン

**ステータス**：
- 最新バージョン
- 推奨される使用

### 7.3 認証

#### 認証方法

**Token-based Authentication（トークンベース認証）**：
- プライベート統合を対象
- シングルアカウントサービスアプリに使用
- APIトークンで認証

**OAuth 2.0 Authentication**：
- パブリック/マルチユーザーアプリ用
- より安全な認証フロー
- ユーザーごとのアクセストークン

#### 認証設定手順（ClickFunnels 2.0）

1. Workspace → Team Settings → Developer Portalに移動
2. プラットフォームアプリを作成
3. Client ID、Secret、APIトークンをメモ

#### リクエストの認証
- `Authorization: Bearer {token}`ヘッダーを設定
- すべてのAPIリクエストに含める

### 7.4 APIエンドポイント

#### ベースURL構造
```
https://{{domain}}/api/{{adapter}}
```

#### 主要エンドポイント例
**Funnels**：
- `GET /api/v2/funnels` - ファネル一覧取得
- `GET /api/v2/funnels/{id}` - 特定ファネル取得
- `POST /api/v2/funnels` - ファネル作成
- `PUT /api/v2/funnels/{id}` - ファネル更新
- `DELETE /api/v2/funnels/{id}` - ファネル削除

**Contacts**：
- `GET /api/v2/contacts` - コンタクト一覧取得
- `POST /api/v2/contacts` - コンタクト作成
- `PUT /api/v2/contacts/{id}` - コンタクト更新

**Orders**：
- `GET /api/v2/orders` - 注文一覧取得
- `GET /api/v2/orders/{id}` - 特定注文取得

#### ペジネーションサポート
- リスト系エンドポイントでページネーション対応
- `page`と`per_page`パラメータ
- 大量データの効率的な取得

### 7.5 ウェブフック

#### ウェブフックの設定

**UI経由での設定**：
1. 左側ナビゲーションのWorkspace Settingsに移動
2. Webhooksを選択
3. Add New Endpointボタンをクリック
4. ウェブフックの名前を入力
5. データを送信したいアプリケーションまたはAPIのエンドポイントURLを入力
6. サブスクライブするイベントタイプを選択

**API経由での設定**：
- `Webhooks::Outgoing::Endpoints`エンドポイントを使用
- リッスンしたい`event_type_ids`で設定

#### イベントタイプ

**構造**：
- `subject.action`形式
- 例：`contact.identified`、`order.created`

**主要イベント**：
- `contact.identified` - コンタクトが特定された
- `contact.created` - 新規コンタクト作成
- `contact.updated` - コンタクト更新
- `order.created` - 注文作成
- `order.completed` - 注文完了
- `one-time-order.identified` - 1回限りの注文が特定された
- `subscription.created` - サブスクリプション作成
- `subscription.cancelled` - サブスクリプションキャンセル

**データペイロード**：
- イベントタイプに応じたデータ
- ドキュメントのレスポンススキーマ/例から取得可能

#### ウェブフックバージョン

**V1ウェブフック**：
- 異なるデータペイロード
- 非推奨
- レガシーサポートのみ

**V2ウェブフック（推奨）**：
- 可能な限りV2ウェブフックを使用
- 最新の機能とデータ構造
- より良いドキュメント

### 7.6 署名検証

#### セキュリティ機能
**目的**：
- ウェブフックリクエストの正当性を検証
- 改ざん防止
- セキュアな統合

**設定**：
1. UI経由またはAPI経由でエンドポイントを設定
2. エンドポイント作成時にSecretを取得
3. Secretを使用してリクエストの署名を検証

**有効期限**：
- デフォルトの有効期限は600秒
- この時間を過ぎると検証は失敗

### 7.7 プラン要件

#### APIアクセス
**利用可能なプラン**：
- Scale
- Optimize
- Dominate

**制限**：
- 下位プランではAPI利用不可
- プランアップグレードが必要

### 7.8 レート制限

**実装の推奨**：
- API呼び出しのレート制限
- 適切なリトライロジック
- バックオフ戦略

**ベストプラクティス**：
- 不必要な呼び出しを避ける
- バッチ処理の活用
- キャッシュの実装

### 7.9 公式ドキュメントリソース

#### 主要リソース
- **Developer Portal**: https://developers.myclickfunnels.com/docs/intro
- **Webhooks Guide**: https://developers.myclickfunnels.com/docs/webhooks
- **Signature Verification**: https://developers.myclickfunnels.com/docs/signature-verification
- **Classic API Docs**: https://apidocs.clickfunnels.com/

#### サポート
- 開発者向けドキュメント
- APIリファレンス
- コードサンプル
- 統合ガイド

## 実装優先度

### フェーズ1（MVP）
1. **カウントダウンタイマー**
   - Date Countdown Timer
   - 基本的な埋め込み機能
   - シンプルなカスタマイズ

2. **カスタマーセンター**
   - 基本的なポータル機能
   - コース/商品表示
   - サブスクリプション管理

3. **API基盤**
   - 基本的なREST API
   - トークン認証
   - 主要エンドポイント（ファネル、コンタクト、注文）

### フェーズ2（機能拡張）
1. **予約・アポイントメント**
   - カレンダー統合
   - イベントタイプ管理
   - 予約フォーム

2. **パイプライン（CRM）**
   - 基本的なパイプライン機能
   - ステージ管理
   - オポチュニティ追跡

3. **ウェブフック**
   - アウトバウンドウェブフック
   - 主要イベントタイプ
   - 署名検証

### フェーズ3（高度な機能）
1. **コミュニティ**
   - グループとトピック
   - メンバー管理
   - モデレーション機能

2. **MessageHub**
   - マルチチャネル統合
   - 自動化機能
   - アナリティクス

3. **カウントダウンタイマー高度な機能**
   - Evergreen Timer
   - Countdown Funnels統合
   - メールシーケンス連携

4. **予約・アポイントメント高度な機能**
   - ラウンドロビン
   - 会議ツール統合
   - 高度な自動化

## 参考資料

本要件定義書は、以下の公式ドキュメントおよび情報源を基に作成されました：

### カウントダウンタイマー
- [Countdown Timers - ClickFunnels 2025](https://www.clickfunnels.com/blog/countdown-timers/)
- [How to Create and Embed a Countdown Timer](https://support.myclickfunnels.com/docs/how-to-create-and-embed-a-countdown-timer)
- [How to Create and Manage Countdown Events](https://support.myclickfunnels.com/docs/how-to-create-and-manage-countdown-events)
- [Countdown Funnels for Urgency and Sales](https://www.clickfunnels.com/apps/countdown-funnels)

### 予約・アポイントメント
- [Appointments - Getting Started with ClickFunnels Appointments](https://support.myclickfunnels.com/docs/appointments-getting-started-with-clickfunnels-appointments)
- [Appointments - How to Create and Manage Event Types](https://support.myclickfunnels.com/docs/appointments-how-to-create-and-manage-event-types)
- [Appointments App | ClickFunnels](https://www.clickfunnels.com/apps/appointments)
- [Appointments - Define Your Availability with Availability Schedules](https://support.myclickfunnels.com/docs/appointments-define-your-availability-with-availability-schedules)

### コミュニティ
- [Getting Started with Community](https://support.myclickfunnels.com/docs/getting-started-with-community)
- [Creating and Managing Community Groups and Topics](https://support.myclickfunnels.com/docs/creating-and-managing-community-groups-and-topics)
- [Community For Funnel Builders](https://www.clickfunnels.com/apps/community)
- [How to Grant and Manage Community Access](https://support.myclickfunnels.com/docs/how-to-grant-access-to-your-community)

### MessageHub
- [MessageHub App | ClickFunnels](https://www.clickfunnels.com/apps/message-hub)
- [Getting Started with MessageHub](https://support.myclickfunnels.com/docs/getting-started-with-messagehub-1)
- [Workflows "Send MessageHub Message" Step](https://support.myclickfunnels.com/docs/workflows-send-messagehub-message-step-send-automated-message-in-messagehub)

### パイプライン（CRM）
- [How to Create and Manage Pipelines](https://support.myclickfunnels.com/docs/how-to-create-and-manage-pipelines)
- [One Page CRM for Funnels System](https://www.clickfunnels.com/features/crm)
- [Getting Started with Opportunities](https://support.myclickfunnels.com/docs/getting-started-with-opprtunities)
- [Opportunities App | ClickFunnels](https://www.clickfunnels.com/apps/opportunities)

### カスタマーセンター
- [Customer Center Explained - Setup and Management](https://support.myclickfunnels.com/docs/customer-center-explained-setup-and-management)
- [Customer Center & Sales Funnel Management Tools](https://www.clickfunnels.com/features/customer-center)
- [Customer Center - Understanding User View](https://support.myclickfunnels.com/docs/customer-center-understanding-user-view)
- [Managing Your ClickFunnels Subscription Plan](https://support.myclickfunnels.com/docs/managing-your-clickfunnels-subscription-plan-2)

### API
- [Accessing the ClickFunnels API](https://support.myclickfunnels.com/docs/accessing-the-clickfunnels-api)
- [ClickFunnels API Documentation](https://developers.myclickfunnels.com/docs/intro)
- [How to Create & Manage Webhooks in ClickFunnels](https://support.myclickfunnels.com/docs/creating-webhooks-in-clickfunnels)
- [Signature Verification](https://developers.myclickfunnels.com/docs/signature-verification)
- [ClickFunnels CLASSIC (1.0) Public API v1](https://apidocs.clickfunnels.com/)
- [API & Webhooks Integration](https://www.clickfunnels.com/features/api-and-webhooks)
