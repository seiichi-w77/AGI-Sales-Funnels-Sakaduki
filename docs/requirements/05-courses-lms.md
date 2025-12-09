# コース・LMS機能 要件定義書

## 1. 概要

本ドキュメントは、ClickFunnelsのコース・LMS（Learning Management System）機能のクローンアプリケーション構築のための詳細要件定義書です。ClickFunnelsは完全なLMSではなく、B2C向けのカジュアルな学習コンテンツ配信に特化したプラットフォームです。

### 1.1 コアコンセプト

- ファネル統合型のオンラインコース配信プラットフォーム
- シンプルで直感的なコース作成・管理
- 商品購入と連動した自動アクセス制御
- ドリップコンテンツによる段階的な学習体験
- ブランドに合わせたカスタマイズ可能なテーマ

### 1.2 主要機能範囲

- コース作成・管理
- モジュール・レッスンの階層構造
- 受講者登録・アクセス管理
- コンテンツドリップ配信
- 進捗トラッキング
- 修了証明書の発行
- メールオートメーション
- ビデオホスティング
- テーマカスタマイズ

### 1.3 除外される機能

以下の機能はClickFunnelsのコースには含まれません：

- クイズ・テスト機能
- 採点・成績評価システム
- 宿題・課題提出機能
- 高度な学習分析（ビデオヒートマップ、エンゲージメントスコアリング）
- ネイティブモバイルアプリ
- 自動アフィリエイト支払い

## 2. コース構造とデータモデル

### 2.1 コース (Course)

#### 2.1.1 基本属性

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | コースの一意識別子 |
| workspace_id | UUID | Yes | 所属するワークスペースID |
| title | String(255) | Yes | コースタイトル |
| description | Text | No | コースの説明文 |
| status | Enum | Yes | `published`, `draft` |
| course_type | Enum | Yes | `simple`, `custom` |
| created_at | Timestamp | Yes | 作成日時 |
| updated_at | Timestamp | Yes | 更新日時 |
| created_by | UUID | Yes | 作成者のユーザーID |

#### 2.1.2 コースタイプ

**Simple Course（シンプルコース）**
- 自動的に用意されたレイアウト
- モジュールとレッスンに最適化
- モバイルレスポンシブ対応
- カスタマイズオプションは限定的

**Custom Course（カスタムコース）**
- テンプレートの完全カスタマイズが可能
- モジュール・レッスンの外観を完全制御
- 高度なブランディング対応

#### 2.1.3 コース設定

| 設定項目 | データ型 | 説明 |
|---------|---------|------|
| theme_id | UUID | 適用するテーマID |
| enable_certificates | Boolean | 修了証明書の有効化 |
| certificate_template_id | UUID | 証明書テンプレートID |
| enable_comments | Boolean | レッスンコメント機能の有効化 |
| comment_notifications | Boolean | コメント通知の有効化 |
| sidebar_render_mode | Enum | `classic`, `ascension` |
| show_drip_modules | Boolean | ドリップモジュールの表示 |
| completed_checkmark_color | String(7) | 完了チェックマークの色（HEX） |
| filter_drip_access | Boolean | アクセス制限のあるモジュールをフィルタ |

### 2.2 モジュール (Module)

#### 2.2.1 基本属性

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | モジュールの一意識別子 |
| course_id | UUID | Yes | 所属するコースID |
| parent_module_id | UUID | No | 親モジュールID（サブモジュールの場合） |
| title | String(255) | Yes | モジュールタイトル |
| description | Text | No | モジュールの説明 |
| status | Enum | Yes | `published`, `draft`, `drip`, `lock` |
| sort_order | Integer | Yes | 表示順序 |
| created_at | Timestamp | Yes | 作成日時 |
| updated_at | Timestamp | Yes | 更新日時 |

#### 2.2.2 モジュールステータス

**Published（公開）**
- 即座にすべての受講者がアクセス可能
- デフォルトの状態

**Draft（下書き）**
- 受講者には非表示
- 作成者のみ閲覧可能

**Drip（ドリップ配信）**
- スケジュールに基づいて段階的に公開
- 購入日からの経過日数または特定日時で制御

**Lock（ロック）**
- モジュールは表示されるが、アクセスには条件が必要
- 他のレッスンの完了が必要

#### 2.2.3 ドリップ設定

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| drip_type | Enum | `days_after_purchase`, `specific_date` |
| drip_days | Integer | 購入後の経過日数（drip_type=days_after_purchaseの場合） |
| drip_date | Timestamp | 特定の公開日時（drip_type=specific_dateの場合） |

#### 2.2.4 ロック設定

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| lock_type | Enum | `lesson_completion` |
| required_lesson_id | UUID | 完了が必要なレッスンID |

#### 2.2.5 アップグレードオファー設定

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| enable_upgrade_offer | Boolean | アップグレードオファーの有効化 |
| upgrade_url | String(2048) | チェックアウト/決済ページのURL |

- モジュールへのアクセス権がない受講者には、モジュールタイトルがクリック可能なリンクとして表示
- クリックすると新しいタブでチェックアウトページが開く
- 個別モジュールの販売や段階的な価格設定が可能

### 2.3 レッスン (Lesson)

#### 2.3.1 基本属性

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | レッスンの一意識別子 |
| module_id | UUID | Yes | 所属するモジュールID |
| title | String(255) | Yes | レッスンタイトル |
| description | Text | No | レッスンの説明 |
| status | Enum | Yes | `published`, `draft`, `drip`, `lock` |
| sort_order | Integer | Yes | 表示順序 |
| required_time_seconds | Integer | No | 完了とみなす最低滞在時間（秒） |
| created_at | Timestamp | Yes | 作成日時 |
| updated_at | Timestamp | Yes | 更新日時 |

#### 2.3.2 コンテンツタイプ

レッスンには以下のコンテンツタイプを含めることができます：

| コンテンツタイプ | 説明 |
|---------------|------|
| Video | 動画コンテンツ（MP4, AVI, MPEG、最大3GB） |
| Text | テキストベースの説明・解説 |
| Audio | 音声コンテンツ（ポッドキャストなど） |
| Downloadable Files | PDF、ワークシート等のダウンロード可能ファイル |

#### 2.3.3 レッスン設定

**ドリップ設定**
- モジュールと同様のドリップ機能
- 特定日時または購入後の経過日数で公開

**ロック設定**
- 他のレッスン完了を条件にアクセス許可
- 構造化された学習パスの実現

**進捗トラッキング設定**

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| required_time_seconds | Integer | 完了とみなす最低滞在時間（最小35秒） |

注：required_timeは次のレッスンへの移動を制限しない。完了率の計算にのみ使用される。

#### 2.3.4 レッスンステータス要素

受講者向けのUI要素：

| 要素 | 機能 |
|-----|------|
| Mark Complete | 現在のレッスンを完了とマークし、自動的に次のレッスンに進む |
| Go Back to Previous Lesson | 前のレッスンに戻る（現在のレッスンの完了ステータスに影響しない） |
| Restart Lesson | 現在のレッスンをリロードし、関連する進捗をリセット |

### 2.4 コース登録 (Course Enrollment)

#### 2.4.1 基本属性

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | 登録の一意識別子 |
| course_id | UUID | Yes | コースID |
| contact_id | UUID | Yes | 受講者の連絡先ID |
| enrolled_at | Timestamp | Yes | 登録日時 |
| enrollment_source | Enum | Yes | `manual`, `product_purchase`, `workflow` |
| product_id | UUID | No | 関連する商品ID（該当する場合） |
| status | Enum | Yes | `active`, `unenrolled` |
| unenrolled_at | Timestamp | No | 登録解除日時 |

#### 2.4.2 登録方法

**1. Manual Enrollment（手動登録）**
- 管理者が個別または一括で受講者を登録
- コース全体またはモジュール単位での登録が可能
- 即時登録またはスケジュール登録

