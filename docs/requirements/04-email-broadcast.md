# メール・ブロードキャスト機能要件定義書

## 1. 概要

本ドキュメントは、ClickFunnels 2.0のメール・ブロードキャスト機能のクローンアプリケーション開発における機能要件を定義する。メールマーケティング機能は、ワンタイム配信（ブロードキャスト）、自動化ワークフロー、テンプレート管理、パーソナライゼーション、配信性最適化、分析・レポーティングを包括的にカバーする。

### 1.1 ブロードキャストとは

ブロードキャストは、選択したオーディエンスに対して送信される一回限りのメールである。以下のような用途に使用される：

- プロモーションキャンペーン
- ニュースレター配信
- 新商品発表
- ウェビナー招待
- 重要なアップデート告知

ブロードキャストは自動化されたメールシーケンスとは異なり、即時送信またはスケジュール送信される時間制約のあるメッセージングに最適である。

### 1.2 対象ユーザー

- マーケティング担当者
- セールスファネル運営者
- オンラインビジネスオーナー
- メールマーケティングキャンペーン管理者

### 1.3 システム構成

- フロントエンド：メール作成・管理UI、ドラッグ&ドロップエディタ
- バックエンド：メール配信エンジン、SMTP統合、トラッキングシステム
- データベース：コンタクト管理、テンプレート保存、分析データ蓄積
- 外部連携：SMTP プロバイダー（SendGrid、Mailgun、Amazon SES等）、DNS管理

## 2. 機能一覧

### 2.1 コア機能

| 機能ID | 機能名 | 優先度 | 説明 |
|--------|--------|--------|------|
| BC-001 | ブロードキャスト作成 | 高 | 新規ブロードキャストの作成 |
| BC-002 | ブロードキャスト管理 | 高 | ブロードキャストの編集、削除、複製 |
| BC-003 | オーディエンス設定 | 高 | 送信対象の選択・フィルタリング |
| BC-004 | メールデザイン | 高 | ドラッグ&ドロップエディタによるメール作成 |
| BC-005 | テンプレート管理 | 中 | メールテンプレートの作成・保存・再利用 |
| BC-006 | パーソナライゼーション | 高 | マージタグによる動的コンテンツ挿入 |
| BC-007 | テスト送信 | 高 | 本番送信前のテストメール送信 |
| BC-008 | スケジュール送信 | 高 | 指定日時での自動送信 |
| BC-009 | A/Bテスト | 中 | 件名の分割テスト |
| BC-010 | パフォーマンス分析 | 高 | 開封率、クリック率、売上追跡 |

### 2.2 設定・管理機能

| 機能ID | 機能名 | 優先度 | 説明 |
|--------|--------|--------|------|
| ES-001 | 一般設定 | 高 | 送信元アドレス、返信先アドレス設定 |
| ES-002 | ドメイン認証 | 高 | SPF、DKIM、DMARC設定 |
| ES-003 | SMTP連携 | 高 | カスタムSMTPプロバイダー接続 |
| ES-004 | 配信停止管理 | 高 | 配信停止リンク・ページ管理 |
| ES-005 | システムメール | 中 | 自動送信メールのカスタマイズ |
| ES-006 | コンプライアンス設定 | 高 | CAN-SPAM法対応（連絡先住所表示） |
| ES-007 | スマート送信 | 中 | 送信速度調整による配信性向上 |

## 3. 各機能の詳細要件

### 3.1 ブロードキャスト作成（BC-001）

#### 3.1.1 UIコンポーネント

**メインナビゲーション**
- 左サイドメニューに「Email」アプリアイコン
- クリックでブロードキャスト一覧ページへ遷移

**ブロードキャスト一覧ページ**
- ヘッダー：
  - ページタイトル「Broadcasts」
  - 右上に「Create Broadcast」ボタン（プライマリアクション）
- ブロードキャスト一覧テーブル：
  - 列：ブロードキャスト名、ステータス、送信日時、開封率、クリック率、アクション
  - フィルター：すべて / 下書き / 送信済み / スケジュール済み
  - ソート機能：作成日、名前、送信日時
  - 検索機能：ブロードキャスト名で検索

**新規作成モーダル**
- モーダルタイトル：「Create New Broadcast」
- 入力フィールド：
  - `Broadcast Name`（必須、テキスト入力、最大255文字）
- アクションボタン：
  - 「Cancel」（セカンダリボタン）
  - 「Create Broadcast」（プライマリボタン、disabled状態は名前未入力時）

#### 3.1.2 データモデル

```typescript
interface Broadcast {
  id: string;
  workspaceId: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  emailContent: EmailContent;
  audienceFilter: AudienceFilter;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // A/Bテスト関連
  subjectLineTest?: {
    enabled: boolean;
    variants: SubjectVariant[];
    testPercentage: number; // 10-50%
    winnerMetric: 'open_rate' | 'click_rate';
    winnerSentAt?: Date;
  };

  // スマート送信
  smartSending?: {
    enabled: boolean;
    sendingRate: number; // メール/時間
    startTime?: Date;
    endTime?: Date;
  };

  // トピック（配信停止管理用）
  topics?: string[];
}

interface SubjectVariant {
  id: string;
  subject: string;
  percentage?: number;
  isWinner?: boolean;
  stats?: {
    sent: number;
    opened: number;
    openRate: number;
  };
}

interface EmailContent {
  html: string;
  json: any; // エディタの内部形式
  plainText?: string;
}

interface AudienceFilter {
  filterType: 'all' | 'segment' | 'custom';
  segmentId?: string;
  customFilter?: FilterRule[];
  excludeUnsubscribed: boolean;
  excludeBounced: boolean;
  estimatedCount?: number;
}

interface FilterRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'exists' | 'not_exists' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}
```

#### 3.1.3 ワークフロー

1. ユーザーが「Create Broadcast」ボタンをクリック
2. モーダルが表示される
3. ブロードキャスト名を入力
4. 「Create Broadcast」ボタンをクリック
5. システムがブロードキャストレコードを作成（status: 'draft'）
6. ブロードキャスト詳細ページへリダイレクト

#### 3.1.4 バリデーションルール

- ブロードキャスト名：
  - 必須
  - 最小1文字、最大255文字
  - ワークスペース内でユニークである必要はない（同名可）

### 3.2 オーディエンス設定（BC-003）

#### 3.2.1 UIコンポーネント

**オーディエンス設定セクション**
- セクションタイトル：「Audience」
- 「Edit Audience」ボタン
- 推定配信数表示：「Estimated Recipients: 1,234」

**オーディエンスフィルタービルダー**
- フィルタータイプ選択：
  - ラジオボタン：
    - 「All Contacts」- すべてのコンタクト
    - 「Segment」- 既存のセグメント選択
    - 「Custom Filter」- カスタムフィルター作成
- セグメント選択（「Segment」選択時）：
  - ドロップダウンリスト
  - 既存セグメント一覧表示
- カスタムフィルター（「Custom Filter」選択時）：
  - フィルタールール追加インターフェース
  - 各ルール：
    - フィールド選択（ドロップダウン）
    - オペレーター選択（ドロップダウン）
    - 値入力（テキスト、数値、日付など、フィールドタイプに応じる）
    - AND/OR 切り替え
    - 削除ボタン
  - 「Add Rule」ボタン
  - 「Add Group」ボタン（ネストされたフィルター用）

**除外設定**
- チェックボックス：
  - 「Exclude Unsubscribed Contacts」（デフォルト：ON）
  - 「Exclude Bounced Email Addresses」（デフォルト：ON）

**トピック設定**
- セクション：「Email Topics」
- 説明：「Contacts can subscribe/unsubscribe to specific topics」
- トピック選択：
  - マルチセレクトドロップダウン
  - 既存トピック一覧
  - 新規トピック作成機能

**リアルタイムプレビュー**
- オーディエンス数カウンター
- フィルター変更時にリアルタイム更新
- API呼び出しでカウント取得（debounce 500ms）

