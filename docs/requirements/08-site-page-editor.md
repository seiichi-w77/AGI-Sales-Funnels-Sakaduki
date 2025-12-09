# サイト/ページエディター機能要件定義書

## 1. 概要

### 1.1 目的
ClickFunnelsのサイト/ページエディターは、ユーザーがドラッグ&ドロップ操作でランディングページ、ウェブサイト、ブログを構築できるビジュアルエディターです。この文書は、その完全クローンを実装するための詳細な機能要件を定義します。

### 1.2 主要機能領域
- ページ構造管理（セクション、行、カラム）
- コンテンツ要素（見出し、ボタン、画像、動画、入力フィールド等）
- レイアウトシステム
- スタイル管理（グローバル/ローカル）
- テーマシステム
- レスポンシブデザイン
- ポップアップ機能
- ヘッダー/フッター管理
- ブログ機能
- ドメイン接続
- カスタムCSS

---

## 2. エディターコア機能

### 2.1 エディターインターフェース

#### 2.1.1 メインツールバー
**必須UI要素:**
- 保存ボタン（自動保存インジケーター付き）
- プレビューボタン（デスクトップ/タブレット/モバイル切替）
- 公開ボタン
- 設定ボタン
- 元に戻す/やり直しボタン
- デバイスビュー切替（デスクトップ/タブレット/モバイル）

**技術要件:**
```typescript
interface EditorToolbar {
  save: () => Promise<void>;
  autoSave: boolean;
  autoSaveInterval: number; // ミリ秒
  preview: (device: 'desktop' | 'tablet' | 'mobile') => void;
  publish: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  undoStack: EditorState[];
  redoStack: EditorState[];
}
```

#### 2.1.2 左サイドパネル（要素パネル）
**カテゴリー構成:**
1. コンテンツ要素
   - 見出し（Headline）
   - テキスト（Text/Paragraph）
   - ボタン（Button）
   - 画像（Image）
   - 動画（Video）
   - リスト（List）

2. フォーム要素
   - 入力フィールド（Input）
   - テキストエリア（Textarea）
   - セレクトボックス（Select）
   - チェックボックス（Checkbox）
   - ラジオボタン（Radio）
   - フォーム（Form Container）

3. メディア要素
   - 画像ギャラリー
   - 動画プレーヤー
   - オーディオ
   - iframe/埋め込み

4. レイアウト要素
   - セクション（Section）
   - 行（Row）
   - カラム（Column）
   - スペーサー（Spacer）

5. 高度な要素
   - アコーディオン（Accordion/Details）
   - タブ
   - カルーセル
   - ポップアップトリガー
   - カウントダウンタイマー

**実装要件:**
```typescript
interface ElementCategory {
  id: string;
  name: string;
  icon: string;
  elements: Element[];
  collapsed: boolean;
}

interface Element {
  id: string;
  name: string;
  icon: string;
  category: string;
  defaultProps: Record<string, any>;
  component: React.ComponentType;
}
```

#### 2.1.3 右サイドパネル（プロパティパネル）
**動的表示:**
選択された要素に応じてプロパティを表示

**共通プロパティタブ:**
- スタイル（Style）
- レイアウト（Layout）
- 詳細設定（Advanced）

**実装要件:**
```typescript
interface PropertyPanel {
  selectedElement: string | null;
  tabs: PropertyTab[];
  activeTab: string;
}

interface PropertyTab {
  id: string;
  label: string;
  icon: string;
  properties: Property[];
}

interface Property {
  id: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'toggle' | 'slider' | 'spacing' | 'border' | 'shadow';
  value: any;
  options?: any[];
  unit?: string;
  responsive?: boolean; // デバイス別設定可能か
}
```

#### 2.1.4 キャンバスエリア
**機能要件:**
- ドラッグ&ドロップ対応
- インライン編集（テキスト要素）
- 要素選択ハイライト
- ホバー時アウトライン表示
- 要素境界線表示（セクション/行/カラム）
- グリッドライン表示（オプション）
- スナップ機能

**インタラクション:**
```typescript
interface CanvasInteraction {
  // ドラッグ&ドロップ
  onDragStart: (elementId: string) => void;
  onDragOver: (targetId: string, position: 'before' | 'after' | 'inside') => void;
  onDrop: (elementId: string, targetId: string, position: string) => void;

  // 選択
  onSelect: (elementId: string) => void;
  onMultiSelect: (elementIds: string[]) => void;

  // 編集
  onInlineEdit: (elementId: string) => void;

  // コピー/ペースト
  onCopy: (elementId: string) => void;
  onPaste: (targetId: string) => void;
  onDuplicate: (elementId: string) => void;

  // 削除
  onDelete: (elementId: string) => void;
}
```

---

## 3. ページ構造システム

### 3.1 セクション（Section）

#### 3.1.1 概要
セクションはページの最上位コンテナで、ページを論理的なブロックに分割します。

#### 3.1.2 プロパティ
**レイアウト:**
- 幅設定
  - ボックス型（Boxed）: 最大幅設定（例: 1400px, 90%）
  - 全幅（Full Width）
  - カスタム幅
- 高さ設定
  - 自動（Auto）
  - ビューポート高さ（100vh, 50vh等）
  - カスタムピクセル値
- パディング（上下左右個別設定可能）
  - デスクトップ/タブレット/モバイル別設定
- マージン（上下のみ）

**背景:**
- 背景色
- グラデーション（線形、放射状）
- 背景画像
  - アップロード方式
  - 位置（top, center, bottom, left, right, custom）
  - サイズ（cover, contain, custom）
  - リピート（repeat, no-repeat, repeat-x, repeat-y）
  - 固定/スクロール（fixed, scroll）
  - オーバーレイ色と透明度
- 背景動画
  - MP4対応
  - 自動再生
  - ループ
  - ミュート
  - オーバーレイ色と透明度

**ボーダー:**
- 上下左右個別設定
- スタイル（solid, dashed, dotted）
- 太さ
- 色
- 角丸（border-radius）

**エフェクト:**
- ボックスシャドウ
  - 水平オフセット
  - 垂直オフセット
  - ぼかし
  - 広がり
  - 色
- パララックス効果

**詳細設定:**
- カスタムID
- カスタムクラス
- z-index
- オーバーフロー（visible, hidden, scroll）
- ビジビリティ（デバイス別表示/非表示）

**データモデル:**
```typescript
interface Section {
  id: string;
  type: 'section';
  name: string;

  // レイアウト
  layout: {
    width: {
      type: 'boxed' | 'full' | 'custom';
      value?: string;
      maxWidth?: string;
    };
    height: {
      type: 'auto' | 'viewport' | 'custom';
      value?: string;
    };
    padding: ResponsiveSpacing;
    margin: {
      top: string;
      bottom: string;
    };
  };

  // 背景
  background: {
    type: 'color' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: Gradient;
    image?: BackgroundImage;
    video?: BackgroundVideo;
  };

  // ボーダー
  border: Border;
  borderRadius: ResponsiveSpacing;

  // エフェクト
  shadow: BoxShadow;
  parallax?: {
    enabled: boolean;
    speed: number;
  };

  // 詳細
  advanced: {
    id?: string;
    className?: string;
    zIndex?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    visibility: DeviceVisibility;
  };

  // 子要素
  rows: Row[];
}

interface ResponsiveSpacing {
  desktop: Spacing;
  tablet: Spacing;
  mobile: Spacing;
}

interface Spacing {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}
```

### 3.2 行（Row）

#### 3.2.1 概要
行はセクション内のコンテナで、カラムを配置するための横方向のグループです。

#### 3.2.2 プロパティ
**レイアウト:**
- カラム数（1-12カラム）
- カラム比率設定
  - 均等分割
  - カスタム比率（例: 2:1, 1:2:1）
- ギャップ（カラム間隔）
  - 水平ギャップ
  - 垂直ギャップ（折り返し時）