**2. Product Purchase Actions（商品購入アクション）**
- 商品購入時に自動的にコースに登録
- 最もシームレスなアクセス付与方法
- 商品ごとに異なるコース・モジュールのアクセス権を設定可能

**3. Workflow Enroll Step（ワークフロー登録ステップ）**
- ワークフローの一部として自動登録
- 複雑な条件に基づいた登録が可能
- メール送信などの他のアクションと組み合わせ可能

#### 2.4.3 モジュールアクセス制御

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | アクセス権の一意識別子 |
| enrollment_id | UUID | 登録ID |
| module_id | UUID | モジュールID |
| has_access | Boolean | アクセス権の有無 |
| granted_at | Timestamp | アクセス付与日時 |

- 受講者をコースから完全に解除せずに、特定モジュールへのアクセスをカスタマイズ可能
- チェックボックスで個別にアクセス権を付与/削除

### 2.5 進捗トラッキング (Progress Tracking)

#### 2.5.1 レッスン進捗

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | 進捗記録の一意識別子 |
| enrollment_id | UUID | Yes | 登録ID |
| lesson_id | UUID | Yes | レッスンID |
| status | Enum | Yes | `not_started`, `in_progress`, `completed` |
| time_spent_seconds | Integer | Yes | 滞在時間（秒） |
| started_at | Timestamp | No | 開始日時 |
| completed_at | Timestamp | No | 完了日時 |
| last_accessed_at | Timestamp | Yes | 最終アクセス日時 |

#### 2.5.2 コース進捗集計

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| enrollment_id | UUID | 登録ID |
| total_lessons | Integer | 総レッスン数 |
| completed_lessons | Integer | 完了レッスン数 |
| completion_percentage | Decimal(5,2) | 完了率（%） |
| last_lesson_id | UUID | 最後にアクセスしたレッスンID |

#### 2.5.3 進捗計算ロジック

完了率の計算：
```
completion_percentage = (completed_lessons / total_lessons) * 100
```

レッスン完了の条件：
- `required_time_seconds`が設定されている場合：その時間以上の滞在
- 設定されていない場合：ユーザーが「Mark Complete」ボタンをクリック
- 最低35秒の滞在でシステムが進捗を認識

### 2.6 修了証明書 (Completion Certificate)

#### 2.6.1 証明書設定

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | 証明書テンプレートの一意識別子 |
| course_id | UUID | コースID |
| template_name | String(255) | テンプレート名 |
| certificate_content | Text | 証明書のコンテンツ（HTML） |
| enable_auto_issue | Boolean | 自動発行の有効化 |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

#### 2.6.2 発行済み証明書

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | 発行済み証明書の一意識別子 |
| enrollment_id | UUID | 登録ID |
| certificate_template_id | UUID | 証明書テンプレートID |
| issued_at | Timestamp | 発行日時 |
| certificate_url | String(2048) | 証明書のダウンロードURL |

#### 2.6.3 証明書機能

- コース完了時に自動発行
- 受講者はアカウント設定の「Courses and Downloads」セクションからアクセス可能
- PDF形式でダウンロード可能
- カスタマイズ可能なデザイン

## 3. テーマとカスタマイズ

### 3.1 コーステーマ

#### 3.1.1 テーマの種類

**LearningHub View（デフォルト）**
- すべてのコースの初期設定
- ミニマルなレイアウト
- クリーンで構造化された学習体験
- コンテンツに集中
- コース間で一貫した外観

**Advanced Customization（高度なカスタマイズ）**
- 好みのテーマを選択・カスタマイズ可能
- ブランド中心の学習環境を作成
- エンゲージメントとユーザー体験の向上

#### 3.1.2 テーマテンプレート

| テンプレート種類 | 用途 |
|---------------|------|
| Course Home | コースのメインページ |
| Module | モジュールページ |
| Lesson | 個別レッスンページ |

各テンプレートは個別にカスタマイズ可能。

#### 3.1.3 カスタマイズ可能な要素

**色設定**
- プライマリカラー
- ダークカラー
- 背景色
- アクセントカラー
- 完了チェックマークの色

**レイアウト設定**
- Center Layout（中央寄せレイアウト）
- Fluid Layout（フルード レイアウト）
- レスポンシブデザインオプション

**サイドバー設定**

| 設定項目 | オプション | 説明 |
|---------|-----------|------|
| Render Mode | `classic`, `ascension` | サイドバーのスタイル |
| Show Drip Modules | `Yes`, `No` | アクセス不可のドリップモジュールの表示/非表示 |
| Completed Checkmark Color | HEX色コード | 完了したレッスンのチェックマークの色 |

### 3.2 ページエディタ

#### 3.2.1 エディタ機能

- ドラッグ&ドロップエディタ
- コード不要でページをデザイン
- 数分でページを作成・公開

#### 3.2.2 編集可能な要素

**既存要素の操作**
- 要素の再配置
- 要素設定の編集
- スタイルのカスタマイズ

**新規要素の追加**
- テキストブロック
- 画像・メディア
- ビデオプレーヤー
- ボタン・CTA
- フォーム
- カスタムHTML

#### 3.2.3 レッスンページのカスタマイズ方法

**方法1: デフォルトレッスンページテンプレート**
- ページエディタで「Templates」タブをクリック
- 「Default Lesson Page」を選択
- 変更はこのテンプレートを使用するすべてのレッスンに適用

**方法2: 個別レッスンページ**
- ページエディタの「Course」タブでカスタマイズしたいレッスンを選択
- レッスン名をクリックして個別のページを編集
- 変更は選択したレッスンにのみ適用

#### 3.2.4 ユニバーサルセクション

**定義**
- 一度設定すると、すべてのページに同じように表示されるセクション
- ユニバーサルセクションに変更を加えると、そのセクションを持つすべてのコースで変更される

**用途**
- ヘッダー
- フッター
- ナビゲーション
- CTA（Call to Action）

**メリット**
- ブランドの一貫性を最小限の労力で維持
- 複数のファネル、ウェブサイト、ストアで統一された外観
- 一箇所の変更で全体に反映

### 3.3 コース要素

#### 3.3.1 Course Sidebar（コースサイドバー）

**機能**
- 受講者がコースコンテンツをナビゲート
- コース構造（モジュール・レッスン）を表示
- セクション間の簡単な移動

**設定**
- Render Mode: `classic`, `ascension`
- Show Drip Modules: ロック/スケジュールされたモジュールの表示制御
- Completed Checkmark Color: 進捗トラッキングのチェックマーク色

#### 3.3.2 Course Progress Bar（コース進捗バー）

**機能**
- 受講者の進捗を視覚的に表示
- 完了率をパーセンテージで表示
- モチベーション向上

#### 3.3.3 Lesson Video（レッスンビデオ）

**機能**
- コースビデオの再生専用要素
- 標準のVideoエレメントとは異なる
- Course Videosとの最適な連携

#### 3.3.4 Lesson Status（レッスンステータス）

**機能**
- 各レッスン内での受講者の進捗を表示

**オプション**
- Mark Complete: 現在のレッスンを完了とマークし、次のレッスンに自動進行
- Go Back to Previous Lesson: 前のレッスンに戻る
- Restart Lesson: 現在のレッスンをリロードし、進捗をリセット

## 4. ビデオ管理

### 4.1 ビデオホスティング

#### 4.1.1 内蔵ビデオホスティング

ClickFunnelsは外部のビデオホスティングサービスを必要とせず、コース内で直接ビデオをアップロード、管理、追加できる機能を提供。

#### 4.1.2 ビデオアップロード

**アップロード方法**
1. ClickFunnelsダッシュボードから「Workspace Settings」に移動
2. 「My Assets」を選択
3. 「Course Videos」タブをクリック
4. 「Upload Course Video」ボタンでビデオを追加