#### 3.2.2 データモデル

```typescript
interface Contact {
  id: string;
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  // ステータス
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  emailStatus: 'valid' | 'invalid' | 'bounced_permanent' | 'bounced_temporary';

  // カスタムフィールド
  customFields: Record<string, any>;

  // タグ
  tags: string[];

  // トピック購読
  subscribedTopics: string[];
  unsubscribedTopics: string[];

  // メタデータ
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  lastEmailedAt?: Date;
  lastOpenedAt?: Date;
  lastClickedAt?: Date;
}

interface Segment {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  filterRules: FilterRule[];
  contactCount?: number;
  isStatic: boolean; // 静的セグメント（手動追加）vs 動的セグメント（フィルター自動適用）
  createdAt: Date;
  updatedAt: Date;
}

interface Topic {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  subscriberCount: number;
  createdAt: Date;
}
```

#### 3.2.3 フィルター可能フィールド

**標準フィールド**
- Email
- First Name
- Last Name
- Phone
- Subscription Status
- Email Status
- Tags（contains, not contains）
- Created Date
- Last Emailed Date
- Last Opened Date
- Last Clicked Date
- Subscribed Topics

**カスタムフィールド**
- ユーザー定義フィールド（フォームで収集）
- 動的に取得・表示

#### 3.2.4 フィルターオペレーター

| フィールドタイプ | 利用可能オペレーター |
|-----------------|---------------------|
| テキスト | equals, not_equals, contains, not_contains, starts_with, ends_with, exists, not_exists |
| 数値 | equals, not_equals, greater_than, less_than, greater_than_or_equal, less_than_or_equal, exists, not_exists |
| 日付 | equals, not_equals, before, after, between, exists, not_exists |
| ブーリアン | is_true, is_false, exists, not_exists |
| 配列（タグ等） | contains, not_contains, contains_all, contains_any |

#### 3.2.5 ワークフロー

1. ブロードキャスト詳細ページで「Edit Audience」をクリック
2. オーディエンスフィルタービルダーが開く
3. フィルタータイプを選択
4. フィルター条件を設定
5. リアルタイムで推定配信数が更新される
6. 「Save」ボタンをクリックして保存
7. ブロードキャスト詳細ページに戻る

### 3.3 メールデザイン（BC-004）

#### 3.3.1 UIコンポーネント

**メールエディタページ**
- ヘッダー：
  - 左：「Back to Broadcast」リンク
  - 中央：ブロードキャスト名
  - 右：
    - 「Send Test」ボタン
    - 「Save」ボタン
    - 「Preview」ボタン
- 2カラムレイアウト：
  - 左パネル（30%）：コンテンツブロック
  - 右パネル（70%）：エディタキャンバス

**左パネル - コンテンツブロック**

*基本ブロック：*
- Text（テキスト）
- Image（画像）
- Button（ボタン）
- Divider（区切り線）
- Spacer（スペース）

*レイアウトブロック：*
- Column（2カラム、3カラム、4カラム）
- Row（行）

*コンテンツブロック：*
- Header（ヘッダー）
- Footer（フッター）
- Hero（ヒーローイメージ）
- Product（商品カード）
- Testimonial（お客様の声）
- Social（ソーシャルアイコン）
- Video（動画埋め込み）
- HTML（カスタムHTML）

**右パネル - エディタキャンバス**
- デバイスプレビュー切り替え：
  - Desktop
  - Mobile
  - Tablet
- ドラッグ&ドロップ領域
- ブロック選択時の編集ツールバー
- ブロック設定サイドバー（右端）

**ブロック設定サイドバー**

各ブロックタイプごとに異なる設定オプション：

*テキストブロック：*
- リッチテキストエディタ
- フォント選択
- フォントサイズ
- カラー
- 配置（左、中央、右）
- 行間
- パディング
- マージタグ挿入ボタン

*画像ブロック：*
- 画像アップロード/URL指定
- 代替テキスト
- リンクURL
- 幅（%またはpx）
- 配置
- パディング

*ボタンブロック：*
- ボタンテキスト
- リンクURL
- 背景色
- テキストカラー
- ボーダー設定
- ボーダー半径
- パディング
- 配置

**件名設定**
- 件名入力フィールド
- プレビューテキスト入力フィールド
- 「Merge Tags」ボタン（件名にパーソナライゼーション追加）

**A/Bテスト設定（件名）**
- 「Enable Subject Line Test」トグル
- バリエーション追加：
  - Variant A（オリジナル）
  - Variant B（追加可能）
  - 最大5バリエーション
- テスト配信割合：スライダー（10-50%）
- 勝者判定基準：
  - ラジオボタン：「Open Rate」「Click Rate」
- 勝者自動送信時間：ドロップダウン（1時間後、2時間後、4時間後、6時間後、12時間後、24時間後）

#### 3.3.2 エディタ機能

**ドラッグ&ドロップ**
- 左パネルからキャンバスへブロックをドラッグ
- キャンバス内でブロックの並べ替え
- ネストされたブロック（カラム内のブロック）のサポート

**ブロック操作**
- ホバー時に表示される操作アイコン：
  - 移動（ドラッグハンドル）
  - 複製
  - 削除
  - 設定

**元に戻す/やり直す**
- ツールバーにアイコン
- キーボードショートカット：Cmd+Z / Cmd+Shift+Z

**レスポンシブデザイン**
- デバイスごとのプレビュー
- モバイル専用の表示/非表示設定
- 自動的にモバイルフレンドリーなHTML生成

**保存**
- 自動保存（30秒ごと）
- 手動保存ボタン
- 保存状態インジケーター（「Saved」「Saving...」「Unsaved changes」）

#### 3.3.3 データモデル

```typescript
interface EmailDesign {
  version: string; // エディタバージョン
  subject: string;
  previewText?: string;

  // エディタJSON（内部形式）
  blocks: Block[];

  // 生成されたHTML
  html: string;

  // プレーンテキスト版（自動生成）
  plainText: string;

  // グローバルスタイル
  globalStyles: {
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    linkColor?: string;
    containerWidth?: number;
  };
}

interface Block {
  id: string;
  type: BlockType;
  properties: Record<string, any>;
  children?: Block[];
}

type BlockType =
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'row'
  | 'header'
  | 'footer'
  | 'hero'
  | 'product'
  | 'testimonial'
  | 'social'
  | 'video'
  | 'html';

// 各ブロックタイプの例

interface TextBlock extends Block {
  type: 'text';
  properties: {
    content: string; // HTML
    fontSize: number;
    fontFamily?: string;
    color?: string;
    textAlign: 'left' | 'center' | 'right';
    lineHeight?: number;
    padding?: Spacing;
  };
}

interface ImageBlock extends Block {
  type: 'image';
  properties: {
    src: string;
    alt: string;
    href?: string;
    width: string | number;
    align: 'left' | 'center' | 'right';
    padding?: Spacing;
  };
}

interface ButtonBlock extends Block {
  type: 'button';
  properties: {
    text: string;
    href: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    padding?: Spacing;
    align: 'left' | 'center' | 'right';
    fullWidth?: boolean;
  };
}

interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
```

#### 3.3.4 テンプレート

**テンプレートカテゴリ**
- Promotional（プロモーション）
- Newsletter（ニュースレター）
- Invitation（招待）
- Product Launch（新商品発表）
- Order Confirmation（注文確認）
- Blank（空白）

**テンプレート選択フロー**
1. ブロードキャスト作成後、「Design Email」をクリック
2. テンプレート選択モーダル表示
3. カテゴリでフィルター
4. テンプレートプレビュー表示
5. 「Use This Template」をクリック
6. エディタにテンプレートが読み込まれる

### 3.4 パーソナライゼーション（BC-006）

#### 3.4.1 マージタグ概要

