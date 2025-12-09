# アナリティクス機能要件定義書

## 概要

ClickFunnelsのアナリティクス機能は、マーケティングパフォーマンス、顧客行動、売上データをリアルタイムで追跡・分析するための包括的なデータトラッキング・レポーティングツールです。すべてのプランで基本アナリティクスが含まれており、上位プランでは高度なアナリティクス機能が利用可能です。

## 1. アナリティクス概要ダッシュボード

### 1.1 基本構造

アナリティクスセクションは3つのタブで構成されます：
- Overview（概要）
- Reporting（レポート）
- Live View（ライブビュー）

### 1.2 主要KPIメトリクス

ダッシュボード上部に表示される主要パフォーマンス指標：

#### 注文関連
- **Total Orders（総注文数）**: 選択した期間内の完了した購入数
- **Upfront Sales（初回売上）**: 一度限りの購入とトライアル登録からの総収益
- **Recurring Sales（継続売上）**: サブスクリプション商品から発生する収益（2回目以降の支払いすべてを含む）
- **Average Cart Value（平均カート価格）**: ファネルセッションあたりの平均支出額（総収益÷総ファネルセッション数）

#### コンバージョン関連
- **Total Opt-ins（総オプトイン数）**: ファネルを通じてサインアップした人数
- **Conversion Rate（コンバージョン率）**: オプトインまたは購入などの望ましいアクションを実行した訪問者の割合
- **Earnings Per Click（クリック単価）**: クリックあたりの平均収益

#### トラフィック関連
- **Total Pageviews（総ページビュー数）**: ファネルページが閲覧された総回数
- **Total Visits（総訪問数）**: ページへの訪問者数

### 1.3 パフォーマンスチャート

主要メトリクスの下にタイムシリーズチャートを表示：
- 選択したメトリクス（注文、オプトイン、ページビュー）に基づいて更新
- Daily（日次）またはWeekly（週次）表示の切り替え
- トレンド分析のための視覚的なグラフ表示

### 1.4 追加インサイト

メインメトリクスの下に表示される詳細データ：
- **Total Product Sales（総商品売上）**: 商品別の売上高
- **Opt-in Sources（オプトインソース）**: リード獲得経路の分析
- **Customer Distribution（顧客分布）**: 収益とリードの発生源の分析

### 1.5 フィルタリング機能

#### 日付フィルター
- ページ右上のDate Filterドロップダウンメニュー
- 事前定義された期間オプション
- カスタム期間の設定
- First Visit（初回訪問）またはLast Visit（最終訪問）ベースのフィルタリング
- キャンペーンパフォーマンスとトラフィックソースの追跡に有効

#### ファネル・キャンペーンフィルター
- 特定のファネルでフィルタリング
- 特定のキャンペーンでフィルタリング
- 複数条件の組み合わせ

### 1.6 期間比較機能

**Compare to Period機能**：
- 現在のパフォーマンスを過去の期間と比較
- 前年同週などの比較が可能
- パフォーマンストレンドの把握

### 1.7 リアルタイムデータ更新

- データはリアルタイムで更新
- 商品ローンチや日次売上の即座の監視
- 瞬時の意思決定とマーケティング戦略の調整が可能

### 1.8 MRR（月次経常収益）ビュー

- 日付別または商品別のMRR表示
- New Trials（新規トライアル）の日付別追跡
- サブスクリプションビジネスの健全性把握

## 2. ファネルアナリティクスダッシュボード

### 2.1 アクセス方法

1. 左ナビゲーションメニューから「Funnels」をクリック
2. ファネルリストから対象ファネルを選択
3. 右側のAnalyticsアイコンをクリック

### 2.2 ダッシュボードメトリクス

ファネルの各ステップごとに以下を追跡：

#### ビュー関連
- **Views（閲覧数）**: 各ファネルステップの閲覧回数
- **Pageviews（ページビュー）**: ページビューとそのコンバージョン率

#### オプトイン関連
- **Opt-ins（オプトイン数）**: 各ファネルステップのオプトイン数
- **Rate（率）**: ページビューに対するオプトインのコンバージョン率

#### 売上関連
- **Sales（売上）**: 特定のファネルステップで完了した購入
- **Rate（率）**: 購入した訪問者の割合
- **Value（価値）**: 発生した総収益

#### 継続売上
- **Recurring Sales**: サブスクリプション商品からの収益

### 2.3 ファネルフロー分析

- ユーザーがファネル内をどのように移動するかの詳細ビュー
- どのステップがうまく機能しているか、どこで改善が必要かの把握
- ドロップオフポイントの特定