**技術仕様**

| 項目 | 仕様 |
|-----|------|
| サポートフォーマット | MP4, AVI, MPEG |
| 最大ファイルサイズ | 3,000 MB (3 GB) |
| 一度にアップロード可能な数 | 10ビデオ |

#### 4.1.3 レッスンへのビデオ追加

**手順**
1. コースに移動し、特定のレッスンの「Edit Lesson」をクリック
2. レッスンエディタで左側から「Select Video」をクリック
3. 「Course Videos」にアップロードしたビデオのリストから選択

**推奨事項**
- **Course Video要素**: ClickFunnelsの「Lesson Video」要素と組み合わせて使用
- **標準Video要素**: 外部ホスティング（Voomly、YouTube、Vimeo、Wistia等）を推奨
  - ストリーミング・再生の問題を回避
  - ブラウザ・デバイス間での最大互換性

### 4.2 ビデオデータモデル

#### 4.2.1 Course Video

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | ビデオの一意識別子 |
| workspace_id | UUID | Yes | ワークスペースID |
| title | String(255) | Yes | ビデオタイトル |
| description | Text | No | ビデオの説明 |
| file_name | String(255) | Yes | ファイル名 |
| file_size | BigInteger | Yes | ファイルサイズ（バイト） |
| file_format | Enum | Yes | `mp4`, `avi`, `mpeg` |
| duration_seconds | Integer | No | ビデオの長さ（秒） |
| storage_url | String(2048) | Yes | ストレージのURL |
| thumbnail_url | String(2048) | No | サムネイルURL |
| upload_status | Enum | Yes | `uploading`, `processing`, `ready`, `failed` |
| uploaded_at | Timestamp | Yes | アップロード日時 |
| created_by | UUID | Yes | アップロードしたユーザーID |

#### 4.2.2 Lesson Video Reference

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | 参照の一意識別子 |
| lesson_id | UUID | レッスンID |
| course_video_id | UUID | コースビデオID |
| sort_order | Integer | 複数ビデオがある場合の順序 |

## 5. メール管理とオートメーション

### 5.1 コースメールの種類

#### 5.1.1 Broadcasts（ブロードキャスト）

**特徴**
- 単発または日付ベースのメール
- 特定の日時に送信
- 全受講者または特定のセグメントに配信

**用途**
- コース開始のお知らせ
- 新モジュール追加の通知
- 期間限定オファー

#### 5.1.2 Workflows（ワークフロー）

**特徴**
- オートレスポンダー機能
- トリガーベースの自動送信
- 複雑なロジックと条件分岐

**トリガータイプ**
- ファネルアクティビティ
- 商品購入
- フォーム送信
- コース登録
- レッスン完了
- モジュール完了
- コース完了

### 5.2 ワークフローの機能

#### 5.2.1 Send Email ステップ

**機能**
- ワークフロー内で「Send Email」ステップを追加
- パーソナライズされたコミュニケーションを自動化

**例**
- 顧客が購読時にウェルカムメール送信
- カート放棄時のリマインダーメール送信
- レッスン完了時の祝福メール送信

#### 5.2.2 ワークフローロジック

| ロジック要素 | 機能 |
|------------|------|
| Split Path | 条件に基づいてフローを分岐 |
| Split Test | A/Bテストの実施 |
| Notes | ワークフローにメモを追加 |
| Notification | 内部通知の送信 |
| Webhook | 外部サービスとの連携 |
| Wait/Delay | 指定時間待機 |

### 5.3 メールエディタ

#### 5.3.1 エディタ機能

- ユーザーフレンドリーなメールエディタ
- コード不要で視覚的に魅力的なメールを作成
- ドラッグ&ドロップエディタ
- メールコンテンツのカスタマイズとブランディングを簡素化

#### 5.3.2 コンタクト管理

- コンタクトとリードを簡単に管理
- 様々な基準でインポート、セグメント、整理
- 受講者の行動や属性に基づいたセグメンテーション

### 5.4 コースメールのデータモデル

#### 5.4.1 Course Email Template

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | メールテンプレートの一意識別子 |
| course_id | UUID | Yes | コースID |
| template_name | String(255) | Yes | テンプレート名 |
| email_type | Enum | Yes | `welcome`, `lesson_reminder`, `course_complete`, `custom` |
| subject_line | String(255) | Yes | 件名 |
| email_body | Text | Yes | メール本文（HTML） |
| from_name | String(100) | Yes | 送信者名 |
| from_email | String(255) | Yes | 送信者メールアドレス |
| created_at | Timestamp | Yes | 作成日時 |
| updated_at | Timestamp | Yes | 更新日時 |

#### 5.4.2 Email Automation Rule

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | ルールの一意識別子 |
| course_id | UUID | コースID |
| trigger_type | Enum | `enrollment`, `lesson_complete`, `module_complete`, `course_complete` |
| trigger_lesson_id | UUID | トリガーとなるレッスンID（該当する場合） |
| trigger_module_id | UUID | トリガーとなるモジュールID（該当する場合） |
| email_template_id | UUID | 送信するメールテンプレートID |
| delay_days | Integer | トリガー後の遅延日数 |
| delay_hours | Integer | トリガー後の遅延時間 |
| is_active | Boolean | ルールの有効/無効 |

## 6. 商品統合とアクセス制御

### 6.1 商品との連携

#### 6.1.1 コースアクセスの追加

**機能**
- 商品購入を通じてコースコンテンツへのアクセスを付与
- セットアップ後、商品を購入した人は選択したコースモジュールにアクセス可能

**メリット**
- コースを商品パッケージの一部として販売
- オファーに価値を追加
- 複数の商品にコースアクセスを追加可能
- 異なるオファーや会員レベルを作成可能

#### 6.1.2 コースアクセス設定手順

1. 左ナビゲーションメニューから「Courses」をクリック
2. 管理したいコースを見つけて「Access」タブをクリック
3. 「Add Product」または「Create Product」を選択

**Create Product（商品作成）時の設定**

| 設定項目 | データ型 | 説明 |
|---------|---------|------|
| Product Name | String(255) | 商品名 |
| Price | Decimal(10,2) | 価格 |
| Pricing Type | Enum | `one_time`, `monthly`, `quarterly`, `annually` |
| Course Modules | Array[UUID] | 含めるコースモジュール |

### 6.2 決済ゲートウェイ統合

#### 6.2.1 統合タイプ

**API Payment Gateway統合**
- ClickFunnels内で作成された商品の決済処理
- Stripeが最も一般的で推奨
- ClickFunnels内の最多機能を利用可能

**3rd-party Product Access統合**
- 外部プラットフォームで作成された商品の決済処理

#### 6.2.2 Payments AI

- ClickFunnels独自の決済システム
- すべてのプランに含まれる
- コース、メンバーシップ、商品の販売に対応

### 6.3 Product Data Model

#### 6.3.1 Product

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| id | UUID | Yes | 商品の一意識別子 |
| workspace_id | UUID | Yes | ワークスペースID |
| name | String(255) | Yes | 商品名 |
| description | Text | No | 商品説明 |
| price | Decimal(10,2) | Yes | 価格 |
| pricing_type | Enum | Yes | `one_time`, `monthly`, `quarterly`, `annually` |
| status | Enum | Yes | `active`, `inactive` |
| created_at | Timestamp | Yes | 作成日時 |
| updated_at | Timestamp | Yes | 更新日時 |

#### 6.3.2 Product Course Access

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | アクセス権の一意識別子 |
| product_id | UUID | 商品ID |
| course_id | UUID | コースID |
| module_ids | Array[UUID] | アクセス可能なモジュールIDの配列（空の場合は全モジュール） |
| created_at | Timestamp | 設定日時 |