マージタグは、メールコンテンツに動的にコンタクト情報を挿入するためのプレースホルダーである。送信時に実際のコンタクトデータに置き換えられる。

**マージタグの形式**
- 標準形式：`{{contact.field_name}}`
- フォールバック付き：`{{contact.field_name | fallback: "Default Value"}}`

#### 3.4.2 標準マージタグ

| マージタグ | 説明 | 例 |
|-----------|------|-----|
| `{{contact.email}}` | メールアドレス | user@example.com |
| `{{contact.first_name}}` | 名 | 太郎 |
| `{{contact.last_name}}` | 姓 | 山田 |
| `{{contact.full_name}}` | フルネーム | 山田 太郎 |
| `{{contact.phone}}` | 電話番号 | 090-1234-5678 |

#### 3.4.3 カスタムマージタグ

ユーザー定義のカスタムフィールドもマージタグとして使用可能：
- 形式：`{{contact.custom_field_name}}`
- 例：`{{contact.company_name}}`、`{{contact.membership_type}}`

**注意事項**
- カスタムフィールド名は小文字で指定する必要がある
- スペースはアンダースコアに置き換える
- 例：「Company Name」→ `company_name`

#### 3.4.4 配信停止リンク

必須マージタグ：
- `{{unsubscribe_link}}`：配信停止ページへのリンク
- `{{preferences_link}}`：配信設定ページへのリンク

使用例：
```html
<a href="{{unsubscribe_link}}">配信停止</a>
<a href="{{preferences_link}}">メール設定を管理</a>
```

#### 3.4.5 UIコンポーネント

**マージタグ挿入ボタン**
- 件名入力フィールドの横に「Merge Tags」リンク
- テキストブロックのツールバーに「+ Contact Field」ボタン

**マージタグ選択ドロップダウン**
- セクション分け：
  - Standard Fields（標準フィールド）
  - Custom Fields（カスタムフィールド）
  - System Links（配信停止リンク等）
- 各タグにホバーで説明ツールチップ表示
- クリックで挿入

**フォールバック設定モーダル**
- マージタグ選択後、オプションで表示
- 「Default Value if Empty」入力フィールド
- 例：名前が未設定の場合「お客様」と表示

#### 3.4.6 データ処理

**送信時の置き換えロジック**
1. メールHTMLをパース
2. すべてのマージタグを検出
3. 各受信者のコンタクトデータを取得
4. マージタグを実際の値に置き換え
5. 値が存在しない場合：
   - フォールバック値が設定されている場合：フォールバック値を使用
   - フォールバック値がない場合：空文字列（タグは削除）

**テストメール時の挙動**
- テストメール送信時はマージタグは置き換えられない
- または、テスト用のダミーデータを使用（設定可能）

#### 3.4.7 バリデーション

- 送信前チェック：
  - 必須マージタグ（配信停止リンク）の存在確認
  - マージタグの構文エラーチェック
  - 存在しないフィールド名の警告

### 3.5 テスト送信（BC-007）

#### 3.5.1 UIコンポーネント

**「Send Test」ボタン**
- メールエディタヘッダーに配置
- クリックでテスト送信モーダル表示

**テスト送信モーダル**
- モーダルタイトル：「Send Test Email」
- 入力フィールド：
  - `Test Email Addresses`（必須）
  - プレースホルダー：「Enter email addresses separated by commas」
  - 複数アドレス入力可（カンマ区切り）
  - バリデーション：メールアドレス形式チェック
- チェックボックス：
  - 「Use sample contact data for merge tags」
  - ONの場合、マージタグをサンプルデータで置き換え
  - OFFの場合、マージタグはそのまま表示
- アクションボタン：
  - 「Cancel」
  - 「Send Test」（プライマリボタン）

**送信後のフィードバック**
- 成功時：
  - トーストメッセージ：「Test email sent to [email addresses]」
  - 緑色のチェックマークアイコン
- エラー時：
  - エラーメッセージ表示
  - 赤色の警告アイコン

#### 3.5.2 サンプルデータ

マージタグのテスト用サンプルデータ：

```typescript
const SAMPLE_CONTACT = {
  email: 'test@example.com',
  first_name: '太郎',
  last_name: '山田',
  full_name: '山田 太郎',
  phone: '090-1234-5678',
  // カスタムフィールドもサンプル値を生成
};
```

#### 3.5.3 ワークフロー

1. ユーザーが「Send Test」ボタンをクリック
2. テスト送信モーダルが表示される
3. テストメールアドレスを入力（複数可）
4. オプション：サンプルデータ使用を選択
5. 「Send Test」ボタンをクリック
6. バリデーション実行
7. メール送信処理
8. 送信結果のフィードバック表示

#### 3.5.4 技術仕様

- テストメールは通常の送信パイプラインを使用
- トラッキングピクセルは含まれない（オプションで含めることも可能）
- 配信統計には含まれない
- 送信レート制限の対象外

### 3.6 スケジュール送信（BC-008）

#### 3.6.1 UIコンポーネント

**送信オプションセクション**
- ラジオボタン選択：
  - 「Send Now」- 即時送信
  - 「Schedule for Later」- スケジュール送信

**スケジュール設定（「Schedule for Later」選択時）**
- 日付ピッカー
- 時刻ピッカー（15分刻み）
- タイムゾーン表示（ワークスペースのタイムゾーン）

**スマート送信オプション**
- トグル：「Enable Smart Sending」
- 説明：「Gradually send emails over a period of time to improve deliverability」
- 設定（トグルON時）：
  - 送信レート：ドロップダウン
    - 「500 emails/hour」
    - 「1,000 emails/hour」
    - 「2,500 emails/hour」
    - 「5,000 emails/hour」
    - 「10,000 emails/hour」
  - 送信開始時刻：時刻ピッカー
  - 送信終了時刻：時刻ピッカー（オプション）

**送信確認モーダル**
- モーダルタイトル：「Confirm Broadcast Send」
- 送信サマリー：
  - ブロードキャスト名
  - 件名
  - 推定配信数
  - 送信予定日時（スケジュール送信の場合）
  - スマート送信設定（有効な場合）
- 最終チェックリスト：
  - ✓ Subject line is set
  - ✓ Email content is complete
  - ✓ Unsubscribe link is included
  - ✓ Audience is selected
- アクションボタン：
  - 「Go Back」
  - 「Confirm & Send」（プライマリボタン、赤色または目立つ色）

#### 3.6.2 データモデル

```typescript
interface BroadcastSchedule {
  scheduledAt?: Date;
  timezone: string;

  smartSending?: {
    enabled: boolean;
    sendingRate: number; // emails per hour
    startTime: Date;
    endTime?: Date;
    currentBatch?: number;
    totalBatches?: number;
  };
}
```

#### 3.6.3 ワークフロー

**即時送信**
1. すべての設定が完了
2. 「Send」ボタンをクリック
3. 送信確認モーダル表示
4. 「Confirm & Send」をクリック
5. ステータスが「sending」に変更
6. バックグラウンドジョブで送信処理開始
7. 完了後、ステータスが「sent」に変更

**スケジュール送信**
1. 「Schedule for Later」を選択
2. 日時を設定
3. 「Schedule」ボタンをクリック
4. 確認モーダル表示
5. 「Confirm & Schedule」をクリック
6. ステータスが「scheduled」に変更
7. 設定日時になったら自動的に送信処理開始

**スマート送信**
1. 「Enable Smart Sending」をON
2. 送信レートと時間帯を設定
3. 送信開始
4. システムが受信者リストをバッチに分割
5. 設定されたレートで段階的に送信
6. 進捗状況をダッシュボードに表示

#### 3.6.4 キャンセル・一時停止機能

**スケジュール済みブロードキャストのキャンセル**
- ステータスが「scheduled」の場合のみ可能
- 「Cancel Schedule」ボタン
- 確認ダイアログ表示
- キャンセル後、ステータスが「draft」に戻る