### 2.4 最適化のためのインサイト

- トレンドの特定
- ファネルステップの最適化
- データに基づいたビジネス意思決定

## 3. レポーティングページ

### 3.1 レポートカテゴリー

レポートページ内には以下のカテゴリーが用意されています：

#### Sales（売上）
- 売上高の詳細分析
- 商品別売上
- 期間別売上推移

#### Opt-ins（オプトイン）
- オプトインフォームの送信データ
- ソース別オプトイン分析
- コンバージョン率追跡

#### Pageviews（ページビュー）
- ページ閲覧統計
- ページ別パフォーマンス
- 滞在時間分析

#### Subscriptions（サブスクリプション）
- サブスクリプション登録数
- 解約率（チャーン）
- LTV（顧客生涯価値）

#### Course Progress（コース進捗）
- コース受講状況
- レッスン完了率
- エンゲージメント指標

### 3.2 データ分析オプション

各レポートカテゴリーをクリックすると：
- 詳細なフィルタリングオプション
- データ分析ツール
- カスタマイズ可能なビュー
- エクスポート機能

### 3.3 エクスポート機能

- CSV形式でのデータエクスポート
- レポートのスケジューリング
- カスタムデータセットの作成

## 4. ライブビューセクション

### 4.1 リアルタイムイベントフィード

ライブビューページでは、以下のリアルタイムユーザーアクティビティを追跡：

#### ユーザーインタラクション
- **Pageview（ページビュー）**: 訪問者がファネルページを閲覧
- **Visit（訪問）**: 訪問者がページに着地
- **Opt-In（オプトイン）**: 訪問者がオプトインフォームを送信
- **Link Click（リンククリック）**: ユーザーが追跡リンクをクリック
- **URL Redirect Click（URLリダイレクトクリック）**: ユーザーが追跡URLを通じてリダイレクト

#### 注文・取引
- Orders（注文）
- Subscriptions（サブスクリプション）

#### ワークフロー・自動化
- Workflow Events（ワークフローイベント）

#### コミュニケーション
- Messages（メッセージ）
- Email Opens（メール開封）

#### コース関連
- **Opt-ins（オプトイン）**
- **Course Lesson Views（コースレッスン閲覧）**
- **Course Sections Viewed（コースセクション閲覧）**
- **Course Views（コース閲覧）**
- **Topics Subscribed（トピック購読）**

### 4.2 イベントデータの保存

- すべてのイベントは分析データとしてClickFunnels 2.0に保存
- 時系列での表示
- リアルタイムフィードで即座に確認可能

### 4.3 ライブビューの用途

- エンゲージメントの追跡
- 問題のトラブルシューティング
- ビジネスパフォーマンスの監視
- キャンペーンの即時評価

## 5. メールブロードキャストアナリティクス

### 5.1 パフォーマンス指標

ブロードキャスト送信後、以下のメトリクスが利用可能：

#### エンゲージメント指標
- **Opens（開封数）**: メールを開封した受信者数
- **Clicks（クリック数）**: メール内のリンクをクリックした数
- **Unsubscribes（購読解除数）**: 購読解除した受信者数

#### 収益指標
- **Attributed Revenue（帰属収益）**: メールから発生した収益
- リアルタイムでの更新
- 各送信済みブロードキャストで利用可能

## 6. Google Analytics 4 (GA4) 連携

### 6.1 統合の前提条件

- アクティブなClickFunnelsアカウント
- ワークスペースに追加されたSite & Blogアプリ
- Googleアナリティクスアカウント
- GoogleアナリティクスアカウントでGA4プロパティが利用可能

### 6.2 GA4データストリームの作成

#### 初回セットアップ
1. GA4で、Data Collection and Modification → Data Streamsを選択
2. Add stream → Webをクリック
3. ウェブサイトのURLとストリーム名を入力
4. Enhanced Measurement（強化された測定）はデフォルトでオン（page_view、scrollなどの一般的なイベントを送信）
5. Create & Continueをクリック
6. ストリーム詳細でMeasurement ID（形式：G-XXXXXXXXXX）をコピー

### 6.3 APIシークレットの作成（オプションだが推奨）

1. 同じWebデータストリームからMeasurement Protocol API secretsまでスクロール
2. Createをクリック
3. ニックネーム（例：ClickFunnels Site）を入力
4. Createをクリック
5. Secret値をコピーして安全に保管

### 6.4 ClickFunnels側の設定

1. ClickFunnelsワークスペースでSite & Blogアプリに移動
2. Secret値をGA4/GTM Api Secretに貼り付け
3. Measurement IDを該当フィールドに貼り付け