#### 6.3.3 Purchase Actions

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | 購入アクションの一意識別子 |
| product_id | UUID | 商品ID |
| action_type | Enum | `enroll_course`, `send_email`, `add_tag`, `trigger_webhook` |
| course_id | UUID | 登録するコースID（action_type=enroll_courseの場合） |
| module_ids | Array[UUID] | アクセス付与するモジュールID（該当する場合） |
| is_active | Boolean | アクションの有効/無効 |

### 6.4 メンバーシップファネル

#### 6.4.1 構造

**Membership Access（メンバーシップアクセス）**
- 登録・サインアップに使用
- パスワード保護されたセキュアエリア

**Membership Area（メンバーシップエリア）**
- コースコンテンツがホストされる場所
- オプトインまたは購入内容に基づいてアクセス制御

#### 6.4.2 アクセス制御

- 顧客がオプトインまたは購入した内容に基づいてコンテンツへのアクセスを制御
- モジュール単位でのアクセス権管理
- チェックボックスでアクセス付与/削除

## 7. アナリティクスとレポート

### 7.1 アナリティクスアプリ

#### 7.1.1 アクセス方法

1. 左側メニューの「APPS」セクションで「Analytics」を探す
2. 「Reporting」をクリックしてページを開く

#### 7.1.2 レポートカテゴリ

| カテゴリ | 説明 |
|---------|------|
| Sales | 売上データ |
| Opt-ins | オプトイン情報 |
| Pageviews | ページビュー |
| Subscriptions | サブスクリプション |
| Course Progress | コース進捗 |

### 7.2 コース進捗レポート

#### 7.2.1 機能

- 顧客のオンラインコースへのエンゲージメントを追跡
- 受講者の進捗を監視
- 最も高い完了率のコースを特定

#### 7.2.2 表示内容

- アカウント内の利用可能なコースのリスト
- コースをクリックするとダッシュボードに移動
- 受講者の進捗とエンゲージメントを表示

### 7.3 コースダッシュボードメトリクス

#### 7.3.1 主要メトリクス

**Completion Average（平均完了率）**
- コースの完了率を計算・表示
- コースを完了した受講者の割合を分析

**Members（メンバー数）**
- コースに登録されているメンバーの総数

#### 7.3.2 個別受講者の進捗

- 各受講者の進捗状況を確認
- 受講者がどこで停止しているかを把握
- 受講者に連絡して状況確認が可能
- 行動パターンを発見した場合、コースを改善

### 7.4 Live View（ライブビュー）

#### 7.4.1 トラッキングイベント

| イベント | トリガー |
|---------|---------|
| Course Enrolled | ユーザーがコースに登録 |
| Course Completed | ユーザーがコースを完了 |
| Lesson Completed | ユーザーがレッスンを完了 |
| Lesson Viewed | ユーザーがレッスンを閲覧 |

### 7.5 分析の制限事項

#### 7.5.1 提供される機能

- 基本的な受講者進捗トラッキング
- レッスン完了の追跡
- 受講者がレッスンを完了したかどうかの確認

#### 7.5.2 提供されない機能

- ビデオエンゲージメント（ビデオヒートマップ）
- クイズスコア
- レッスンごとの滞在時間の詳細
- エンゲージメントスコアリング
- レッスンごとの時間レポート

### 7.6 Analytics Data Model

#### 7.6.1 Course Analytics Summary

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| course_id | UUID | コースID |
| total_enrollments | Integer | 総登録者数 |
| active_enrollments | Integer | アクティブな登録者数 |
| completion_average | Decimal(5,2) | 平均完了率（%） |
| total_completions | Integer | 総完了者数 |
| calculated_at | Timestamp | 計算日時 |

#### 7.6.2 Student Analytics

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| enrollment_id | UUID | 登録ID |
| total_lessons | Integer | 総レッスン数 |
| completed_lessons | Integer | 完了レッスン数 |
| completion_percentage | Decimal(5,2) | 完了率（%） |
| last_accessed_lesson_id | UUID | 最後にアクセスしたレッスンID |
| last_accessed_at | Timestamp | 最終アクセス日時 |
| total_time_spent_seconds | Integer | 総滞在時間（秒） |

#### 7.6.3 Lesson Analytics Event

| フィールド名 | データ型 | 説明 |
|------------|---------|------|
| id | UUID | イベントの一意識別子 |
| enrollment_id | UUID | 登録ID |
| lesson_id | UUID | レッスンID |
| event_type | Enum | `viewed`, `completed` |
| event_timestamp | Timestamp | イベント発生日時 |
| session_duration_seconds | Integer | セッション時間（秒） |

## 8. UI/UX要件

### 8.1 管理者インターフェース

#### 8.1.1 コース一覧ページ

**表示要素**
- コースカード（サムネイル、タイトル、説明、ステータス）
- 「Create New Course」ボタン
- フィルター（ステータス、作成日）
- ソート（名前、作成日、更新日）
- 検索機能

**アクション**
- コースの新規作成
- コースの編集
- コースの複製
- コースの削除
- コースプレビュー

#### 8.1.2 コース編集ページ

**タブ構成**

| タブ名 | 内容 |
|--------|------|
| Overview | コースの基本情報、設定 |
| Content | モジュール・レッスンの管理 |
| Members | 受講者の管理、登録・解除 |
| Access | 商品との連携設定 |
| Emails | メールテンプレート、オートメーション |
| Analytics | 進捗・完了率のレポート |
| Settings | 高度な設定、証明書、テーマ |

#### 8.1.3 Content タブ（モジュール・レッスン管理）

**表示要素**
- モジュールの階層ツリー表示
- ドラッグ&ドロップでの並び替え
- 各モジュール/レッスンの展開/折りたたみ
- ステータスインジケーター（Published, Draft, Drip, Lock）

**アクション**
- 「Add Module」ボタン
- 「Add Submodule」ボタン
- 「Add Lesson」ボタン
- 編集アイコン（鉛筆）
- 削除アイコン（ゴミ箱）
- ステータス変更ドロップダウン

#### 8.1.4 モジュール設定モーダル

**基本設定**
- Module Title（テキスト入力）
- Description（テキストエリア）
- Status（ドロップダウン: Published, Draft, Drip, Lock）

**Drip設定（Status=Dripの場合）**
- Drip Type（ラジオボタン: Days after purchase, Specific date）
- Drip Days（数値入力、Drip Type=Days after purchaseの場合）
- Release Date（日時ピッカー、Drip Type=Specific dateの場合）

**Lock設定（Status=Lockの場合）**
- Required Lesson（ドロップダウン: 完了が必要なレッスンを選択）

**Upgrade Offer設定**
- Enable Upgrade Offer（トグルスイッチ）
- Upgrade URL（URL入力、有効化された場合）

**ボタン**
- Save（保存）
- Cancel（キャンセル）

#### 8.1.5 レッスン設定モーダル

**基本設定**
- Lesson Title（テキスト入力）
- Description（テキストエリア）
- Status（ドロップダウン: Published, Draft, Drip, Lock）

**コンテンツ設定**
- Video（ビデオ選択ドロップダウン）
- Text Content（リッチテキストエディタ）
- Audio（オーディオファイルアップロード）
- Downloadable Files（ファイルアップロード）

**進捗設定**
- Required Time (Seconds)（数値入力、最小35）

**ドリップ・ロック設定**
- モジュールと同様の設定UI

**ボタン**
- Update Lesson（更新）
- Cancel（キャンセル）

#### 8.1.6 Members タブ（受講者管理）

**表示要素**
- 受講者リスト（名前、メールアドレス、登録日、進捗率）
- フィルター（ステータス、進捗率）
- 検索（名前、メールアドレス）

**アクション**
- 「Enroll Contact」ボタン
- 「Bulk Enroll」ボタン
- 個別受講者の詳細表示
- 受講者の登録解除
- モジュールアクセスの管理