**送信中の一時停止**
- ステータスが「sending」の場合
- 「Pause Sending」ボタン
- ステータスが「paused」に変更
- 「Resume Sending」ボタンで再開可能

### 3.7 パフォーマンス分析（BC-010）

#### 3.7.1 UIコンポーネント

**ブロードキャスト詳細ページ - Analyticsタブ**

**サマリーカード（上部）**

*全体統計：*
- 送信数（Delivered）
  - 数値
  - 配信率（%）
- 開封数（Opened）
  - ユニーク開封数
  - 開封率（%）
  - 総開封数
- クリック数（Clicked）
  - ユニーククリック数
  - クリック率（%）
  - 総クリック数
- バウンス（Bounced）
  - 数値
  - バウンス率（%）
- 配信停止（Unsubscribed）
  - 数値
  - 配信停止率（%）

**売上セクション**
- Total Revenue（総売上）
  - 金額
  - 通貨表示
- Per Recipient（受信者あたり売上）
  - 平均金額
- Per Unique Open（ユニーク開封あたり売上）
  - 平均金額
- Per Unique Click（ユニーククリックあたり売上）
  - 平均金額

**A/Bテスト結果（件名テスト実施時）**
- セクションタイトル：「Subject Line Test Results」
- 各バリエーション表示：
  - 件名テキスト
  - 送信数
  - 開封数
  - 開封率
  - 勝者バッジ（最高開封率のバリエーション）
- 勝者送信情報：
  - 「Winner sent to remaining audience at [時刻]」

**パフォーマンスグラフ**
- タイムラインチャート：
  - X軸：時間（送信後の経過時間）
  - Y軸：開封数 / クリック数
  - 2つの折れ線：Opens、Clicks
- 期間選択：
  - Last 24 Hours
  - Last 7 Days
  - Last 30 Days
  - All Time

**リンククリック詳細**
- セクションタイトル：「Link Performance」
- テーブル：
  - 列：Link URL、Total Clicks、Unique Clicks、Click Rate
  - ソート可能
- 各リンクをクリックで、クリックしたコンタクト一覧表示

**コンタクト詳細アクセス**
- 各メトリクス名をクリック可能
- サイドパネルで該当コンタクト一覧表示
- 例：「Opened」をクリック → 開封したコンタクトリスト
- コンタクトリストの情報：
  - コンタクト名
  - メールアドレス
  - 開封/クリック時刻
  - デバイス/ブラウザ情報（可能な場合）
- エクスポートボタン（CSV）

#### 3.7.2 データモデル

```typescript
interface BroadcastAnalytics {
  broadcastId: string;

  // 配信統計
  sent: number;
  delivered: number;
  bounced: number;
  bouncedPermanent: number;
  bouncedTemporary: number;

  // エンゲージメント統計
  openedUnique: number;
  openedTotal: number;
  clickedUnique: number;
  clickedTotal: number;
  unsubscribed: number;
  complained: number; // スパム報告

  // 計算フィールド
  deliveryRate: number; // delivered / sent * 100
  openRate: number; // openedUnique / delivered * 100
  clickRate: number; // clickedUnique / delivered * 100
  clickToOpenRate: number; // clickedUnique / openedUnique * 100
  bounceRate: number; // bounced / sent * 100
  unsubscribeRate: number; // unsubscribed / delivered * 100

  // 売上統計
  revenue: {
    total: number;
    perRecipient: number;
    perUniqueOpen: number;
    perUniqueClick: number;
    currency: string;
  };

  // 時系列データ
  timeline: AnalyticsTimeline[];

  // リンク別クリック統計
  linkClicks: LinkClickStats[];

  // A/Bテスト結果
  subjectLineTestResults?: SubjectLineTestResults;

  // 平均時間
  averageOpenTime?: number; // 分
  averageClickTime?: number; // 分

  // デバイス・クライアント統計
  deviceStats?: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };

  emailClientStats?: {
    [clientName: string]: number;
  };
}

interface AnalyticsTimeline {
  timestamp: Date;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
}

interface LinkClickStats {
  url: string;
  totalClicks: number;
  uniqueClicks: number;
  clickRate: number;
}

interface SubjectLineTestResults {
  variants: {
    id: string;
    subject: string;
    sent: number;
    opened: number;
    openRate: number;
    isWinner: boolean;
  }[];
  winnerSentAt?: Date;
  testCompletedAt: Date;
}
```

#### 3.7.3 トラッキング実装

**開封トラッキング**
- 1x1ピクセルの透明GIF画像を各メールに挿入
- ユニークURLをコンタクトごとに生成
- 画像リクエスト時にサーバーで記録
- 記録内容：
  - コンタクトID
  - ブロードキャストID
  - 開封日時
  - IPアドレス
  - User-Agent（デバイス/クライアント情報）

**クリックトラッキング**
- メール内のすべてのリンクをトラッキングURLに変換
- リダイレクトサーバーを経由して実際のURLへ
- 記録内容：
  - コンタクトID
  - ブロードキャストID
  - リンクURL
  - クリック日時
  - IPアドレス
  - User-Agent

**売上トラッキング**
- 購入完了時に注文データとメールクリックを関連付け
- アトリビューション期間：クリック後7日間（設定可能）
- 複数のブロードキャストからのクリックがある場合：
  - ラストクリック（最後にクリックしたブロードキャスト）に帰属
  - または、全ブロードキャストに按分（設定可能）

#### 3.7.4 リアルタイム更新

- WebSocketまたはポーリングでリアルタイム統計更新
- 送信中のブロードキャストは5秒ごとに更新
- 送信完了後は30秒ごとに更新
- 24時間経過後は手動更新のみ

#### 3.7.5 エクスポート機能

**統計エクスポート**
- 「Export Analytics」ボタン
- フォーマット選択：CSV、PDF
- エクスポート内容：
  - サマリー統計
  - 時系列データ
  - リンククリック詳細
  - A/Bテスト結果（該当する場合）

**コンタクトリストエクスポート**
- 各メトリクスから該当コンタクトをエクスポート
- フォーマット：CSV
- 含まれる情報：
  - コンタクト情報（名前、メールアドレス等）
  - アクション詳細（開封時刻、クリックリンク等）

### 3.8 ブロードキャスト管理（BC-002）

#### 3.8.1 UIコンポーネント

**ブロードキャスト一覧ページ**

**フィルター・検索**
- 検索バー：ブロードキャスト名で検索
- ステータスフィルター：
  - All
  - Draft
  - Scheduled
  - Sending
  - Sent
  - Paused
  - Cancelled
- 日付範囲フィルター：
  - Last 7 Days
  - Last 30 Days
  - Last 90 Days
  - Custom Range

**ブロードキャスト一覧テーブル**

列：
- 名前（Name）
  - ブロードキャスト名
  - 件名（サブテキスト）
- ステータス（Status）
  - バッジ表示（色分け）
- 受信者数（Recipients）
  - 送信数
- 送信日時（Sent / Scheduled）
  - 実際の送信日時または予定日時
- パフォーマンス（Performance）
  - 開封率
  - クリック率
- アクション（Actions）
  - ドロップダウンメニュー

**アクションメニュー**
- View Analytics（すべてのステータス）
- Edit（Draft、Scheduled）
- Duplicate（すべてのステータス）
- Cancel Schedule（Scheduled）
- Pause Sending（Sending）
- Resume Sending（Paused）
- Delete（Draft、Cancelled）

**一括操作**
- チェックボックスで複数選択
- 一括アクション：
  - Delete
  - Export

#### 3.8.2 ステータス管理

**ステータス遷移図**

```
Draft → Scheduled → Sending → Sent
  ↓         ↓          ↓
Delete   Cancel    Paused → Sending
                      ↓
                   Cancel → Draft
```

**各ステータスの定義**