#### gtagインジェクション設定
- **On（推奨）**: 他の場所でGoogle Analytics/gtagまたはGoogle Tag Managerを読み込んでいない場合
  - ClickFunnelsがすべてのページにgtag.jsを自動注入
- **Off**: すでに他の方法でgtag/GAまたはGTMを読み込んでいる場合
  - 重複したページビューとイベントを防ぐため

### 6.5 追跡されるデータ

#### Measurement IDのみの場合
- gtag.jsを介したブラウザサイドイベントを記録

#### API Secretも追加した場合
- ClickFunnelsからの追加のサーバーサイドイベント配信が有効化
- 現在、ClickFunnelsが送信する追加のサーバーサイドイベント：
  - **generate_lead**: リード生成イベント

### 6.6 代替方法：手動コードインストール

1. ClickFunnelsアカウントにログイン
2. 追跡したいファネルに移動
3. Settingsタブを開く
4. Head Tracking Codeセクションまでスクロール
5. GA4トラッキングコード（Googleアナリティクスから提供された完全なスクリプト）を貼り付け

### 6.7 GA4統合のメリット

#### AI駆動の予測メトリクス
- **Purchase Probability（購入確率）**: 短期間（通常7日未満）でのユーザーコンバージョンの可能性
- **Churn Probability（解約確率）**: 消費者行動の推定損失または放棄
- **Predicted Revenue（予測収益）**: 次の月の推定収益

### 6.8 サードパーティ統合オプション

#### Zapier統合
- コード不要でClickFunnelsとGA4を統合
- フォーム送信、予約、購入などの主要イベントをGA4に直接送信

#### CustomerLabs 1PD Ops
- 大規模なコードなしでClickFunnels全体のユーザージャーニーを追跡
- Measurement Protocol API Secretsを使用してサーバーサイドからデータを送信

## 7. Meta Pixel & Conversions API 連携

### 7.1 デュアルチャネルトラッキングの仕組み

#### Meta Pixel（ブラウザサイド）
- ブラウザベースのトラッキング
- ピクセルコードによるイベント追跡

#### Conversions API（サーバーサイド）
- ウェブサイトまたはサーバーとMetaの間の直接的で安全な接続を作成
- ブラウザに依存せず、ClickFunnelsのサーバーからMetaのシステムに直接コンバージョンイベントを送信
- ユーザーがブラウザのクッキーをブロックまたはトラッキングをオプトアウトしても、購入やオプトインなどのイベントを正確に追跡

#### 併用のメリット
- データ精度の向上
- シグナル損失の最小化
- Facebookが推奨する両方を使用するアプローチ

### 7.2 セットアップ要件

- **カスタムドメインが必須**: ドメイン検証が必要
- ClickFunnelsサブドメインはCAPIでは機能しない

### 7.3 ClickFunnels側の設定手順

1. ワークスペースから左側メニューのSite & Blogアプリをクリック
2. Site Settingsを選択
3. Tracking Codesセクションまでスクロール
4. Dataset IDをFacebook Pixel IDフィールドに貼り付け
5. Access TokenをFacebook Access Tokenフィールドに貼り付け

### 7.4 自動トラッキング機能

#### 購入の自動トラッキング
- ピクセルが有効になっているアカウントからのすべての購入で自動的にコンバージョンを送信
- 追加設定は不要

### 7.5 テストに関する注意事項

- **Facebook Pixel Helperは動作しない**: Conversions API統合では仕様上使用不可
- イベントトラッキングのテストはFacebookのEvents Manager設定内で実施

### 7.6 既知の制限事項

- ClickFunnelsの直接Conversions API統合には複数の問題が存在
- セットアップが複雑
- CAPIセットアップを通じてMetaに送信されるデータが不明確
- ClickFunnelsにはFacebookが推奨するすべてのベストプラクティスが組み込まれていない完全なFacebook Conversion APIがない

### 7.7 代替アプローチ：サーバーサイドGTM

ClickFunnelsのトラッキング精度を向上させる方法：
- サーバーサイドトラッキング、特にサーバーGoogle Tag Manager経由でのFacebook Conversion APIの実装

### 7.8 2025年のプライバシー環境

#### Apple Advanced Fingerprinting Protection
- すべてのSafariブラウジングで有効化
- 高エントロピー識別子をカットオフ
- フィンガープリンティングスクリプトをブロック
- クライアントサイドトラッキングの信頼性が低下
- Conversions API統合の重要性がさらに増大

## 8. プラン別アナリティクス機能

### 8.1 Basic & Proプラン
- Basic Analytics機能を提供
- すべての基本的なメトリクスとレポート
- 無料で含まれる