#### 8.1.7 受講者詳細パネル

**表示情報**
- 受講者の基本情報
- 登録日
- 全体の進捗率
- レッスンごとの完了状況（チェックリスト）
- 最終アクセス日時

**モジュールアクセス管理**
- モジュールリスト
- 各モジュールのアクセス権（チェックボックス）
- 「Update Access」ボタン

#### 8.1.8 Access タブ（商品統合）

**表示要素**
- 連携済み商品リスト（商品名、価格、価格タイプ、含まれるモジュール）

**アクション**
- 「Add Product」ボタン
- 「Create Product」ボタン
- 商品の編集
- 商品の削除

#### 8.1.9 商品作成/編集モーダル

**フィールド**
- Product Name（テキスト入力）
- Price（数値入力）
- Pricing Type（ドロップダウン: One-Time, Monthly, Quarterly, Annually）
- Course Modules（チェックボックスリスト: 全モジュールを表示、複数選択可能）

**ボタン**
- Save Product（保存）
- Cancel（キャンセル）

### 8.2 受講者インターフェース

#### 8.2.1 コースホームページ

**ヘッダーセクション**
- コースタイトル
- コースの説明
- 進捗バー（全体の完了率）

**コンテンツセクション**
- モジュールカードのリスト
  - モジュールタイトル
  - モジュールの説明
  - レッスン数
  - ロック/ドリップアイコン（該当する場合）
  - 「Start」または「Continue」ボタン

**サイドバー（オプション）**
- コース構造ナビゲーション
- 完了したレッスンのチェックマーク
- 現在のレッスンのハイライト

#### 8.2.2 モジュールページ

**ヘッダーセクション**
- モジュールタイトル
- モジュールの説明
- パンくずリスト（Course > Module）

**レッスンリスト**
- レッスンカード
  - レッスンタイトル
  - レッスンの説明
  - 完了アイコン（完了済みの場合）
  - ロックアイコン（ロックされている場合）
  - ビデオサムネイル（該当する場合）
  - 「Start Lesson」ボタン

#### 8.2.3 レッスンページ

**ヘッダーセクション**
- レッスンタイトル
- パンくずリスト（Course > Module > Lesson）

**コンテンツエリア**
- ビデオプレーヤー（ビデオレッスンの場合）
- テキストコンテンツ
- オーディオプレーヤー（オーディオレッスンの場合）
- ダウンロード可能ファイルのリンク

**サイドバー**
- コース構造ナビゲーション
- 現在のレッスンのハイライト
- 完了チェックマーク

**レッスンステータスコントロール**
- 「Mark Complete」ボタン（まだ完了していない場合）
- 「Completed」表示（完了済みの場合）
- 「Go Back to Previous Lesson」リンク
- 「Restart Lesson」リンク

**ナビゲーションボタン**
- 「Previous Lesson」ボタン
- 「Next Lesson」ボタン

#### 8.2.4 アカウント設定（受講者）

**Courses and Downloads セクション**
- 登録済みコースのリスト
  - コースタイトル
  - 進捗率
  - 「Continue」ボタン
  - 完了証明書（コース完了済みの場合）
    - 「Download Certificate」ボタン

#### 8.2.5 レスポンシブデザイン

**デスクトップ（1200px以上）**
- サイドバー常時表示
- 2カラムレイアウト（コンテンツ + サイドバー）

**タブレット（600px - 1199px）**
- サイドバーはハンバーガーメニューで切り替え
- 1カラムレイアウト

**モバイル（599px以下）**
- サイドバーはハンバーガーメニューで切り替え
- 1カラムレイアウト
- タッチ最適化されたボタンサイズ

### 8.3 通知とフィードバック

#### 8.3.1 成功メッセージ

| アクション | メッセージ |
|-----------|-----------|
| コース作成 | "Course created successfully!" |
| モジュール作成 | "Module added successfully!" |
| レッスン作成 | "Lesson created successfully!" |
| 受講者登録 | "Contact enrolled successfully!" |
| レッスン完了 | "Lesson marked as complete!" |
| コース完了 | "Congratulations! You've completed the course!" |
| 証明書発行 | "Your certificate is ready for download!" |

#### 8.3.2 エラーメッセージ

| エラー | メッセージ |
|--------|-----------|
| 必須フィールド未入力 | "Please fill in all required fields." |
| ビデオアップロード失敗 | "Video upload failed. Please try again." |
| アクセス権限なし | "You don't have access to this content." |
| ロックされたレッスン | "Please complete [Lesson Name] before accessing this lesson." |
| ドリップコンテンツ | "This content will be available on [Date]." |

#### 8.3.3 確認ダイアログ

| アクション | メッセージ |
|-----------|-----------|
| コース削除 | "Are you sure you want to delete this course? This action cannot be undone." |
| モジュール削除 | "Delete this module and all its lessons?" |
| 受講者登録解除 | "Unenrolling this contact will remove their access and may result in loss of progress data. Continue?" |

#### 8.3.4 インジケーター

**ステータスバッジ**
- Published: 緑色のバッジ
- Draft: グレーのバッジ
- Drip: オレンジ色のバッジ（時計アイコン付き）
- Lock: 赤色のバッジ（鍵アイコン付き）

**進捗インジケーター**
- プログレスバー（0-100%）
- パーセンテージ表示
- 完了チェックマーク（緑色）

**ロード状態**
- スピナー（データ読み込み中）
- スケルトンスクリーン（初回読み込み時）
- 「Uploading...」（ビデオアップロード中）
- 「Processing...」（ビデオ処理中）

## 9. ワークフロー

### 9.1 コース作成ワークフロー

#### 9.1.1 基本フロー

```
1. ユーザーが「Create New Course」をクリック
   ↓
2. コース作成モーダルが表示
   - Course Title（必須）
   - Description（任意）
   - Course Type（Simple / Custom）
   ↓
3. 「Create Course」をクリック
   ↓
4. コースが作成される（ステータス: Published）
   ↓
5. コース編集ページにリダイレクト
```

#### 9.1.2 モジュール・レッスン追加フロー

```
1. Content タブで「Add Module」をクリック
   ↓
2. モジュール作成モーダルが表示
   - Module Title（必須）
   - Description（任意）
   - Status（Draft がデフォルト）
   ↓
3. 「Save」をクリック
   ↓
4. モジュールが作成される（ステータス: Draft）
   ↓
5. モジュール内で「Add Lesson」をクリック
   ↓
6. レッスン作成モーダルが表示
   - Lesson Title（必須）
   - Description（任意）
   - Status（Draft がデフォルト）
   - コンテンツ（Video, Text, Audio, Files）
   ↓
7. 「Create Lesson」をクリック
   ↓
8. レッスンが作成される（ステータス: Draft）
   ↓
9. 各モジュールとレッスンを個別にPublishする
```

**重要**: 新しいコースはPublishedステータスで作成されるが、新しいモジュールとレッスンはDraftステータスで作成される。コース全体を受講者に表示するには、各モジュールとレッスンを個別に公開する必要がある。

### 9.2 受講者登録ワークフロー

#### 9.2.1 手動登録フロー

```
1. Members タブで「Enroll Contact」をクリック
   ↓
2. 連絡先選択モーダルが表示
   - 連絡先を検索・選択
   - または複数選択（一括登録の場合）
   ↓
3. コースまたはモジュールを選択
   ↓
4. 登録日時を選択（即時 or スケジュール）
   ↓
5. 「Enroll」をクリック
   ↓
6. 受講者が登録される
   ↓
7. （オプション）ウェルカムメールが送信される
```

#### 9.2.2 商品購入による自動登録フロー