| ステータス | 説明 | 可能なアクション |
|-----------|------|-----------------|
| Draft | 作成中、送信未設定 | Edit, Delete, Schedule, Send Now |
| Scheduled | 送信がスケジュールされている | Edit, Cancel Schedule, View |
| Sending | 送信中 | Pause, View Analytics |
| Sent | 送信完了 | View Analytics, Duplicate |
| Paused | 送信が一時停止中 | Resume, Cancel |
| Cancelled | スケジュールがキャンセルされた | Delete, Duplicate, Reschedule |

#### 3.8.3 複製機能

**複製ワークフロー**
1. アクションメニューから「Duplicate」を選択
2. 確認ダイアログ表示：
   - 「Duplicate Broadcast」
   - 新しいブロードキャスト名入力フィールド
   - デフォルト：「[元の名前] (Copy)」
3. 「Duplicate」ボタンをクリック
4. 新しいブロードキャストが作成される（status: 'draft'）
5. 複製内容：
   - 件名、プレビューテキスト
   - メールコンテンツ
   - オーディエンス設定
   - トピック設定
   - A/Bテスト設定（テスト結果は除く）
6. 複製されない内容：
   - 送信日時
   - 統計データ
   - ステータス

#### 3.8.4 削除機能

**削除可能条件**
- ステータスが「Draft」または「Cancelled」の場合のみ

**削除ワークフロー**
1. アクションメニューから「Delete」を選択
2. 確認ダイアログ表示：
   - 「Delete Broadcast」
   - 警告メッセージ：「This action cannot be undone.」
   - ブロードキャスト名の確認入力（安全対策）
3. 「Delete」ボタンをクリック（赤色）
4. ブロードキャストがソフトデリート（論理削除）
5. 成功トーストメッセージ表示

**ソフトデリート**
- データベースから物理削除せず、`deleted_at`フィールドに削除日時を記録
- UI上は表示されない
- 30日間保持後、自動的に物理削除（設定可能）

## 4. SMTP連携要件（ES-003）

### 4.1 SMTP設定概要

ClickFunnelsは2つのメール送信方式をサポート：

1. **デフォルト設定**：ClickFunnelsのメール送信サービスを使用
2. **カスタムSMTP**：外部SMTPプロバイダーを接続

### 4.2 カスタムSMTP接続

#### 4.2.1 対応SMTPプロバイダー

推奨プロバイダー：
- SendGrid
- Mailgun
- Amazon SES (Simple Email Service)
- Postmark
- SparkPost
- Mailjet

**禁止事項**
- WebホスティングプロバイダーのSMTPは使用不可
- 専用のトランザクションメールSMTPプロバイダーを使用する必要がある

#### 4.2.2 UIコンポーネント

**SMTP設定ページ**
- ナビゲーション：Workspace Settings → Email Settings → SMTP

**接続タイプ選択**
- ラジオボタン：
  - 「Use ClickFunnels Email Service」（デフォルト）
  - 「Connect Custom SMTP」

**SMTP接続フォーム**

*基本設定：*
- SMTP Provider
  - ドロップダウン：主要プロバイダー選択
  - 「Other」オプション
- SMTP Host
  - テキスト入力
  - 例：smtp.sendgrid.net
- SMTP Port
  - 数値入力
  - 一般的なポート：25, 587, 465, 2525
  - デフォルト：587
- Encryption
  - ドロップダウン：
    - None
    - TLS (推奨)
    - SSL

*認証情報：*
- Username
  - テキスト入力
  - 多くの場合、メールアドレスまたはAPIユーザー名
- Password / API Key
  - パスワード入力（マスク表示）
  - 「Show」トグルで表示/非表示

*送信者設定：*
- From Name
  - テキスト入力
  - デフォルトの送信者名
- From Email
  - メールアドレス入力
  - 認証済みドメインのアドレスを使用

**接続テスト**
- 「Test Connection」ボタン
- テストメール送信先入力フィールド
- 接続テスト結果表示：
  - 成功：緑色のチェックマーク、「Connection successful」
  - 失敗：赤色の×マーク、エラーメッセージ詳細

**Webhook設定**
- Webhook URL（読み取り専用フィールド）
- 説明：「Add this webhook URL to your SMTP provider to track email events」
- 「Copy」ボタン
- サポートされるイベント：
  - Delivered
  - Opened
  - Clicked
  - Bounced
  - Complained (Spam)
  - Unsubscribed

#### 4.2.3 データモデル

```typescript
interface SMTPConfiguration {
  id: string;
  workspaceId: string;

  // 接続タイプ
  provider: 'clickfunnels' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark' | 'sparkpost' | 'mailjet' | 'other';

  // SMTP設定
  host?: string;
  port?: number;
  encryption?: 'none' | 'tls' | 'ssl';
  username?: string;
  password?: string; // 暗号化保存

  // 送信者設定
  defaultFromName: string;
  defaultFromEmail: string;
  defaultReplyToEmail?: string;

  // ステータス
  isActive: boolean;
  isVerified: boolean;
  lastTestedAt?: Date;
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;

  // Webhook
  webhookSecret: string; // 署名検証用

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4.2.4 SMTP接続ワークフロー

1. Workspace Settings → Email Settings → SMTP
2. 「Connect Custom SMTP」を選択
3. SMTPプロバイダーを選択
4. 接続情報を入力
5. 「Test Connection」をクリック
6. テスト成功を確認
7. Webhook URLをコピー
8. SMTPプロバイダーの管理画面でWebhookを設定
9. 「Save Settings」をクリック

#### 4.2.5 プロバイダー別設定ガイド

**SendGrid**
- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- Encryption: `TLS`
- Username: `apikey`
- Password: SendGrid API Key
- Webhook: Settings → Mail Settings → Event Webhook

**Mailgun**
- SMTP Host: `smtp.mailgun.org`
- SMTP Port: `587`
- Encryption: `TLS`
- Username: Mailgun SMTP username
- Password: Mailgun SMTP password
- Webhook: Webhooks → Add webhook

**Amazon SES**
- SMTP Host: `email-smtp.[region].amazonaws.com`
- SMTP Port: `587`
- Encryption: `TLS`
- Username: SMTP username (IAMから取得)
- Password: SMTP password (IAMから取得)
- Webhook: SNS → Configure notifications

#### 4.2.6 Webhook実装

**Webhookエンドポイント**
- URL: `https://[your-domain]/api/webhooks/email/[provider]/[workspace-id]`
- メソッド: POST
- 認証: 署名検証（プロバイダーごとに異なる）

**処理するイベント**

| イベント | 処理内容 |
|---------|---------|
| delivered | 配信成功を記録 |
| opened | 開封イベントを記録（User-Agent、IP等） |
| clicked | クリックイベントを記録（URL、時刻等） |
| bounced | バウンスを記録、コンタクトステータス更新 |
| complained | スパム報告を記録、自動配信停止 |
| unsubscribed | 配信停止を記録、コンタクトステータス更新 |

**署名検証**
- SendGrid: `X-Twilio-Email-Event-Webhook-Signature`ヘッダー
- Mailgun: `X-Mailgun-Signature`ヘッダー
- Amazon SES: SNS署名検証

### 4.3 メール送信パイプライン

#### 4.3.1 送信フロー

```
1. ブロードキャスト送信開始
   ↓
2. オーディエンスフィルター適用 → 受信者リスト生成
   ↓
3. リストをバッチに分割（スマート送信設定に基づく）
   ↓
4. 各受信者に対して：
   a. メールHTMLを生成（マージタグ置き換え）
   b. トラッキングピクセル挿入
   c. リンクをトラッキングURLに変換
   ↓
5. SMTP経由で送信
   ↓
6. 送信結果を記録
   ↓
7. Webhookでイベントを受信・記録
```

#### 4.3.2 エラーハンドリング

**送信エラー**
- 一時的エラー：
  - 再試行（最大3回、指数バックオフ）
  - 例：接続タイムアウト、一時的なSMTPエラー
- 永続的エラー：
  - 再試行しない
  - コンタクトステータスを更新
  - 例：無効なメールアドレス、ドメイン不在

