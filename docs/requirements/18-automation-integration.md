# 自動化・外部連携機能要件定義書

## 1. 概要

### 1.1 目的
本ドキュメントは、UTAGEシステムの自動化・外部連携機能を再現するための詳細な機能要件を定義する。マーケティングオートメーション、シナリオ管理、外部システム連携、ラベル管理などの包括的な機能を実装対象とする。

### 1.2 機能範囲
- シナリオアクション設定・管理
- リンククリック時のアクション実行
- ラベル付与・解除の自動化
- クロスアカウント連携
- Googleスプレッドシート直接連携
- 外部システムとのWebhook連携（GET/POST）
- 複数アクションの同時実行
- Zapier連携サポート

### 1.3 参照ドキュメント
- [シナリオアクションの追加方法](https://help.utage-system.com/archives/1688)
- [リンククリック時のアクション実行](https://help.utage-system.com/archives/8745)
- [シナリオ登録直後のラベル付与/解除](https://help.utage-system.com/archives/10111)
- [ラベルの管理](https://help.utage-system.com/archives/1683)
- [Googleスプレッドシート連携（ファネル）](https://help.utage-system.com/archives/10476)
- [Googleスプレッドシート連携（メール・LINE）](https://help.utage-system.com/archives/10668)
- [外部システムからUTAGEへの登録（POST）](https://help.utage-system.com/archives/13732)
- [UTAGEから外部システムへの登録](https://help.utage-system.com/archives/12591)
- [複数アクションの同時実行](https://help.utage-system.com/archives/9512)
- [ファネルアクション設定可能な置き換え文字](https://help.utage-system.com/archives/1477)
- [メール・LINE配信アクション設定可能な置き換え文字](https://help.utage-system.com/archives/1480)
- [独自置き換え文字](https://help.utage-system.com/archives/13805)
- [Zapier連携方法](https://help.utage-system.com/archives/4363)

---

## 2. アクション設定機能

### 2.1 アクション種類

システムは以下の9種類のアクションタイプをサポートする必要がある：

#### 2.1.1 シナリオ遷移（Scenario Transition）
**概要**: 別シナリオへの登録、または配信停止を行う

**設定項目**:
- アクション選択: 登録 / 停止
- 対象シナリオの指定
- 重複登録ポリシー:
  - 重複登録を許可
  - 重複登録を禁止（再登録なし）
  - 解除済みアドレスの再登録を許可
- パートナー情報継承設定

**ユースケース**:
- ステップメール完了後に別のシナリオに自動登録
- 特定条件でプロモーションシナリオを停止
- 顧客のステージに応じたシナリオ移行

#### 2.1.2 クロスアカウントシナリオ管理
**概要**: 別配信アカウントのシナリオへの登録・停止

**設定方法**:
- Webhook機能を使用して別アカウントのシナリオに登録
- 同一配信アカウント内では直接シナリオ遷移が可能
- 配信アカウント間をまたぐ場合は必ずWebhookを使用

**制約事項**:
- 直接的なクロスアカウント遷移は不可
- Webhookを介した間接的な登録のみサポート

#### 2.1.3 LINEメッセージ送信
**概要**: LINE公式アカウントからの直接メッセージ配信

**設定項目**:
- メッセージ内容
- メッセージタイプ（テキスト/ボタン/画像/カルーセル/音声/動画/スタンプ）

#### 2.1.4 LINEテンプレート送信
**概要**: 事前作成したテンプレートの配信

**設定項目**:
- テンプレート選択
- ボタン動作設定:
  - URLを開く
  - LINE友だち側からメッセージを送信
  - メッセージを送る
  - テンプレートを送る
  - 何もしない/アクション実行

#### 2.1.5 LINEリッチメニュー変更
**概要**: LINE公式アカウントのリッチメニュー表示を変更

**設定項目**:
- リッチメニューテンプレート選択
- 表示条件
- 表示タイミング

**ユースケース**:
- ユーザーのステータスに応じたメニュー切り替え
- キャンペーン期間中の特別メニュー表示
- 会員ランク別メニュー表示

#### 2.1.6 ラベル変更
**概要**: 顧客属性のセグメント化のためのラベル付与・解除

**設定項目**:
- 付与するラベル（複数選択可）
- 解除するラベル（複数選択可）

**ラベル管理機能**:
- ラベルの追加・編集・削除
- 表示順変更（ドラッグ&ドロップ）
- グループ管理によるラベル整理
- ラベルは全シナリオ共通情報として管理

**ユースケース**:
- 商品購入後に「購入者」ラベル付与
- イベント申込後に「参加予定」ラベル付与
- アンケート回答後に「回答済み」ラベル付与
- 登録経路別のラベル付与

#### 2.1.7 クロスアカウントラベル変更
**概要**: 配信アカウント間をまたいだラベル操作

**重要事項**:
- 異なる配信アカウント間でラベル情報は同期されない
- 各アカウントで独立したラベル管理が必要

#### 2.1.8 Webhook（外部連携）
**概要**: UTAGEから外部システムへのデータ連携（送信）

**設定項目**:
- URL: 連携先のURL
- Name: name属性値（半角英数字）
- Value: 置き換え文字（%name%, %mail%等）

**利用例**:
- 外部メール配信スタンドへの読者登録
- 外部システムツールへのデータ登録
- Zapier等のデータ連携サービスへのデータ送信
- 決済完了後、書籍発送代行業者等へのデータ送信
- イベント予約データのデータ送信

**重要な注意点**:
- 入力欄にはすべて半角英数字で入力
- 不要なスペースが挿入されていないか確認
- 外部配信スタンド側で「確認画面をスキップする」設定が必要
- 確認画面が表示される設定だと正常にデータ登録が完了しない

#### 2.1.9 バンドルコース操作
**概要**: 会員サイトのバンドルコース登録・停止

**機能**:
- バンドルコースへの登録
- バンドルコースの停止

**設定項目**:
- 対象コース選択

**制約事項**:
- 継続課金停止は事前購入履歴のあるアカウントのみ
- 特定決済プロバイダーは除外

#### 2.1.10 Googleスプレッドシート追記
**概要**: Zapier等を介さずに直接Googleスプレッドシートへデータ転記

**特徴**:
- 2024年6月11日に追加された機能
- 外部データ連携サービス不要
- リアルタイムデータ同期

詳細は「5. 外部連携」セクションで記載

---

### 2.2 アクション設定UI

#### 2.2.1 アクション管理画面
**アクセスパス**:
- ファネル機能: ファネル > アクション設定 > [アクション追加]
- メール・LINE配信: メール・LINE配信 > アカウント一覧 > アカウント選択 > アクション管理 > [追加]

**画面構成**:
- アクション一覧表示
- 追加ボタン
- 編集・削除機能
- アクション名検索・フィルタリング

#### 2.2.2 アクション作成フォーム
**必須項目**:
- 管理用名称: アクション名（任意の名前）
- 種類: アクションタイプ選択（プルダウン）

**動的項目**:
- 選択したアクション種類に応じて設定項目が動的に変化
- 各アクションタイプ固有の設定フォームを表示

**保存機能**:
- [保存]ボタンでアクション保存
- バリデーション: 必須項目チェック、形式チェック

#### 2.2.3 複数アクション設定
**機能概要**:
- 1つのアクション内で複数アクションを指定可能
- 例: 「ラベル付与 + シナリオ遷移(登録) + シナリオ遷移(停止)」

**設定方法**:
1. アクション作成画面で最初のアクションを設定
2. 青い[+ 追加]ボタンをクリック
3. 追加したいアクションを設定
4. 必要に応じて複数回繰り返し
5. [保存]で一括保存

**制約事項**:
- 実行順序の保証なし（ドキュメントに明示的な記載なし）
- エラーハンドリングの詳細仕様なし
- 置き換え文字はアクションタイプにより異なる

---

## 3. トリガー機能

### 3.1 リンククリック時のアクション実行

#### 3.1.1 概要
メール配信やLINE配信時のリンク（URL）をクリックした際に、各URL毎に実行するアクションを指定できる機能。

#### 3.1.2 対応配信タイプ
- メール一斉送信
- LINE一斉送信
- ステップ配信
- リマインダ配信

#### 3.1.3 設定手順

**Step 1: アクション作成**
- アクション管理画面で事前にアクションを作成
- 利用可能なアクション種類:
  - シナリオ遷移（登録/停止）
  - LINEメッセージ送信
  - LINEテンプレート送信
  - リッチメニュー変更
  - ラベル変更
  - Webhook
  - バンドルコース管理
  - 継続課金停止
  - ファネル共有ライセンス発行/取消

**Step 2: メッセージ本文でのURL入力**
- メール本文またはLINEメッセージ本文にURLを入力
- システムが自動的にURLを検出

**Step 3: アクション割り当て**
- 本文下部の「リンクを開いた際に実行するアクション」セクションに検出されたリンクが自動表示
- 各URLに対して実行するアクションを選択

#### 3.1.4 実装要件
- URLの自動検出機能
- URLとアクションのマッピング管理
- クリックイベントのトラッキング
- クリック後のアクション自動実行
- クリック履歴の記録

#### 3.1.5 データモデル
```typescript
interface LinkAction {
  id: string;
  messageId: string; // 配信メッセージID
  url: string; // 元のURL
  trackingUrl: string; // トラッキング用URL
  actionIds: string[]; // 実行するアクションのID配列
  clickCount: number; // クリック回数
  uniqueClickCount: number; // ユニーククリック数
  createdAt: Date;
  updatedAt: Date;
}

interface LinkClickEvent {
  id: string;
  linkActionId: string;
  userId: string;
  clickedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  actionExecuted: boolean;
  actionExecutionResult?: object;
}
```

---

### 3.2 シナリオ登録直後のラベル付与・解除

#### 3.2.1 概要
シナリオに読者が登録された直後に自動的にラベルを付与または解除する機能。

#### 3.2.2 ユースケース
- シナリオ登録直後にラベルを付与
- 特定のラベルを解除
- ラベル状態を条件とした後続メッセージ配信
  - 例: 特定ラベルがない読者のみにメールを送信

#### 3.2.3 前提条件
1. シナリオの作成
   - メール・LINE配信 > アカウント選択 > [追加]ボタン
2. ラベル変更アクションの作成
   - メール・LINE配信 > アカウント選択 > アクション管理
   - 種類: 「ラベルを変更」を選択
   - 注: ステップ配信設定内で直接アクション指定も可能（事前作成不要）

#### 3.2.4 設定手順

**方法1: 事前作成アクションを使用**
1. メール・LINE配信 > アカウント選択 > シナリオ名 > ステップ配信
2. [メール追加] / [LINEメッセージ追加] / [アクション追加] を選択
3. タイミング設定: 「シナリオ登録直後」を選択
4. 「送信後に実行するアクション」で事前作成したラベルアクションを選択
5. [保存]

**方法2: 直接アクション指定**
1. ステップ配信設定画面を開く
2. 「送信後に実行するアクション」のドロップダウンをクリック
3. 「新規にアクションを追加」を選択
4. その場でアクションを作成・設定
5. [保存]

#### 3.2.5 CSV一括登録時の注意事項
**重要**: 大量の読者とメッセージを同時送信すると、全てのメールがスパムに分類されるリスクがある。

**対策**:
- CSV一括アップロード時は約100件ずつ段階的に送信
- 一度に大量送信しない

#### 3.2.6 実装要件
- シナリオ登録イベントのフック
- 登録直後のアクション実行トリガー
- ラベル付与・解除の非同期処理
- バッチ登録時のスロットリング機能
- エラーハンドリングとリトライ機能

---

### 3.3 その他のトリガー

#### 3.3.1 商品購入直後のラベル付与
**トリガー**: 商品購入完了時
**設定方法**: 購入後に登録するシナリオでラベル付与アクションを設定
**注意**: ファネルアクション、購入後のアクションでは付与不可
**特性**: ラベルは全シナリオ共通情報のため、購入前シナリオにも反映

#### 3.3.2 アンケート回答後のラベル付与・解除
**トリガー**: シナリオ内アンケート送信完了時
**設定場所**: 「送信後の動作設定」セクション
**設定方法**:
- 「実行するアクション」に事前作成したラベルアクションを指定
- または「新規にアクションを追加」から直接アクション指定

#### 3.3.3 イベント申込後のラベル自動付与
**トリガー**: イベント・予約機能経由での申込み完了時
**設定内容**: イベント名、日程、参加者情報等に基づくラベル付与

#### 3.3.4 既存読者への一括ラベル付与
**トリガー**: 手動実行（今すぐ/指定日時）
**設定方法**:
1. ラベル管理より付与したいラベルを作成
2. アクション管理よりラベル付与アクションを追加
3. 該当シナリオの「予約中」より「アクション追加」をクリック
4. 実行タイミング選択: 「今すぐ」または「実行日時を指定」
5. [保存]

**ユースケース**:
- 既存顧客全員に新しいセグメントラベルを付与
- 過去のイベント参加者にフォローアップラベル付与

---

## 4. ラベル管理

### 4.1 ラベル管理機能

#### 4.1.1 アクセス
メール・LINE配信 > アカウント選択 > ラベル > ラベル管理

#### 4.1.2 基本機能
- ラベルの追加
- ラベルの編集
- ラベルの削除
- 表示順変更（ドラッグ&ドロップ）
- グループ管理によるラベル整理

#### 4.1.3 表示順変更
1. [表示順変更]をクリック
2. ドラッグ&ドロップで並べ替え
3. [表示順保存]を押下

#### 4.1.4 グループ管理
- [グループ管理]からグループを追加
- ラベルをグループに分類して整理
- 視認性向上とラベル管理の効率化

### 4.2 ラベルの特性

#### 4.2.1 全シナリオ共通
- ラベルは配信アカウント内の全シナリオで共通
- あるシナリオで付与したラベルは他のシナリオでも参照可能
- 統一されたセグメンテーション管理

#### 4.2.2 配信アカウント間の独立性
- 異なる配信アカウント間でラベル情報は同期されない
- 各アカウントで独立したラベル体系を維持
- クロスアカウントラベル操作は可能だが、情報は独立

### 4.3 ラベルの活用パターン

#### 4.3.1 顧客セグメンテーション
- 購入者 / 未購入者
- 有料会員 / 無料会員
- 興味関心カテゴリ別

#### 4.3.2 エンゲージメント状態
- アクティブ / 非アクティブ
- 高関心 / 中関心 / 低関心
- 開封率・クリック率による分類

#### 4.3.3 カスタマージャーニー
- 見込み客
- 検討中
- 購入済み
- リピーター

#### 4.3.4 イベント・キャンペーン
- セミナー参加予定
- キャンペーン応募済み
- アンケート回答済み

### 4.4 データモデル

```typescript
interface Label {
  id: string;
  accountId: string;
  name: string;
  color?: string;
  description?: string;
  groupId?: string;
  displayOrder: number;
  isSystemLabel: boolean; // システム標準ラベルか
  createdAt: Date;
  updatedAt: Date;
}

interface LabelGroup {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLabel {
  id: string;
  userId: string;
  labelId: string;
  assignedAt: Date;
  assignedBy?: string; // 手動付与の場合のユーザーID
  assignedByAction?: string; // アクションによる自動付与の場合のアクションID
  source: 'manual' | 'action' | 'import' | 'api';
}
```

---

## 5. 外部連携

### 5.1 Googleスプレッドシート連携

#### 5.1.1 概要
2024年6月11日にリリースされた機能。Zapier等の外部データ連携サービスを介さず、UTAGEから直接Googleスプレッドシートへデータ転記が可能。

#### 5.1.2 連携タイプ

##### A. ファネル機能でのGoogleスプレッドシート連携

**トリガー**:
- オプトインLP登録時
- 商品決済完了時
- サブスクリプション解約時

**利用可能な置き換え文字**:

**共通項目**:
- お名前: %name%
- メールアドレス: %mail%
- 姓: %sei%
- 名: %mei%
- フリガナ: %kana%
- 電話番号: %phone%
- 郵便番号: %zipcode%
- 都道府県: %pref%
- 市区町村: %city%
- 番地: %address%
- 建物名: %building%
- 登録元ページURL: %referer%
- ファネル登録経路: %funnel_tracking_name%
- ファネルID: %funnel_id%
- ファネルステップID: %funnel_step_id%
- ファネルページID: %funnel_page_id%
- アクション実行日時: %now%

**決済関連**:
- トランザクションID: %payment_transaction_id%
- サブスクリプションID: %payment_subscription_id%
- 商品名: %payment_product_name%
- 決済方法: %payment_method%
- 金額: %payment_amount%
- 分割払い情報: %payment_installment_info%

**イベント関連**:
- イベント名: %event_name%
- 日程: %event_date%
- 会場: %event_venue%
- 参加者URL: %event_url%
- 参加者詳細: %event_attendee_details%
- 決済状態: %event_payment_status%

**UTMパラメータ**: %utm_source%, %utm_medium%, %utm_campaign%, %utm_term%, %utm_content%

##### B. メール・LINE配信機能でのGoogleスプレッドシート連携

**トリガー**:
- シナリオ登録直後（メールアドレス登録、LINE登録）
- イベント・予約機能経由での申込内容 / 決済履歴
- シナリオ内アンケート送信完了時
- 商品購入シナリオ
- カスタムアクション実行時

**利用可能な置き換え文字**:

**共通項目**:
- お名前: %name%
- マスターID: %master_id%
- 現在日時: %now%

**標準データ**:
- メールアドレス: %mail%
- 姓: %sei%
- 名: %mei%
- 電話番号: %phone%
- 郵便番号: %zipcode%
- 都道府県: %pref%

**イベント固有**:
- イベント名: %event_name%
- イベント日時: %event_date%
- イベント会場: %event_venue%
- イベントURL: %event_url%

**LINE固有**:
- LINE表示名: %line_name%
- LINE友だちID: %line_id%
- LINEマスターID: %line_master_id%

**決済フィールド**:
- 購入ID: %payment_purchase_id%
- 金額: %payment_amount%
- 商品名: %payment_product_name%

**自由入力フィールド**: %free1% ～ %free10%

**注意**: ファネル機能の置き換え文字とメール・LINE配信機能の置き換え文字は異なる

#### 5.1.3 設定手順

**Step 1: スプレッドシート準備**
1. Googleスプレッドシートを作成
2. 1行目にヘッダー（カラム名）を追加
   - UTAGEのフィールド名と完全一致させる必要はない
   - 任意のカラム名でOK

**Step 2: アクション作成**
- ファネル: ファネル > アクション設定 > [アクション追加]
- メール・LINE: メール・LINE配信 > アカウント > アクション管理 > [追加]
- 種類: 「Googleスプレッドシートへ追記」を選択

**Step 3: Googleアカウント認証**
1. 「Googleスプレッドシートと連携する」ボタンをクリック
2. ポップアップウィンドウが開く
   - ポップアップブロッカーを無効化しておく
3. Googleアカウントでログイン
4. 権限リクエスト: 「すべてのスプレッドシートを表示、編集、作成、削除」
5. 許可チェックボックスをON
6. 認証完了

**Step 4: URL設定**
1. 連携先スプレッドシートをブラウザで開く
2. ブラウザのURLバー全体をコピー
3. UTAGE側の「スプレッドシートURL」欄に貼り付け

**Step 5: シート選択**
1. 「シート」欄のプルダウンをクリック
2. 連携先のシート名を選択
   - スプレッドシート内の複数シートから選択可能

**Step 6: フィールドマッピング**
1. 各カラムに対応する置き換え文字を選択
2. プルダウンメニューから利用可能な置き換え文字を選択
3. 必要な全フィールドをマッピング
4. [保存]

#### 5.1.4 制約事項

**アカウント連携解除の影響**:
- 同一Googleアカウントを設定している複数アクションのうち、いずれかでアカウント連携解除を行うと、該当Googleアカウントを設定していたすべてのアクションで連携解除される
- 影響範囲が広いため注意が必要

**既存行の上書き防止**:
- 連携先スプレッドシート側で行に何らかのデータ（数式や入力データ等）が入力されている場合、既存行へのデータ上書き防止のため、入力済み行へのデータ追加はスキップされる
- 常に空白行を確保する必要がある

**置き換え文字の違い**:
- ファネル機能とメール・LINE配信機能で利用可能な置き換え文字が異なる
- 自由入力フィールド（%free1% ～ %free10%）はメール・LINE配信機能でのみ利用可能

**決済方法の制約**:
- 銀行振込決済の場合、決済方法データは「none」として表示される

**編集権限**:
- Googleアカウントが対象スプレッドシートの編集権限を持っている必要がある
- 閲覧権限のみでは連携不可

**アカウント切り替え**:
- Googleアカウントを切り替える場合は、連携解除せずに新しいアカウントで認証・保存すればOK
- ただし新しいアカウントも編集権限が必要

#### 5.1.5 データモデル

```typescript
interface GoogleSheetIntegration {
  id: string;
  actionId: string;
  accountId: string;
  googleAccountId: string; // 連携Googleアカウント
  spreadsheetUrl: string;
  spreadsheetId: string; // GoogleスプレッドシートID
  sheetName: string;
  fieldMappings: GoogleSheetFieldMapping[];
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface GoogleSheetFieldMapping {
  columnName: string; // スプレッドシートのカラム名
  replacementVariable: string; // UTAGE置き換え文字 (e.g., "%name%")
  columnIndex?: number; // カラムの位置（A=0, B=1, ...）
}

interface GoogleSheetSyncLog {
  id: string;
  integrationId: string;
  triggeredBy: string; // トリガーソース（シナリオID、ファネルID等）
  dataPayload: Record<string, any>;
  status: 'success' | 'failed' | 'skipped';
  errorMessage?: string;
  rowNumber?: number; // 追記された行番号
  syncedAt: Date;
}

interface GoogleAccount {
  id: string;
  accountId: string; // UTAGE配信アカウントID
  email: string;
  accessToken: string; // 暗号化保存
  refreshToken: string; // 暗号化保存
  tokenExpiresAt: Date;
  scopes: string[]; // ['https://www.googleapis.com/auth/spreadsheets']
  connectedAt: Date;
  lastUsedAt: Date;
}
```

---

### 5.2 Webhook連携

#### 5.2.1 概要
UTAGEから外部システムへのデータ送信、または外部システムからUTAGEへのデータ受信を行う機能。

#### 5.2.2 UTAGEから外部システムへの送信（Outbound Webhook）

##### 利用シーン
- 外部メール配信スタンドへの読者登録
- 外部システムツールへのデータ登録
- Zapier等のデータ連携サービスへのデータ送信
- 決済完了後、書籍発送代行業者等へのデータ送信
- イベント予約データのデータ送信
- 別UTAGEアカウント（JVパートナー等）への登録

##### 設定手順

**Step 1: 外部システムの準備**
1. 外部システム（例: MyASP）で登録用シナリオを作成
2. 必要フィールド（お名前、メールアドレス、電話番号等）を設定
3. 「確認画面をスキップする」設定を有効化（重要）
4. 登録フォームのURLを取得
5. フォームのHTMLソースから入力フィールドのname属性を抽出
   - 例: `data[User][mail]`, `data[User][name]`

**Step 2: UTAGEでWebhookアクション作成**
1. メール・LINE配信 > アカウント選択 > アクション管理 > [追加]
2. 管理用名称: 任意の識別名
3. 種類: 「webhook」を選択
4. URL: 外部フォームのURL（Step 1で取得）
5. Name/Valueペアの設定:
   - Name: 外部フィールドのname属性（例: `data[User][mail]`）
   - Value: UTAGE置き換え文字（例: `%mail%`）
   - 必要なフィールド分繰り返し
6. [保存]

**Step 3: シナリオに組み込み**
1. 対象シナリオのステップ配信設定を開く
2. 「送信後に実行するアクション」にWebhookアクションを指定
3. [保存]

##### 設定例

```
URL: https://example-mail-service.com/registration/form
Name: data[User][mail]
Value: %mail%

Name: data[User][name]
Value: %name%

Name: data[User][phone]
Value: %phone%
```

##### 重要な注意点

**必須設定**:
- 外部システム側で「確認画面をスキップする」設定が必須
- 確認画面が表示される設定だとWebhookデータ送信時に正常登録完了にならない

**入力規則**:
- 全ての入力欄は半角英数字で入力
- 不要なスペースが挿入されていないか確認
- 全角文字や余分なスペースがあるとエラーの原因になる

**ConvertKit連携の注意**:
- ConvertKitユーザーは専用の連携機能を使用
- 通常のWebhook機能は使用しない

##### データモデル

```typescript
interface WebhookAction {
  id: string;
  actionId: string;
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  parameters: WebhookParameter[];
  retryPolicy?: RetryPolicy;
  timeoutMs: number; // デフォルト30000
  createdAt: Date;
  updatedAt: Date;
}

interface WebhookParameter {
  name: string; // name属性値
  value: string; // 置き換え文字 or 固定値
  type: 'replacement' | 'static'; // 置き換え or 固定
}

interface RetryPolicy {
  maxRetries: number;
  retryIntervalMs: number;
  backoffMultiplier?: number; // 指数バックオフ用
}

interface WebhookLog {
  id: string;
  webhookActionId: string;
  triggeredBy: string;
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseStatus?: number;
  responseBody?: string;
  duration: number; // ミリ秒
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  retryCount: number;
  executedAt: Date;
}
```

#### 5.2.3 外部システムからUTAGEへの登録（Inbound Webhook - POST方式）

##### 概要
外部システムのWebhook送信機能等を使用してPOST方式でUTAGEにシナリオ読者を登録する機能。

##### 前提条件
- 外部システム側でWebhookデータ送信機能（POST方式）をサポート
- メールアドレス情報が必須

##### 設定手順

**Step 1: UTAGE側の準備**
1. シナリオを作成
2. 読者フィールドを設定（お名前、メールアドレス、電話番号等）
3. 登録確認画面設定を「省略する」に設定（重要）
4. 登録フォームURLを取得
5. フォームのHTMLソースから入力フィールドのname属性を抽出
   - 例: `mail`, `name`, `phone`

**Step 2: 外部システム側の設定**
1. Webhook送信機能の設定画面を開く
2. URL: UTAGEの登録フォームURL（Step 1で取得）
3. データマッピング設定:
   - 外部システムのフィールド → UTAGEのname属性
   - 例: MyASPの場合 `mail=%mail%`
4. [保存]

##### 必須パラメータ
- **mail**: メールアドレス（必須）

##### オプションパラメータ
- name: お名前
- phone: 電話番号
- その他、UTAGEフォームで定義したフィールド
- 隠しフィールドのパラメータも必要に応じて送信

##### 入力規則
- 全て半角英数字で入力
- 不要なスペースを挿入しない

##### レスポンス
登録成功後、自動アクション（アカウント作成、確認メール送信等）がトリガーされる

##### データモデル

```typescript
interface InboundWebhookEndpoint {
  id: string;
  scenarioId: string;
  accountId: string;
  endpointUrl: string; // 登録フォームURL
  isActive: boolean;
  skipConfirmation: boolean; // 確認画面スキップ
  fieldMappings: InboundFieldMapping[];
  allowedOrigins?: string[]; // CORS設定
  createdAt: Date;
  updatedAt: Date;
}

interface InboundFieldMapping {
  formFieldName: string; // フォームのname属性
  internalFieldName: string; // 内部フィールド名
  isRequired: boolean;
  dataType: 'string' | 'email' | 'phone' | 'number';
  validation?: string; // 正規表現等
}

interface InboundWebhookLog {
  id: string;
  endpointId: string;
  sourceIp: string;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, any>;
  registrationStatus: 'success' | 'duplicate' | 'validation_error' | 'system_error';
  userId?: string; // 登録されたユーザーID
  errorMessage?: string;
  receivedAt: Date;
}
```

#### 5.2.4 外部システムからUTAGEへの登録（GET方式）

##### 概要
GET方式でURLパラメータを使用してUTAGEにシナリオ読者を登録する機能。

##### URL形式
```
https://utage-system.com/register?mail=example@example.com&name=山田太郎&phone=03-1234-5678
```

##### 設定方法
- UTAGEの登録フォームURLに対してクエリパラメータでデータを送信
- フィールド名はフォームのname属性と一致させる

##### 注意点
- GET方式は個人情報がURLに含まれるため、セキュリティ上POST方式推奨
- ブラウザ履歴やサーバーログに個人情報が残る可能性
- 基本的にはPOST方式を使用すべき

---

### 5.3 Zapier連携

#### 5.3.1 概要
Zapierを介した外部サービス連携機能。Webhook機能を使用してZapierにデータを送信し、Zapier側で様々な外部サービスと連携。

#### 5.3.2 連携パターン

##### パターン1: コンバージョンAPI連携
UTAGEのアクション機能 → Zapier → 広告プラットフォームのコンバージョンAPI

##### パターン2: Googleスプレッドシート連携（レガシー）
UTAGEのアクション機能 → Zapier → Googleスプレッドシート

**注**: 2024年6月11日以降は直接Googleスプレッドシート連携が推奨

##### パターン3: その他外部サービス連携
- CRM連携
- メールマーケティングツール連携
- プロジェクト管理ツール連携
- カスタムアプリケーション連携

#### 5.3.3 設定方法

**Step 1: Zapier側の設定**
1. Zapierアカウントでログイン
2. 新しいZapを作成
3. トリガー: 「Webhooks by Zapier」を選択
   - 注: Professionalプラン以上が必要
4. トリガーイベント: 「Catch Hook」を選択
5. Webhook URLを取得

**Step 2: UTAGE側のWebhook設定**
1. アクション管理 > [追加]
2. 種類: 「webhook」
3. URL: Zapierから取得したWebhook URL
4. Name/Valueペアを設定
   - ZapierではJSONペイロードまたはURLエンコードされたデータを受け取る
5. [保存]

**Step 3: Zapier側のアクション設定**
1. ZapierでActionを設定
2. 連携先サービスを選択（例: Googleスプレッドシート、Facebook Conversion API等）
3. データマッピングを設定
4. Zapをテスト
5. Zapを有効化

#### 5.3.4 必要なZapierプラン
- 「Webhooks by Zapier」機能が必要
- Professionalプラン以上

#### 5.3.5 データモデル

```typescript
interface ZapierIntegration {
  id: string;
  webhookActionId: string;
  zapierWebhookUrl: string;
  zapName?: string;
  connectedService?: string; // 'google_sheets', 'facebook_api', etc.
  isActive: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 6. API要件

### 6.1 アクション管理API

#### 6.1.1 アクション一覧取得
```typescript
GET /api/v1/accounts/{accountId}/actions

Response:
{
  actions: Action[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### 6.1.2 アクション作成
```typescript
POST /api/v1/accounts/{accountId}/actions

Request:
{
  name: string;
  type: ActionType;
  config: ActionConfig; // アクションタイプに応じた設定
}

Response:
{
  action: Action;
}
```

#### 6.1.3 アクション更新
```typescript
PUT /api/v1/accounts/{accountId}/actions/{actionId}

Request:
{
  name?: string;
  config?: ActionConfig;
  isActive?: boolean;
}

Response:
{
  action: Action;
}
```

#### 6.1.4 アクション削除
```typescript
DELETE /api/v1/accounts/{accountId}/actions/{actionId}

Response:
{
  success: boolean;
}
```

#### 6.1.5 アクション実行（手動トリガー）
```typescript
POST /api/v1/accounts/{accountId}/actions/{actionId}/execute

Request:
{
  userId?: string; // 対象ユーザーID（オプション）
  scenarioId?: string; // 対象シナリオID（オプション）
  context?: Record<string, any>; // 実行コンテキスト
}

Response:
{
  executionId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
}
```

---

### 6.2 ラベル管理API

#### 6.2.1 ラベル一覧取得
```typescript
GET /api/v1/accounts/{accountId}/labels

Response:
{
  labels: Label[];
  groups: LabelGroup[];
}
```

#### 6.2.2 ラベル作成
```typescript
POST /api/v1/accounts/{accountId}/labels

Request:
{
  name: string;
  color?: string;
  description?: string;
  groupId?: string;
}

Response:
{
  label: Label;
}
```

#### 6.2.3 ラベル表示順変更
```typescript
PUT /api/v1/accounts/{accountId}/labels/reorder

Request:
{
  labelOrders: Array<{
    labelId: string;
    displayOrder: number;
  }>;
}

Response:
{
  success: boolean;
}
```

#### 6.2.4 ユーザーへのラベル付与
```typescript
POST /api/v1/users/{userId}/labels

Request:
{
  labelIds: string[];
  source?: 'manual' | 'action' | 'import' | 'api';
}

Response:
{
  userLabels: UserLabel[];
}
```

#### 6.2.5 ユーザーからのラベル解除
```typescript
DELETE /api/v1/users/{userId}/labels

Request:
{
  labelIds: string[];
}

Response:
{
  success: boolean;
  removedCount: number;
}
```

---

### 6.3 Webhook API

#### 6.3.1 Webhook設定作成
```typescript
POST /api/v1/accounts/{accountId}/webhooks

Request:
{
  actionId: string;
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  parameters: Array<{
    name: string;
    value: string;
  }>;
  retryPolicy?: {
    maxRetries: number;
    retryIntervalMs: number;
  };
}

Response:
{
  webhook: WebhookAction;
}
```

#### 6.3.2 Webhookログ取得
```typescript
GET /api/v1/accounts/{accountId}/webhooks/{webhookId}/logs

Query Parameters:
- startDate?: string (ISO 8601)
- endDate?: string (ISO 8601)
- status?: 'success' | 'failed' | 'timeout'
- page?: number
- pageSize?: number

Response:
{
  logs: WebhookLog[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### 6.3.3 Webhook再実行
```typescript
POST /api/v1/accounts/{accountId}/webhooks/{webhookId}/retry

Request:
{
  logId: string; // 再実行したいログのID
}

Response:
{
  executionId: string;
  status: string;
}
```

---

### 6.4 Googleスプレッドシート連携API

#### 6.4.1 Google認証URL取得
```typescript
GET /api/v1/accounts/{accountId}/google/auth-url

Response:
{
  authUrl: string;
  state: string; // CSRF対策用
}
```

#### 6.4.2 Google認証コールバック
```typescript
POST /api/v1/accounts/{accountId}/google/callback

Request:
{
  code: string;
  state: string;
}

Response:
{
  googleAccount: GoogleAccount;
}
```

#### 6.4.3 スプレッドシート連携設定作成
```typescript
POST /api/v1/accounts/{accountId}/google-sheets

Request:
{
  actionId: string;
  googleAccountId: string;
  spreadsheetUrl: string;
  sheetName: string;
  fieldMappings: Array<{
    columnName: string;
    replacementVariable: string;
  }>;
}

Response:
{
  integration: GoogleSheetIntegration;
}
```

#### 6.4.4 スプレッドシートのシート一覧取得
```typescript
GET /api/v1/accounts/{accountId}/google-sheets/sheets

Query Parameters:
- spreadsheetUrl: string (required)
- googleAccountId: string (required)

Response:
{
  sheets: Array<{
    name: string;
    sheetId: number;
    index: number;
  }>;
}
```

#### 6.4.5 同期ログ取得
```typescript
GET /api/v1/accounts/{accountId}/google-sheets/{integrationId}/logs

Query Parameters:
- startDate?: string
- endDate?: string
- status?: 'success' | 'failed' | 'skipped'
- page?: number
- pageSize?: number

Response:
{
  logs: GoogleSheetSyncLog[];
  total: number;
}
```

---

### 6.5 リンククリックトラッキングAPI

#### 6.5.1 トラッキングリンク生成
```typescript
POST /api/v1/messages/{messageId}/tracking-links

Request:
{
  originalUrl: string;
  actionIds: string[];
}

Response:
{
  linkAction: LinkAction;
  trackingUrl: string;
}
```

#### 6.5.2 リンククリックイベント記録
```typescript
POST /api/v1/link-clicks

Request:
{
  linkActionId: string;
  userId?: string; // 識別可能な場合
  ipAddress?: string;
  userAgent?: string;
}

Response:
{
  clickEvent: LinkClickEvent;
  redirectUrl: string; // 元のURL
}
```

#### 6.5.3 リンククリック統計取得
```typescript
GET /api/v1/messages/{messageId}/link-stats

Response:
{
  links: Array<{
    linkActionId: string;
    originalUrl: string;
    trackingUrl: string;
    clickCount: number;
    uniqueClickCount: number;
    actionExecutions: number;
  }>;
}
```

---

### 6.6 Inbound Webhook API

#### 6.6.1 登録エンドポイント（POST）
```typescript
POST /register/{scenarioId}

Request (application/x-www-form-urlencoded or application/json):
{
  mail: string; // required
  name?: string;
  phone?: string;
  [key: string]: any; // その他のフィールド
}

Response:
{
  success: boolean;
  userId?: string;
  message: string;
}

Error Response:
{
  success: false;
  error: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}
```

#### 6.6.2 登録エンドポイント（GET）
```typescript
GET /register/{scenarioId}?mail={email}&name={name}&phone={phone}...

Response: (同上)
```

---

## 7. データモデル（TypeScript型定義）

### 7.1 アクション関連

```typescript
// アクションタイプ列挙型
enum ActionType {
  SCENARIO_TRANSITION = 'scenario_transition',
  CROSS_ACCOUNT_SCENARIO = 'cross_account_scenario',
  LINE_MESSAGE = 'line_message',
  LINE_TEMPLATE = 'line_template',
  LINE_RICH_MENU = 'line_rich_menu',
  LABEL_CHANGE = 'label_change',
  CROSS_ACCOUNT_LABEL = 'cross_account_label',
  WEBHOOK = 'webhook',
  BUNDLE_COURSE = 'bundle_course',
  GOOGLE_SHEET = 'google_sheet',
}

// 基本アクション型
interface Action {
  id: string;
  accountId: string;
  name: string; // 管理用名称
  type: ActionType;
  config: ActionConfig;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// アクション設定（Union型）
type ActionConfig =
  | ScenarioTransitionConfig
  | LabelChangeConfig
  | WebhookConfig
  | GoogleSheetConfig
  | LineMessageConfig
  | LineTemplateConfig
  | LineRichMenuConfig
  | BundleCourseConfig;

// シナリオ遷移設定
interface ScenarioTransitionConfig {
  action: 'register' | 'stop';
  targetScenarioId: string;
  duplicatePolicy: 'allow' | 'prohibit' | 'allow_unsubscribed';
  inheritPartnerInfo: boolean;
}

// ラベル変更設定
interface LabelChangeConfig {
  labelsToAdd: string[]; // Label IDs
  labelsToRemove: string[]; // Label IDs
}

// Webhook設定
interface WebhookConfig {
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  parameters: Array<{
    name: string;
    value: string; // 置き換え文字 or 固定値
  }>;
  timeout: number; // ミリ秒
  retryPolicy?: {
    maxRetries: number;
    retryIntervalMs: number;
    backoffMultiplier?: number;
  };
}

// Googleスプレッドシート設定
interface GoogleSheetConfig {
  googleAccountId: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  sheetName: string;
  fieldMappings: Array<{
    columnName: string;
    replacementVariable: string;
  }>;
}

// LINEメッセージ設定
interface LineMessageConfig {
  messageType: 'text' | 'button' | 'image' | 'carousel' | 'audio' | 'video' | 'sticker';
  content: any; // メッセージタイプに応じた内容
}

// LINEテンプレート設定
interface LineTemplateConfig {
  templateId: string;
  buttonActions?: Array<{
    type: 'url' | 'message' | 'template' | 'action' | 'none';
    value?: string;
  }>;
}

// LINEリッチメニュー設定
interface LineRichMenuConfig {
  richMenuId: string;
  displayCondition?: string;
}

// バンドルコース設定
interface BundleCourseConfig {
  action: 'register' | 'stop';
  courseId: string;
}

// 複合アクション
interface CompositeAction {
  id: string;
  accountId: string;
  name: string;
  actions: Action[]; // 複数のアクション
  executionMode: 'sequential' | 'parallel'; // 実行モード
  stopOnError: boolean; // エラー時に停止するか
  createdAt: Date;
  updatedAt: Date;
}

// アクション実行履歴
interface ActionExecution {
  id: string;
  actionId: string;
  userId?: string;
  triggeredBy: string; // シナリオID、ファネルID、手動実行等
  triggerType: 'scenario' | 'funnel' | 'link_click' | 'manual' | 'scheduled';
  context: Record<string, any>; // 実行時のコンテキスト情報
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
  errorMessage?: string;
  duration?: number; // ミリ秒
  executedAt: Date;
}
```

### 7.2 ラベル関連

```typescript
// ラベル
interface Label {
  id: string;
  accountId: string;
  name: string;
  color?: string; // HEXカラーコード
  description?: string;
  groupId?: string;
  displayOrder: number;
  isSystemLabel: boolean; // システム標準ラベルか
  userCount?: number; // このラベルを持つユーザー数
  createdAt: Date;
  updatedAt: Date;
}

// ラベルグループ
interface LabelGroup {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ユーザーラベル（中間テーブル）
interface UserLabel {
  id: string;
  userId: string;
  labelId: string;
  assignedAt: Date;
  assignedBy?: string; // 手動付与の場合のユーザーID
  assignedByAction?: string; // アクション自動付与の場合のアクションID
  source: 'manual' | 'action' | 'import' | 'api';
  metadata?: Record<string, any>; // 追加情報
}
```

### 7.3 リンククリック関連

```typescript
// リンクアクション
interface LinkAction {
  id: string;
  messageId: string; // 配信メッセージID
  messageType: 'email' | 'line';
  url: string; // 元のURL
  trackingUrl: string; // トラッキング用URL
  actionIds: string[]; // 実行するアクションのID配列
  clickCount: number; // 総クリック回数
  uniqueClickCount: number; // ユニーククリック数
  createdAt: Date;
  updatedAt: Date;
}

// リンククリックイベント
interface LinkClickEvent {
  id: string;
  linkActionId: string;
  userId?: string; // 識別可能な場合
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  clickedAt: Date;
  actionExecuted: boolean;
  actionExecutionResults?: Array<{
    actionId: string;
    status: 'success' | 'failed';
    errorMessage?: string;
  }>;
}
```

### 7.4 Googleスプレッドシート関連

```typescript
// Googleスプレッドシート連携
interface GoogleSheetIntegration {
  id: string;
  actionId: string;
  accountId: string;
  googleAccountId: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  sheetName: string;
  sheetId: number; // スプレッドシート内のシートID
  fieldMappings: GoogleSheetFieldMapping[];
  isActive: boolean;
  lastSyncAt?: Date;
  syncCount: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// フィールドマッピング
interface GoogleSheetFieldMapping {
  columnName: string; // スプレッドシートのカラム名
  replacementVariable: string; // UTAGE置き換え文字
  columnIndex?: number; // カラムインデックス（0始まり）
}

// Googleアカウント
interface GoogleAccount {
  id: string;
  accountId: string; // UTAGE配信アカウントID
  email: string;
  accessToken: string; // 暗号化して保存
  refreshToken: string; // 暗号化して保存
  tokenExpiresAt: Date;
  scopes: string[];
  connectedAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

// 同期ログ
interface GoogleSheetSyncLog {
  id: string;
  integrationId: string;
  triggeredBy: string; // トリガーソース
  dataPayload: Record<string, any>;
  status: 'success' | 'failed' | 'skipped';
  errorMessage?: string;
  rowNumber?: number; // 追記された行番号
  duration?: number; // ミリ秒
  syncedAt: Date;
}
```

### 7.5 Webhook関連

```typescript
// Webhookアクション
interface WebhookAction {
  id: string;
  actionId: string;
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  parameters: WebhookParameter[];
  retryPolicy?: RetryPolicy;
  timeoutMs: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Webhookパラメータ
interface WebhookParameter {
  name: string;
  value: string;
  type: 'replacement' | 'static';
}

// リトライポリシー
interface RetryPolicy {
  maxRetries: number;
  retryIntervalMs: number;
  backoffMultiplier?: number;
}

// Webhookログ
interface WebhookLog {
  id: string;
  webhookActionId: string;
  triggeredBy: string;
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  duration: number; // ミリ秒
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  retryCount: number;
  executedAt: Date;
}
```

### 7.6 Inbound Webhook関連

```typescript
// Inbound Webhookエンドポイント
interface InboundWebhookEndpoint {
  id: string;
  scenarioId: string;
  accountId: string;
  endpointUrl: string; // 公開URL
  endpointPath: string; // パス部分
  isActive: boolean;
  skipConfirmation: boolean; // 確認画面スキップ
  fieldMappings: InboundFieldMapping[];
  allowedOrigins?: string[]; // CORS設定
  rateLimitPerMinute?: number; // レート制限
  secretToken?: string; // 検証用トークン
  createdAt: Date;
  updatedAt: Date;
}

// フィールドマッピング
interface InboundFieldMapping {
  formFieldName: string; // フォームのname属性
  internalFieldName: string; // 内部フィールド名
  isRequired: boolean;
  dataType: 'string' | 'email' | 'phone' | 'number' | 'date';
  validation?: string; // 正規表現等
  defaultValue?: string;
}

// Inbound Webhookログ
interface InboundWebhookLog {
  id: string;
  endpointId: string;
  sourceIp: string;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, any>;
  registrationStatus: 'success' | 'duplicate' | 'validation_error' | 'system_error';
  userId?: string; // 登録されたユーザーID
  errorMessage?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
  receivedAt: Date;
  processedAt: Date;
  duration: number; // ミリ秒
}
```

### 7.7 置き換え文字関連

```typescript
// 置き換え文字定義
interface ReplacementVariable {
  key: string; // %name%, %mail%等
  name: string; // 表示名
  category: 'common' | 'user' | 'payment' | 'event' | 'line' | 'funnel' | 'utm' | 'custom';
  description: string;
  availableIn: ('funnel' | 'scenario' | 'webhook')[]; // 利用可能な場所
  dataType: 'string' | 'number' | 'date' | 'url';
  exampleValue?: string;
}

// 独自置き換え文字
interface CustomReplacementVariable {
  id: string;
  accountId: string;
  key: string; // %original-XXX%形式
  name: string;
  value: string; // デフォルト値
  scenarioSpecificValues?: Array<{
    scenarioId: string;
    value: string;
  }>;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 置き換え文字コンテキスト（実行時に使用）
interface ReplacementContext {
  userId?: string;
  scenarioId?: string;
  funnelId?: string;
  messageId?: string;
  eventId?: string;
  paymentId?: string;
  customData?: Record<string, any>;
  timestamp: Date;
}
```

### 7.8 Zapier連携関連

```typescript
// Zapier連携設定
interface ZapierIntegration {
  id: string;
  webhookActionId: string;
  accountId: string;
  zapierWebhookUrl: string;
  zapName?: string;
  zapDescription?: string;
  connectedService?: string; // 'google_sheets', 'facebook_api', 'slack'等
  isActive: boolean;
  lastTriggeredAt?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. 実装優先順位

### 8.1 フェーズ1: 基本アクション機能（必須）
1. アクション管理基盤
   - アクションCRUD API
   - アクションタイプ定義
   - アクション実行エンジン
2. シナリオ遷移アクション
3. ラベル変更アクション
4. ラベル管理機能

### 8.2 フェーズ2: トリガー機能
1. リンククリックトラッキング
2. リンククリック時のアクション実行
3. シナリオ登録直後のアクション実行
4. 複数アクション同時実行機能

### 8.3 フェーズ3: 外部連携（Webhook）
1. Outbound Webhook機能
2. Inbound Webhook機能（POST）
3. Inbound Webhook機能（GET）
4. Webhookログ・リトライ機能

### 8.4 フェーズ4: Googleスプレッドシート連携
1. Google OAuth認証
2. スプレッドシート接続
3. データマッピング設定
4. 自動同期機能
5. 同期ログ管理

### 8.5 フェーズ5: 高度な機能
1. Zapier連携サポート
2. LINE連携アクション
3. クロスアカウント連携
4. カスタム置き換え文字
5. アクション実行統計・分析

---

## 9. セキュリティ要件

### 9.1 認証・認可
- アクション管理はアカウント権限に基づく
- APIキー認証（Inbound Webhook用）
- Google OAuth 2.0（Googleスプレッドシート連携用）
- トークンの暗号化保存

### 9.2 データ保護
- 置き換え文字のサニタイゼーション
- SQLインジェクション対策
- XSS対策
- CSRF対策（Inbound Webhook）

### 9.3 外部通信
- HTTPS必須
- Webhook送信時のSSL証明書検証
- タイムアウト設定
- レート制限

### 9.4 個人情報保護
- 個人情報のログ記録最小化
- Webhookログの保持期間設定
- アクセスログの監査

---

## 10. パフォーマンス要件

### 10.1 応答時間
- アクション作成・更新: 500ms以内
- アクション実行キュー投入: 200ms以内
- リンククリックリダイレクト: 100ms以内

### 10.2 スループット
- 同時アクション実行: 1,000件/秒
- Webhook送信: 500件/秒
- Googleスプレッドシート同期: 100件/秒

### 10.3 スケーラビリティ
- 非同期ジョブキュー（Redis/RabbitMQ）
- ワーカープロセスのスケールアウト
- データベース読み取りレプリカ

---

## 11. エラーハンドリング

### 11.1 アクション実行エラー
- エラーログの記録
- 管理者への通知（重大エラー）
- ユーザーへのエラー表示（適切な場合）

### 11.2 Webhookエラー
- 自動リトライ（指数バックオフ）
- 最大リトライ回数制限
- Dead Letter Queue（DLQ）

### 11.3 Googleスプレッドシートエラー
- 認証エラー: 再認証フロー
- 書き込みエラー: リトライ
- スプレッドシートロックエラー: 待機・リトライ

---

## 12. 監視・ログ

### 12.1 監視項目
- アクション実行成功率
- アクション実行時間
- Webhook送信成功率
- Googleスプレッドシート同期成功率
- エラー発生率

### 12.2 ログ保持
- アクション実行ログ: 90日間
- Webhookログ: 90日間
- Googleスプレッドシート同期ログ: 90日間
- リンククリックログ: 365日間

### 12.3 アラート
- Webhook連続失敗（5回以上）
- Googleスプレッドシート認証エラー
- アクション実行キューの蓄積
- 異常なレート増加

---

## 13. テスト要件

### 13.1 単体テスト
- 各アクションタイプの実行ロジック
- 置き換え文字の変換処理
- Webhookリトライロジック

### 13.2 統合テスト
- アクション実行フロー全体
- 外部API連携（モック使用）
- 複数アクション同時実行

### 13.3 E2Eテスト
- リンククリックからアクション実行まで
- シナリオ登録からラベル付与まで
- Googleスプレッドシート同期

### 13.4 負荷テスト
- 大量アクション同時実行
- Webhook大量送信
- リンククリック集中

---

## 14. 参考: 置き換え文字一覧

### 14.1 ファネルアクション用置き換え文字

#### 共通項目
- %name% - お名前
- %mail% - メールアドレス
- %sei% - 姓
- %mei% - 名
- %kana% - フリガナ
- %phone% - 電話番号
- %zipcode% - 郵便番号
- %pref% - 都道府県
- %city% - 市区町村
- %address% - 番地
- %building% - 建物名
- %referer% - 登録元ページURL
- %funnel_tracking_name% - ファネル登録経路
- %funnel_id% - ファネルID
- %funnel_step_id% - ファネルステップID
- %funnel_page_id% - ファネルページID
- %now% - アクション実行日時

#### UTMパラメータ
- %utm_source%
- %utm_medium%
- %utm_campaign%
- %utm_term%
- %utm_content%

#### 決済関連
- %payment_transaction_id% - トランザクションID
- %payment_subscription_id% - サブスクリプションID
- %payment_product_name% - 商品名
- %payment_method% - 決済方法
- %payment_amount% - 金額
- %payment_installment_info% - 分割払い情報

#### イベント関連
- %event_name% - イベント名
- %event_date% - 日程
- %event_venue% - 会場
- %event_url% - 参加者URL
- %event_attendee_details% - 参加者詳細
- %event_payment_status% - 決済状態
- %event_info% - イベント情報（会場情報含む）

### 14.2 メール・LINE配信アクション用置き換え文字

#### 共通項目
- %name% - お名前
- %mail% - メールアドレス
- %master_id% - マスターID
- %sei% - 姓
- %mei% - 名
- %phone% - 電話番号
- %zipcode% - 郵便番号
- %pref% - 都道府県
- %now% - 現在日時

#### LINE固有
- %line_name% - LINE表示名
- %line_id% - LINE友だちID
- %line_master_id% - LINEマスターID

#### イベント関連
- %event_name%
- %event_date%
- %event_venue%
- %event_url%
- %event_info%

#### 決済関連
- %payment_purchase_id%
- %payment_amount%
- %payment_product_name%

#### 自由入力フィールド
- %free1% ～ %free10%

#### URL関連
- %unsubscribe_url% - 解除フォームURL
- %unsubscribe_all_url% - 全シナリオ解除フォームURL
- %change_email_url% - アドレス変更フォームURL

### 14.3 独自置き換え文字
- %original-XXX% - ユーザー定義の置き換え文字
- 例: %original-company-name%, %original-support-email%

---

## まとめ

本ドキュメントでは、UTAGEの自動化・外部連携機能の詳細な要件を定義した。実装にあたっては以下の点に注意すること：

1. **段階的な実装**: フェーズごとに機能を実装し、各フェーズで十分なテストを実施
2. **拡張性の確保**: 新しいアクションタイプや連携先を容易に追加できる設計
3. **エラーハンドリング**: 外部連携の失敗に対する適切なリトライ・ログ記録
4. **セキュリティ**: 認証情報の安全な保管、APIエンドポイントの保護
5. **パフォーマンス**: 非同期処理、キュー管理、スケーラビリティの考慮
6. **ユーザビリティ**: 直感的なUI、わかりやすいエラーメッセージ

---

## ソース

本要件定義書は以下のUTAGE公式マニュアルを参照して作成された：

- [シナリオアクションの追加方法](https://help.utage-system.com/archives/1688)
- [リンククリック時のアクション実行](https://help.utage-system.com/archives/8745)
- [シナリオ登録直後のラベル付与/解除](https://help.utage-system.com/archives/10111)
- [ラベルの管理](https://help.utage-system.com/archives/1683)
- [ファネル機能でのGoogleスプレッドシート連携](https://help.utage-system.com/archives/10476)
- [メール・LINE配信機能でのGoogleスプレッドシート連携](https://help.utage-system.com/archives/10668)
- [外部システムからUTAGEへの登録（POST方式）](https://help.utage-system.com/archives/13732)
- [UTAGEから外部システムへの登録](https://help.utage-system.com/archives/12591)
- [複数アクションの同時実行方法](https://help.utage-system.com/archives/9512)
- [ファネルアクション設定可能な置き換え文字](https://help.utage-system.com/archives/1477)
- [メール・LINE配信アクション設定可能な置き換え文字](https://help.utage-system.com/archives/1480)
- [独自置き換え文字](https://help.utage-system.com/archives/13805)
- [コンバージョンAPI連携（Zapier利用）](https://help.utage-system.com/archives/5279)
- [ファネルアクション→Zapier→Googleスプレッドシート連携](https://help.utage-system.com/archives/4363)
- [シナリオアクション→Zapier→Googleスプレッドシート連携](https://help.utage-system.com/archives/4398)
- [webhookアクション利用例一覧](https://help.utage-system.com/purpose/webhook)