- 配置
  - 水平配置: flex-start, center, flex-end, space-between, space-around, space-evenly
  - 垂直配置: flex-start, center, flex-end, stretch
- 折り返し設定（レスポンシブ）

**背景/スタイル:**
- セクションと同様のプロパティ（背景、ボーダー、影）

**レスポンシブ:**
- デバイス別カラム数変更
  - デスクトップ: 3カラム
  - タブレット: 2カラム
  - モバイル: 1カラム（スタック）

**データモデル:**
```typescript
interface Row {
  id: string;
  type: 'row';
  name: string;

  layout: {
    columns: number;
    columnRatios: number[]; // 例: [1, 2, 1] = 1:2:1
    gap: {
      horizontal: string;
      vertical: string;
    };
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    wrap: boolean;
    responsive: {
      desktop: { columns: number };
      tablet: { columns: number };
      mobile: { columns: number };
    };
  };

  background: Background;
  border: Border;
  borderRadius: ResponsiveSpacing;
  shadow: BoxShadow;
  padding: ResponsiveSpacing;
  margin: ResponsiveSpacing;

  advanced: {
    id?: string;
    className?: string;
    zIndex?: number;
    visibility: DeviceVisibility;
  };

  columns: Column[];
}
```

### 3.3 カラム（Column）

#### 3.3.1 概要
カラムは行内の垂直コンテナで、実際のコンテンツ要素を配置します。

#### 3.3.2 プロパティ
**レイアウト:**
- 幅（パーセンテージまたはflex値）
- パディング
- 垂直配置（align-self）

**レスポンシブ動作:**
- デバイス別幅調整
- スタック順序（order プロパティ）

**背景/スタイル:**
- セクション・行と同様のプロパティ

**データモデル:**
```typescript
interface Column {
  id: string;
  type: 'column';
  name: string;

  layout: {
    width: ResponsiveValue<string>; // 例: { desktop: '33.33%', tablet: '50%', mobile: '100%' }
    order: ResponsiveValue<number>; // レスポンシブ順序変更
    alignSelf: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
  };

  padding: ResponsiveSpacing;
  background: Background;
  border: Border;
  borderRadius: ResponsiveSpacing;

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };

  elements: ContentElement[];
}

interface ResponsiveValue<T> {
  desktop: T;
  tablet: T;
  mobile: T;
}
```

---

## 4. コンテンツ要素詳細

### 4.1 見出し（Headline）

#### 4.1.1 概要
ページの主要なタイトルやサブタイトルを表示する要素。

#### 4.1.2 プロパティ

**コンテンツ:**
- テキスト内容（リッチテキスト対応）
- HTMLタグ（h1, h2, h3, h4, h5, h6, p, span）

**タイポグラフィ:**
- フォントファミリー
- フォントサイズ（レスポンシブ対応）
- フォントウェイト（100-900）
- 行間（line-height）
- 文字間隔（letter-spacing）
- テキスト変換（uppercase, lowercase, capitalize）
- テキスト装飾（underline, line-through）
- テキスト配置（left, center, right, justify）

**色とエフェクト:**
- テキスト色
- テキストシャドウ
  - 水平オフセット
  - 垂直オフセット
  - ぼかし
  - 色

**アイコン:**
- アイコン（前）
  - アイコンライブラリ（Font Awesome等）
  - サイズ
  - 色
  - 間隔
- アイコン（後）
  - 同上

**レイアウト:**
- マージン（上下左右）
- パディング（上下左右）

**データモデル:**
```typescript
interface HeadlineElement {
  id: string;
  type: 'headline';
  name: string;

  content: {
    text: string;
    htmlTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  };

  typography: {
    fontFamily: string;
    fontSize: ResponsiveValue<string>;
    fontWeight: number;
    lineHeight: string;
    letterSpacing: string;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration: 'none' | 'underline' | 'line-through';
    textAlign: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  };

  color: string;
  textShadow: TextShadow;

  icons: {
    before?: Icon;
    after?: Icon;
  };

  spacing: {
    margin: ResponsiveSpacing;
    padding: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}

interface TextShadow {
  enabled: boolean;
  horizontal: string;
  vertical: string;
  blur: string;
  color: string;
}

interface Icon {
  library: 'fontawesome' | 'custom';
  icon: string;
  size: string;
  color: string;
  spacing: string;
}
```

### 4.2 ボタン（Button）

#### 4.2.1 概要
ユーザーアクションを促す重要な要素。フォーム送信、ページ遷移、ポップアップ表示などのアクションをトリガーします。

#### 4.2.2 プロパティ

**コンテンツ:**
- ボタンテキスト
- アイコン（前/後）

**アクション:**
- アクションタイプ
  - リンク（URL）
  - ポップアップを開く
  - セクションへスクロール
  - フォーム送信
  - JavaScript実行
- リンク先URL
- 新しいタブで開く（_blank）
- リンクにnofollow追加

**スタイル:**
- 背景色
- テキスト色
- ボーダー（幅、スタイル、色、角丸）
- パディング（上下、左右）
- フォント設定（ファミリー、サイズ、ウェイト）
- ボックスシャドウ

**ホバー状態:**
- ホバー背景色
- ホバーテキスト色
- ホバーボーダー色
- トランジション速度

**サイズとレイアウト:**
- 幅（auto, 100%, カスタム）
- 配置（left, center, right）
- マージン

**データモデル:**
```typescript
interface ButtonElement {
  id: string;
  type: 'button';
  name: string;

  content: {
    text: string;
    icon?: Icon;
    iconPosition: 'before' | 'after';
  };

  action: {
    type: 'link' | 'popup' | 'scroll' | 'submit' | 'javascript';
    value: string; // URL, ポップアップID, セクションID等
    target: '_self' | '_blank';
    nofollow: boolean;
  };

  style: {
    backgroundColor: string;
    textColor: string;
    border: Border;
    borderRadius: string;
    padding: {
      vertical: string;
      horizontal: string;
    };
    typography: Typography;
    shadow: BoxShadow;
  };

  hover: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    transition: string; // 例: '0.2s ease-in-out'
  };

  layout: {
    width: string;
    alignment: 'left' | 'center' | 'right';
    margin: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

### 4.3 画像（Image）

#### 4.3.1 概要
ページに画像を表示する要素。複数のアップロード方法と豊富なカスタマイズオプションを提供。

#### 4.3.2 画像ソース

**アップロード方法:**
1. ファイルアップロード
   - 対応フォーマット: JPG, PNG, SVG, GIF, WEBP, ICO
   - 最大サイズ: 10MB
   - 推奨サイズ: 3MB以下

2. ダイナミック画像
   - ワークスペースアセット（サイトロゴ等）
   - 複数ページで自動同期

3. 画像ライブラリ
   - Iconfinder
   - Freepik
   - Pixabay
   - Unsplash
   - その他統合サービス

4. AI生成
   - Marketing.ai統合
   - テキストプロンプトから画像生成

**URL指定:**
- 外部画像URL直接指定

#### 4.3.3 プロパティ

**サイズと比率:**
- アスペクト比
  - スクエア（1:1）
  - ランドスケープ（16:9, 4:3等）
  - ポートレート（9:16, 3:4等）
  - カスタム
  - 元のまま（Original）
- 幅・高さ
  - ピクセル値
  - パーセンテージ
  - auto
- オブジェクトフィット
  - fill（塗りつぶし）
  - contain（収める）
  - cover（カバー）
  - scale-down（縮小のみ）

**配置:**
- 水平配置（left, center, right）
- 垂直配置（top, center, bottom）
- レスポンシブ配置（デバイス別）

**最適化:**
- 遅延読み込み（Lazy Loading）
  - 有効/無効
- 画質設定
  - 製品画像: 80%以上推奨
  - 装飾画像: 50-60%推奨

**リンクとアクション:**
- リンクURL
- 新しいタブで開く
- Lightbox（画像拡大表示）
- ポップアップトリガー

**スタイル:**
- 角丸（border-radius）
- ボーダー
- ボックスシャドウ
- フィルター
  - 明るさ
  - コントラスト
  - 彩度
  - グレースケール
  - セピア
  - ぼかし
- パディング
- マージン

**SEOとアクセシビリティ:**
- Alt テキスト（代替テキスト）
- Title 属性

**データモデル:**
```typescript
interface ImageElement {
  id: string;
  type: 'image';
  name: string;