**レート制限**
- SMTPプロバイダーのレート制限を遵守
- 429エラー時は送信を遅延
- 設定可能な送信レート制限

#### 4.3.3 バウンス管理

**バウンスタイプ**

*ハードバウンス（永続的）：*
- 無効なメールアドレス
- ドメイン不在
- 受信拒否

処理：
- コンタクトの`emailStatus`を`bounced_permanent`に更新
- 今後の送信対象から自動除外

*ソフトバウンス（一時的）：*
- メールボックス満杯
- 一時的なサーバーエラー

処理：
- コンタクトの`emailStatus`を`bounced_temporary`に更新
- 3回連続ソフトバウンスでハードバウンス扱い

## 5. 配信性要件（ES-004）

### 5.1 ドメイン認証

#### 5.1.1 必要なDNSレコード

**SPF (Sender Policy Framework)**
- レコードタイプ: TXT
- ホスト名: `@` (ルートドメイン)
- 値: `v=spf1 include:mailer.myclickfunnels.com ~all`

**既存SPFレコードとのマージ**
- 既存のSPFレコードがある場合、マージが必要
- 例：
  ```
  既存: v=spf1 include:_spf.google.com ~all
  新規: v=spf1 include:_spf.google.com include:mailer.myclickfunnels.com ~all
  ```

**DKIM (DomainKeys Identified Mail)**
- レコードタイプ: TXT
- ホスト名: `cf._domainkey` (ClickFunnels提供)
- 値: ClickFunnelsが提供する2048ビットDKIMキー

**注意事項**
- 一部のDNSプロバイダーは255文字以上のTXTレコードに対応していない
- 対応していない場合、CloudflareなどのDNSプロバイダーへの移行を推奨

**DMARC (Domain-based Message Authentication)**
- レコードタイプ: TXT
- ホスト名: `_dmarc`
- 値（例）: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

**CNAME**
- トラッキングドメイン用
- ホスト名: `email` (カスタマイズ可能)
- 値: ClickFunnels提供のCNAME値

#### 5.1.2 UIコンポーネント

**ドメイン管理ページ**
- ナビゲーション: Workspace Settings → Email Settings → Domains

**ドメイン一覧**
- テーブル：
  - 列：ドメイン、ステータス、認証状態、アクション
- 「Add Domain」ボタン

**ドメイン追加フロー**

1. **ドメイン入力**
   - 「Enter Your Domain」
   - テキスト入力：`yourdomain.com`
   - 「Next」ボタン

2. **DNSレコード表示**
   - 各レコードのカード表示：
     - レコードタイプ
     - ホスト名
     - 値（コピーボタン付き）
     - ステータスインジケーター（未検証/検証済み）
   - セットアップ手順：
     1. DNSプロバイダーにログイン
     2. 表示されたDNSレコードを追加
     3. 「Verify DNS Records」をクリック

3. **検証**
   - 「Verify DNS Records」ボタン
   - 検証中インジケーター
   - 検証結果表示：
     - 成功：緑色チェックマーク
     - 失敗：赤色×マーク、エラー詳細

**検証ステータス**
- Pending（保留中）
- Verifying（検証中）
- Verified（検証済み）
- Failed（失敗）

#### 5.1.3 データモデル

```typescript
interface EmailDomain {
  id: string;
  workspaceId: string;
  domain: string;

  // 検証ステータス
  status: 'pending' | 'verifying' | 'verified' | 'failed';

  // DNSレコード
  dnsRecords: {
    spf: DNSRecord;
    dkim: DNSRecord;
    dmarc?: DNSRecord;
    cname?: DNSRecord;
  };

  // 検証結果
  lastVerifiedAt?: Date;
  verificationErrors?: {
    record: string;
    error: string;
  }[];

  // 設定
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface DNSRecord {
  type: 'TXT' | 'CNAME' | 'MX';
  host: string;
  value: string;
  status: 'pending' | 'verified' | 'failed';
  lastCheckedAt?: Date;
}
```

#### 5.1.4 DNS検証プロセス

**検証方法**
1. ユーザーが「Verify DNS Records」をクリック
2. サーバーでDNSルックアップ実行
   - SPFレコード: `dig TXT yourdomain.com`
   - DKIMレコード: `dig TXT cf._domainkey.yourdomain.com`
   - DMARCレコード: `dig TXT _dmarc.yourdomain.com`
3. 取得した値と期待値を比較
4. 結果をデータベースに記録
5. UIに結果を表示

**自動再検証**
- 検証失敗時、24時間ごとに自動再検証
- 最大7日間自動再試行
- 検証成功後も定期的にチェック（週1回）

### 5.2 2025年配信性要件

#### 5.2.1 新規制への対応

**Gmail・Yahoo新ポリシー（2025年）**

必須要件：
1. **ドメイン認証**
   - SPF、DKIM、DMARCの設定（上記参照）

2. **ワンクリック配信停止**
   - List-Unsubscribeヘッダーの実装
   - `List-Unsubscribe: <mailto:unsubscribe@yourdomain.com>`
   - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`

3. **スパム率制限**
   - スパム報告率を0.3%未満に維持
   - 5,000通/日以上送信する場合は必須

#### 5.2.2 配信停止機能（ES-004）

**UIコンポーネント**

**配信停止リンク設定**
- ナビゲーション: Workspace Settings → Email Settings → Unsubscribe

**設定オプション**

*配信停止リンクテキスト：*
- テキスト入力フィールド
- デフォルト：「Unsubscribe」
- カスタマイズ例：「配信停止」「メール設定を管理」

*配信停止フッター：*
- リッチテキストエディタ
- マージタグ：
  - `{{unsubscribe_link}}`
  - `{{preferences_link}}`
  - `{{company_address}}`
- デフォルトテンプレート：
  ```
  If you no longer wish to receive these emails, you can [unsubscribe]({{unsubscribe_link}}) or [manage your preferences]({{preferences_link}}).

  {{company_address}}
  ```

**連絡先住所設定（CAN-SPAM法対応）**
- セクション：「Marketing Contact Address」
- フィールド：
  - Company Name
  - Street Address
  - City
  - State/Province
  - Postal Code
  - Country

**配信停止ページカスタマイズ**
- ページタイトル
- 確認メッセージ
- ボタンテキスト
- リダイレクトURL（オプション）

#### 5.2.3 配信停止フロー

**ワンクリック配信停止（List-Unsubscribe）**
1. 受信者がメールクライアントの「配信停止」ボタンをクリック
2. メールクライアントがPOSTリクエストを送信
3. システムが自動的にコンタクトを配信停止
4. 確認メールは送信されない（ワンクリック）

**リンク経由の配信停止**
1. 受信者がメール内の配信停止リンクをクリック
2. 配信停止ページへリダイレクト
3. 配信停止理由選択（オプション）
4. 「Unsubscribe」ボタンをクリック
5. 確認ページ表示
6. コンタクトステータスを`unsubscribed`に更新

**配信設定ページ（Preferences）**
1. 受信者が設定ページリンクをクリック
2. 配信設定ページ表示：
   - トピック別の配信設定
   - メール頻度設定（可能な場合）
   - 完全配信停止オプション
3. 設定を保存
4. 確認メッセージ表示

#### 5.2.4 データモデル

```typescript
interface UnsubscribeEvent {
  id: string;
  contactId: string;
  broadcastId?: string;
  workflowId?: string;

  // 配信停止タイプ
  type: 'one_click' | 'link' | 'manual' | 'bounce' | 'complaint';

  // 配信停止詳細
  reason?: string;
  reasonCategory?: 'too_frequent' | 'not_relevant' | 'never_subscribed' | 'other';

  // メタデータ
  ipAddress?: string;
  userAgent?: string;
  unsubscribedAt: Date;
}

interface ContactPreferences {
  contactId: string;

  // グローバル配信停止
  globalUnsubscribe: boolean;

