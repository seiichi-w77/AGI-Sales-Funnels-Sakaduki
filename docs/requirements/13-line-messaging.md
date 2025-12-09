# 13. LINE メッセージング機能要件

## 目次
1. [概要](#概要)
2. [メッセージタイプ一覧](#メッセージタイプ一覧)
3. [配信機能要件](#配信機能要件)
4. [テンプレート機能](#テンプレート機能)
5. [エラー処理・再送](#エラー処理再送)
6. [アクション機能](#アクション機能)
7. [API要件](#api要件)
8. [データモデル](#データモデル)

---

## 概要

UTAGEシステムにおけるLINEメッセージング機能は、LINE公式アカウントを通じてシナリオ登録者に対して多様な形式のメッセージを配信するための包括的なシステムです。

### 主要機能
- 7種類のメッセージタイプ（テキスト/ボタン/画像/カルーセル/音声/動画/スタンプ）
- 3種類の配信方式（一斉送信/ステップ配信/リマインダ配信）
- テンプレート管理による再利用性
- アクション自動化による顧客管理
- エラー検出・再送機能
- 配信分析・トラッキング

### ビジネス要件
- シナリオ登録者への効果的なフォローアップ
- イベント・セミナーのリマインダー通知
- 顧客セグメントに応じた条件付き配信
- 配信効果測定（開封率・クリック率）

---

## メッセージタイプ一覧

### 1. テキストメッセージ

**概要**
プレーンテキストによる基本的なメッセージ配信。置換文字による動的コンテンツ生成と条件分岐に対応。

**機能要件**
- プレーンテキスト入力（改行対応）
- 置換文字（変数）のサポート
  - `%line_name%` - LINE登録名
  - `%name%` - ユーザー名
  - `%line_id%` - LINE友達ID
  - `%master_id%` - シナリオ全体の読者ID
- 条件分岐機能
  - ラベルによる分岐
  - 登録経路による分岐
  - ユーザー属性による分岐

**UI要素**
- テキストエリア（マルチライン対応）
- 置換文字挿入ボタン
- 条件分岐設定パネル
- プレビュー機能

---

### 2. 画像メッセージ

**概要**
画像ファイルを配信し、画像内の特定エリアにアクションを設定可能。

**機能要件**
- 画像ファイルアップロード（対応形式：JPG、PNG）
- 画像分割マッピング（A～Fの6エリア）
- エリアごとのアクション設定
  - URLを開く
  - ユーザーからのメッセージ送信
  - アクションなし
- カスタム通知テキスト設定

**UI要素**
- ドラッグ&ドロップアップロード
- 画像エリアマッピングツール（ビジュアルエディタ）
- エリアごとのアクション設定パネル
- 通知テキスト入力欄

**技術仕様**
- 最大ファイルサイズ：未指定（LINE API制限に準拠）
- 推奨画像サイズ：1040×1040ピクセル
- クリッカブルエリア数：最大6エリア

---

### 3. ボタンメッセージ

**概要**
タイトル、本文、画像（オプション）、複数のクリック可能なボタンで構成されるインタラクティブなメッセージ。

**機能要件**
- タイトル設定
- 本文テキスト（複数行対応）
- 画像添付（オプション）
- 複数ボタン設定（最大4個推奨）
- ボタンアクション
  - URL遷移
  - メッセージ送信
  - テンプレート配信
  - ラベル更新
  - データ更新
- タップ制限設定
  - 合計1回のみ
  - ボタンごとに1回のみ
  - 無制限
- 制限超過時の応答設定

**UI要素**
- タイトル入力欄
- 本文テキストエリア
- 画像アップロードエリア
- ボタン追加・編集パネル
  - ボタンテキスト入力
  - アクションタイプ選択ドロップダウン
  - アクション設定詳細パネル
- タップ制限設定ラジオボタン
- 制限超過時メッセージ設定

---

### 4. カルーセルメッセージ

**概要**
横スクロール可能な複数パネル（2～5枚以上）で構成される閲覧型メッセージ。

**機能要件**
- 最小パネル数：2～5枚
- 最大パネル数：10枚（LINE API制限）
- パネルごとの設定
  - タイトル（全パネル統一フォーマット必須）
  - 説明文
  - 画像
  - アクションボタン（最大3個）
- タイトルフォーマット一貫性チェック（配信エラー防止）

**UI要素**
- パネル追加・削除ボタン
- パネル順序変更（ドラッグ&ドロップ）
- パネルごとの編集パネル
  - タイトル入力
  - 説明文入力
  - 画像アップロード
  - ボタン設定
- タイトルフォーマット検証アラート
- カルーセルプレビュー

**技術仕様**
- パネル間のタイトルフォーマットが不一致の場合は配信エラー
- 各パネルのボタンは同一数である必要がある

---

### 5. 音声メッセージ

**概要**
音声ファイルを直接ユーザーに配信する機能。

**機能要件**
- 音声ファイルアップロード
- 対応形式：M4A、MP3
- 最大ファイルサイズ：200MB（LINE API制限）
- 再生時間表示

**UI要素**
- ファイルアップロードボタン
- 音声プレビュープレーヤー
- ファイル情報表示（形式、サイズ、再生時間）

---

### 6. 動画メッセージ

**概要**
動画ファイルの配信とカスタムサムネイル画像の設定をサポート。

**機能要件**
- 動画ファイルアップロード
- 対応形式：MP4
- 最大ファイルサイズ：200MB
- サムネイル画像設定（オプション）
- 自動サムネイル生成

**UI要素**
- 動画ファイルアップロードエリア
- サムネイル画像アップロードエリア
- 動画プレビュープレーヤー
- ファイル情報表示（形式、サイズ、長さ）

---

### 7. スタンプメッセージ

**概要**
LINEスタンプの配信機能。

**機能要件**
- 事前選択されたスタンプオプションから選択
- スタンプパッケージID・スタンプIDの指定
- スタンププレビュー表示

**UI要件**
- スタンプ選択UI（カタログ形式）
- 選択済みスタンプのプレビュー
- パッケージID・スタンプID入力欄（上級者向け）

---

### 共通機能：通知テキスト

画像、ボタン、カルーセル形式では、メッセージ到着時に通知バーに表示されるカスタムテキストを設定可能。

**機能要件**
- 通知テキストのカスタマイズ（最大100文字推奨）
- 未設定時のデフォルト動作定義

**UI要素**
- 通知テキスト入力欄
- 文字数カウンター

---

## 配信機能要件

### 1. 一斉送信（ブロードキャスト）

**概要**
シナリオ登録者全員または条件指定したセグメントに対して即時または予約配信を行う機能。

#### ワークフロー

1. **配信対象選択**
   - ナビゲーション：メール/LINE配信 > アカウント > シナリオ管理
   - 対象シナリオ選択
   - 「LINE一斉送信」をクリック

2. **配信条件設定（オプション）**
   - 条件なし：全登録者に配信
   - 条件あり：
     - フォームフィールド値による絞り込み
     - ラベルによる絞り込み
     - 配信日時による絞り込み
   - AND/OR論理演算子による複数条件組み合わせ

3. **メッセージ編集**
   - メッセージタイプ選択（7種類から）
   - メッセージ内容編集
   - 複数メッセージの追加
   - メッセージ順序変更（↑/↓矢印）
   - メッセージコピー機能

4. **送信設定**
   - 配信タイミング
     - 即時送信
     - 予約送信（日時指定）
   - 送信後アクション設定
   - リンククリック時アクション設定
   - URLドメイン設定（デフォルト/カスタム）
   - カスタム送信者選択
   - テスト送信機能

5. **配信実行と履歴**
   - 配信前：「保留中」タブに表示
   - 配信後：「送信済み > 一斉送信」に履歴保存
   - 配信分析（開封率・クリック率）の確認

#### 重要仕様（2025年7月更新）

**重複配信の防止**
- 以前：シナリオ内で重複するLINE友達には複数回配信
- 現在：各LINE友達は1通のみ受信
- 注意：「保留中」ビューでは配信前に重複表示される場合がある

#### 機能要件

- 条件フィルタリングエンジン
  - 複数条件のAND/OR組み合わせ
  - フォームデータ参照
  - ラベル参照
  - 日時範囲指定
- 重複排除ロジック（LINE友達IDベース）
- 予約配信スケジューラー
- テスト送信機能（特定ユーザーへの事前配信）
- 配信履歴管理
- 分析データ収集（開封・クリック）

#### UI要件

- シナリオ選択ドロップダウン
- 配信条件ビルダー
  - 条件追加ボタン
  - フィールド選択
  - 演算子選択（等しい、含む、以上、以下など）
  - 値入力
  - AND/ORトグル
- メッセージエディタ（タイプ別）
- 送信設定パネル
  - 日時ピッカー
  - アクション設定セクション
  - URLドメイン設定
  - 送信者選択
- テスト送信ボタン
- 配信実行ボタン
- 保留中/送信済み履歴テーブル
- 分析ダッシュボード

---

### 2. ステップ配信

**概要**
シナリオ登録を起点として、指定したタイミングで自動的にメッセージを配信する機能。フォローアップメールシーケンスのLINE版。

#### ユースケース

- **必要な場合**：シナリオ登録後の定期的なフォローアップ通信
  - 購入後のサポート
  - オンボーディングシーケンス
  - 教育コンテンツの段階的配信
- **不要な場合**：登録後の定期メッセージが不要な場合

#### ワークフロー

1. **ステップ配信設定画面へ移動**
   - メール/LINE配信 > アカウント > シナリオ管理
   - 対象シナリオ選択
   - 左メニューから「ステップ配信」を開く

2. **LINEメッセージ追加**
   - 「LINEメッセージ追加」ボタンをクリック

3. **配信条件とメッセージ設定**
   - 一斉送信の設定手順3～5と同様
   - 配信タイミング設定（下記参照）

4. **ステップリスト表示**
   - 設定したメッセージがステップ配信リストに表示
   - メッセージの並び替え（∧∨マーカー使用）

5. **配信履歴**
   - 送信済み > ステップ に履歴保存

#### 配信タイミングオプション

1. **即時配信**
   - シナリオ登録直後に送信

2. **固定時刻スケジュール**
   - 登録からX日後の指定時刻に送信
   - 例：登録から3日後の18:00

3. **相対時間スケジュール**
   - 登録時刻からの経過時間で計算
   - 例：登録から48時間後

#### 当日配信処理

登録時刻が予定送信時刻を過ぎている場合の処理設定：
- オプション1：その日は送信しない
- オプション2：翌日に送信（以降のすべての配信を1日シフト）

**設定場所**：シナリオ設定 > 登録日配信タイミング

#### 機能要件

- ステップ配信スケジューラー
  - 登録イベントトリガー
  - 複数タイミングオプション（即時/固定/相対）
  - 当日配信スキップ/シフトロジック
- ステップシーケンス管理
  - ステップの追加・編集・削除
  - ステップの並び替え
  - ステップの有効化/無効化
- 配信状態管理
  - スケジュール済み
  - 配信済み
  - スキップ
  - エラー
- 配信履歴トラッキング

#### UI要件

- ステップ配信リストビュー
  - ステップ番号
  - 配信タイミング表示
  - メッセージタイプアイコン
  - 編集/削除ボタン
  - 並び替えコントロール（∧∨）
- ステップ追加ボタン
- ステップ編集モーダル
  - タイミング設定セクション
    - 即時/固定/相対ラジオボタン
    - 日数・時刻入力フィールド
  - メッセージ設定セクション
  - 条件設定セクション
- 当日配信設定（シナリオレベル）
- 配信履歴テーブル

---

### 3. リマインダ配信

**概要**
イベントやセミナーなど、特定の予定日時を基準としたリマインダー通知を送信する機能。

#### ユースケース

- **必要な場合**：予定イベント前のリマインダー通知
  - セミナー開催前通知
  - ウェビナーリマインダー
  - 予約確認通知
- **不要な場合**：予定イベントがない場合

#### ワークフロー

1. **リマインダ配信設定画面へ移動**
   - メール/LINE配信 > アカウント > シナリオ管理
   - 対象シナリオ選択
   - 左メニューから「リマインダ配信」を開く

2. **LINEメッセージ追加**
   - 「LINEメッセージ追加」ボタンをクリック

3. **配信条件とメッセージ設定**
   - 一斉送信の設定手順3～5に準拠

4. **リマインダリスト表示**
   - 設定したメッセージとリマインダがリストに表示
   - メッセージの並び替え（▲▼マーカー使用）
   - コピー機能による複製

5. **配信履歴**
   - 送信済み > リマインダ に履歴保存

#### タイミングオプション

**相対時間設定**
- イベント開始時刻を基準点として使用
- X日、Y時間、Z分前/後に送信
- 例：イベント開始2時間前に送信

**重要な注意点**
イベント開始時刻が基準のため、イベント終了を考慮する必要がある。

**例**
- イベント開始：13:00
- 設定：2時間後
- 実際の送信時刻：15:00（イベント中の可能性）

管理者はイベント期間を考慮して適切なタイミングを設定する必要がある。

#### 参照日時フィールド

- 登録フォームの日付型フィールド
- 読者設定の日付フィールド
- イベント/予約機能との連携

#### 機能要件

- イベント日時参照システム
  - フォームフィールドからの日時取得
  - イベント/予約機能との統合
- リマインダスケジューラー
  - イベント日時基準の相対時間計算
  - 前後指定（before/after）
  - 複数単位（日/時間/分）
- リマインダ管理
  - 追加・編集・削除
  - コピー機能
  - 並び替え
  - 有効化/無効化
- 自動参加者抽出（イベント/予約機能連携時）
- 配信履歴トラッキング

#### UI要件

- リマインダリストビュー
  - リマインダタイミング表示（例：「2日前 9:00」）
  - 参照イベントフィールド表示
  - メッセージタイプアイコン
  - 編集/削除/コピーボタン
  - 並び替えコントロール（▲▼）
- リマインダ追加ボタン
- リマインダ編集モーダル
  - 参照日時フィールド選択ドロップダウン
  - タイミング設定セクション
    - 前/後ラジオボタン
    - 日数・時間・分入力フィールド
  - メッセージ設定セクション
- イベント連携設定
- 配信履歴テーブル

---

## テンプレート機能

**概要**
LINE配信メッセージをテンプレート形式で保存し、複数のシナリオや配信で再利用可能にする機能。アクション機能と連携して使用。

### 対応メッセージタイプ

1. テキスト
2. 画像
3. ボタン
4. カルーセル
5. 音声
6. 動画
7. スタンプ

### 変数置換機能

#### サポート変数

- `%line_name%` - LINE登録名
- `%name%` - ユーザー名
- `%line_id%` - LINE友達ID
- `%master_id%` - シナリオ全体の読者ID
- `%event_schedule_change_url%` - イベントスケジュール変更URL（イベント機能使用時のみ）
- `%event_cancel_url%` - イベントキャンセルURL（イベント機能使用時のみ）

#### 変数の動作
- テンプレート送信時に各受信者の実際のデータで置換
- 未設定の変数は空文字または設定されたデフォルト値で置換

### ボタン設定機能

**クリック制限**
- 合計1回のみ
- ボタンごとに1回のみ
- 無制限

**制限超過時の応答**
カスタムメッセージまたはアクションの設定

### アクション連携

テンプレート内の要素（ボタン、画像エリアなど）に事前作成したアクションをリンク可能。

**実行タイミング**
- ボタンクリック時
- 画像エリアタップ時
- カルーセルアクション実行時

### メッセージ順序制御

複数のメッセージバブルの表示順序を方向コントロールで変更可能。

### テンプレート管理機能

#### テンプレートコピー
- 既存テンプレートの複製
- 操作メニューから実行

#### グループ組織化
- カスタムグループ名でのカテゴリ分け
- グループ別表示・フィルタリング

#### 表示順序
- ドラッグ&ドロップによる並び替え
- グループ内での順序制御

### 機能要件

- テンプレートCRUD操作
  - 作成・読み込み・更新・削除
- 変数エンジン
  - 変数解析
  - データバインディング
  - デフォルト値処理
- バージョン管理（推奨）
  - テンプレート変更履歴
  - ロールバック機能
- グループ管理
  - グループ作成・編集・削除
  - テンプレートのグループ割り当て
- 検索・フィルタリング
  - テンプレート名検索
  - グループフィルタ
  - メッセージタイプフィルタ
- プレビュー機能
  - 変数置換後のプレビュー
  - テストデータ入力

### UI要件

- テンプレート一覧ビュー
  - グリッド/リスト表示切り替え
  - テンプレートカード
    - サムネイル
    - テンプレート名
    - メッセージタイプアイコン
    - グループタグ
    - 操作ボタン（編集/コピー/削除）
  - 検索バー
  - フィルタドロップダウン
  - 並び替えコントロール
- テンプレート作成/編集モーダル
  - テンプレート名入力
  - グループ選択
  - メッセージタイプ選択
  - メッセージエディタ（タイプ別）
  - 変数挿入ボタン
  - アクション設定セクション
  - プレビューパネル
- グループ管理セクション
  - グループ一覧
  - グループ追加/編集/削除
  - ドラッグ&ドロップ並び替え

---

## エラー処理・再送

**概要**
LINE配信エラーの検出、表示、管理、および再送機能。

### エラーの主要原因

**月間メッセージ制限超過**
- LINE公式アカウントの月間メッセージ送信上限を超過
- 最も頻繁に観察されるエラー原因

**その他の潜在的エラー**
- ネットワークエラー
- LINE API障害
- 無効なLINE友達ID
- ブロック済みユーザー
- 不正なメッセージフォーマット

### エラー管理機能

#### エラーモニタリング

**アクセス方法**
メール/LINE配信 > アカウント選択 > LINE配信エラー

**表示情報**
- 失敗した配信の一覧
- エラー発生日時
- シナリオ名
- 配信タイプ（一斉送信/ステップ/リマインダ）
- 受信者情報
- エラー理由（可能な場合）

#### フィルタリングオプション

- **期間フィルタ**
  - 開始日・終了日指定
  - プリセット期間（今日/今週/今月/先月など）

- **エラーステータスフィルタ**
  - 未処理
  - 再送済み
  - 再送失敗
  - スキップ

- **配信タイプフィルタ**
  - 一斉送信
  - ステップ配信
  - リマインダ配信

#### 再送機能

**再送プロセス**
1. エラー一覧から対象メッセージを選択
   - 個別選択（チェックボックス）
   - 一括選択（全選択チェックボックス）
2. 再送ボタンをクリック
3. 確認ポップアップダイアログで実行確認
4. 再送実行
5. 結果表示（成功/失敗）

**再送オプション**
- 即時再送
- 予約再送（日時指定）
- メッセージ編集後の再送

### 機能要件

- エラー検出システム
  - LINE APIレスポンス監視
  - エラーコード解析
  - エラー分類
- エラーログ記録
  - タイムスタンプ
  - エラー詳細
  - スタックトレース（技術的エラー）
  - 受信者情報
  - メッセージ内容（参照）
- エラー通知
  - 管理者への即時通知（重大エラー）
  - 日次サマリーレポート
  - エラー閾値アラート
- 再送エンジン
  - 単一/バッチ再送
  - 再送スケジューリング
  - 再送回数制限
  - 再送履歴記録
- エラー分析
  - エラー統計ダッシュボード
  - エラー傾向分析
  - 月間制限使用状況トラッキング

### UI要件

- エラー一覧テーブル
  - カラム
    - 選択チェックボックス
    - エラー日時
    - シナリオ名
    - 配信タイプ
    - 受信者名/ID
    - エラー理由
    - ステータス
    - 操作（詳細/再送）
  - ソート機能
  - ページネーション
- フィルタパネル
  - 期間選択（日付ピッカー）
  - ステータスドロップダウン
  - 配信タイプドロップダウン
  - フィルタ適用/リセットボタン
- 一括操作バー
  - 全選択チェックボックス
  - 選択件数表示
  - 再送ボタン
  - スキップボタン
- エラー詳細モーダル
  - エラー詳細情報
  - メッセージ内容プレビュー
  - 受信者情報
  - エラーログ
  - 再送ボタン
- 再送確認ダイアログ
  - 再送対象件数
  - 再送オプション（即時/予約）
  - 確認/キャンセルボタン
- エラー統計ダッシュボード
  - 総エラー数
  - エラータイプ別内訳
  - 時系列グラフ
  - 月間制限使用率

---

## アクション機能

**概要**
ユーザー管理と条件付き反復操作を事前登録し、LINE送信や他のシステムイベントでトリガーする機能。

### アクション管理ワークフロー

1. **アクション管理画面へ移動**
   - メール/LINE配信 > 配信アカウント選択 > アクション管理

2. **アクション追加**
   - 「アクション追加」ボタンをクリック

3. **アクション設定**
   - 必須フィールド入力
   - アクションタイプ選択
   - タイプ別の詳細設定
   - 保存ボタンクリック

4. **複数アクション登録**
   - 「+追加」ボタンで同一管理名配下に複数アクション実行可能

### アクションタイプ

#### 1. シナリオ遷移

**機能**
ユーザーを別のシナリオに移動

**設定項目**
- 遷移先シナリオ選択
- 重複登録オプション
  - 常に禁止
  - リリース済みの場合のみ禁止
  - 許可

**ユースケース**
- 購入後のフォローアップシナリオへの自動移動
- セグメント別シナリオへの振り分け
- アップセルシナリオへの誘導

#### 2. LINEメッセージ送信

**機能**
指定したテキストメッセージを送信

**設定項目**
- メッセージテキスト入力
- 変数置換のサポート

**ユースケース**
- 即時の自動応答
- 確認メッセージ
- サンキューメッセージ

#### 3. LINEテンプレート送信

**機能**
事前登録されたLINEテンプレートを送信

**設定項目**
- テンプレート選択ドロップダウン

**ユースケース**
- 複雑なメッセージの自動配信
- 標準化された応答
- ボタン/カルーセルメッセージの自動送信

#### 4. LINEリッチメニュー変更

**機能**
ユーザーに表示されるリッチメニューを変更

**設定項目**
- 変更後のリッチメニュー選択

**ユースケース**
- ユーザーステータスに応じたメニュー切り替え
- 購入者専用メニューへの変更
- キャンペーン期間限定メニュー表示

#### 5. ラベル変更

**機能**
ユーザーにラベルを追加または削除

**設定項目**
- 操作タイプ（追加/削除）
- ラベル選択（事前登録済みラベルから）

**ユースケース**
- ユーザーセグメント管理
- 興味関心のタグ付け
- ステータスフラグ管理
- 配信条件フィルタ用のラベル設定

#### 6. Webhook

**機能**
外部システムへのHTTPリクエスト送信

**設定項目**
- ターゲットURL入力
- パラメータ（name/valueペア、オプション）
- HTTPメソッド（POST/GET）
- ヘッダー設定（オプション）

**ユースケース**
- 外部CRMとの連携
- サードパーティツールへのデータ送信
- カスタムロジックのトリガー
- Zapier/Make.com等の連携

### アクショントリガー

**利用可能なトリガーポイント**
- ボタンクリック
- 画像エリアタップ
- テンプレート配信時
- 特定メッセージ受信時
- シナリオ登録時
- ラベル追加/削除時

### 機能要件

- アクションCRUD操作
  - 作成・読み込み・更新・削除
- アクション実行エンジン
  - トリガー検出
  - 条件評価
  - アクション実行
  - 複数アクションの順次/並列実行
- アクション履歴記録
  - 実行ログ
  - 成功/失敗ステータス
  - タイムスタンプ
  - トリガー情報
- エラーハンドリング
  - リトライロジック
  - エラー通知
  - フォールバック処理
- 変数コンテキスト
  - ユーザーデータアクセス
  - シナリオデータアクセス
  - カスタムフィールドアクセス

### UI要件

- アクション一覧ビュー
  - テーブル表示
    - 管理名
    - アクションタイプ
    - 作成日
    - 最終実行日
    - 実行回数
    - 操作（編集/削除/複製）
  - 検索・フィルタ
  - ソート機能
- アクション作成/編集モーダル
  - 管理名入力
  - アクションタイプ選択
  - タイプ別設定パネル
    - シナリオ遷移設定
    - メッセージ入力
    - テンプレート選択
    - リッチメニュー選択
    - ラベル選択
    - Webhook設定
  - 複数アクション追加（+追加ボタン）
  - アクションリスト（追加済み）
    - 並び替え
    - 削除
  - 保存/キャンセルボタン
- アクション実行履歴ビュー
  - 実行日時
  - トリガー情報
  - ステータス
  - 詳細ログ

---

## API要件

### LINE Messaging API統合

#### 認証
- LINE Official Account連携
- Channel Access Token管理
- Token更新メカニズム

#### メッセージ送信エンドポイント

**Push Message API**
```
POST https://api.line.me/v2/bot/message/push
```

**Multicast Message API**
```
POST https://api.line.me/v2/bot/message/multicast
```

**Broadcast Message API**
```
POST https://api.line.me/v2/bot/message/broadcast
```

#### リッチメニューAPI

**Rich Menu作成**
```
POST https://api.line.me/v2/bot/richmenu
```

**Rich Menu切り替え**
```
POST https://api.line.me/v2/bot/user/{userId}/richmenu/{richMenuId}
```

### 内部API設計

#### メッセージ配信API

**POST /api/line/broadcast**
- 一斉送信の実行
- リクエスト
  - scenarioId
  - messageContent
  - conditions
  - scheduledAt (optional)
- レスポンス
  - broadcastId
  - status
  - estimatedRecipients

**POST /api/line/step**
- ステップ配信設定の追加/更新
- リクエスト
  - scenarioId
  - stepNumber
  - messageContent
  - timing
- レスポンス
  - stepId
  - status

**POST /api/line/reminder**
- リマインダ配信設定の追加/更新
- リクエスト
  - scenarioId
  - messageContent
  - eventFieldReference
  - timing
- レスポンス
  - reminderId
  - status

#### テンプレートAPI

**GET /api/line/templates**
- テンプレート一覧取得
- クエリパラメータ
  - groupId (optional)
  - messageType (optional)
  - search (optional)

**POST /api/line/templates**
- テンプレート作成
- リクエスト
  - name
  - messageType
  - content
  - groupId (optional)

**PUT /api/line/templates/:id**
- テンプレート更新

**DELETE /api/line/templates/:id**
- テンプレート削除

#### アクションAPI

**GET /api/line/actions**
- アクション一覧取得

**POST /api/line/actions**
- アクション作成
- リクエスト
  - managementName
  - actions (array)
    - type
    - config

**POST /api/line/actions/:id/execute**
- アクション手動実行
- リクエスト
  - userId
  - context (optional)

#### エラー管理API

**GET /api/line/errors**
- エラー一覧取得
- クエリパラメータ
  - startDate
  - endDate
  - status
  - type

**POST /api/line/errors/resend**
- エラーメッセージ再送
- リクエスト
  - errorIds (array)
  - scheduledAt (optional)

#### 分析API

**GET /api/line/analytics/broadcast/:id**
- 一斉送信分析データ取得
- レスポンス
  - sent
  - delivered
  - opened
  - clicked
  - openRate
  - clickRate

**GET /api/line/analytics/overview**
- 全体統計取得
- クエリパラメータ
  - startDate
  - endDate
- レスポンス
  - totalSent
  - totalDelivered
  - averageOpenRate
  - averageClickRate
  - messageTypeBreakdown

---

## データモデル

### TypeScript Interfaces

#### メッセージタイプ

```typescript
// 基本メッセージインターフェース
interface LineMessage {
  id: string;
  type: LineMessageType;
  notificationText?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum LineMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  BUTTON = 'button',
  CAROUSEL = 'carousel',
  AUDIO = 'audio',
  VIDEO = 'video',
  STICKER = 'sticker',
}

// テキストメッセージ
interface TextMessage extends LineMessage {
  type: LineMessageType.TEXT;
  content: string;
  variables?: string[]; // 使用されている変数のリスト
  conditionalBranches?: ConditionalBranch[];
}

interface ConditionalBranch {
  id: string;
  condition: BranchCondition;
  content: string;
}

interface BranchCondition {
  type: 'label' | 'field' | 'registration_path';
  field?: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

// 画像メッセージ
interface ImageMessage extends LineMessage {
  type: LineMessageType.IMAGE;
  imageUrl: string;
  originalContentUrl: string;
  previewImageUrl: string;
  clickableAreas?: ImageClickableArea[];
}

interface ImageClickableArea {
  id: string;
  area: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  action: ImageAreaAction;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ImageAreaAction {
  type: 'url' | 'message' | 'none';
  url?: string;
  message?: string;
  notificationText?: string;
}

// ボタンメッセージ
interface ButtonMessage extends LineMessage {
  type: LineMessageType.BUTTON;
  title: string;
  text: string;
  imageUrl?: string;
  buttons: MessageButton[];
  tapLimit: TapLimitType;
  tapLimitExceededResponse?: string;
}

enum TapLimitType {
  ONCE_TOTAL = 'once_total',
  ONCE_PER_BUTTON = 'once_per_button',
  UNLIMITED = 'unlimited',
}

interface MessageButton {
  id: string;
  label: string;
  action: ButtonAction;
  style?: 'primary' | 'secondary' | 'link';
}

interface ButtonAction {
  type: 'url' | 'message' | 'template' | 'label' | 'data_update' | 'action';
  url?: string;
  message?: string;
  templateId?: string;
  labelId?: string;
  dataField?: string;
  dataValue?: string;
  actionId?: string;
}

// カルーセルメッセージ
interface CarouselMessage extends LineMessage {
  type: LineMessageType.CAROUSEL;
  panels: CarouselPanel[];
}

interface CarouselPanel {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  buttons: MessageButton[];
}

// 音声メッセージ
interface AudioMessage extends LineMessage {
  type: LineMessageType.AUDIO;
  audioUrl: string;
  duration: number; // ミリ秒
  fileSize: number; // バイト
}

// 動画メッセージ
interface VideoMessage extends LineMessage {
  type: LineMessageType.VIDEO;
  videoUrl: string;
  previewImageUrl?: string;
  duration: number; // ミリ秒
  fileSize: number; // バイト
}

// スタンプメッセージ
interface StickerMessage extends LineMessage {
  type: LineMessageType.STICKER;
  packageId: string;
  stickerId: string;
}
```

#### 配信モデル

```typescript
// 一斉送信
interface BroadcastDistribution {
  id: string;
  scenarioId: string;
  name: string;
  messages: LineMessage[];
  conditions?: DistributionCondition[];
  timing: DistributionTiming;
  customSender?: string;
  urlDomain?: string;
  postSendActions?: string[]; // アクションID配列
  linkClickActions?: Record<string, string>; // URL -> アクションID
  status: DistributionStatus;
  stats?: DistributionStats;
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  updatedAt: Date;
}

interface DistributionCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[] | number[];
  logicOperator?: 'AND' | 'OR'; // 次の条件との論理演算子
}

interface DistributionTiming {
  type: 'immediate' | 'scheduled';
  scheduledDate?: Date;
}

enum DistributionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

interface DistributionStats {
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

// ステップ配信
interface StepDistribution {
  id: string;
  scenarioId: string;
  stepNumber: number;
  name: string;
  messages: LineMessage[];
  conditions?: DistributionCondition[];
  timing: StepTiming;
  enabled: boolean;
  stats?: DistributionStats;
  createdAt: Date;
  updatedAt: Date;
}

interface StepTiming {
  type: 'immediate' | 'fixed_time' | 'relative';
  // 固定時刻の場合
  daysAfterRegistration?: number;
  timeOfDay?: string; // HH:mm形式
  // 相対時間の場合
  days?: number;
  hours?: number;
  minutes?: number;
  // 当日配信処理
  sameDayHandling?: 'skip' | 'send_next_day';
}

// リマインダ配信
interface ReminderDistribution {
  id: string;
  scenarioId: string;
  name: string;
  messages: LineMessage[];
  conditions?: DistributionCondition[];
  eventFieldReference: string; // フォームフィールド名
  timing: ReminderTiming;
  enabled: boolean;
  stats?: DistributionStats;
  createdAt: Date;
  updatedAt: Date;
}

interface ReminderTiming {
  beforeAfter: 'before' | 'after';
  days?: number;
  hours?: number;
  minutes?: number;
}
```

#### テンプレートモデル

```typescript
interface LineTemplate {
  id: string;
  name: string;
  groupId?: string;
  messageType: LineMessageType;
  content: LineMessage; // 各メッセージタイプのインターフェース
  variables: TemplateVariable[];
  version: number;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateVariable {
  key: string; // 例: 'line_name', 'name', 'line_id'
  type: 'string' | 'number' | 'date' | 'url';
  defaultValue?: string;
  required: boolean;
  description?: string;
}

interface TemplateGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  templateCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### アクションモデル

```typescript
interface LineAction {
  id: string;
  managementName: string;
  actions: Action[];
  triggers?: ActionTrigger[];
  enabled: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Action {
  id: string;
  type: ActionType;
  order: number;
  config: ActionConfig;
}

enum ActionType {
  SCENARIO_TRANSITION = 'scenario_transition',
  LINE_MESSAGE_SEND = 'line_message_send',
  LINE_TEMPLATE_SEND = 'line_template_send',
  RICH_MENU_CHANGE = 'rich_menu_change',
  LABEL_CHANGE = 'label_change',
  WEBHOOK = 'webhook',
}

type ActionConfig =
  | ScenarioTransitionConfig
  | LineMessageSendConfig
  | LineTemplateSendConfig
  | RichMenuChangeConfig
  | LabelChangeConfig
  | WebhookConfig;

interface ScenarioTransitionConfig {
  targetScenarioId: string;
  duplicateRegistration: 'prohibit_always' | 'prohibit_if_released' | 'allow';
}

interface LineMessageSendConfig {
  messageText: string;
  variables?: boolean;
}

interface LineTemplateSendConfig {
  templateId: string;
  variableOverrides?: Record<string, string>;
}

interface RichMenuChangeConfig {
  richMenuId: string;
}

interface LabelChangeConfig {
  operation: 'add' | 'remove';
  labelIds: string[];
}

interface WebhookConfig {
  url: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
}

interface ActionTrigger {
  id: string;
  type: 'button_click' | 'image_tap' | 'template_send' | 'message_received' | 'scenario_registration' | 'label_change';
  config?: Record<string, any>;
}

interface ActionExecutionLog {
  id: string;
  actionId: string;
  userId: string;
  triggeredBy: string;
  status: 'success' | 'failed' | 'partial';
  executedActions: {
    actionId: string;
    status: 'success' | 'failed';
    error?: string;
  }[];
  executedAt: Date;
}
```

#### エラーモデル

```typescript
interface LineDeliveryError {
  id: string;
  distributionId: string;
  distributionType: 'broadcast' | 'step' | 'reminder';
  userId: string;
  lineUserId: string;
  messageContent: LineMessage[];
  errorCode: string;
  errorMessage: string;
  errorCategory: ErrorCategory;
  status: ErrorStatus;
  retryCount: number;
  lastRetryAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum ErrorCategory {
  RATE_LIMIT = 'rate_limit', // 月間メッセージ制限超過
  NETWORK = 'network',
  API_ERROR = 'api_error',
  INVALID_USER = 'invalid_user', // ブロック済み、無効なID
  INVALID_MESSAGE = 'invalid_message',
  UNKNOWN = 'unknown',
}

enum ErrorStatus {
  PENDING = 'pending', // 未処理
  RETRYING = 'retrying',
  RESENT = 'resent', // 再送済み
  FAILED = 'failed', // 再送失敗
  SKIPPED = 'skipped', // スキップ
}
```

#### 分析モデル

```typescript
interface MessageAnalytics {
  id: string;
  distributionId: string;
  messageId: string;
  userId: string;
  lineUserId: string;
  sent: boolean;
  sentAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  opened: boolean;
  openedAt?: Date;
  clicked: boolean;
  clickedAt?: Date;
  clickedUrls?: string[];
  buttonClicks?: {
    buttonId: string;
    clickedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface DistributionAnalyticsSummary {
  distributionId: string;
  distributionType: 'broadcast' | 'step' | 'reminder';
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    clickThroughRate: number;
  };
  messageTypeBreakdown: Record<LineMessageType, number>;
  deviceBreakdown?: {
    ios: number;
    android: number;
    desktop: number;
  };
  timeSeriesData?: {
    timestamp: Date;
    opened: number;
    clicked: number;
  }[];
  topClickedUrls?: {
    url: string;
    clicks: number;
  }[];
}

interface OverallLineAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totalDistributions: number;
  totalMessagesSent: number;
  totalMessagesDelivered: number;
  totalMessagesFailed: number;
  averageOpenRate: number;
  averageClickRate: number;
  messageTypeUsage: Record<LineMessageType, number>;
  topPerformingDistributions: {
    distributionId: string;
    name: string;
    openRate: number;
    clickRate: number;
  }[];
  errorSummary: {
    total: number;
    byCategory: Record<ErrorCategory, number>;
  };
  monthlyMessageUsage: {
    limit: number;
    used: number;
    remaining: number;
    percentageUsed: number;
  };
}
```

#### シナリオ関連モデル

```typescript
interface Scenario {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  isActive: boolean;
  registrationSettings: {
    sameDayDeliveryHandling: 'skip' | 'send_next_day';
  };
  totalSubscribers: number;
  activeSubscribers: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ScenarioSubscriber {
  id: string;
  scenarioId: string;
  userId: string;
  lineUserId: string;
  registeredAt: Date;
  status: 'active' | 'unsubscribed' | 'blocked';
  labels: string[];
  customFields: Record<string, any>;
  lastMessageReceivedAt?: Date;
  lastMessageOpenedAt?: Date;
  totalMessagesReceived: number;
  totalMessagesOpened: number;
  updatedAt: Date;
}
```

#### リッチメニューモデル

```typescript
interface RichMenu {
  id: string;
  richMenuId: string; // LINE API rich menu ID
  name: string;
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  chatBarText: string;
  areas: RichMenuArea[];
  imageUrl: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: 'postback' | 'message' | 'uri' | 'datetimepicker';
    label?: string;
    data?: string;
    text?: string;
    uri?: string;
    mode?: string;
    initial?: string;
    max?: string;
    min?: string;
  };
}
```

---

## 技術スタック推奨

### バックエンド
- **フレームワーク**: NestJS / Express
- **データベース**: PostgreSQL（メイン）、Redis（キャッシュ・キュー）
- **メッセージキュー**: Bull / BullMQ
- **スケジューラー**: node-cron / Agenda
- **LINE SDK**: @line/bot-sdk

### フロントエンド
- **フレームワーク**: React / Next.js
- **状態管理**: Redux Toolkit / Zustand
- **UIライブラリ**: Material-UI / Ant Design / shadcn/ui
- **フォームライブラリ**: React Hook Form + Zod
- **ドラッグ&ドロップ**: react-dnd / dnd-kit

### インフラ
- **ホスティング**: AWS / GCP / Azure
- **ストレージ**: AWS S3 / GCS（画像・動画・音声）
- **CDN**: CloudFront / Cloud CDN
- **監視**: Sentry / DataDog / CloudWatch

### セキュリティ
- **認証**: JWT / OAuth 2.0
- **暗号化**: LINE Channel Access Tokenの安全な保管
- **レート制限**: Redis-based rate limiting
- **監査ログ**: すべてのアクション実行とメッセージ配信の記録

---

## パフォーマンス要件

### スケーラビリティ
- 同時配信：10,000件/分
- 最大受信者数（一斉送信）：100,000件
- テンプレート数：無制限
- アクション実行遅延：< 500ms

### レスポンスタイム
- メッセージ作成UI：< 200ms
- 配信リスト読み込み：< 500ms
- 分析データ読み込み：< 1秒
- エラーリスト読み込み：< 500ms

### 可用性
- システムアップタイム：99.9%
- 配信成功率：> 99%（LINE API制限除く）
- データバックアップ：日次

---

## まとめ

本要件定義書は、UTAGEシステムにおけるLINEメッセージング機能の包括的な仕様を定義しています。

### 主要実装範囲

1. **7種類のメッセージタイプ**のフル実装
2. **3種類の配信方式**（一斉送信・ステップ・リマインダ）
3. **テンプレート管理**による効率化
4. **アクション自動化**によるマーケティングオートメーション
5. **エラー処理・再送**による配信信頼性
6. **分析・トラッキング**による効果測定

### 開発優先順位

**Phase 1（MVP）**
- テキスト・画像・ボタンメッセージ
- 一斉送信機能
- 基本的なテンプレート機能
- エラー検出と手動再送

**Phase 2**
- カルーセル・音声・動画・スタンプメッセージ
- ステップ配信機能
- リマインダ配信機能
- アクション機能（基本）

**Phase 3**
- 高度なアクション連携
- 詳細な分析ダッシュボード
- 自動再送機能
- A/Bテスト機能（拡張）

本要件定義に基づき、スケーラブルで信頼性の高いLINEメッセージングシステムの構築が可能です。