```
1. 顧客が商品を購入
   ↓
2. 決済処理が完了
   ↓
3. Purchase Actionsが実行される
   ↓
4. 顧客がコースに自動登録される
   ↓
5. 登録確認メールが送信される
   ↓
6. 顧客がコースにアクセス可能になる
```

#### 9.2.3 ワークフローによる登録フロー

```
1. トリガーイベントが発生（例: フォーム送信）
   ↓
2. ワークフローが開始
   ↓
3. 条件分岐（必要な場合）
   ↓
4. "Enroll in Course"ステップが実行される
   ↓
5. 連絡先がコースに登録される
   ↓
6. 次のワークフローステップ（例: メール送信）
```

### 9.3 受講者学習フロー

#### 9.3.1 基本学習フロー

```
1. 受講者がコースホームページにアクセス
   ↓
2. モジュールを選択
   ↓
3. モジュールページでレッスンを選択
   ↓
4. レッスンページでコンテンツを消費
   - ビデオ視聴
   - テキスト読解
   - オーディオ聴取
   - ファイルダウンロード
   ↓
5. 「Mark Complete」をクリック
   ↓
6. レッスンが完了としてマークされる
   ↓
7. 自動的に次のレッスンに進む
   ↓
8. すべてのレッスン完了でコース完了
   ↓
9. 修了証明書が発行される（有効化されている場合）
```

#### 9.3.2 ロックされたコンテンツアクセス試行フロー

```
1. 受講者がロックされたレッスンをクリック
   ↓
2. アクセス拒否メッセージが表示
   - "Please complete [Required Lesson] before accessing this lesson."
   ↓
3. 受講者が必須レッスンを完了
   ↓
4. ロックが自動的に解除される
   ↓
5. レッスンにアクセス可能になる
```

#### 9.3.3 ドリップコンテンツアクセス試行フロー

```
1. 受講者がまだ公開されていないドリップレッスンをクリック
   ↓
2. アクセス拒否メッセージが表示
   - "This content will be available on [Date]."
   または
   - "This content will be available [X] days after purchase."
   ↓
3. 公開日時が到来
   ↓
4. コンテンツが自動的に利用可能になる
   ↓
5. （オプション）通知メールが送信される
```

### 9.4 ビデオアップロードワークフロー

#### 9.4.1 ビデオアップロードフロー

```
1. Workspace Settings > My Assets > Course Videos に移動
   ↓
2. 「Upload Course Video」をクリック
   ↓
3. ビデオファイルを選択（最大10ファイル、各最大3GB）
   ↓
4. アップロード開始
   - ステータス: Uploading
   - プログレスバー表示
   ↓
5. アップロード完了
   ↓
6. ビデオ処理開始
   - ステータス: Processing
   ↓
7. 処理完了
   - ステータス: Ready
   - サムネイル生成
   ↓
8. ビデオがCourse Videosリストに表示される
```

#### 9.4.2 レッスンへのビデオ追加フロー

```
1. レッスン編集ページで「Select Video」をクリック
   ↓
2. Course Videosのリストが表示される
   ↓
3. ビデオを選択
   ↓
4. 「Add Video」をクリック
   ↓
5. ビデオがレッスンに追加される
   ↓
6. 「Update Lesson」をクリック
   ↓
7. レッスンが保存される
```

### 9.5 修了証明書発行フロー

#### 9.5.1 証明書有効化フロー

```
1. Course Settings > Certificates に移動
   ↓
2. 「Enable Certificates」トグルをオン
   ↓
3. 証明書テンプレートを選択または作成
   - テンプレート名
   - 証明書コンテンツ（HTML）
   - 変数（受講者名、コース名、完了日等）
   ↓
4. 「Save Settings」をクリック
   ↓
5. 証明書機能が有効化される
```

#### 9.5.2 証明書自動発行フロー

```
1. 受講者がすべてのレッスンを完了
   ↓
2. システムがコース完了を検出
   ↓
3. 完了率が100%であることを確認
   ↓
4. 証明書が自動生成される
   - PDF形式
   - 受講者情報を埋め込み
   ↓
5. 証明書がストレージに保存される
   ↓
6. 受講者に通知メールが送信される
   ↓
7. 受講者がAccount Settings > Courses and Downloadsから証明書をダウンロード可能
```

### 9.6 メールオートメーションワークフロー

#### 9.6.1 ウェルカムメールフロー

```
1. 受講者がコースに登録される
   ↓
2. トリガー: Course Enrolled イベント
   ↓
3. Email Automation Ruleが検出
   ↓
4. 遅延時間があれば待機（設定されている場合）
   ↓
5. ウェルカムメールが送信される
   - パーソナライズされた内容
   - コースへのリンク
   ↓
6. メール送信ログに記録
```

#### 9.6.2 レッスン完了祝福メールフロー

```
1. 受講者がレッスンを完了
   ↓
2. トリガー: Lesson Completed イベント
   ↓
3. Email Automation Ruleが検出
   ↓
4. 条件チェック（特定のレッスンか？）
   ↓
5. 祝福メールが送信される
   - レッスン名
   - 次のステップへの案内
   ↓
6. メール送信ログに記録
```

#### 9.6.3 コース完了祝福メールフロー

```
1. 受講者が最後のレッスンを完了
   ↓
2. システムがコース完了を検出
   ↓
3. トリガー: Course Completed イベント
   ↓
4. Email Automation Ruleが検出
   ↓
5. 祝福メールが送信される
   - コース完了のお祝い
   - 証明書へのリンク（有効化されている場合）
   - 次のコースへの案内（該当する場合）
   ↓
6. メール送信ログに記録
```

## 10. 技術要件

### 10.1 データベース設計

#### 10.1.1 主要テーブル

**courses**
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('published', 'draft')),
  course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('simple', 'custom')),
  theme_id UUID REFERENCES themes(id),
  enable_certificates BOOLEAN DEFAULT FALSE,
  certificate_template_id UUID REFERENCES certificate_templates(id),
  enable_comments BOOLEAN DEFAULT TRUE,
  comment_notifications BOOLEAN DEFAULT FALSE,
  sidebar_render_mode VARCHAR(20) DEFAULT 'classic' CHECK (sidebar_render_mode IN ('classic', 'ascension')),
  show_drip_modules BOOLEAN DEFAULT TRUE,
  completed_checkmark_color VARCHAR(7) DEFAULT '#00FF00',
  filter_drip_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  INDEX idx_courses_workspace (workspace_id),
  INDEX idx_courses_status (status)
);
```

**modules**
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  parent_module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('published', 'draft', 'drip', 'lock')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  drip_type VARCHAR(30) CHECK (drip_type IN ('days_after_purchase', 'specific_date')),
  drip_days INTEGER,
  drip_date TIMESTAMP,
  lock_type VARCHAR(30) CHECK (lock_type IN ('lesson_completion')),
  required_lesson_id UUID REFERENCES lessons(id),
  enable_upgrade_offer BOOLEAN DEFAULT FALSE,
  upgrade_url VARCHAR(2048),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_modules_course (course_id),
  INDEX idx_modules_parent (parent_module_id),
  INDEX idx_modules_sort (sort_order)
);
```

**lessons**
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('published', 'draft', 'drip', 'lock')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  required_time_seconds INTEGER CHECK (required_time_seconds IS NULL OR required_time_seconds >= 35),
  drip_type VARCHAR(30) CHECK (drip_type IN ('days_after_purchase', 'specific_date')),
  drip_days INTEGER,
  drip_date TIMESTAMP,
  lock_type VARCHAR(30) CHECK (lock_type IN ('lesson_completion')),
  required_lesson_id UUID REFERENCES lessons(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_lessons_module (module_id),
  INDEX idx_lessons_sort (sort_order)
);
```

**course_enrollments**
```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  enrollment_source VARCHAR(30) NOT NULL CHECK (enrollment_source IN ('manual', 'product_purchase', 'workflow')),
  product_id UUID REFERENCES products(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unenrolled')),
  unenrolled_at TIMESTAMP,
  UNIQUE (course_id, contact_id),
  INDEX idx_enrollments_course (course_id),
  INDEX idx_enrollments_contact (contact_id),
  INDEX idx_enrollments_status (status)
);
```

**lesson_progress**
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id),
  INDEX idx_progress_enrollment (enrollment_id),
  INDEX idx_progress_lesson (lesson_id),
  INDEX idx_progress_status (status)
);
```