  // トピック別設定
  topicPreferences: {
    topicId: string;
    subscribed: boolean;
  }[];

  // 頻度設定
  frequency?: 'daily' | 'weekly' | 'monthly';

  updatedAt: Date;
}
```

#### 5.2.5 スパム管理

**スパム報告の処理**
1. Webhookでスパム報告（complaint）イベント受信
2. 該当コンタクトを即座に配信停止
3. コンタクトステータスを`complained`に更新
4. 今後のすべての送信から除外

**スパム率モニタリング**
- ダッシュボードにスパム率表示
- 計算：`(スパム報告数 / 配信成功数) * 100`
- 警告閾値：
  - 0.1%：注意
  - 0.2%：警告
  - 0.3%：危険（送信制限の可能性）

**スパム率改善アクション**
- 古いリストのクリーニング
- エンゲージメントの低い受信者の除外
- ダブルオプトインの実装
- 配信頻度の見直し

### 5.3 配信性ベストプラクティス

#### 5.3.1 リストハイジーン

**リストクリーニング**
- 6ヶ月以上エンゲージメントがないコンタクトの除外
- バウンスしたアドレスの自動除外
- スパム報告したコンタクトの除外
- 定期的な再許可キャンペーン

**セグメンテーション**
- アクティブユーザーと非アクティブユーザーの分離
- エンゲージメントレベル別の送信頻度調整

#### 5.3.2 送信レピュテーション管理

**IPウォームアップ（新規SMTP利用時）**
- 初日：100-500通
- 2-3日目：1,000-2,000通
- 4-7日目：5,000-10,000通
- 2週目：20,000-50,000通
- 3週目以降：フル送信

**エンゲージメント重視**
- 初期はエンゲージメント率の高いセグメントから送信
- 開封率・クリック率をモニタリング

#### 5.3.3 コンテンツベストプラクティス

**スパムトリガー回避**
- 全て大文字の使用を避ける
- 過度な記号の使用を避ける
- スパムワード（「無料」「今すぐ」等）の過度な使用を避ける
- テキストと画像のバランスを保つ（画像のみのメールは避ける）

**テクニカル要件**
- HTML妥当性を確保
- プレーンテキスト版を含める
- レスポンシブデザイン
- 配信停止リンクを明確に表示

## 6. システムメール（ES-005）

### 6.1 システムメールの種類

**トランザクションメール**
- 注文確認
- 決済確認
- 領収書
- パスワードリセット
- アカウント確認

**自動通知メール**
- コース完了通知
- 予約確認
- ウェビナーリマインダー
- サブスクリプション更新通知

### 6.2 UIコンポーネント

**システムメール管理ページ**
- ナビゲーション: Workspace Settings → System Emails

**システムメール一覧**
- カテゴリ別グループ化：
  - Orders & Payments
  - Account Management
  - Course & Membership
  - Appointments
  - Webinars
- 各メールカード：
  - メール名
  - 説明
  - ステータス（有効/無効）
  - 「Edit」ボタン

**システムメール編集ページ**

*基本設定：*
- 有効/無効トグル
- 送信元名（From Name）
- 送信元メールアドレス（From Email）
- 返信先メールアドレス（Reply To）
- 件名（マージタグ使用可能）

*コンテンツ編集：*
- リッチテキストエディタまたは簡易エディタ
- 利用可能なマージタグ一覧表示（メールタイプごとに異なる）
- プレビュー機能
- デフォルトに戻すボタン

### 6.3 システムメール専用マージタグ

**注文確認メール**
- `{{order.id}}`
- `{{order.total}}`
- `{{order.items}}`
- `{{order.billing_address}}`
- `{{order.shipping_address}}`
- `{{order.date}}`

**パスワードリセット**
- `{{reset_link}}`
- `{{reset_expiry}}`

**コース完了**
- `{{course.name}}`
- `{{course.completion_date}}`
- `{{certificate_link}}`

### 6.4 データモデル

```typescript
interface SystemEmail {
  id: string;
  workspaceId: string;

  // システムメールタイプ
  type: SystemEmailType;

  // カスタマイズ設定
  isEnabled: boolean;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  subject?: string;
  htmlContent?: string;

  // デフォルト値（読み取り専用）
  defaultSubject: string;
  defaultHtmlContent: string;
  availableMergeTags: MergeTag[];

  // メタデータ
  lastModifiedAt?: Date;
  isCustomized: boolean;
}

type SystemEmailType =
  | 'order_confirmation'
  | 'payment_confirmation'
  | 'receipt'
  | 'password_reset'
  | 'account_verification'
  | 'course_completion'
  | 'appointment_confirmation'
  | 'webinar_reminder'
  | 'subscription_renewal';

interface MergeTag {
  tag: string;
  description: string;
  example?: string;
}
```

## 7. テンプレート管理（BC-005）

### 7.1 UIコンポーネント

**テンプレート管理ページ**
- ナビゲーション: Email → Templates

**テンプレート一覧**
- タブ：
  - My Templates（自作テンプレート）
  - Library（公式テンプレート）
- グリッド表示：
  - テンプレートサムネイル
  - テンプレート名
  - カテゴリタグ
  - アクションボタン（Edit、Duplicate、Delete）
- フィルター：
  - カテゴリで絞り込み
  - 検索バー
- 「Create Template」ボタン

**テンプレート作成フロー**
1. 「Create Template」をクリック
2. テンプレート名入力
3. カテゴリ選択（オプション）
4. エディタへ遷移
5. デザイン作成
6. 「Save Template」をクリック

**テンプレート使用フロー**
1. ブロードキャスト作成時
2. 「Choose Template」をクリック
3. テンプレート選択モーダル表示
4. テンプレートを選択
5. エディタにロード
6. カスタマイズ

### 7.2 データモデル

```typescript
interface EmailTemplate {
  id: string;
  workspaceId: string;

  // テンプレート情報
  name: string;
  description?: string;
  category?: string;
  tags?: string[];

  // コンテンツ
  thumbnailUrl?: string;
  design: EmailDesign;