### 8.2 Funnel Hackerプラン
- Advanced Analytics機能を提供
- より詳細な分析機能
- 高度なセグメンテーション

### 8.3 Optimize Plan ($297/月)
- エージェンシーおよび大規模ビジネス向け
- 複数のウェブサイトにわたる高度なアナリティクス
- エンタープライズレベルのインサイト

## 9. サードパーティアナリティクス統合

### 9.1 トラッキングコードの追加

ファネルに追加できるトラッキングコード：
- Google Analytics
- Facebook Pixel
- その他のトラッキングツール

#### 追加方法
- ファネルのヘッダーまたはフッターに簡単に追加
- ユーザー行動に関する貴重なデータを収集
- キャンペーンパフォーマンスの測定
- より良い結果のためのファネル最適化

### 9.2 SegMetrics統合

ClickFunnelsレポーティングのための別オプション：
- 各ステージで最もパフォーマンスの高い顧客セグメントの特定
- ファーストパーティトラッキングピクセル
- 広告ブロッカーやプライバシー設定によるブロックを回避

## 10. 技術仕様

### 10.1 データ更新頻度

- **リアルタイム更新**: ライブビュー、主要メトリクス
- **準リアルタイム**: 詳細レポート（数分遅延）
- **バッチ処理**: 一部の集計データ（時間単位または日次）

### 10.2 データ保持期間

- イベントデータの長期保存
- カスタム期間でのレポート生成
- 履歴データの比較分析

### 10.3 パフォーマンス要件

- ダッシュボードの高速読み込み（3秒以内）
- 大量データでもスムーズなフィルタリング
- リアルタイムデータストリーミングの低遅延

### 10.4 セキュリティ・プライバシー

- GDPR準拠のデータ処理
- ユーザープライバシー設定の尊重
- データアクセス権限の細かい制御
- 監査ログの記録

## 実装優先度

### フェーズ1（MVP）
1. アナリティクス概要ダッシュボード
   - 主要KPIメトリクスの表示
   - 基本的な日付フィルタリング
   - シンプルなチャート表示

2. ファネルアナリティクス
   - ファネルごとの基本メトリクス
   - ステップ別コンバージョン率
   - 簡易レポート

3. ライブビュー
   - リアルタイムイベントフィード
   - 基本的なイベントタイプ（ページビュー、オプトイン、購入）

### フェーズ2（機能拡張）
1. レポーティングページ
   - カテゴリ別詳細レポート
   - データエクスポート機能
   - カスタムレポート作成

2. 期間比較機能
   - 過去データとの比較
   - トレンド分析

3. 外部連携準備
   - トラッキングコード埋め込み機能
   - Webhook基盤

### フェーズ3（高度な機能）
1. Google Analytics 4連携
   - 完全統合
   - サーバーサイドトラッキング
   - カスタムイベント

2. Meta Pixel & Conversions API
   - ピクセル統合
   - CAPI実装
   - イベントマッピング

3. 高度なセグメンテーション
   - カスタムディメンション
   - コホート分析
   - 予測アナリティクス

## 参考資料

本要件定義書は、以下の公式ドキュメントおよび情報源を基に作成されました：

- [Understanding the Analytics Overview Dashboard](https://support.myclickfunnels.com/docs/understanding-the-analytics-overview-dashboard)
- [ClickFunnels 2.0 Analytics, Reporting & Statistics (2025)](https://supplygem.com/clickfunnels-analytics/)
- [Funnel Analytics Dashboard Overview](https://support.myclickfunnels.com/docs/funnel-analytics-dashboard-overview)
- [Analytics Reporting Page Overview](https://support.myclickfunnels.com/docs/analytics-reporting-section-overview)
- [Analytics Live View Page Overview](https://support.myclickfunnels.com/docs/analytics-live-view-section-overview)
- [Sales Funnel Analytics](https://www.clickfunnels.com/apps/analytics)
- [Connecting Google Analytics (GA4) to ClickFunnels](https://support.myclickfunnels.com/docs/connecting-google-analytics-ga4-to-clickfunnels)
- [Add Google Analytics to Clickfunnels](https://www.simpleanalytics.com/glossary/google-analytics/add-google-analytics-to-clickfunnels)
- [Connecting Meta Pixel and the Conversions API to ClickFunnels](https://support.myclickfunnels.com/docs/connecting-meta-pixel-and-the-conversions-api-to-clickfunnels)
- [The Best ClickFunnels Reporting Dashboards - SegMetrics](https://segmetrics.io/integration/clickfunnels/)