**course_videos**
```sql
CREATE TABLE course_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('mp4', 'avi', 'mpeg')),
  duration_seconds INTEGER,
  storage_url VARCHAR(2048) NOT NULL,
  thumbnail_url VARCHAR(2048),
  upload_status VARCHAR(20) NOT NULL DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed')),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  INDEX idx_videos_workspace (workspace_id),
  INDEX idx_videos_status (upload_status)
);
```

**certificate_templates**
```sql
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  certificate_content TEXT NOT NULL,
  enable_auto_issue BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_cert_templates_course (course_id)
);
```

**issued_certificates**
```sql
CREATE TABLE issued_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  certificate_template_id UUID NOT NULL REFERENCES certificate_templates(id),
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  certificate_url VARCHAR(2048) NOT NULL,
  UNIQUE (enrollment_id),
  INDEX idx_issued_certs_enrollment (enrollment_id)
);
```

**products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  pricing_type VARCHAR(20) NOT NULL CHECK (pricing_type IN ('one_time', 'monthly', 'quarterly', 'annually')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_products_workspace (workspace_id),
  INDEX idx_products_status (status)
);
```

**product_course_access**
```sql
CREATE TABLE product_course_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_product_access_product (product_id),
  INDEX idx_product_access_course (course_id)
);
```

**module_access_control**
```sql
CREATE TABLE module_access_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  has_access BOOLEAN NOT NULL DEFAULT TRUE,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, module_id),
  INDEX idx_module_access_enrollment (enrollment_id),
  INDEX idx_module_access_module (module_id)
);
```

**email_automation_rules**
```sql
CREATE TABLE email_automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('enrollment', 'lesson_complete', 'module_complete', 'course_complete')),
  trigger_lesson_id UUID REFERENCES lessons(id),
  trigger_module_id UUID REFERENCES modules(id),
  email_template_id UUID NOT NULL REFERENCES email_templates(id),
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_email_rules_course (course_id),
  INDEX idx_email_rules_trigger (trigger_type)
);
```

**course_analytics_summary**
```sql
CREATE TABLE course_analytics_summary (
  course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  total_enrollments INTEGER NOT NULL DEFAULT 0,
  active_enrollments INTEGER NOT NULL DEFAULT 0,
  completion_average DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_completions INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**lesson_analytics_events**
```sql
CREATE TABLE lesson_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('viewed', 'completed')),
  event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  session_duration_seconds INTEGER DEFAULT 0,
  INDEX idx_analytics_events_enrollment (enrollment_id),
  INDEX idx_analytics_events_lesson (lesson_id),
  INDEX idx_analytics_events_type (event_type),
  INDEX idx_analytics_events_timestamp (event_timestamp)
);
```

### 10.2 APIエンドポイント

#### 10.2.1 コース管理API

**GET /api/courses**
- クエリパラメータ: workspace_id, status, page, limit
- レスポンス: コース一覧

**POST /api/courses**
- リクエストボディ: { title, description, course_type, workspace_id }
- レスポンス: 作成されたコース

**GET /api/courses/:id**
- レスポンス: コース詳細

**PUT /api/courses/:id**
- リクエストボディ: コース更新情報
- レスポンス: 更新されたコース

**DELETE /api/courses/:id**
- レスポンス: 削除成功メッセージ

#### 10.2.2 モジュール管理API

**GET /api/courses/:courseId/modules**
- レスポンス: モジュール一覧（階層構造）

**POST /api/courses/:courseId/modules**
- リクエストボディ: { title, description, status, parent_module_id, ... }
- レスポンス: 作成されたモジュール

**PUT /api/modules/:id**
- リクエストボディ: モジュール更新情報
- レスポンス: 更新されたモジュール

**DELETE /api/modules/:id**
- レスポンス: 削除成功メッセージ

**PUT /api/modules/reorder**
- リクエストボディ: { modules: [{ id, sort_order }] }
- レスポンス: 並び替え成功メッセージ

#### 10.2.3 レッスン管理API

**GET /api/modules/:moduleId/lessons**
- レスポンス: レッスン一覧

**POST /api/modules/:moduleId/lessons**
- リクエストボディ: { title, description, status, ... }
- レスポンス: 作成されたレッスン

**GET /api/lessons/:id**
- レスポンス: レッスン詳細（コンテンツ含む）

**PUT /api/lessons/:id**
- リクエストボディ: レッスン更新情報
- レスポンス: 更新されたレッスン

**DELETE /api/lessons/:id**
- レスポンス: 削除成功メッセージ

**PUT /api/lessons/reorder**
- リクエストボディ: { lessons: [{ id, sort_order }] }
- レスポンス: 並び替え成功メッセージ

#### 10.2.4 受講者管理API

**GET /api/courses/:courseId/enrollments**
- クエリパラメータ: status, page, limit
- レスポンス: 受講者一覧

**POST /api/courses/:courseId/enrollments**
- リクエストボディ: { contact_ids: [], enrollment_source, scheduled_at }
- レスポンス: 登録成功メッセージ

**GET /api/enrollments/:id**
- レスポンス: 受講者詳細（進捗情報含む）

**DELETE /api/enrollments/:id**
- レスポンス: 登録解除成功メッセージ

**PUT /api/enrollments/:id/module-access**
- リクエストボディ: { module_ids: [{ module_id, has_access }] }
- レスポンス: アクセス権更新成功メッセージ

#### 10.2.5 進捗トラッキングAPI

**GET /api/enrollments/:enrollmentId/progress**
- レスポンス: 全体進捗およびレッスンごとの進捗

**POST /api/lessons/:lessonId/mark-complete**
- リクエストボディ: { enrollment_id }
- レスポンス: 完了マーク成功、次のレッスン情報

**POST /api/lessons/:lessonId/track-time**
- リクエストボディ: { enrollment_id, session_duration_seconds }
- レスポンス: トラッキング成功

**GET /api/courses/:courseId/analytics**
- レスポンス: コース全体の分析データ

#### 10.2.6 ビデオ管理API

**GET /api/course-videos**
- クエリパラメータ: workspace_id, page, limit
- レスポンス: ビデオ一覧

**POST /api/course-videos/upload**
- リクエストボディ: FormData（ビデオファイル、メタデータ）
- レスポンス: アップロード開始、ビデオID

**GET /api/course-videos/:id/status**
- レスポンス: アップロード・処理ステータス

**DELETE /api/course-videos/:id**
- レスポンス: 削除成功メッセージ

**POST /api/lessons/:lessonId/add-video**
- リクエストボディ: { course_video_id }
- レスポンス: ビデオ追加成功

#### 10.2.7 証明書API

**GET /api/courses/:courseId/certificate-template**
- レスポンス: 証明書テンプレート

**POST /api/courses/:courseId/certificate-template**
- リクエストボディ: { template_name, certificate_content, enable_auto_issue }
- レスポンス: 作成された証明書テンプレート

**PUT /api/certificate-templates/:id**
- リクエストボディ: テンプレート更新情報
- レスポンス: 更新された証明書テンプレート

**GET /api/enrollments/:enrollmentId/certificate**
- レスポンス: 発行済み証明書情報

**POST /api/enrollments/:enrollmentId/issue-certificate**
- レスポンス: 証明書発行、ダウンロードURL

#### 10.2.8 商品統合API

**GET /api/courses/:courseId/products**
- レスポンス: 連携済み商品一覧

**POST /api/courses/:courseId/products**
- リクエストボディ: { name, price, pricing_type, module_ids }
- レスポンス: 作成された商品

**PUT /api/products/:id/course-access**
- リクエストボディ: { course_id, module_ids }
- レスポンス: アクセス権設定成功

**DELETE /api/products/:id/course-access/:courseId**
- レスポンス: アクセス権削除成功

#### 10.2.9 メール管理API

**GET /api/courses/:courseId/email-templates**
- レスポンス: メールテンプレート一覧

**POST /api/courses/:courseId/email-templates**
- リクエストボディ: { template_name, email_type, subject_line, email_body, from_name, from_email }
- レスポンス: 作成されたメールテンプレート

**PUT /api/email-templates/:id**
- リクエストボディ: テンプレート更新情報
- レスポンス: 更新されたメールテンプレート

**GET /api/courses/:courseId/email-automation-rules**
- レスポンス: メールオートメーションルール一覧

**POST /api/courses/:courseId/email-automation-rules**
- リクエストボディ: { trigger_type, email_template_id, delay_days, delay_hours, ... }
- レスポンス: 作成されたルール

**PUT /api/email-automation-rules/:id**
- リクエストボディ: ルール更新情報
- レスポンス: 更新されたルール

**DELETE /api/email-automation-rules/:id**
- レスポンス: 削除成功メッセージ

### 10.3 フロントエンド技術スタック

#### 10.3.1 推奨技術

- **フレームワーク**: React 18+ / Next.js 14+
- **状態管理**: Zustand / Redux Toolkit
- **UIライブラリ**: Material-UI / shadcn/ui
- **ドラッグ&ドロップ**: react-beautiful-dnd / dnd-kit
- **フォーム管理**: React Hook Form + Zod
- **リッチテキストエディタ**: TipTap / Slate
- **ビデオプレーヤー**: Video.js / Plyr
- **日時ピッカー**: react-datepicker
- **チャート**: Recharts / Chart.js

#### 10.3.2 レスポンシブブレークポイント

```css
/* モバイル */
@media (max-width: 599px) { ... }

/* タブレット */
@media (min-width: 600px) and (max-width: 1199px) { ... }

/* デスクトップ */
@media (min-width: 1200px) { ... }

/* ワイドスクリーン */
@media (min-width: 1500px) { ... }
```

### 10.4 バックエンド技術スタック

#### 10.4.1 推奨技術

- **言語**: Node.js / Python / Go
- **フレームワーク**: Express / NestJS / FastAPI / Gin
- **データベース**: PostgreSQL 14+
- **ORM**: Prisma / TypeORM / SQLAlchemy
- **認証**: JWT / OAuth 2.0
- **ファイルストレージ**: AWS S3 / Google Cloud Storage / MinIO
- **ビデオ処理**: FFmpeg
- **バックグラウンドジョブ**: Bull / Celery
- **メール送信**: SendGrid / AWS SES / Resend
- **PDF生成**: Puppeteer / wkhtmltopdf

#### 10.4.2 ビデオ処理パイプライン

```
1. ビデオアップロード
   ↓
2. ストレージに保存（S3等）
   ↓
3. バックグラウンドジョブをキュー
   ↓
4. FFmpegで処理
   - トランスコード（複数解像度）
   - サムネイル生成
   - メタデータ抽出
   ↓
5. 処理済みファイルをストレージに保存
   ↓
6. データベースのステータスを更新（Ready）
   ↓
7. 通知（該当する場合）
```

### 10.5 セキュリティ要件

#### 10.5.1 認証・認可

- すべてのAPIエンドポイントは認証が必要
- ロールベースアクセス制御（RBAC）
  - Admin: すべての操作が可能
  - Instructor: 自分のコースのみ管理可能
  - Student: 登録済みコースの閲覧・進捗記録のみ
- JWTトークンの有効期限: 24時間
- リフレッシュトークンの有効期限: 30日

#### 10.5.2 データ保護

- すべての通信はHTTPS
- パスワードはbcrypt（salt rounds: 10）でハッシュ化
- 個人情報はGDPR/CCPA準拠
- データ削除リクエストへの対応（30日以内）

#### 10.5.3 ビデオセキュリティ

- 署名付きURL（有効期限: 1時間）
- HLS暗号化（AES-128）
- ドメイン制限（Refererチェック）
- ダウンロード防止（該当する場合）

#### 10.5.4 レート制限

| エンドポイント | 制限 |
|--------------|------|
| ビデオアップロード | 10リクエスト/時間 |
| メール送信 | 100リクエスト/時間 |
| 一般API | 1000リクエスト/時間 |

### 10.6 パフォーマンス要件

#### 10.6.1 応答時間

| 操作 | 目標 |
|-----|------|
| ページロード | < 2秒 |
| API応答 | < 500ms |
| ビデオ開始 | < 3秒 |
| 検索結果 | < 1秒 |

#### 10.6.2 スケーラビリティ

- 10,000同時受講者をサポート
- 100,000コース登録をサポート
- 1,000,000レッスン進捗記録をサポート

#### 10.6.3 キャッシング戦略

| データ | キャッシュ期間 |
|--------|-------------|
| コース一覧 | 5分 |
| コース詳細 | 5分 |
| 受講者進捗 | リアルタイム（キャッシュなし） |
| ビデオメタデータ | 1時間 |
| 分析データ | 15分 |

## 11. 参考情報・出典

本要件定義書は、以下のClickFunnels公式ドキュメントおよびリソースを参照して作成されました：

### 公式ドキュメント
- [Getting Started with Courses](https://support.myclickfunnels.com/docs/getting-started-with-courses)
- [Managing Course Enrollment](https://support.myclickfunnels.com/docs/managing-course-enrollment)
- [How to Customize the Course Theme](https://support.myclickfunnels.com/docs/courses-how-to-customize-the-course-theme)
- [How to Manage Course Modules](https://support.myclickfunnels.com/docs/how-to-manage-course-modules)
- [Courses Module Settings](https://support.myclickfunnels.com/docs/courses-module-settings)
- [Using the Page Editor to Design Your Course](https://support.myclickfunnels.com/docs/using-the-page-editor-to-design-your-course)
- [Courses: Universal Sections](https://support.myclickfunnels.com/docs/courses-universal-sections)
- [How to Upload and Use Course Videos](https://support.myclickfunnels.com/docs/how-to-upload-and-use-course-videos-1)
- [Adding Course Access to Products](https://support.myclickfunnels.com/docs/adding-course-access-to-products)

### レビュー・分析記事
- [ClickFunnels 2.0 Review (2026)](https://www.learningrevolution.net/clickfunnels-review/)
- [ClickFunnels Course Hosting: Full Guide for 2025](https://supplygem.com/clickfunnels-online-course/)
- [How to Set Up Course Completion Certificates in ClickFunnels](https://blog.repairmyfunnel.com/home/course-completion-certificates-clickfunnels-2-setup-guide)
- [How to Automate Emails Using Clickfunnels](https://www.mailmodo.com/guides/clickfunnels-email-automation/)
- [ClickFunnels 2.0 Analytics, Reporting & Statistics (2025)](https://supplygem.com/clickfunnels-analytics/)

### 機能概要
- [Online Course Builder - Launch & Sell Online Courses](https://www.clickfunnels.com/features/online-courses)
- [Page Editor For Custom Build Sales Funnel](https://www.clickfunnels.com/features/clickfunnels-editor)
- [Email Funnel Builder with Automation](https://www.clickfunnels.com/apps/email)

---

**作成日**: 2025-12-09
**バージョン**: 1.0
**対象プラットフォーム**: ClickFunnels 2.0クローン