  source: {
    type: 'upload' | 'dynamic' | 'library' | 'ai' | 'url';
    value: string; // URL or asset ID
    uploadedFile?: File;
    aiPrompt?: string;
  };

  dimensions: {
    aspectRatio: string; // '1:1', '16:9', 'custom', 'original'
    width: ResponsiveValue<string>;
    height: ResponsiveValue<string>;
    objectFit: 'fill' | 'contain' | 'cover' | 'scale-down';
    position: {
      horizontal: 'left' | 'center' | 'right';
      vertical: 'top' | 'center' | 'bottom';
    };
  };

  optimization: {
    lazyLoad: boolean;
    quality: number; // 0-100
  };

  action?: {
    type: 'link' | 'lightbox' | 'popup';
    value: string;
    target?: '_self' | '_blank';
  };

  style: {
    borderRadius: ResponsiveSpacing;
    border: Border;
    shadow: BoxShadow;
    filters: {
      brightness: number; // 0-200
      contrast: number; // 0-200
      saturate: number; // 0-200
      grayscale: number; // 0-100
      sepia: number; // 0-100
      blur: string; // 例: '5px'
    };
  };

  spacing: {
    padding: ResponsiveSpacing;
    margin: ResponsiveSpacing;
  };

  seo: {
    alt: string;
    title: string;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

### 4.4 動画（Video）

#### 4.4.1 概要
ページに動画を埋め込む要素。YouTube、Vimeo、自社ホスティング動画に対応。

#### 4.4.2 動画ソース

**対応プラットフォーム:**
- YouTube
- Vimeo
- 直接アップロード（MP4等）
- カスタムURL

#### 4.4.3 プロパティ

**動画設定:**
- 動画URL/埋め込みコード
- アスペクト比（16:9, 4:3, 1:1, カスタム）
- 幅・高さ設定
- サムネイル画像（カスタム）

**再生設定:**
- 自動再生（Autoplay）
- ループ再生（Loop）
- ミュート（Mute）
- コントロール表示/非表示
- 関連動画表示（YouTubeの場合）
- プレーヤーブランディング（Vimeoの場合）

**スタイル:**
- 角丸
- ボーダー
- ボックスシャドウ
- マージン・パディング

**データモデル:**
```typescript
interface VideoElement {
  id: string;
  type: 'video';
  name: string;

  source: {
    type: 'youtube' | 'vimeo' | 'upload' | 'url';
    value: string; // URL or video ID
    embedCode?: string;
    uploadedFile?: File;
  };

  dimensions: {
    aspectRatio: string; // '16:9', '4:3', '1:1', 'custom'
    width: ResponsiveValue<string>;
    height: ResponsiveValue<string>;
  };

  thumbnail?: {
    type: 'auto' | 'custom';
    url?: string;
  };

  playback: {
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
    relatedVideos?: boolean; // YouTube
    branding?: boolean; // Vimeo
  };

  style: {
    borderRadius: ResponsiveSpacing;
    border: Border;
    shadow: BoxShadow;
  };

  spacing: {
    margin: ResponsiveSpacing;
    padding: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

### 4.5 入力フィールド（Input）

#### 4.5.1 概要
フォームでユーザー入力を収集するテキストフィールド要素。

#### 4.5.2 入力タイプ

**対応タイプ:**
- text（テキスト）
- email（メールアドレス）
- tel（電話番号）
- number（数値）
- password（パスワード）
- url（URL）
- date（日付）
- time（時刻）
- textarea（複数行テキスト）

#### 4.5.3 プロパティ

**フィールド設定:**
- ラベルテキスト
- プレースホルダー
- デフォルト値
- フィールド名（name属性）
- 必須フィールド
- 読み取り専用
- 無効化

**検証:**
- 必須検証
- メール形式検証
- 電話番号形式検証
- 最小/最大文字数
- カスタム正規表現パターン
- エラーメッセージカスタマイズ

**スタイル:**
- 幅（%, px, auto）
- 高さ
- パディング
- フォント設定
- テキスト色
- 背景色
- ボーダー（通常時、フォーカス時、エラー時）
- 角丸
- ボックスシャドウ

**ラベルスタイル:**
- 位置（上、左、プレースホルダーのみ）
- フォント設定
- 色
- 間隔

**データモデル:**
```typescript
interface InputElement {
  id: string;
  type: 'input';
  name: string;

  field: {
    inputType: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'date' | 'time' | 'textarea';
    label: string;
    placeholder: string;
    defaultValue?: string;
    name: string; // form field name
    required: boolean;
    readonly: boolean;
    disabled: boolean;
  };

  validation: {
    required: boolean;
    email?: boolean;
    phone?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // regex
    errorMessages: {
      required?: string;
      invalid?: string;
      custom?: string;
    };
  };

  style: {
    width: ResponsiveValue<string>;
    height: string;
    padding: Spacing;
    typography: Typography;
    textColor: string;
    backgroundColor: string;
    border: {
      normal: Border;
      focus: Border;
      error: Border;
    };
    borderRadius: string;
    shadow: BoxShadow;
  };

  label: {
    position: 'top' | 'left' | 'placeholder';
    typography: Typography;
    color: string;
    spacing: string;
  };

  spacing: {
    margin: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
    autocomplete?: string;
  };
}
```

### 4.6 その他のコンテンツ要素

#### 4.6.1 テキスト/段落（Text/Paragraph）
```typescript
interface TextElement {
  id: string;
  type: 'text';
  name: string;

  content: {
    html: string; // リッチテキストHTML
  };

  typography: Typography;
  color: string;

  spacing: {
    margin: ResponsiveSpacing;
    padding: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

#### 4.6.2 リスト（List）
```typescript
interface ListElement {
  id: string;
  type: 'list';
  name: string;

  listType: 'ul' | 'ol';
  items: string[]; // HTML content for each item

  style: {
    listStyle: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'lower-roman' | 'none';
    typography: Typography;
    color: string;
    itemSpacing: string;
  };

  spacing: {
    margin: ResponsiveSpacing;
    padding: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

#### 4.6.3 スペーサー（Spacer）
```typescript
interface SpacerElement {
  id: string;
  type: 'spacer';
  name: string;

  height: ResponsiveValue<string>;

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}
```

#### 4.6.4 アコーディオン（Accordion）
```typescript
interface AccordionElement {
  id: string;
  type: 'accordion';
  name: string;

  items: AccordionItem[];

  style: {
    headerBackground: string;
    headerTextColor: string;
    contentBackground: string;
    contentTextColor: string;
    border: Border;
    typography: Typography;
  };

  behavior: {
    multipleOpen: boolean; // 複数同時展開可能か
    defaultOpen?: number[]; // デフォルトで開くアイテムのインデックス
  };

  spacing: {
    margin: ResponsiveSpacing;
    padding: ResponsiveSpacing;
  };

  advanced: {
    id?: string;
    className?: string;
    visibility: DeviceVisibility;
  };
}

interface AccordionItem {
  id: string;
  title: string;
  content: string; // HTML
  icon?: string;
}
```

---

## 5. ポップアップ機能

### 5.1 概要
ポップアップは、ページ上にオーバーレイとして表示されるモーダルウィンドウです。

### 5.2 ポップアップタイプ

**表示形式:**
- モーダル（中央表示、背景オーバーレイ付き）
- バー（画面上部/下部の帯状表示）
- スライドイン（画面端からスライド）

**配置オプション:**
- top-left（左上）
- top-center（中央上）
- top-right（右上）
- bottom-left（左下）
- bottom-center（中央下）
- bottom-right（右下）
- center（中央）

### 5.3 トリガー設定

**トリガータイプ:**
- ページ読み込み時（タイムディレイ設定可能）
- スクロール率（例: 50%スクロール時）
- 要素クリック（ボタン等）
- 離脱意図（Exit Intent）
- 一定時間経過後
- カスタムJavaScriptイベント

### 5.4 プロパティ

**サイズ:**
- 幅（px, %, vw）
- 高さ（auto, px, %, vh）
- 最大幅/最大高さ

**コンテンツ:**
- セクション/行/カラム構造を内包
- 全てのコンテンツ要素を配置可能

**背景オーバーレイ:**
- 背景色
- 透明度
- ぼかし効果（backdrop-filter）

**閉じるボタン:**
- 表示/非表示
- 位置（右上、左上等）
- スタイル（アイコン、テキスト）
- 色

**動作:**
- オーバーレイクリックで閉じる
- ESCキーで閉じる
- 自動クローズ（タイマー設定）
- スクロール無効化

**頻度制御:**
- 1回のみ表示
- セッションごとに1回
- 訪問ごとに1回
- 常に表示
- Cookie有効期限設定

**アニメーション:**
- フェードイン/アウト
- スライドイン（上下左右）
- ズーム
- アニメーション速度

**データモデル:**
```typescript
interface Popup {
  id: string;
  name: string;

  type: 'modal' | 'bar' | 'slide-in';
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';

  trigger: {
    type: 'load' | 'scroll' | 'click' | 'exit' | 'time' | 'custom';
    delay?: number; // ms
    scrollPercent?: number; // 0-100
    elementId?: string; // for click trigger
    customEvent?: string;
  };

  dimensions: {
    width: string;
    height: string;
    maxWidth?: string;
    maxHeight?: string;
  };

  content: Section[]; // ポップアップ内のセクション構造

  overlay: {
    backgroundColor: string;
    opacity: number; // 0-1
    blur?: string;
  };

  closeButton: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    style: 'icon' | 'text' | 'custom';
    color: string;
    size: string;
  };

  behavior: {
    closeOnOverlayClick: boolean;
    closeOnEscape: boolean;
    autoClose?: number; // ms
    disableScroll: boolean;
  };

  frequency: {
    type: 'once' | 'session' | 'visit' | 'always';
    cookieExpiry?: number; // days
  };

  animation: {
    enter: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';
    exit: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';
    duration: string; // 例: '0.3s'
  };

  advanced: {
    zIndex: number;
    className?: string;
  };
}
```

---

## 6. ヘッダー・フッター管理

### 6.1 概要
ヘッダーとフッターは、サイト全体で共有されるグローバルセクションです。

### 6.2 ヘッダー

#### 6.2.1 タイプ

**固定ヘッダー:**
- スクロール時も画面上部に固定
- z-index管理で常に最前面

**静的ヘッダー:**
- ページと共にスクロール

**スティッキーヘッダー:**
- 一定スクロール後に固定

#### 6.2.2 プロパティ

**レイアウト:**
- 高さ（auto, 固定値）
- 幅（全幅、ボックス）
- パディング
- 背景（色、画像、透明度）
- ボーダー（下部）
- ボックスシャドウ

**ナビゲーション:**
- ロゴ
  - 画像/テキスト
  - サイズ
  - リンク先
- メニュー項目
  - テキスト
  - リンク先
  - ドロップダウン（サブメニュー）
  - アクティブ状態スタイル
- CTA（コールトゥアクション）ボタン
- 検索バー

**レスポンシブ:**
- ハンバーガーメニュー（モバイル）
- モバイルメニュースタイル
- ブレークポイント設定

**スクロール時の動作:**
- 背景色変更
- 高さ変更（縮小）
- シャドウ追加/変更

**データモデル:**
```typescript
interface Header {
  id: string;
  name: string;
  type: 'global' | 'local'; // グローバル or ページ固有

  position: {
    type: 'static' | 'fixed' | 'sticky';
    stickyOffset?: string; // sticky時のtop値
  };

  layout: {
    height: ResponsiveValue<string>;
    width: 'full' | 'boxed';
    maxWidth?: string;
    padding: ResponsiveSpacing;
    background: Background;
    border: {
      bottom?: Border;
    };
    shadow: BoxShadow;
  };

  logo: {
    type: 'image' | 'text';
    image?: {
      url: string;
      width: ResponsiveValue<string>;
      height: ResponsiveValue<string>;
    };
    text?: {
      content: string;
      typography: Typography;
      color: string;
    };
    link: string;
  };

  navigation: {
    items: MenuItem[];
    typography: Typography;
    color: string;
    hoverColor: string;
    activeColor: string;
    spacing: string; // アイテム間隔
  };

  cta?: {
    button: ButtonElement;
  };

  search?: {
    enabled: boolean;
    placeholder: string;
    style: any;
  };

  mobile: {
    breakpoint: string; // 例: '768px'
    hamburgerIcon: string;
    menuStyle: 'slide' | 'overlay' | 'push';
    menuPosition: 'left' | 'right' | 'top' | 'bottom';
  };

  scrollBehavior?: {
    changeBackground: boolean;
    backgroundColor?: string;
    changeHeight: boolean;
    height?: string;
    addShadow: boolean;
    shadow?: BoxShadow;
  };

  advanced: {
    zIndex: number;
    className?: string;
  };
}

interface MenuItem {
  id: string;
  label: string;
  link: string;
  target: '_self' | '_blank';
  icon?: Icon;
  submenu?: MenuItem[]; // ドロップダウン
}
```

### 6.3 フッター

#### 6.3.1 概要
フッターは、サイトの最下部に表示されるグローバルセクションで、コピーライト情報、リンク、ソーシャルメディアアイコン等を含みます。

#### 6.3.2 プロパティ

**レイアウト:**
- セクション構造（複数セクション可能）
- カラム数（3-4カラムが一般的）
- 背景
- パディング

**コンテンツ:**
- ウィジェットエリア
  - 会社情報
  - リンクリスト
  - ニュースレター登録フォーム
  - ソーシャルメディアアイコン
- コピーライトテキスト
- プライバシーポリシーリンク
- 利用規約リンク

**データモデル:**
```typescript
interface Footer {
  id: string;
  name: string;
  type: 'global' | 'local';

  layout: {
    columns: number;
    background: Background;
    padding: ResponsiveSpacing;
  };

  widgets: FooterWidget[];

  copyright: {
    text: string;
    typography: Typography;
    color: string;
    alignment: 'left' | 'center' | 'right';
  };

  links: {
    items: MenuItem[];
    separator?: string;
    typography: Typography;
    color: string;
    hoverColor: string;
  };

  advanced: {
    className?: string;
  };
}

interface FooterWidget {
  id: string;
  type: 'text' | 'links' | 'social' | 'newsletter' | 'custom';
  title?: string;
  content: any; // type に応じた内容
  columnSpan: number; // 占めるカラム数
}
```

---

## 7. テーマ・スタイルシステム

### 7.1 テーマ管理

#### 7.1.1 概要
テーマは、サイト全体のデザイン一貫性を保つためのグローバルスタイル設定です。

#### 7.1.2 テーマ構成要素

**カラーパレット:**
```typescript
interface ColorPalette {
  primary: string; // プライマリーカラー（例: #FEB95F）
  secondary: string; // セカンダリーカラー
  accent: string; // アクセントカラー

  text: {
    primary: string; // メインテキスト色
    secondary: string; // サブテキスト色
    light: string; // 明るいテキスト（暗背景用）
    dark: string; // 暗いテキスト（明背景用）
  };

  background: {
    primary: string; // メイン背景
    secondary: string; // サブ背景
    dark: string; // ダーク背景
    light: string; // ライト背景
  };

  border: {
    default: string;
    light: string;
    dark: string;
  };

  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
```

**タイポグラフィ:**
```typescript
interface TypographyTheme {
  fonts: {
    primary: string; // メインフォント
    secondary: string; // サブフォント
    monospace: string; // コードフォント
  };

  headings: {
    h1: HeadingStyle;
    h2: HeadingStyle;
    h3: HeadingStyle;
    h4: HeadingStyle;
    h5: HeadingStyle;
    h6: HeadingStyle;
  };

  body: {
    fontSize: ResponsiveValue<string>;
    lineHeight: string;
    fontWeight: number;
  };

  small: {
    fontSize: ResponsiveValue<string>;
    lineHeight: string;
  };
}

interface HeadingStyle {
  fontSize: ResponsiveValue<string>;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: string;
}
```

**スペーシングスケール:**
```typescript
interface SpacingScale {
  xs: string;   // 例: 4px
  sm: string;   // 例: 8px
  md: string;   // 例: 16px
  lg: string;   // 例: 24px
  xl: string;   // 例: 32px
  xxl: string;  // 例: 48px
  xxxl: string; // 例: 64px
}
```

**ボーダー:**
```typescript
interface BorderTheme {
  radius: {
    none: string;    // 0
    sm: string;      // 例: 4px
    md: string;      // 例: 8px
    lg: string;      // 例: 12px
    xl: string;      // 例: 16px
    full: string;    // 9999px（完全円）
  };

  width: {
    none: string;    // 0
    thin: string;    // 1px
    medium: string;  // 2px
    thick: string;   // 4px
  };
}
```

**シャドウ:**
```typescript
interface ShadowTheme {
  none: string;
  sm: string;   // 例: 0 1px 2px rgba(0,0,0,0.05)
  md: string;   // 例: 0 4px 6px rgba(0,0,0,0.1)
  lg: string;   // 例: 0 10px 15px rgba(0,0,0,0.1)
  xl: string;   // 例: 0 20px 25px rgba(0,0,0,0.1)
  inner: string; // inset shadow
}
```

**レスポンシブブレークポイント:**
```typescript
interface Breakpoints {
  mobile: string;    // 例: 600px
  tablet: string;    // 例: 768px or 1080px
  desktop: string;   // 例: 1240px or 1366px
  wide: string;      // 例: 1500px
}
```

#### 7.1.3 テーマのデータモデル

```typescript
interface Theme {
  id: string;
  name: string;
  description?: string;

  colors: ColorPalette;
  typography: TypographyTheme;
  spacing: SpacingScale;
  borders: BorderTheme;
  shadows: ShadowTheme;
  breakpoints: Breakpoints;

  // ボタンのデフォルトスタイル
  buttons: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
    outline: ButtonStyle;
    ghost: ButtonStyle;
    link: ButtonStyle;
  };

  // フォームのデフォルトスタイル
  forms: {
    input: InputStyle;
    textarea: InputStyle;
    select: InputStyle;
    checkbox: CheckboxStyle;
    radio: RadioStyle;
  };

  // グローバル設定
  global: {
    containerMaxWidth: string;
    containerPadding: ResponsiveValue<string>;
    sectionSpacing: ResponsiveValue<string>;
  };

  // ダークモード
  darkMode?: {
    enabled: boolean;
    colors: Partial<ColorPalette>;
  };
}

interface ButtonStyle {
  backgroundColor: string;
  textColor: string;
  border: Border;
  borderRadius: string;
  padding: { vertical: string; horizontal: string };
  typography: Typography;
  shadow?: BoxShadow;
  hover: {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
  };
}

interface InputStyle {
  backgroundColor: string;
  textColor: string;
  border: Border;
  borderRadius: string;
  padding: Spacing;
  typography: Typography;
  focus: {
    borderColor: string;
    shadow?: BoxShadow;
  };
  error: {
    borderColor: string;
  };
}
```

### 7.2 スタイルの適用と継承

#### 7.2.1 スタイル階層

**継承順序:**
1. テーマのグローバルスタイル（最下層）
2. セクションレベルのスタイル
3. 行レベルのスタイル
4. カラムレベルのスタイル
5. 要素レベルのスタイル（最上層、最優先）

#### 7.2.2 グローバルスタイル vs ローカルスタイル

**グローバルスタイル:**
- テーマで定義
- サイト全体に適用
- CSS変数として実装
- 一元管理可能

**ローカルスタイル:**
- 個別要素で定義
- 該当要素のみに適用
- グローバルスタイルをオーバーライド
- 詳細なカスタマイズ可能

#### 7.2.3 CSSカスタムプロパティ実装

```css
:root {
  /* カラー */
  --color-primary: #FEB95F;
  --color-secondary: #15110E;
  --color-accent: #080436;
  --color-text-primary: #15110E;
  --color-text-secondary: #6B7280;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-border: #E5E7EB;

  /* タイポグラフィ */
  --font-primary: 'Inter', sans-serif;
  --h1-font-size: clamp(2rem, 5vw, 3rem);
  --h1-line-height: 1.2;
  --body-font-size: 16px;
  --body-line-height: 1.6;

  /* スペーシング */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* ボーダー */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* シャドウ */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* ブレークポイント */
  --breakpoint-mobile: 600px;
  --breakpoint-tablet: 1080px;
  --breakpoint-desktop: 1240px;
}
```

### 7.3 カスタムCSS

#### 7.3.1 概要
ユーザーが独自のCSSコードを追加できる機能。

#### 7.3.2 適用スコープ

**ページレベルCSS:**
- 特定のページのみに適用
- `<style>` タグとしてページに挿入

**サイトレベルCSS:**
- サイト全体に適用
- グローバルスタイルシートに追加

**セクション/要素レベルCSS:**
- 特定のセクションまたは要素のみに適用
- インラインスタイルまたはスコープドスタイル

#### 7.3.3 実装方法

**コードエディター:**
- シンタックスハイライト
- オートコンプリート
- エラーチェック
- プレビュー機能

**セレクター:**
- カスタムIDやクラスを要素に追加可能
- セクション: `#section-id` または `.section-class`
- 要素: `#element-id` または `.element-class`

**データモデル:**
```typescript
interface CustomCSS {
  id: string;
  scope: 'page' | 'site' | 'section' | 'element';
  targetId?: string; // section or element ID
  css: string;
  enabled: boolean;
  order: number; // 適用順序
}
```

**実装例:**
```typescript
interface Page {
  id: string;
  name: string;
  sections: Section[];
  customCSS: CustomCSS[];
}

// ページレベルCSS
{
  id: 'css-1',
  scope: 'page',
  css: `
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .custom-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
  `,
  enabled: true,
  order: 1
}
```

---

## 8. サイト・ブログ機能

### 8.1 サイト構造

#### 8.1.1 サイトとは
サイトは、複数のページをまとめた上位概念で、ウェブサイト全体を構成します。

#### 8.1.2 サイトプロパティ

```typescript
interface Site {
  id: string;
  name: string;
  description?: string;

  // ドメイン設定
  domain: {
    primary: string; // メインドメイン
    aliases: string[]; // サブドメインやエイリアス
    ssl: boolean;
  };

  // ページ構成
  pages: Page[];
  homepageId: string; // ホームページのID

  // ナビゲーション
  navigation: {
    header: Header;
    footer: Footer;
    menus: Menu[];
  };

  // テーマ
  themeId: string;

  // SEO設定
  seo: {
    siteName: string;
    defaultMetaDescription: string;
    defaultMetaImage?: string;
    favicon?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    customHeadCode?: string;
    customBodyCode?: string;
  };

  // ブログ設定
  blog?: BlogSettings;

  // 詳細設定
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
    cookieConsent: CookieConsentSettings;
  };
}
```

#### 8.1.3 ページ管理

```typescript
interface Page {
  id: string;
  name: string;
  slug: string; // URL slug
  path: string; // 完全パス

  type: 'standard' | 'blog-post' | 'blog-index' | 'landing-page';

  // ページコンテンツ
  sections: Section[];

  // ヘッダー・フッター
  header: {
    type: 'global' | 'custom';
    headerId?: string;
    customHeader?: Header;
  };

  footer: {
    type: 'global' | 'custom';
    footerId?: string;
    customFooter?: Footer;
  };

  // SEO
  seo: {
    title: string;
    metaDescription: string;
    metaKeywords?: string[];
    metaImage?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    nofollow?: boolean;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
  };

  // カスタムコード
  customCSS: CustomCSS[];
  customJS: CustomJS[];

  // 公開設定
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;

  // アクセス制限
  access: {
    type: 'public' | 'password' | 'members-only';
    password?: string;
    allowedMemberGroups?: string[];
  };

  // 詳細設定
  settings: {
    template?: string;
    parentPageId?: string; // 親ページ（階層構造）
    order: number; // ナビゲーション内の順序
  };
}
```

### 8.2 ブログ機能

#### 8.2.1 ブログ設定

```typescript
interface BlogSettings {
  enabled: boolean;

  // URL構成
  basePath: string; // 例: '/blog'
  postSlugFormat: string; // 例: '/blog/{slug}' or '/blog/{year}/{month}/{slug}'

  // インデックスページ
  indexPageId: string;
  postsPerPage: number;

  // カテゴリー・タグ
  categories: BlogCategory[];
  tags: string[];

  // コメント
  comments: {
    enabled: boolean;
    provider: 'disqus' | 'facebook' | 'custom' | 'none';
    moderationRequired: boolean;
  };

  // RSS
  rss: {
    enabled: boolean;
    title: string;
    description: string;
  };

  // 著者
  authors: Author[];
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // 階層カテゴリー
}

interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
}
```

#### 8.2.2 ブログ投稿

```typescript
interface BlogPost extends Page {
  type: 'blog-post';

  // ブログ固有プロパティ
  blog: {
    // 著者
    authorId: string;

    // カテゴリー・タグ
    categoryIds: string[];
    tags: string[];

    // アイキャッチ画像
    featuredImage?: {
      url: string;
      alt: string;
    };

    // 抜粋
    excerpt?: string;

    // 公開日時
    publishedAt: Date;
    updatedAt: Date;

    // コメント
    commentsEnabled: boolean;
    commentCount?: number;

    // ソーシャルシェア
    socialSharing: {
      enabled: boolean;
      platforms: ('facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'email')[];
    };

    // 関連記事
    relatedPosts?: string[]; // post IDs
  };
}
```

#### 8.2.3 ブログインデックスページ

**機能要件:**
- 投稿一覧表示（グリッド/リスト）
- ページネーション
- カテゴリーフィルター
- タグフィルター
- 検索機能
- 並び替え（新着順、人気順等）

**レイアウトオプション:**
- グリッドレイアウト（2カラム、3カラム、4カラム）
- リストレイアウト
- マガジンレイアウト
- カードレイアウト

**投稿カードに表示する情報:**
- アイキャッチ画像
- タイトル
- 抜粋
- 著者名・アバター
- 公開日
- カテゴリー
- タグ
- 続きを読むボタン

---

## 9. ドメイン接続

### 9.1 概要
ClickFunnelsで作成したサイトにカスタムドメインを接続する機能。

### 9.2 ドメイン接続方法

#### 9.2.1 自動セットアップ（推奨）

**プロセス:**
1. ドメイン名入力
2. ドメインレジストラー選択（GoDaddy、Namecheap等）
3. 自動DNS設定（可能な場合）
4. ドメイン所有権確認
5. SSL証明書自動発行

#### 9.2.2 手動セットアップ

**DNS設定:**
- Aレコード設定
  - ホスト: @ または www
  - 値: ClickFunnelsのIPアドレス
- CNAMEレコード設定
  - ホスト: www
  - 値: ClickFunnelsのドメイン

**所有権確認方法:**
- DNSレコード追加
- メール確認
- HTMLファイルアップロード

### 9.3 SSL/TLS証明書

**自動SSL:**
- Let's Encrypt統合
- 自動発行・更新
- ワイルドカード対応

**カスタムSSL:**
- 独自証明書アップロード
- 中間証明書対応
- プライベートキー管理

### 9.4 データモデル

```typescript
interface Domain {
  id: string;
  domain: string; // 例: 'example.com'
  type: 'primary' | 'alias' | 'subdomain';

  // DNS設定
  dns: {
    aRecords: DNSRecord[];
    cnameRecords: DNSRecord[];
    txtRecords: DNSRecord[];
    mxRecords?: DNSRecord[];
  };

  // SSL設定
  ssl: {
    enabled: boolean;
    provider: 'letsencrypt' | 'custom';
    certificate?: {
      cert: string;
      key: string;
      chain?: string;
    };
    autoRenew: boolean;
    expiresAt?: Date;
  };

  // ステータス
  status: {
    connected: boolean;
    verified: boolean;
    sslActive: boolean;
    lastChecked: Date;
    errors?: string[];
  };

  // 所有権確認
  verification: {
    method: 'dns' | 'email' | 'file';
    token: string;
    verified: boolean;
    verifiedAt?: Date;
  };

  // リダイレクト設定
  redirects: {
    forceHttps: boolean;
    forceWww: boolean | 'remove'; // true: wwwを強制, false: 変更なし, 'remove': wwwを削除
  };
}

interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'MX';
  host: string;
  value: string;
  ttl?: number;
  priority?: number; // MXレコード用
}
```

---

## 10. レスポンシブデザイン

### 10.1 概要
全てのページと要素が、デスクトップ、タブレット、モバイルで最適に表示される仕組み。

### 10.2 ブレークポイント

**標準ブレークポイント:**
```typescript
const breakpoints = {
  mobile: 600,      // 0-600px
  tablet: 1080,     // 601-1080px
  desktop: 1240,    // 1081-1240px
  wide: 1500,       // 1241px以上
};
```

### 10.3 レスポンシブ設定対象

**全要素で設定可能なプロパティ:**
- フォントサイズ
- 幅・高さ
- パディング・マージン
- 配置（左寄せ/中央/右寄せ）
- 表示/非表示
- カラム数（レイアウト）
- スタック順序

### 10.4 モバイル最適化機能

**自動調整:**
- テキストサイズの拡大
- タッチターゲットサイズの確保（最小44x44px）
- カラムの自動スタック
- 画像の自動リサイズ

**モバイル専用設定:**
- ハンバーガーメニュー
- スワイプジェスチャー
- モバイル専用ポップアップ配置
- タップでの電話発信（tel:リンク）

### 10.5 エディター内プレビュー

**デバイス切替:**
- デスクトッププレビュー（デフォルト）
- タブレットプレビュー（768px or 1080px幅）
- モバイルプレビュー（375px幅、iPhone基準）

**実機プレビュー:**
- QRコード生成
- プレビューURLの共有
- デバイスでリアルタイム確認

---

## 11. データ構造全体図

### 11.1 エンティティ関係図（概念）

```
Workspace (ワークスペース)
  |
  ├── Sites (サイト) [1:N]
  |     |
  |     ├── Pages (ページ) [1:N]
  |     |     |
  |     |     ├── Sections (セクション) [1:N]
  |     |     |     |
  |     |     |     ├── Rows (行) [1:N]
  |     |     |     |     |
  |     |     |     |     └── Columns (カラム) [1:N]
  |     |     |     |           |
  |     |     |     |           └── Elements (要素) [1:N]
  |     |     |     |
  |     |     |     └── Background (背景)
  |     |     |
  |     |     ├── CustomCSS (カスタムCSS) [1:N]
  |     |     ├── CustomJS (カスタムJS) [1:N]
  |     |     └── SEO Settings (SEO設定)
  |     |
  |     ├── Popups (ポップアップ) [1:N]
  |     ├── Headers (ヘッダー) [1:N]
  |     ├── Footers (フッター) [1:N]
  |     ├── Domains (ドメイン) [1:N]
  |     ├── Blog Settings (ブログ設定) [0:1]
  |     └── Theme (テーマ) [N:1]
  |
  ├── Themes (テーマ) [1:N]
  |
  ├── Media Library (メディアライブラリ) [1:N]
  |     ├── Images (画像)
  |     ├── Videos (動画)
  |     └── Files (ファイル)
  |
  └── Global Assets (グローバルアセット)
        ├── Logos (ロゴ)
        ├── Favicons (ファビコン)
        └── Brand Colors (ブランドカラー)
```

### 11.2 主要型定義まとめ

```typescript
// ============================================
// ワークスペース
// ============================================
interface Workspace {
  id: string;
  name: string;
  sites: Site[];
  themes: Theme[];
  mediaLibrary: MediaLibrary;
  globalAssets: GlobalAssets;
}

// ============================================
// サイト
// ============================================
interface Site {
  id: string;
  name: string;
  domain: Domain;
  pages: Page[];
  popups: Popup[];
  headers: Header[];
  footers: Footer[];
  navigation: Navigation;
  themeId: string;
  blog?: BlogSettings;
  seo: SiteSEO;
  settings: SiteSettings;
}

// ============================================
// ページ
// ============================================
interface Page {
  id: string;
  name: string;
  slug: string;
  type: 'standard' | 'blog-post' | 'blog-index' | 'landing-page';
  sections: Section[];
  header: PageHeader;
  footer: PageFooter;
  seo: PageSEO;
  customCSS: CustomCSS[];
  customJS: CustomJS[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  settings: PageSettings;
}

// ============================================
// セクション
// ============================================
interface Section {
  id: string;
  type: 'section';
  name: string;
  layout: SectionLayout;
  background: Background;
  border: Border;
  shadow: BoxShadow;
  advanced: AdvancedSettings;
  rows: Row[];
}

// ============================================
// 行
// ============================================
interface Row {
  id: string;
  type: 'row';
  name: string;
  layout: RowLayout;
  background: Background;
  border: Border;
  shadow: BoxShadow;
  spacing: Spacing;
  advanced: AdvancedSettings;
  columns: Column[];
}

// ============================================
// カラム
// ============================================
interface Column {
  id: string;
  type: 'column';
  name: string;
  layout: ColumnLayout;
  background: Background;
  border: Border;
  padding: ResponsiveSpacing;
  advanced: AdvancedSettings;
  elements: ContentElement[];
}

// ============================================
// コンテンツ要素（Union型）
// ============================================
type ContentElement =
  | HeadlineElement
  | TextElement
  | ButtonElement
  | ImageElement
  | VideoElement
  | InputElement
  | ListElement
  | SpacerElement
  | AccordionElement
  | FormElement
  | CustomElement;

// ============================================
// 共通型
// ============================================
interface ResponsiveValue<T> {
  desktop: T;
  tablet: T;
  mobile: T;
}

interface ResponsiveSpacing {
  desktop: Spacing;
  tablet: Spacing;
  mobile: Spacing;
}

interface Spacing {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface Background {
  type: 'color' | 'gradient' | 'image' | 'video';
  color?: string;
  gradient?: Gradient;
  image?: BackgroundImage;
  video?: BackgroundVideo;
}

interface Gradient {
  type: 'linear' | 'radial';
  angle?: number; // linear用
  position?: string; // radial用
  stops: GradientStop[];
}

interface GradientStop {
  color: string;
  position: number; // 0-100
}

interface BackgroundImage {
  url: string;
  position: {
    x: 'left' | 'center' | 'right' | string;
    y: 'top' | 'center' | 'bottom' | string;
  };
  size: 'cover' | 'contain' | 'auto' | string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  attachment: 'scroll' | 'fixed';
  overlay?: {
    color: string;
    opacity: number; // 0-1
  };
}

interface BackgroundVideo {
  url: string;
  type: 'mp4' | 'webm';
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  overlay?: {
    color: string;
    opacity: number;
  };
}

interface Border {
  top?: BorderSide;
  right?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
}

interface BorderSide {
  width: string;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
}

interface BoxShadow {
  enabled: boolean;
  horizontal: string;
  vertical: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

interface Typography {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

interface AdvancedSettings {
  id?: string;
  className?: string;
  zIndex?: number;
  visibility?: DeviceVisibility;
  customAttributes?: Record<string, string>;
}
```

---

## 12. UI/UXインタラクション要件

### 12.1 ドラッグ&ドロップ

**要件:**
- 左パネルから要素をドラッグしてキャンバスにドロップ
- 既存要素の並び替え（同じカラム内、異なるカラム間）
- セクション/行/カラムの並び替え
- ドロップ可能領域のビジュアルフィードバック
- ドロップ位置のインジケーター（線表示）

**実装考慮事項:**
- HTML5 Drag and Drop API
- またはReact DnD、react-beautiful-dnd等のライブラリ
- タッチデバイス対応

### 12.2 インライン編集

**対象要素:**
- 見出し
- テキスト/段落
- ボタンテキスト

**動作:**
- 要素をダブルクリックで編集モード
- 直接テキスト入力
- Enter/ESCで編集完了/キャンセル
- リッチテキストツールバー表示（太字、斜体、リンク等）

### 12.3 要素選択と操作

**選択方法:**
- クリックで選択
- Ctrl/Cmd + クリックで複数選択
- ドラッグで範囲選択（オプション）

**選択時の表示:**
- アウトライン（青枠等）
- 要素名表示
- クイックアクション（コピー、削除、複製）
- サイズハンドル（リサイズ可能な要素）

**コンテキストメニュー:**
- 右クリックでメニュー表示
- コピー、ペースト、複製、削除
- 前面/背面移動
- グループ化（オプション）

### 12.4 レスポンシブ編集

**デバイス切替:**
- ツールバーのデバイスアイコンでプレビュー切替
- キャンバスサイズが対応デバイスに変更
- デバイス固有のプロパティ編集可能

**同期編集:**
- デスクトップで編集した内容が他デバイスにも反映（レスポンシブ値以外）
- デバイス固有値は独立して管理

### 12.5 元に戻す/やり直し

**要件:**
- 全ての編集操作を記録
- Ctrl/Cmd + Z で元に戻す
- Ctrl/Cmd + Shift + Z でやり直し
- 履歴スタック管理（例: 最大50操作）

**対象操作:**
- 要素の追加/削除
- プロパティ変更
- 要素の移動
- セクション/行/カラムの追加/削除

### 12.6 リアルタイムプレビュー

**要件:**
- プロパティ変更が即座にキャンバスに反映
- デバウンス処理（高頻度変更時のパフォーマンス対策）
- 保存せずにプレビュー可能

### 12.7 保存と公開

**自動保存:**
- 一定間隔で自動保存（例: 30秒ごと）
- 変更検知時のみ保存
- 保存中インジケーター表示
- 保存エラー時の通知

**手動保存:**
- 保存ボタンクリック
- Ctrl/Cmd + S ショートカット

**公開:**
- 下書きと公開を分離
- 公開前プレビュー
- 公開確認ダイアログ
- 公開後のURL表示

---

## 13. パフォーマンス要件

### 13.1 エディターパフォーマンス

**目標:**
- 初回ロード時間: 3秒以内
- 要素追加時の応答: 100ms以内
- プロパティ変更の反映: 50ms以内
- ページ保存: 2秒以内

**最適化手法:**
- 仮想化（Virtual Scrolling）
- 遅延ロード（Lazy Loading）
- メモ化（Memoization）
- デバウンス・スロットル
- Web Workers活用（重い処理）

### 13.2 フロントエンド出力最適化

**HTML/CSS最適化:**
- 不要なCSSの除去
- クリティカルCSSのインライン化
- CSSの最小化・圧縮

**JavaScript最適化:**
- コード分割（Code Splitting）
- 遅延ロード
- 最小化・圧縮

**画像最適化:**
- 次世代フォーマット（WebP、AVIF）への自動変換
- レスポンシブ画像（srcset）
- 遅延ロード（Lazy Loading）
- 画像圧縮

**その他:**
- CDN活用
- HTTPキャッシュ設定
- Gzip/Brotli圧縮

### 13.3 SEOパフォーマンス

**Core Web Vitals:**
- LCP (Largest Contentful Paint): 2.5秒以内
- FID (First Input Delay): 100ms以内
- CLS (Cumulative Layout Shift): 0.1以内

---

## 14. セキュリティ要件

### 14.1 入力サニタイゼーション

**対象:**
- ユーザー入力テキスト
- カスタムHTML/CSS/JavaScript
- 画像アップロード

**対策:**
- XSS対策（エスケープ処理）
- CSP (Content Security Policy)
- ファイルタイプ検証
- ファイルサイズ制限

### 14.2 アクセス制御

**認証:**
- ワークスペースレベルのアクセス制御
- ページレベルのアクセス制限（パスワード、メンバーシップ）

**権限:**
- 閲覧者、編集者、管理者ロール
- 操作権限の細かな制御

### 14.3 データ保護

**暗号化:**
- 通信のHTTPS化
- パスワードのハッシュ化
- APIキーの安全な保管

**バックアップ:**
- 定期的な自動バックアップ
- バージョン履歴管理
- 復元機能

---

## 15. 技術スタック推奨

### 15.1 フロントエンド

**エディター:**
- React / Vue / Svelte
- TypeScript
- State管理: Redux / Zustand / Jotai
- UI Components: Radix UI / Headless UI
- Drag & Drop: react-beautiful-dnd / dnd-kit
- Code Editor: Monaco Editor / CodeMirror

**出力（公開ページ）:**
- Next.js / Nuxt.js（SSR/SSG対応）
- Tailwind CSS（ユーティリティファースト）
- または生の HTML/CSS/JS

### 15.2 バックエンド

**サーバー:**
- Node.js / Go / Python
- REST API / GraphQL

**データベース:**
- PostgreSQL（リレーショナルデータ）
- MongoDB（ドキュメント指向、柔軟なスキーマ）
- Redis（キャッシュ、セッション）

**ストレージ:**
- AWS S3 / Google Cloud Storage（メディアファイル）
- CDN: CloudFront / Cloudflare

**認証:**
- Auth0 / Supabase Auth / Firebase Auth

### 15.3 インフラ

**ホスティング:**
- Vercel / Netlify（Jamstack）
- AWS / Google Cloud / Azure

**CI/CD:**
- GitHub Actions / GitLab CI / CircleCI

**モニタリング:**
- Sentry（エラートラッキング）
- Google Analytics / Plausible（分析）
- Lighthouse CI（パフォーマンス監視）

---

## 16. 実装優先順位

### フェーズ1: コア機能（MVP）
1. 基本エディターUI（ツールバー、サイドパネル、キャンバス）
2. セクション/行/カラム管理
3. 基本要素（見出し、テキスト、ボタン、画像）
4. ドラッグ&ドロップ
5. プロパティパネル
6. 保存・公開機能
7. レスポンシブプレビュー

### フェーズ2: 拡張要素
1. 動画要素
2. フォーム要素（入力、送信）
3. リスト、スペーサー
4. アコーディオン
5. 背景画像・動画
6. ポップアップ基本機能

### フェーズ3: テーマ・スタイル
1. テーマシステム
2. グローバルスタイル
3. カスタムCSS
4. スタイル継承

### フェーズ4: サイト・ブログ
1. サイト管理
2. ページ管理
3. ヘッダー・フッター
4. ナビゲーション
5. ブログ機能

### フェーズ5: 高度な機能
1. ドメイン接続
2. SSL設定
3. SEO最適化
4. パフォーマンス最適化
5. AI統合（画像生成等）

---

## 17. 参考資料

### 17.1 ClickFunnels公式ドキュメント
- Getting Started with the ClickFunnels Page Editor
- Exploring Features in the ClickFunnels Editor
- Page Editor: Adding Sections/Rows/Elements/Columns
- Headline, Button, Image, Video, Input Elements
- Popup, Header & Footer Creation
- Theme & Style Management
- Blog & Site Building
- Domain Connection
- Custom CSS

### 17.2 競合サービス分析推奨
- Webflow
- Wix
- Squarespace
- WordPress Gutenberg
- Elementor

### 17.3 技術リファレンス
- React Beautiful DnD Documentation
- Monaco Editor Documentation
- Tailwind CSS Documentation
- Next.js Documentation

---

## 付録: CSS変数実装例

```css
/* ============================================
   グローバルCSS変数定義
   ============================================ */
:root {
  /* カラーパレット */
  --color-primary: #FEB95F;
  --color-secondary: #15110E;
  --color-accent: #080436;
  --color-midnight-oil: #080436;

  /* テキストカラー */
  --color-text-primary: #15110E;
  --color-text-secondary: #6B7280;
  --color-text-light: #FFFFFF;
  --color-text-dark: #000000;

  /* 背景カラー */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-dark: #15110E;
  --color-bg-light: #F3F4F6;

  /* ボーダーカラー */
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;
  --color-border-dark: #D1D5DB;

  /* ステータスカラー */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* タイポグラフィ */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-secondary: 'Roboto', sans-serif;
  --font-monospace: 'Fira Code', 'Courier New', monospace;

  /* 見出しサイズ（レスポンシブ） */
  --h1-font-size: clamp(2rem, 5vw, 3rem);
  --h1-line-height: 1.2;
  --h1-font-weight: 700;

  --h2-font-size: clamp(1.75rem, 4vw, 2.5rem);
  --h2-line-height: 1.3;
  --h2-font-weight: 600;

  --h3-font-size: clamp(1.5rem, 3vw, 2rem);
  --h3-line-height: 1.4;
  --h3-font-weight: 600;

  --h4-font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  --h4-line-height: 1.5;
  --h4-font-weight: 600;

  --h5-font-size: clamp(1.125rem, 2vw, 1.25rem);
  --h5-line-height: 1.5;
  --h5-font-weight: 500;

  --h6-font-size: clamp(1rem, 1.5vw, 1.125rem);
  --h6-line-height: 1.6;
  --h6-font-weight: 500;

  /* 本文 */
  --body-font-size: 16px;
  --body-line-height: 1.6;
  --body-font-weight: 400;

  /* スペーシングスケール */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-xxxl: 64px;

  /* ボーダー半径 */
  --border-radius-none: 0;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --border-radius-full: 9999px;

  /* ボーダー幅 */
  --border-width-none: 0;
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;

  /* シャドウ */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);

  /* トランジション */
  --transition-fast: 0.1s ease-in-out;
  --transition-normal: 0.2s ease-in-out;
  --transition-slow: 0.3s ease-in-out;

  /* Z-index */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;

  /* ブレークポイント */
  --breakpoint-mobile: 600px;
  --breakpoint-tablet: 1080px;
  --breakpoint-desktop: 1240px;
  --breakpoint-wide: 1500px;

  /* コンテナ */
  --container-max-width: 1400px;
  --container-padding: 24px;
}

/* ============================================
   ダークモード対応
   ============================================ */
[data-theme="dark"] {
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-bg-primary: #1F2937;
  --color-bg-secondary: #111827;
  --color-border: #374151;
}

/* ============================================
   レスポンシブ調整
   ============================================ */
@media (max-width: 600px) {
  :root {
    --container-padding: 16px;
  }
}
```

---

## まとめ

この要件定義書は、ClickFunnelsのサイト/ページエディターの完全クローンを構築するための包括的な仕様を提供します。実装時は、各フェーズを段階的に進め、ユーザーフィードバックを取り入れながら改善していくことを推奨します。

**重要なポイント:**
1. **柔軟なデータモデル**: 将来の拡張に対応できる設計
2. **レスポンシブ優先**: モバイルファーストの思想
3. **パフォーマンス**: エディター・出力ページ両方の最適化
4. **UX重視**: 直感的な操作性とリアルタイムフィードバック
5. **セキュリティ**: ユーザーデータとサイトの保護

この仕様に基づいて実装することで、プロフェッショナルなノーコード/ローコードページビルダーを構築できます。