  // メタデータ
  isPublic: boolean; // 公式テンプレートかどうか
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 8. 技術仕様

### 8.1 推奨技術スタック

**フロントエンド**
- React 18+ または Vue 3+
- TypeScript
- メールエディタ：
  - Unlayer（推奨）
  - GrapesJS
  - React Email Editor
- ドラッグ&ドロップ：React DnD、dnd-kit
- 状態管理：Redux Toolkit、Zustand、Pinia（Vue）
- UIコンポーネント：Material-UI、Ant Design、Chakra UI

**バックエンド**
- Node.js + Express / Fastify
- または：Python + FastAPI / Django
- TypeScript（Node.jsの場合）

**データベース**
- PostgreSQL（推奨）
  - JSONBフィールド活用（メールデザイン保存）
  - インデックス最適化
- または：MySQL 8.0+

**メール送信**
- Bull Queue（Node.js）またはCelery（Python）でジョブキュー
- Redis（キュー管理、キャッシング）
- SMTP接続プール管理

**トラッキング**
- 開封トラッキング：専用エンドポイント
- クリックトラッキング：リダイレクトサービス
- リアルタイム統計：WebSocket（Socket.io、Pusher）

**インフラ**
- クラウド：AWS、GCP、Azure
- コンテナ化：Docker、Kubernetes
- CDN：CloudFront、Cloudflare（画像配信）
- ファイルストレージ：S3、GCS

### 8.2 データベーススキーマ（概要）

```sql
-- ブロードキャスト
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  subject TEXT,
  preview_text TEXT,
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  email_content JSONB NOT NULL,
  audience_filter JSONB NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  INDEX idx_workspace_status (workspace_id, status),
  INDEX idx_scheduled_at (scheduled_at)
);

-- コンタクト
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  subscription_status VARCHAR(50) NOT NULL,
  email_status VARCHAR(50) NOT NULL,
  custom_fields JSONB,
  tags TEXT[],
  subscribed_topics TEXT[],
  unsubscribed_topics TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_emailed_at TIMESTAMP,
  last_opened_at TIMESTAMP,
  last_clicked_at TIMESTAMP,
  UNIQUE (workspace_id, email),
  INDEX idx_workspace_email (workspace_id, email),
  INDEX idx_subscription_status (workspace_id, subscription_status)
);

-- ブロードキャスト送信ログ
CREATE TABLE broadcast_sends (
  id UUID PRIMARY KEY,
  broadcast_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  error_message TEXT,
  INDEX idx_broadcast_contact (broadcast_id, contact_id),
  INDEX idx_broadcast_status (broadcast_id, status)
);

-- イベントログ（開封、クリック等）
CREATE TABLE email_events (
  id UUID PRIMARY KEY,
  broadcast_id UUID,
  contact_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  link_url TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_broadcast_event (broadcast_id, event_type),
  INDEX idx_contact_event (contact_id, event_type),
  INDEX idx_created_at (created_at)
);

-- テンプレート
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags TEXT[],
  thumbnail_url TEXT,
  design JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_workspace_category (workspace_id, category)
);
```

### 8.3 API エンドポイント（主要）

```
# ブロードキャスト
POST   /api/broadcasts                    # 新規作成
GET    /api/broadcasts                    # 一覧取得
GET    /api/broadcasts/:id                # 詳細取得
PUT    /api/broadcasts/:id                # 更新
DELETE /api/broadcasts/:id                # 削除
POST   /api/broadcasts/:id/duplicate      # 複製
POST   /api/broadcasts/:id/send           # 送信
POST   /api/broadcasts/:id/schedule       # スケジュール
POST   /api/broadcasts/:id/cancel         # キャンセル
POST   /api/broadcasts/:id/pause          # 一時停止
POST   /api/broadcasts/:id/resume         # 再開
POST   /api/broadcasts/:id/test           # テスト送信
GET    /api/broadcasts/:id/analytics      # 分析データ取得
GET    /api/broadcasts/:id/contacts       # 対象コンタクト取得

# オーディエンス
POST   /api/broadcasts/:id/audience       # オーディエンス設定
GET    /api/broadcasts/:id/audience/count # 推定配信数取得

# テンプレート
GET    /api/templates                     # 一覧取得
POST   /api/templates                     # 新規作成
GET    /api/templates/:id                 # 詳細取得
PUT    /api/templates/:id                 # 更新
DELETE /api/templates/:id                 # 削除

# SMTP設定
GET    /api/settings/smtp                 # 設定取得
PUT    /api/settings/smtp                 # 設定更新
POST   /api/settings/smtp/test            # 接続テスト

# ドメイン
GET    /api/settings/domains              # ドメイン一覧
POST   /api/settings/domains              # ドメイン追加
POST   /api/settings/domains/:id/verify   # DNS検証
DELETE /api/settings/domains/:id          # ドメイン削除

# トラッキング
GET    /track/open/:token                 # 開封トラッキング（1x1 GIF）
GET    /track/click/:token                # クリックトラッキング（リダイレクト）

# Webhook
POST   /api/webhooks/email/:provider/:workspace_id  # メールイベント受信
```

### 8.4 パフォーマンス要件

**送信速度**
- 小規模（<1,000通）：即時送信
- 中規模（1,000-10,000通）：5分以内
- 大規模（10,000-100,000通）：スマート送信使用、設定レートに応じる

**API応答時間**
- 一覧取得：<500ms
- 詳細取得：<300ms
- 作成/更新：<1s
- オーディエンスカウント：<2s

**データベースクエリ**
- インデックス最適化
- N+1クエリ回避
- 大量データはページネーション（100件/ページ）

### 8.5 セキュリティ要件

**認証・認可**
- JWT トークン認証
- ワークスペースレベルの権限管理
- ロールベースアクセス制御（RBAC）

**データ保護**
- SMTP認証情報の暗号化保存（AES-256）
- 環境変数で秘密鍵管理
- HTTPS必須

**レート制限**
- API: 1000リクエスト/分/ワークスペース
- テスト送信: 10通/分/ユーザー
- 本番送信: SMTP プロバイダーの制限に準拠

**入力バリデーション**
- メールアドレス形式検証
- SQLインジェクション対策（パラメータ化クエリ）
- XSS対策（HTML サニタイゼーション）

### 8.6 監視・ログ

**アプリケーションログ**
- エラーログ（Sentry、Rollbar）
- アクセスログ
- 送信ログ

**メトリクス**
- 送信成功率
- 平均配信時間
- エラー率
- バウンス率
- スパム率

**アラート**
- 送信失敗率が閾値超過
- スパム率が0.2%超過
- SMTP接続エラー
- DNS検証失敗

## 9. 実装優先順位

### フェーズ1（MVP）
1. ブロードキャスト作成・管理基本機能
2. シンプルなメールエディタ（テキスト + 画像 + ボタン）
3. オーディエンス設定（全員、セグメント選択）
4. 基本的なマージタグ
5. テスト送信
6. 即時送信
7. ClickFunnelsデフォルトSMTP使用

### フェーズ2
1. ドラッグ&ドロップエディタ（Unlayer統合）
2. テンプレート管理
3. カスタムオーディエンスフィルター
4. スケジュール送信
5. 基本的な分析（開封率、クリック率）
6. カスタムSMTP接続

### フェーズ3
1. A/Bテスト（件名）
2. スマート送信
3. 高度な分析（売上トラッキング、デバイス統計）
4. ドメイン認証（SPF、DKIM、DMARC）
5. 配信停止ページカスタマイズ
6. トピック管理

### フェーズ4
1. システムメール管理
2. 高度なセグメンテーション
3. 予測送信時間最適化
4. リアルタイム統計（WebSocket）
5. 高度なレポート・エクスポート機能

## 10. 参考資料

本ドキュメントは以下の情報源に基づいて作成されました：

### ClickFunnels 公式ドキュメント
- [Create and Send a New Broadcast](https://support.myclickfunnels.com/docs/create-and-send-a-new-broadcast)
- [How to Manage Broadcasts](https://support.myclickfunnels.com/docs/how-to-manage-broadcasts)
- [Setting Up Broadcasts Audience](https://support.myclickfunnels.com/docs/setting-up-broadcasts-audience)
- [How to Design Emails](https://support.myclickfunnels.com/docs/how-to-design-emails)
- [View Broadcast Revenue and Performance Stats](https://support.myclickfunnels.com/docs/view-broadcast-revenue-and-performance-stats)
- [Send a Test Email](https://support.myclickfunnels.com/docs/send-a-test-email)
- [Email Settings - General Settings](https://support.myclickfunnels.com/docs/email-settings-general-settings-1)
- [Email Domains - How to Verify Email DNS Records](https://support.myclickfunnels.com/docs/email-domains-how-to-verify-email-dns-records)
- [Connecting an SMTP with ClickFunnels](https://support.myclickfunnels.com/docs/connecting-an-smtp-with-clickfunnels)
- [Email Deliverability Guide](https://support.myclickfunnels.com/docs/email-deliverability-guide)
- [How to Create and Manage Email Templates](https://support.myclickfunnels.com/docs/how-to-create-and-manage-email-templates)
- [How to Customize and Manage System Emails in ClickFunnels](https://support.myclickfunnels.com/docs/how-to-customize-and-manage-system-emails-in-clickfunnels)
- [Adding Unsubscribe Link in Email Footer](https://support.myclickfunnels.com/docs/adding-unsubscribe-link-in-email-footer)
- [How to Personalize Emails with Merge Tags in ClickFunnels](https://support.myclickfunnels.com/docs/how-to-personalize-emails-with-merge-tags-in-clickfunnels)

---

**ドキュメントバージョン**: 1.0
**最終更新日**: 2025年12月9日
**作成者**: Claude (Anthropic)