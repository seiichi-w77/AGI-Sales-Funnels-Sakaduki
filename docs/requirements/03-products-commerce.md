# 商品・コマース機能要件定義書

## 1. 概要

本ドキュメントは、ClickFunnelsの商品管理・コマース機能のクローン実装に必要な全機能要件を定義する。ClickFunnels 2.0の最新機能（2025年）を基に、ECサイト構築に必要な商品管理、価格設定、在庫管理、注文処理、決済、配送、税金計算などの包括的な機能を網羅する。

### 1.1 システム目標

- 一元化された商品管理システム（Global Products）
- 柔軟な価格設定とサブスクリプション対応
- ショッピングカートとチェックアウトフロー
- 注文管理と履行プロセスの自動化
- 複数の決済ゲートウェイ統合
- 自動税金計算と請求書発行

## 2. 機能一覧

### 2.1 商品管理機能

1. **Global Products（グローバル商品管理）**
2. **商品作成・編集**
3. **商品バリアント管理**
4. **価格設定管理**
5. **在庫管理**
6. **商品画像管理**

### 2.2 コマース機能

7. **ショッピングカート**
8. **カートへ追加機能**
9. **チェックアウトシステム**
10. **注文管理**
11. **サブスクリプション注文管理**
12. **注文バンプ**
13. **ワンクリックアップセル/ダウンセル**

### 2.3 決済・請求機能

14. **決済ゲートウェイ統合**
15. **Payments AI**
16. **ペイメントプラン**
17. **請求書管理**
18. **税金計算・徴収**
19. **割引・クーポン**

### 2.4 履行・配送機能

20. **注文履行管理**
21. **配送設定**
22. **サードパーティ連携（ShipStation、Zendrop）**
23. **配送追跡**

## 3. 各機能の詳細要件

---

### 3.1 Global Products（グローバル商品管理）

#### 機能名
Global Products - 一元化された商品管理システム

#### 説明
全てのデジタル商品・物理商品を一箇所で作成・管理できる中央集権型の商品管理システム。商品を一度作成すれば、全てのファネルやストアで使用可能。商品の価格、説明、設定を更新すると、全てのファネルとストアに自動的に同期される。

#### 対応商品タイプ
- **物理商品**: 配送・在庫追跡機能付き
- **デジタル商品**: 即座配信機能付き
- **サブスクリプション商品**: 定期課金対応
- **メンバーシップサイト**: 限定コンテンツアクセス制御
- **商品バリアント**: サイズ・色などの選択肢対応
- **商品バンドル/コレクション**: 特別プロモーション用

#### UI要素

**ナビゲーション**
- サイドバー: `Products` メニュー項目
- サブメニュー: `All Products`

**商品ダッシュボード**
- `Create Product` ボタン（プライマリアクション）
- 商品一覧テーブル
  - カラム: 商品名、タイプ、価格、ステータス、在庫、最終更新日
  - ソート・フィルター機能
  - 検索バー
- 商品カード表示/リスト表示切替

**商品作成/編集フォーム**
- 商品情報セクション
  - 商品名（必須フィールド）
  - 商品説明（リッチテキストエディタ）
  - 商品画像（複数アップロード可能、ドラッグ&ドロップ対応）
- 商品タイプ選択（ドロップダウン）
  - Physical Product
  - Digital Product
  - Subscription
  - Membership
- ステータストグル（Active/Inactive）
- 公開設定トグル（Visible/Hidden）

#### ユーザーアクション

1. **商品作成**
   - Products > All Products > Create Product
   - 商品情報入力
   - 商品タイプ選択
   - 保存

2. **商品編集**
   - 商品一覧から商品選択
   - 情報更新
   - 保存（全ファネルに自動同期）

3. **商品削除**
   - 商品選択 > 削除確認ダイアログ > 削除実行

4. **商品複製**
   - 商品選択 > Duplicate > 新規商品として保存

#### データモデル

```typescript
interface Product {
  id: string;
  workspaceId: string;
  name: string;
  description: string; // HTML/Markdown
  type: 'physical' | 'digital' | 'subscription' | 'membership';
  status: 'active' | 'inactive';
  visible: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  prices: ProductPrice[];
  inventory?: InventorySettings;
  shipping?: ShippingSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  customFields?: Record<string, any>;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
}
```

---

### 3.2 商品価格設定管理

#### 機能名
Price Management - 柔軟な価格設定システム

#### 説明
複数の価格バリアントを設定可能。ワンタイム購入価格とサブスクリプション価格を同時に設定できる。各バリアントに対して異なる価格オプションを構成可能。

#### UI要素

**価格セクション**
- `Add Price` リンク/ボタン
- 価格テーブル
  - カラム: Price、Compare at amount、Status、Visible、Price Settings Icon

**価格追加/編集モーダル**
- 価格タイプ選択（ラジオボタン）
  - One-time payment（ワンタイム決済）
  - Subscription（サブスクリプション）
  - Payment Plan（分割払い）
- 価格フィールド（通貨入力）
- 比較価格フィールド（オプション、打ち消し線表示用）
- ステータストグル（Active/Inactive）
- 可視性トグル（Visible/Hidden）
- 適用バリアント選択（複数選択可能）

**サブスクリプション設定**
- 請求サイクル選択（ドロップダウン）
  - Daily（毎日）
  - Weekly（毎週）
  - Monthly（毎月）
  - Quarterly（四半期）
  - Yearly（毎年）
  - Custom（カスタム間隔）
- 請求間隔数値入力
- トライアル期間設定
  - トライアル日数
  - トライアル価格
- 請求回数制限（オプション）

**ペイメントプラン設定**
- 分割回数
- 初回支払額
- 継続支払額
- 支払間隔

#### ユーザーアクション

1. **価格追加**
   - 商品編集画面 > Prices セクション > Add Price
   - 価格タイプ選択
   - 価格情報入力
   - 保存

2. **価格編集**
   - Price Settings Icon クリック > Edit
   - 価格情報更新
   - 保存

3. **価格削除**
   - Price Settings Icon クリック > Delete > 確認

4. **価格の有効/無効切替**
   - Status トグル切替

#### データモデル

```typescript
interface ProductPrice {
  id: string;
  productId: string;
  variantId?: string;
  type: 'one_time' | 'subscription' | 'payment_plan';
  amount: number;
  currency: string;
  compareAtAmount?: number;
  status: 'active' | 'inactive';
  visible: boolean;

  // サブスクリプション設定
  subscription?: {
    interval: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    intervalCount: number;
    trialPeriodDays?: number;
    trialPrice?: number;
    billingCycleLimit?: number;
  };

  // ペイメントプラン設定
  paymentPlan?: {
    installments: number;
    initialPayment: number;
    recurringPayment: number;
    paymentInterval: number; // days
  };

  createdAt: Date;
  updatedAt: Date;
}
```

---

### 3.3 商品バリアント管理

#### 機能名
Product Variants - 商品バリエーション管理

#### 説明
商品の異なるバージョンを管理（例: サイズ、色など）。各バリアントに個別の価格、SKU、在庫を設定可能。

#### UI要素

**バリアントセクション**
- バリアントオプション定義
  - オプション名入力（例: Size、Color）
  - オプション値入力（例: Small, Medium, Large）
  - `Add Option` ボタン
- バリアント組み合わせテーブル
  - 自動生成されたバリアント一覧
  - カラム: Variant、SKU、Price、Inventory、Status
  - 各バリアント編集アイコン

**バリアント編集モーダル**
- バリアント名表示（読み取り専用）
- SKU入力フィールド
- 価格オーバーライド設定
- 在庫数入力
- 重量入力（物理商品のみ）
- 画像選択（バリアント固有）

#### ユーザーアクション

1. **バリアントオプション作成**
   - Variants セクション > Add Option
   - オプション名と値を入力
   - 保存（バリアントが自動生成される）

2. **バリアント詳細編集**
   - バリアント選択 > Edit
   - SKU、価格、在庫などを設定
   - 保存

3. **バリアント無効化**
   - バリアントステータスをInactiveに変更

#### データモデル

```typescript
interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  options: VariantOption[];
  priceOverride?: number;
  compareAtPrice?: number;
  inventoryQuantity?: number;
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  imageId?: string;
  status: 'active' | 'inactive';
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VariantOption {
  name: string; // e.g., "Size"
  value: string; // e.g., "Large"
}

interface ProductOption {
  id: string;
  productId: string;
  name: string; // e.g., "Size"
  values: string[]; // e.g., ["Small", "Medium", "Large"]
  position: number;
}
```

---

### 3.4 在庫管理

#### 機能名
Inventory Management - 在庫追跡・管理システム

#### 説明
商品の在庫レベルを監視し、在庫切れを防止。複数の保管場所を管理可能。在庫変更履歴を記録。

#### UI要素

**在庫・配送セクション**（物理商品のみ表示）
- 在庫トラッキング設定
  - `Track Quantity` トグル（在庫追跡有効/無効）
  - `Don't Track Quantity` オプション
- 在庫数入力フィールド
- 在庫切れ時の動作設定
  - `Allow purchase when out of stock` チェックボックス
  - `Show "Out of Stock" badge` チェックボックス

**保管場所管理**
- `Manage Locations` ボタン
- 保管場所一覧
  - 場所名
  - 住所
  - デフォルト設定
  - 在庫数（場所別）

**在庫履歴**
- 在庫変更ログテーブル
  - カラム: Date、Action、Quantity Change、User、Reason

#### ユーザーアクション

1. **在庫トラッキング有効化**
   - Inventory セクション > Track Quantity トグルON
   - 初期在庫数入力
   - 保存

2. **在庫数更新**
   - 在庫数フィールド編集
   - 変更理由入力（オプション）
   - 保存（履歴に自動記録）

3. **保管場所追加**
   - Manage Locations > Add Location
   - 場所情報入力
   - 保存

4. **在庫履歴確認**
   - Inventory History タブ選択
   - フィルター・検索で絞り込み

#### データモデル

```typescript
interface InventorySettings {
  trackQuantity: boolean;
  allowOutOfStockPurchase: boolean;
  showOutOfStockBadge: boolean;
  lowStockThreshold?: number;
  locations: InventoryLocation[];
}

interface InventoryLocation {
  id: string;
  name: string;
  address: Address;
  isDefault: boolean;
  createdAt: Date;
}

interface InventoryHistory {
  id: string;
  productId: string;
  variantId?: string;
  locationId?: string;
  action: 'adjustment' | 'sale' | 'restock' | 'return' | 'transfer';
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  reason?: string;
  userId: string;
  orderId?: string;
  createdAt: Date;
}
```

---

### 3.5 ショッピングカート

#### 機能名
Shopping Cart - カート機能

#### 説明
顧客が複数の商品をカートに追加し、一度にチェックアウト可能。カート内容の確認、数量変更、削除が可能。動的なストアアップセルに対応。

#### UI要素

**カートアイコン要素**
- ヘッダー固定カートアイコン
- カート内商品数バッジ
- カートサイドパネル（右側から展開）

**カートサイドパネル**
- パネルヘッダー
  - "Your Cart" タイトル
  - 閉じるボタン (×)
- カート商品リスト
  - 各商品カード
    - 商品画像（サムネイル）
    - 商品名
    - バリアント情報（サイズ、色など）
    - 単価表示
    - 数量調整ボタン（- / + ボタン）
    - 小計表示
    - 削除アイコン
- カート合計セクション
  - Subtotal（小計）
  - Shipping（配送料）- "Calculated at checkout"
  - Tax（税金）- "Calculated at checkout"
  - Total（合計）
- `Proceed to Checkout` ボタン（プライマリ）
- `Continue Shopping` リンク

#### ユーザーアクション

1. **カート表示**
   - カートアイコンクリック
   - サイドパネル展開

2. **数量変更**
   - +/- ボタンクリック
   - 自動的に小計・合計再計算

3. **商品削除**
   - 削除アイコンクリック
   - カートから即座に削除（確認なし）

4. **チェックアウトへ進む**
   - Proceed to Checkout ボタンクリック
   - チェックアウトページへ遷移

5. **買い物を続ける**
   - Continue Shopping リンククリック
   - カートパネル閉じる

#### データモデル

```typescript
interface Cart {
  id: string;
  sessionId: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  currency: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  priceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  productImage?: string;
  variantOptions?: VariantOption[];
  customFields?: Record<string, any>;
}
```

---

### 3.6 カートへ追加機能

#### 機能名
Add to Cart - カート追加機能

#### 説明
顧客が商品をショッピングカートに追加できる機能。複数商品を追加してからチェックアウト可能。追加時にトースト通知を表示。

#### UI要素

**商品ページ**
- `Add to Cart` ボタン
  - プライマリスタイル
  - 在庫切れ時は "Out of Stock" 表示（無効化）
- 数量選択フィールド（スピナー型）
- バリアント選択ドロップダウン（該当する場合）

**カート追加トースト通知**
- トースト表示位置: 画面右上（z-index: 1200）
- 表示内容:
  - チェックマークアイコン
  - "Added to cart" メッセージ
  - 商品名
  - `View Cart` リンク
  - `Checkout Now` リンク
- 自動消滅（3-5秒）

**ストアページ商品カード**
- 各商品に `Add to Cart` ボタン
- クイックビューモーダル対応

#### ユーザーアクション

1. **カートに追加（単純）**
   - 商品ページで Add to Cart クリック
   - トースト通知表示
   - カートアイコンのバッジ更新

2. **カートに追加（バリアント選択）**
   - バリアント選択（サイズ、色など）
   - 数量選択
   - Add to Cart クリック
   - トースト通知表示

3. **トースト通知からの操作**
   - View Cart クリック → カートパネル展開
   - Checkout Now クリック → チェックアウトページへ遷移

4. **ストアからの追加**
   - ストアページで商品カードの Add to Cart クリック
   - 即座にカート追加（モーダル不要）

#### API要件

```typescript
// カートに商品追加
POST /api/cart/items
{
  productId: string;
  variantId?: string;
  priceId: string;
  quantity: number;
  customFields?: Record<string, any>;
}

Response: {
  cart: Cart;
  addedItem: CartItem;
}

// カートアイテム更新
PATCH /api/cart/items/:itemId
{
  quantity: number;
}

Response: {
  cart: Cart;
}

// カートアイテム削除
DELETE /api/cart/items/:itemId

Response: {
  cart: Cart;
}
```

---

### 3.7 チェックアウトシステム

#### 機能名
Checkout - チェックアウトプロセス

#### 説明
顧客が購入を完了するための包括的なチェックアウトシステム。Payments AI、Stripe、PayPal、Apple Payなどの複数決済方法に対応。顧客所在地に基づく自動税金計算。

#### UI要素

**チェックアウトページレイアウト**
- 左側: フォームエリア
- 右側: 注文サマリー（固定/スティッキー）

**顧客情報セクション**
- Email フィールド（必須）
- "Already have an account? Login" リンク
- ニュースレター購読チェックボックス（オプション）

**配送情報セクション**（物理商品の場合）
- First Name（必須）
- Last Name（必須）
- Address（必須、住所自動補完機能）
- Apartment/Suite（オプション）
- City（必須）
- Country（ドロップダウン、必須）
- State/Province（ドロップダウン、必須）
- Postal/Zip Code（必須）
- Phone（必須）
- "Save this information for next time" チェックボックス

**配送方法セクション**
- 利用可能な配送オプション（ラジオボタン）
  - 各オプションに配送料と配送予定日表示
  - 例: "Standard Shipping - $5.00 (5-7 business days)"

**決済方法セクション**
- 決済方法選択タブ
  - Credit Card / Debit Card
  - PayPal
  - Apple Pay
  - その他ゲートウェイ
- クレジットカード入力
  - Card Number（Stripe Elements使用）
  - Expiry Date (MM/YY)
  - CVC
  - Cardholder Name
- 請求先住所オプション
  - "Same as shipping address" チェックボックス
  - 異なる場合: 請求先住所フォーム表示

**注文サマリーサイドバー**
- カート商品リスト（折りたたみ可能）
  - 各商品: 画像、名前、数量、価格
- 割引コード入力フィールド
  - `Apply` ボタン
  - 適用済みクーポン表示（削除ボタン付き）
- 価格内訳
  - Subtotal
  - Shipping
  - Discount（適用時のみ）
  - Tax（自動計算）
  - Total（太字、大きめフォント）
- `Complete Order` ボタン（プライマリ、大きめ）
- セキュリティバッジ（SSL、決済ゲートウェイロゴ）
- 返品ポリシー/利用規約リンク

**Order Bump（注文バンプ）**
- チェックアウト内に表示される追加オファー
- チェックボックスで簡単に追加可能
- 例: "Add [Product Name] for only $X more"
- 画像、説明、価格表示

#### ユーザーアクション

1. **チェックアウト開始**
   - カートから Proceed to Checkout クリック
   - チェックアウトページ表示

2. **情報入力**
   - 顧客情報入力
   - 配送情報入力（住所自動補完利用可能）
   - 配送方法選択

3. **決済情報入力**
   - 決済方法選択
   - カード情報入力（Stripe Elementsで安全に処理）

4. **割引コード適用**
   - 割引コード入力
   - Apply クリック
   - 適用成功 → 合計金額更新
   - 適用失敗 → エラーメッセージ表示

5. **Order Bump追加**
   - Order Bumpチェックボックスをチェック
   - 合計金額に自動反映

6. **注文完了**
   - Complete Order ボタンクリック
   - 決済処理実行
   - 成功 → 注文確認ページへリダイレクト
   - 失敗 → エラーメッセージ表示

#### データモデル

```typescript
interface Checkout {
  id: string;
  cartId: string;
  userId?: string;
  email: string;

  shippingAddress?: Address;
  billingAddress?: Address;

  shippingMethod?: {
    id: string;
    name: string;
    cost: number;
    estimatedDays: number;
  };

  paymentMethod?: {
    type: 'card' | 'paypal' | 'apple_pay';
    gatewayId: string;
    last4?: string;
    brand?: string;
  };

  discountCode?: string;
  discountAmount?: number;

  orderBumps?: OrderBump[];

  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountTotal: number;
  total: number;
  currency: string;

  status: 'pending' | 'processing' | 'completed' | 'failed';

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface OrderBump {
  productId: string;
  productName: string;
  price: number;
  accepted: boolean;
}

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}
```

---

### 3.8 注文管理

#### 機能名
Orders Management - 注文管理システム

#### 説明
顧客取引の追跡・管理を行うダッシュボード。総売上、注文数、各取引ステータスの監視が可能。テスト注文と実注文の両方に対応。

#### UI要素

**注文ダッシュボード**
- ナビゲーション: `Customers` > `Orders`
- KPI カード
  - Total Sales（総売上）
  - Number of Orders（注文数）
  - Average Order Value（平均注文額）
  - Conversion Rate（コンバージョン率）

**注文作成ボタン**
- `Create Order` ボタン（実注文作成）
- `Test Order` ボタン（テスト注文作成、分析に影響しない）

**注文一覧テーブル**
- カラム:
  - Order Number（注文番号、クリック可能）
  - Customer（顧客名/メール）
  - Date（注文日時）
  - Status（ステータスバッジ）
  - Payment Status（決済ステータス）
  - Fulfillment Status（履行ステータス）
  - Total（合計金額）
  - Actions（アクションメニュー）
- フィルター
  - Status（All, Pending, Processing, Completed, Cancelled, Refunded）
  - Date Range（日付範囲選択）
  - Payment Status
  - Fulfillment Status
- 検索バー（注文番号、顧客名、メールで検索）
- ページネーション

**注文詳細ページ**
- 注文ヘッダー
  - Order #XXXX
  - ステータスバッジ
  - 注文日時
  - アクションボタン（Edit, Refund, Cancel, Print, More...）

- 顧客情報カード
  - 顧客名
  - Email（クリックでメール送信）
  - Phone
  - 顧客プロフィールリンク

- 注文内容カード
  - 商品リスト（画像、名前、SKU、数量、単価、小計）
  - 価格サマリー（Subtotal, Shipping, Tax, Discount, Total）

- 配送情報カード（物理商品の場合）
  - 配送先住所
  - 配送方法
  - トラッキング情報（追加可能）

- 決済情報カード
  - 決済方法
  - 決済ステータス
  - トランザクションID
  - 決済日時
  - 決済ゲートウェイ

- タイムラインカード
  - 注文イベント履歴（注文作成、決済完了、出荷など）

#### ユーザーアクション

1. **注文一覧表示**
   - Customers > Orders
   - フィルター/検索で絞り込み

2. **注文詳細表示**
   - 注文番号クリック
   - 注文詳細ページ表示

3. **注文作成（手動）**
   - Create Order クリック
   - 顧客選択/作成
   - 商品追加
   - 配送・決済情報入力
   - 注文作成

4. **テスト注文作成**
   - Test Order クリック
   - 注文情報入力
   - テスト注文作成（分析データに含まれない）

5. **注文編集**
   - 注文詳細ページ > Edit
   - 商品追加/削除、数量変更など
   - 保存（差額の決済処理）

6. **注文キャンセル**
   - 注文詳細ページ > Cancel
   - キャンセル理由入力
   - 確認 → 注文キャンセル、返金処理

7. **返金処理**
   - 注文詳細ページ > Refund
   - 返金額入力（全額/部分）
   - 返金理由入力
   - 確認 → 返金実行

8. **注文印刷**
   - 注文詳細ページ > Print
   - 印刷用ビュー表示

#### データモデル

```typescript
interface Order {
  id: string;
  orderNumber: string;
  workspaceId: string;

  customerId: string;
  customerEmail: string;

  items: OrderItem[];

  shippingAddress?: Address;
  billingAddress?: Address;

  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';

  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;

  paymentMethod?: string;
  paymentGateway?: string;
  transactionId?: string;

  discountCodes?: string[];

  notes?: string;
  tags?: string[];

  isTest: boolean;

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  imageUrl?: string;
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'cancelled';
}
```

---

### 3.9 サブスクリプション注文管理

#### 機能名
Subscription Order Management - サブスクリプション管理

#### 説明
定期課金注文の管理機能。顧客が既存のサブスクリプションをアップグレード/ダウングレード可能。サブスクリプションのキャンセル、一時停止、再開に対応。

#### UI要素

**サブスクリプション一覧**
- ナビゲーション: `Customers` > `Subscriptions`
- サブスクリプションテーブル
  - カラム:
    - Subscription ID
    - Customer
    - Product/Plan
    - Amount
    - Billing Cycle（請求サイクル）
    - Next Billing Date（次回請求日）
    - Status（ステータスバッジ）
    - Actions
- フィルター
  - Status（Active, Paused, Cancelled, Past Due）
  - Billing Cycle
  - Date Range
- 検索機能

**サブスクリプション詳細ページ**
- サブスクリプション情報カード
  - Subscription ID
  - Status（大きめバッジ）
  - Created Date
  - Current Period（現在の請求期間）
  - Next Billing Date

- プラン情報カード
  - Product Name
  - Plan Name
  - Amount & Currency
  - Billing Cycle（例: Monthly, Yearly）
  - Trial Period（該当する場合）

- 顧客情報カード
  - Customer Name
  - Email
  - Payment Method（カードの下4桁）
  - Update Payment Method リンク

- 請求履歴カード
  - 過去の請求一覧テーブル
    - Date, Invoice #, Amount, Status, Actions
  - ページネーション

- アクションボタン
  - `Upgrade/Downgrade` ボタン
  - `Pause Subscription` ボタン
  - `Cancel Subscription` ボタン
  - `Resume Subscription` ボタン（一時停止時のみ）

**アップグレード/ダウングレードモーダル**
- 現在のプラン表示
- 利用可能なプラン一覧（ラジオボタン）
- プラン比較表示
- 即座適用 / 次回請求日から適用（ラジオボタン）
- 差額計算表示
- `Confirm Change` ボタン

**キャンセルモーダル**
- キャンセルオプション
  - "Cancel immediately"（即座にキャンセル）
  - "Cancel at period end"（期間終了時にキャンセル）
- キャンセル理由選択（ドロップダウン）
- フィードバック入力（テキストエリア、オプション）
- `Confirm Cancellation` ボタン

**一時停止モーダル**
- 一時停止期間選択
  - 1 month
  - 2 months
  - 3 months
  - Custom（カスタム日付選択）
- 一時停止理由（オプション）
- `Pause Subscription` ボタン

#### ユーザーアクション

1. **サブスクリプション一覧表示**
   - Customers > Subscriptions
   - フィルター/検索で絞り込み

2. **サブスクリプション詳細表示**
   - サブスクリプションIDクリック
   - 詳細ページ表示

3. **プランアップグレード/ダウングレード**
   - 詳細ページ > Upgrade/Downgrade
   - 新プラン選択
   - 適用タイミング選択
   - 確認 → プラン変更実行

4. **サブスクリプション一時停止**
   - 詳細ページ > Pause Subscription
   - 一時停止期間選択
   - 確認 → 一時停止実行

5. **サブスクリプション再開**
   - 詳細ページ > Resume Subscription
   - 確認 → 即座に再開

6. **サブスクリプションキャンセル**
   - 詳細ページ > Cancel Subscription
   - キャンセルタイミング選択
   - 理由入力
   - 確認 → キャンセル実行

7. **決済方法更新**
   - 詳細ページ > Update Payment Method
   - 新しいカード情報入力
   - 保存 → 次回請求から新決済方法使用

#### データモデル

```typescript
interface Subscription {
  id: string;
  workspaceId: string;
  customerId: string;

  productId: string;
  priceId: string;

  status: 'active' | 'paused' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';

  currentPeriodStart: Date;
  currentPeriodEnd: Date;

  billingCycleInterval: 'day' | 'week' | 'month' | 'year';
  billingCycleIntervalCount: number;

  amount: number;
  currency: string;

  trialStart?: Date;
  trialEnd?: Date;

  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  cancelReason?: string;

  pausedAt?: Date;
  pauseUntil?: Date;
  pauseReason?: string;

  paymentMethodId: string;
  paymentGateway: string;

  nextBillingDate?: Date;

  invoices?: string[]; // Invoice IDs

  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  billingDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
}
```

---

### 3.10 決済ゲートウェイ統合

#### 機能名
Payment Gateway Integration - 決済ゲートウェイ統合

#### 説明
複数の決済ゲートウェイと統合し、オンライン決済を処理。Stripe、PayPal、Payments AI、Recurly、NMI、Keapなどに対応。

#### UI要素

**決済設定ページ**
- ナビゲーション: `Settings` > `Payments`
- 接続済みゲートウェイカード
  - 各ゲートウェイのロゴ
  - 接続ステータス（Connected/Disconnected）
  - `Configure` ボタン
  - `Disconnect` ボタン

**利用可能ゲートウェイ一覧**
- Payments AI カード
  - "Native ClickFunnels Payment Gateway"
  - 手数料表示: "2.9% + $0.30 per transaction"
  - `Enable Payments AI` ボタン
- Stripe カード
  - "Popular payment processor"
  - `Connect Stripe Account` ボタン
- PayPal カード
  - "Available via Payments AI"
  - 注記: "Requires Payments AI to be enabled"
- その他ゲートウェイカード
  - Recurly, NMI, Keap (InfusionSoft V2)

**Stripe接続モーダル**
- Stripe接続方法選択
  - `Connect Existing Account`（既存アカウント接続）
  - `Create New Account`（新規アカウント作成）
- OAuth認証フロー
  - Stripe認証ページへリダイレクト
  - 権限承認
  - ClickFunnelsへリダイレクト

**Stripe設定ページ**
- API Keys セクション
  - Publishable Key（表示）
  - Secret Key（マスク表示）
  - Test Mode トグル
- Stripe Tax セクション
  - `Enable Stripe Tax` トグル
  - Tax Configuration リンク（Stripeダッシュボードへ）
- Webhook セクション
  - Webhook URL（読み取り専用、コピーボタン）
  - Webhook Secret（マスク表示）
  - `Test Webhook` ボタン

**Payments AI設定ページ**
- Account Information
  - Business Name
  - Business Address（税金計算用）
  - Business Type（ドロップダウン）
- Tax Settings
  - Automatic Tax Calculation トグル（デフォルト有効）
  - Supported Regions: US, Canada, Australia, EU, UK
  - TaxJar Integration（オプション）
    - `Connect TaxJar` ボタン
- Payment Methods
  - Credit/Debit Cards（デフォルト有効）
  - PayPal（トグル）
  - Apple Pay（トグル）
  - Google Pay（トグル）

#### ユーザーアクション

1. **Payments AI有効化**
   - Settings > Payments
   - Payments AI カード > Enable Payments AI
   - ビジネス情報入力
   - 有効化完了

2. **Stripe接続**
   - Settings > Payments
   - Stripe カード > Connect Stripe Account
   - 既存アカウント選択 or 新規作成
   - Stripe OAuth認証
   - 権限承認
   - 接続完了

3. **Stripe Tax有効化**
   - Stripe設定ページ > Enable Stripe Tax
   - Stripeダッシュボードで税金設定（別タブで開く）
   - 税カテゴリ設定
   - ClickFunnelsに戻って確認

4. **PayPal有効化**
   - Payments AI有効化（必須）
   - Payments AI設定 > Payment Methods > PayPal トグルON
   - 保存

5. **テストモード切替**
   - Stripe設定 > Test Mode トグル
   - テストキー使用に切替
   - チェックアウトでテスト決済可能

6. **Webhook設定**
   - Stripe設定 > Webhook URL コピー
   - Stripeダッシュボード > Webhooks > Add Endpoint
   - URL貼り付け、イベント選択
   - Webhook Secret取得
   - ClickFunnelsに貼り付け
   - Test Webhookで確認

#### データモデル

```typescript
interface PaymentGateway {
  id: string;
  workspaceId: string;
  provider: 'payments_ai' | 'stripe' | 'paypal' | 'recurly' | 'nmi' | 'keap';
  status: 'connected' | 'disconnected' | 'error';
  isDefault: boolean;

  config: {
    // Stripe
    stripeAccountId?: string;
    stripePublishableKey?: string;
    stripeSecretKey?: string; // encrypted
    stripeTaxEnabled?: boolean;
    stripeWebhookSecret?: string; // encrypted

    // Payments AI
    paymentsAIEnabled?: boolean;
    businessName?: string;
    businessAddress?: Address;
    businessType?: string;
    taxJarApiKey?: string; // encrypted

    // 共通
    testMode?: boolean;
  };

  supportedPaymentMethods: PaymentMethodType[];

  createdAt: Date;
  updatedAt: Date;
  connectedAt?: Date;
}

type PaymentMethodType = 'card' | 'paypal' | 'apple_pay' | 'google_pay';

interface PaymentTransaction {
  id: string;
  orderId: string;
  gatewayId: string;
  gatewayTransactionId: string;

  amount: number;
  currency: string;

  paymentMethod: PaymentMethodType;
  paymentMethodDetails?: {
    last4?: string;
    brand?: string;
    email?: string; // for PayPal
  };

  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';

  refunds?: PaymentRefund[];

  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

interface PaymentRefund {
  id: string;
  transactionId: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}
```

---

### 3.11 税金計算・徴収

#### 機能名
Tax Collection - 自動税金計算・徴収

#### 説明
顧客の請求先住所と商品タイプに基づいてリアルタイムで税金を計算。Payments AIとStripe Taxによる自動税金計算に対応。米国、カナダ、オーストラリア、EU、英国をネイティブサポート。

#### UI要素

**税金設定ページ**
- ナビゲーション: `Settings` > `Taxes`

**税金計算方法選択**
- ラジオボタン選択
  - `Automatic Tax Calculation`（推奨）
    - Payments AI or Stripe Tax使用
    - 説明: "Automatically calculates tax based on customer location"
  - `Manual Tax Setup`
    - 手動で税率設定
    - 説明: "Set up tax rates manually for specific regions"
  - `No Tax Collection`
    - 税金徴収なし

**Automatic Tax Settings（Payments AI）**
- Business Location
  - Country（ドロップダウン）
  - Address（住所入力フィールド）
  - Tax ID（オプション）
- Supported Regions（自動有効、設定不要）
  - United States
  - Canada
  - Australia
  - European Union
  - United Kingdom
- TaxJar Integration（オプション）
  - `Connect TaxJar Account` ボタン
  - TaxJar API Key入力
  - `Generate Tax Reports` リンク

**Stripe Tax Settings**
- `Enable Stripe Tax` トグル
- Stripe Tax Configuration リンク（Stripeダッシュボードへ）
- Tax Behavior設定
  - Inclusive（税込表示）
  - Exclusive（税抜表示）
- Product Tax Codes
  - 商品カテゴリーごとの税コード設定

**Manual Tax Setup**
- Tax Zones テーブル
  - カラム: Zone Name, Countries/Regions, Tax Rate, Status, Actions
- `Add Tax Zone` ボタン
- Tax Zone作成モーダル
  - Zone Name入力
  - Country/Region選択（複数選択可能）
  - Tax Rate入力（%）
  - Tax Name（例: VAT, GST, Sales Tax）
  - Compound Tax チェックボックス（税金を他の税金の上に適用）

**商品別税金設定**
- 商品編集ページ内
- Tax Settings セクション
  - Taxable トグル（課税対象 or 非課税）
  - Tax Category（ドロップダウン）
    - General Goods
    - Digital Goods
    - Services
    - Food & Beverage
    - Clothing
    - Books
    - Custom（カスタム税カテゴリ）

**チェックアウトでの税金表示**
- Order Summary内
  - Tax行（自動計算された税額表示）
  - 税金の内訳（複数税率の場合）
    - 例: "VAT (20%): $20.00"
  - Total（税込合計）

#### ユーザーアクション

1. **Automatic Tax有効化（Payments AI）**
   - Settings > Taxes
   - Automatic Tax Calculation選択
   - Business Location入力
   - 保存（即座に有効化）

2. **Stripe Tax有効化**
   - Settings > Taxes
   - Automatic Tax Calculation選択
   - Stripe Taxトグル有効化
   - Stripeダッシュボードで設定
   - 商品に税カテゴリ設定

3. **TaxJar連携**
   - Payments AI設定 > TaxJar Integration
   - Connect TaxJar Account
   - API Key入力
   - 接続確認
   - 税レポート生成可能に

4. **Manual Tax Zone追加**
   - Settings > Taxes > Manual Tax Setup
   - Add Tax Zone
   - Zone情報入力
   - 保存

5. **商品の課税設定**
   - 商品編集 > Tax Settings
   - Taxableトグル有効化
   - Tax Category選択
   - 保存

6. **税金計算確認（チェックアウト）**
   - チェックアウトページで住所入力
   - 自動的に税金計算・表示
   - 合計金額に反映

#### データモデル

```typescript
interface TaxSettings {
  id: string;
  workspaceId: string;

  method: 'automatic' | 'manual' | 'none';

  // Automatic Tax (Payments AI)
  automaticTax?: {
    enabled: boolean;
    businessLocation: Address;
    taxId?: string;
    taxJarEnabled?: boolean;
    taxJarApiKey?: string; // encrypted
  };

  // Stripe Tax
  stripeTax?: {
    enabled: boolean;
    behavior: 'inclusive' | 'exclusive';
  };

  // Manual Tax
  manualTaxZones?: TaxZone[];

  createdAt: Date;
  updatedAt: Date;
}

interface TaxZone {
  id: string;
  name: string;
  countries: string[]; // ISO country codes
  regions?: string[]; // State/Province codes
  rate: number; // percentage
  taxName: string; // e.g., "VAT", "GST", "Sales Tax"
  compound: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface ProductTaxSettings {
  taxable: boolean;
  taxCategory?: 'general' | 'digital' | 'services' | 'food' | 'clothing' | 'books' | 'custom';
  customTaxCode?: string; // for Stripe Tax
}

interface TaxCalculation {
  orderId: string;
  method: 'automatic' | 'manual';
  billingAddress: Address;

  lineItems: TaxLineItem[];

  totalTax: number;
  taxBreakdown: TaxBreakdownItem[];

  calculatedAt: Date;
}

interface TaxLineItem {
  productId: string;
  amount: number;
  taxable: boolean;
  taxCategory?: string;
  taxAmount: number;
}

interface TaxBreakdownItem {
  name: string; // e.g., "VAT", "State Tax"
  rate: number;
  amount: number;
  jurisdiction: string; // e.g., "United Kingdom", "California"
}
```

---

### 3.12 請求書管理

#### 機能名
Invoices - 請求書管理システム

#### 説明
全ての請求書記録を一箇所で追跡・管理。請求書ステータス、履行状態、発行日の詳細情報を表示。請求書の支払い、閲覧、送信、ダウンロード、再発行、破棄が可能。

#### UI要素

**請求書ダッシュボード**
- ナビゲーション: `Customers` > `Invoices`
- 請求書一覧テーブル
  - カラム:
    - Invoice Number（請求書番号、クリック可能）
    - Customer（顧客名）
    - Issue Date（発行日）
    - Due Date（支払期限）
    - Amount（金額）
    - Status（ステータスバッジ）
    - Fulfillment（履行ステータス）
    - Actions（三点メニュー）
- フィルター
  - Status（All, Draft, Open, Paid, Void, Uncollectible）
  - Date Range
- 検索バー（請求書番号、顧客名で検索）
- `Create Invoice` ボタン

**ステータスバッジ**
- Draft（下書き）- グレー
- Open（未払い）- オレンジ
- Paid（支払済み）- グリーン
- Void（無効）- レッド
- Uncollectible（回収不能）- ダークレッド

**アクションメニュー（三点アイコン）**
- `Pay` - 未払い請求書の支払い処理
- `View` - 請求書詳細を開く
- `Send` - 顧客にメール送信
- `Download` - PDF形式で保存
- `Reissue` - 更新された詳細で再発行
- `Abandon` - 請求書を破棄（未払いのみ）

**請求書詳細ページ**
- 請求書ヘッダー
  - Invoice #XXXX
  - ステータスバッジ
  - Issue Date
  - Due Date（該当する場合）
- ビジネス情報
  - 差出人情報（ビジネス名、住所、税ID）
  - 請求先情報（顧客名、住所）
- 請求項目テーブル
  - カラム: Description, Quantity, Unit Price, Total
- 合計セクション
  - Subtotal
  - Tax（税率と金額表示）
  - Discount（該当する場合）
  - Total Due（支払総額）
- 支払い情報（支払済みの場合）
  - Payment Date
  - Payment Method
  - Transaction ID
- アクションボタン
  - `Send Invoice` ボタン
  - `Download PDF` ボタン
  - `Mark as Paid` ボタン（未払いの場合）
  - `Void Invoice` ボタン

**請求書作成フォーム**
- 顧客選択（ドロップダウン or 新規作成）
- 請求項目追加
  - Description
  - Quantity
  - Unit Price
  - `Add Line Item` ボタン
- Due Date選択（オプション）
- Memo/Notes（テキストエリア、オプション）
- `Save as Draft` ボタン
- `Issue Invoice` ボタン

**請求書送信モーダル**
- To: 顧客メール（自動入力、編集可能）
- CC:（オプション）
- Subject:（デフォルト: "Invoice #XXXX from [Business Name]"）
- Message:（テキストエリア、デフォルトメッセージ）
- `Send` ボタン

#### ユーザーアクション

1. **請求書一覧表示**
   - Customers > Invoices
   - フィルター/検索で絞り込み

2. **請求書詳細表示**
   - 請求書番号クリック
   - 詳細ページ表示

3. **請求書作成**
   - Create Invoice クリック
   - 顧客選択
   - 請求項目追加
   - Draft保存 or 即座発行

4. **請求書送信**
   - アクションメニュー > Send
   - メール内容確認/編集
   - Send実行
   - 顧客にメール送信、PDFを添付

5. **請求書ダウンロード**
   - アクションメニュー > Download
   - PDFファイル自動ダウンロード

6. **請求書支払い処理**
   - アクションメニュー > Pay
   - 支払い方法選択
   - 支払い実行
   - ステータス更新: Paid

7. **請求書再発行**
   - アクションメニュー > Reissue
   - 請求書情報編集
   - 新しい請求書として発行

8. **請求書破棄**
   - アクションメニュー > Abandon（未払いのみ）
   - 確認ダイアログ
   - ステータス更新: Void

#### データモデル

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  workspaceId: string;

  customerId: string;
  customerEmail: string;

  orderId?: string;
  subscriptionId?: string;

  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  fulfillmentStatus?: 'unfulfilled' | 'fulfilled';

  issueDate: Date;
  dueDate?: Date;

  lineItems: InvoiceLineItem[];

  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;

  billingAddress?: Address;
  shippingAddress?: Address;

  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;

  memo?: string;
  footer?: string;

  pdfUrl?: string;

  sentAt?: Date;
  sentTo?: string[];

  createdAt: Date;
  updatedAt: Date;
  voidedAt?: Date;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productId?: string;
  variantId?: string;
}
```

---

### 3.13 注文履行管理

#### 機能名
Fulfillment Management - 注文履行・配送管理

#### 説明
商品の出荷と配送を管理。手動履行とZendrop、ShipStationなどのサードパーティサービスとの自動連携に対応。配送追跡とステータス更新機能。

#### UI要素

**履行ダッシュボード**
- ナビゲーション: `Customers` > `Fulfillments`
- 履行ステータスKPI
  - Pending Fulfillment（履行待ち件数）
  - In Progress（処理中）
  - Fulfilled（履行済み）
- 履行一覧テーブル
  - カラム:
    - Order #
    - Customer
    - Products（商品数）
    - Fulfillment Method（履行方法）
    - Status（ステータスバッジ）
    - Tracking Number（追跡番号）
    - Shipped Date（出荷日）
    - Actions

**履行ステータス**
- Unfulfilled（未履行）- オレンジ
- Partially Fulfilled（部分履行）- イエロー
- Fulfilled（履行済み）- グリーン
- Cancelled（キャンセル）- レッド

**履行詳細ページ**
- 注文情報
  - Order Number
  - Customer Name
  - Order Date
- 商品リスト
  - 各商品に履行チェックボックス
  - 数量表示
  - SKU表示
- 配送情報
  - Shipping Address表示
  - Shipping Method
- 履行アクション
  - `Mark as Fulfilled` ボタン
  - `Add Tracking Number` ボタン
  - `Print Packing Slip` ボタン
  - `Print Shipping Label` ボタン

**履行モーダル**
- 履行する商品選択（チェックボックス）
- 数量入力（部分履行の場合）
- Shipping Carrier選択（ドロップダウン）
  - USPS
  - FedEx
  - UPS
  - DHL
  - Other（カスタム入力）
- Tracking Number入力
- Notify Customer チェックボックス（デフォルトON）
  - メール通知テンプレートプレビュー
- `Fulfill Items` ボタン

**配送ラベル生成**（ShipStation連携時）
- Package Details
  - Weight（重量入力）
  - Dimensions（寸法入力）
- Shipping Service選択
  - 利用可能なサービスと料金一覧
- `Generate Label` ボタン
- 生成されたラベルのPDFダウンロード

**サードパーティ連携設定**
- Settings > Integrations > Fulfillment
- ShipStation Integration
  - `Connect ShipStation` ボタン
  - API Key入力
  - API Secret入力
  - `Test Connection` ボタン
  - Auto Sync トグル（注文を自動的にShipStationに送信）
- Zendrop Integration
  - `Connect Zendrop` ボタン
  - OAuth認証フロー
  - Auto Fulfillment トグル

#### ユーザーアクション

1. **手動履行**
   - 注文詳細ページ > Fulfill Items
   - 商品選択
   - 配送業者と追跡番号入力
   - 顧客通知確認
   - Fulfill Items実行
   - ステータス更新、顧客にメール送信

2. **部分履行**
   - 履行モーダルで一部商品のみ選択
   - 数量調整
   - 履行実行
   - ステータス: Partially Fulfilled

3. **配送追跡番号追加**
   - 履行詳細 > Add Tracking Number
   - 配送業者選択
   - 追跡番号入力
   - 保存
   - 顧客に追跡情報メール送信

4. **梱包票印刷**
   - 注文詳細 > Print Packing Slip
   - PDF生成・ダウンロード
   - 印刷

5. **配送ラベル生成（ShipStation）**
   - 注文詳細 > Print Shipping Label
   - パッケージ詳細入力
   - 配送サービス選択
   - ラベル生成
   - PDF印刷

6. **ShipStation連携**
   - Settings > Integrations > Fulfillment > ShipStation
   - Connect ShipStation
   - API情報入力
   - Test Connection
   - Auto Sync有効化
   - 以降、注文が自動的にShipStationに送信
   - ShipStationで出荷 → ClickFunnelsのステータス自動更新

7. **Zendrop連携（ドロップシッピング）**
   - Settings > Integrations > Zendrop
   - Connect Zendrop
   - OAuth認証
   - Auto Fulfillment有効化
   - 注文確定 → Zendropが自動履行
   - 追跡情報が自動的に同期

#### データモデル

```typescript
interface Fulfillment {
  id: string;
  orderId: string;

  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';

  lineItems: FulfillmentLineItem[];

  shippingAddress: Address;
  shippingMethod: string;

  carrier?: string; // USPS, FedEx, UPS, DHL, etc.
  trackingNumber?: string;
  trackingUrl?: string;

  shippingLabelUrl?: string;
  packingSlipUrl?: string;

  shipmentDate?: Date;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;

  fulfillmentMethod: 'manual' | 'shipstation' | 'zendrop' | 'other';
  externalFulfillmentId?: string;

  notifyCustomer: boolean;
  notificationSentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
  fulfilledAt?: Date;
}

interface FulfillmentLineItem {
  id: string;
  orderItemId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  sku?: string;
}

interface FulfillmentIntegration {
  id: string;
  workspaceId: string;
  provider: 'shipstation' | 'zendrop';

  status: 'connected' | 'disconnected' | 'error';

  config: {
    // ShipStation
    shipstationApiKey?: string; // encrypted
    shipstationApiSecret?: string; // encrypted
    shipstationStoreId?: string;
    autoSync?: boolean;

    // Zendrop
    zendropAccessToken?: string; // encrypted
    autoFulfill?: boolean;
  };

  lastSyncAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

---

### 3.14 割引・クーポン

#### 機能名
Discounts & Coupons - 割引・クーポンシステム

#### 説明
チェックアウト時に適用可能な割引コードとクーポンの作成・管理機能。パーセンテージ割引、固定額割引、送料無料などの割引タイプに対応。

#### UI要素

**割引ダッシュボード**
- ナビゲーション: `Marketing` > `Discounts`
- `Create Discount` ボタン
- 割引一覧テーブル
  - カラム:
    - Code（割引コード）
    - Type（割引タイプ）
    - Value（割引額/率）
    - Status（有効/無効）
    - Usage（使用回数/上限）
    - Valid From - Valid Until（有効期間）
    - Actions

**割引作成/編集フォーム**
- 基本情報セクション
  - Discount Code入力（必須、大文字自動変換）
    - `Generate Code` ボタン（ランダムコード生成）
  - Discount Type選択（ドロップダウン）
    - Percentage（パーセンテージ）
    - Fixed Amount（固定額）
    - Free Shipping（送料無料）
    - Buy X Get Y（購入特典）
  - Discount Value入力
    - Percentage: 数値 + % 表示
    - Fixed Amount: 通貨 + 金額入力

- 適用条件セクション
  - Minimum Purchase Amount（最低購入額、オプション）
  - Maximum Discount Amount（最大割引額、オプション）
  - Applies To（適用対象）
    - All Products（全商品）
    - Specific Products（特定商品）- 商品選択
    - Specific Collections（特定コレクション）- コレクション選択

- 使用制限セクション
  - Usage Limit（使用回数上限、オプション）
    - Total Uses（総使用回数）
    - Per Customer（顧客あたりの使用回数）
  - Limit to One Use Per Customer チェックボックス
  - Stackable チェックボックス（他のクーポンと併用可能）

- 有効期間セクション
  - Valid From（開始日時、デートピッカー）
  - Valid Until（終了日時、デートピッカー、オプション）
  - `No Expiration` チェックボックス

- 顧客制限セクション（オプション）
  - All Customers（全顧客）
  - Specific Customers（特定顧客）- 顧客選択
  - Customer Segments（顧客セグメント）- セグメント選択

- アクションボタン
  - `Save` ボタン
  - `Save and Activate` ボタン
  - `Cancel` リンク

**チェックアウトでの割引適用UI**
- 割引コード入力セクション
  - "Discount code" ラベル
  - 入力フィールド
  - `Apply` ボタン
- 適用済みクーポン表示
  - コード名（タグスタイル）
  - 割引額表示
  - 削除アイコン (×)
- 価格サマリーに "Discount" 行追加
  - マイナス金額表示（例: "-$10.00"）

**割引レポート**
- Discounts ダッシュボード内
- 各割引の統計
  - Total Uses（総使用回数）
  - Total Revenue（総売上）
  - Total Discount Given（総割引額）
  - Conversion Rate（コンバージョン率）
- `View Report` リンク
  - 詳細レポートページへ遷移
  - 使用履歴テーブル（注文番号、顧客、日時、割引額）
  - グラフ表示（時系列の使用推移）

#### ユーザーアクション

1. **割引コード作成**
   - Marketing > Discounts > Create Discount
   - コード入力 or 自動生成
   - 割引タイプと値設定
   - 適用条件設定
   - 使用制限設定
   - 有効期間設定
   - Save and Activate

2. **割引コード編集**
   - 割引一覧から選択 > Edit
   - 設定変更
   - 保存

3. **割引コード無効化**
   - Status トグルをOFFに
   - 新規使用不可（既存使用には影響なし）

4. **割引コード削除**
   - Actions > Delete
   - 確認ダイアログ
   - 削除実行

5. **顧客がチェックアウトで適用**
   - チェックアウトページで割引コード入力
   - Apply クリック
   - バリデーション:
     - コード存在確認
     - 有効期間確認
     - 使用回数確認
     - 最低購入額確認
     - 適用商品確認
   - 成功 → 割引適用、合計更新
   - 失敗 → エラーメッセージ表示

6. **割引レポート確認**
   - Discounts > 割引選択 > View Report
   - 使用統計確認
   - 使用履歴確認

#### データモデル

```typescript
interface Discount {
  id: string;
  workspaceId: string;

  code: string; // unique

  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  value: number; // percentage or amount

  // 適用条件
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  appliesTo: 'all' | 'specific_products' | 'specific_collections';
  productIds?: string[];
  collectionIds?: string[];

  // 使用制限
  usageLimit?: number; // total uses
  usageLimitPerCustomer?: number;
  oneUsePerCustomer: boolean;
  stackable: boolean; // can combine with other discounts

  // 有効期間
  validFrom: Date;
  validUntil?: Date; // null = no expiration

  // 顧客制限
  customerEligibility: 'all' | 'specific_customers' | 'customer_segments';
  customerIds?: string[];
  customerSegmentIds?: string[];

  // ステータス
  status: 'active' | 'inactive' | 'scheduled' | 'expired';

  // 統計
  timesUsed: number;
  totalRevenue: number;
  totalDiscountGiven: number;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface DiscountUsage {
  id: string;
  discountId: string;
  orderId: string;
  customerId?: string;

  discountCode: string;
  discountAmount: number;
  orderTotal: number;

  usedAt: Date;
}
```

---

## 4. API要件

### 4.1 商品API

```typescript
// 商品一覧取得
GET /api/products
Query Params: {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  type?: 'physical' | 'digital' | 'subscription' | 'membership';
  search?: string;
  sort?: string;
}
Response: {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// 商品作成
POST /api/products
Body: {
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'subscription' | 'membership';
  status: 'active' | 'inactive';
  visible: boolean;
  images?: ProductImage[];
  // ... その他のフィールド
}
Response: Product

// 商品詳細取得
GET /api/products/:id
Response: Product

// 商品更新
PATCH /api/products/:id
Body: Partial<Product>
Response: Product

// 商品削除
DELETE /api/products/:id
Response: { success: boolean }

// 商品バリアント追加
POST /api/products/:id/variants
Body: {
  options: VariantOption[];
  sku: string;
  priceOverride?: number;
  inventoryQuantity?: number;
}
Response: ProductVariant

// 商品価格追加
POST /api/products/:id/prices
Body: ProductPrice
Response: ProductPrice
```

### 4.2 カート・チェックアウトAPI

```typescript
// カート取得
GET /api/cart
Response: Cart

// カートに商品追加
POST /api/cart/items
Body: {
  productId: string;
  variantId?: string;
  priceId: string;
  quantity: number;
}
Response: Cart

// カートアイテム更新
PATCH /api/cart/items/:itemId
Body: { quantity: number }
Response: Cart

// カートアイテム削除
DELETE /api/cart/items/:itemId
Response: Cart

// 割引コード適用
POST /api/cart/apply-discount
Body: { code: string }
Response: Cart

// チェックアウト作成
POST /api/checkout
Body: {
  email: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethodId?: string;
}
Response: Checkout

// チェックアウト更新
PATCH /api/checkout/:id
Body: Partial<Checkout>
Response: Checkout

// 注文完了
POST /api/checkout/:id/complete
Body: {
  paymentMethodId: string;
  paymentGatewayId: string;
}
Response: {
  order: Order;
  paymentStatus: 'succeeded' | 'failed';
  redirectUrl?: string;
}
```

### 4.3 注文API

```typescript
// 注文一覧取得
GET /api/orders
Query Params: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
Response: {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// 注文詳細取得
GET /api/orders/:id
Response: Order

// 注文作成（手動）
POST /api/orders
Body: {
  customerId: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  isTest: boolean;
}
Response: Order

// 注文更新
PATCH /api/orders/:id
Body: Partial<Order>
Response: Order

// 注文キャンセル
POST /api/orders/:id/cancel
Body: { reason?: string }
Response: Order

// 返金処理
POST /api/orders/:id/refund
Body: {
  amount: number; // partial or full
  reason?: string;
}
Response: {
  order: Order;
  refund: PaymentRefund;
}
```

### 4.4 サブスクリプションAPI

```typescript
// サブスクリプション一覧取得
GET /api/subscriptions
Query Params: {
  status?: 'active' | 'paused' | 'cancelled' | 'past_due';
  customerId?: string;
}
Response: {
  subscriptions: Subscription[];
  total: number;
}

// サブスクリプション詳細取得
GET /api/subscriptions/:id
Response: Subscription

// プラン変更
POST /api/subscriptions/:id/change-plan
Body: {
  newPriceId: string;
  applyImmediately: boolean;
}
Response: Subscription

// サブスクリプション一時停止
POST /api/subscriptions/:id/pause
Body: {
  pauseUntil?: Date;
  reason?: string;
}
Response: Subscription

// サブスクリプション再開
POST /api/subscriptions/:id/resume
Response: Subscription

// サブスクリプションキャンセル
POST /api/subscriptions/:id/cancel
Body: {
  cancelAtPeriodEnd: boolean;
  reason?: string;
}
Response: Subscription

// 決済方法更新
POST /api/subscriptions/:id/update-payment-method
Body: {
  paymentMethodId: string;
}
Response: Subscription
```

### 4.5 決済API

```typescript
// 決済ゲートウェイ一覧取得
GET /api/payment-gateways
Response: PaymentGateway[]

// Stripe接続
POST /api/payment-gateways/stripe/connect
Body: {
  authorizationCode: string; // OAuth
}
Response: PaymentGateway

// Payments AI有効化
POST /api/payment-gateways/payments-ai/enable
Body: {
  businessName: string;
  businessAddress: Address;
  businessType: string;
}
Response: PaymentGateway

// 決済処理
POST /api/payments/process
Body: {
  orderId: string;
  gatewayId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}
Response: PaymentTransaction

// 返金処理
POST /api/payments/:transactionId/refund
Body: {
  amount: number;
  reason?: string;
}
Response: PaymentRefund
```

### 4.6 税金API

```typescript
// 税金計算
POST /api/tax/calculate
Body: {
  lineItems: {
    productId: string;
    amount: number;
    quantity: number;
  }[];
  shippingAddress: Address;
  shippingCost?: number;
}
Response: TaxCalculation

// 税金設定取得
GET /api/tax/settings
Response: TaxSettings

// 税金設定更新
PATCH /api/tax/settings
Body: Partial<TaxSettings>
Response: TaxSettings

// Tax Zone追加
POST /api/tax/zones
Body: TaxZone
Response: TaxZone
```

### 4.7 在庫API

```typescript
// 在庫数取得
GET /api/inventory/products/:productId
Response: {
  productId: string;
  variantId?: string;
  quantity: number;
  locations: {
    locationId: string;
    quantity: number;
  }[];
}

// 在庫数更新
POST /api/inventory/adjust
Body: {
  productId: string;
  variantId?: string;
  locationId?: string;
  quantityChange: number;
  reason?: string;
}
Response: InventoryHistory

// 在庫履歴取得
GET /api/inventory/history
Query Params: {
  productId?: string;
  variantId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}
Response: InventoryHistory[]
```

### 4.8 履行API

```typescript
// 履行作成
POST /api/fulfillments
Body: {
  orderId: string;
  lineItems: FulfillmentLineItem[];
  carrier?: string;
  trackingNumber?: string;
  notifyCustomer: boolean;
}
Response: Fulfillment

// 履行更新
PATCH /api/fulfillments/:id
Body: Partial<Fulfillment>
Response: Fulfillment

// 追跡番号追加
POST /api/fulfillments/:id/tracking
Body: {
  carrier: string;
  trackingNumber: string;
}
Response: Fulfillment

// ShipStation同期
POST /api/integrations/shipstation/sync
Response: {
  synced: number;
  failed: number;
  errors?: string[];
}
```

### 4.9 請求書API

```typescript
// 請求書一覧取得
GET /api/invoices
Query Params: {
  status?: 'draft' | 'open' | 'paid' | 'void';
  customerId?: string;
  startDate?: string;
  endDate?: string;
}
Response: {
  invoices: Invoice[];
  total: number;
}

// 請求書作成
POST /api/invoices
Body: {
  customerId: string;
  lineItems: InvoiceLineItem[];
  dueDate?: Date;
  memo?: string;
}
Response: Invoice

// 請求書送信
POST /api/invoices/:id/send
Body: {
  to: string[];
  cc?: string[];
  subject?: string;
  message?: string;
}
Response: { success: boolean }

// 請求書支払い
POST /api/invoices/:id/pay
Body: {
  paymentMethodId: string;
}
Response: Invoice

// 請求書PDF取得
GET /api/invoices/:id/pdf
Response: PDF file (application/pdf)
```

### 4.10 割引API

```typescript
// 割引一覧取得
GET /api/discounts
Response: Discount[]

// 割引作成
POST /api/discounts
Body: Discount
Response: Discount

// 割引コード検証
POST /api/discounts/validate
Body: {
  code: string;
  cartTotal: number;
  productIds: string[];
  customerId?: string;
}
Response: {
  valid: boolean;
  discount?: Discount;
  discountAmount?: number;
  errorMessage?: string;
}

// 割引使用統計取得
GET /api/discounts/:id/stats
Response: {
  timesUsed: number;
  totalRevenue: number;
  totalDiscountGiven: number;
  conversionRate: number;
  usageHistory: DiscountUsage[];
}
```

---

## 5. 決済連携要件

### 5.1 Payments AI統合

#### 概要
ClickFunnelsのネイティブ決済ゲートウェイ。スタンドアロンゲートウェイとして機能し、他の決済ゲートウェイをClickFunnelsに接続するためのハブとしても機能。

#### 手数料
- 2.9% + $0.30 per transaction

#### 機能
- **決済方法**:
  - クレジット/デビットカード（デフォルト有効）
  - PayPal（トグルで有効化）
  - Apple Pay（トグルで有効化）
  - Google Pay（トグルで有効化）

- **自動税金計算**:
  - サポート地域: 米国、カナダ、オーストラリア、EU、英国
  - ビジネス住所に基づく自動設定
  - 追加設定不要

- **TaxJar連携**（オプション）:
  - TaxJarアカウント接続
  - 税レポート生成

#### 実装要件

```typescript
// Payments AI初期化
async function initializePaymentsAI(config: {
  businessName: string;
  businessAddress: Address;
  businessType: string;
}) {
  // 1. Payments AIアカウント作成
  const account = await createPaymentsAIAccount(config);

  // 2. デフォルト決済方法有効化（カード）
  await enablePaymentMethod(account.id, 'card');

  // 3. 自動税金計算有効化（デフォルト）
  await enableAutomaticTax(account.id, config.businessAddress);

  return account;
}

// 決済処理
async function processPaymentWithPaymentsAI(params: {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerInfo: {
    email: string;
    billingAddress: Address;
  };
  lineItems: {
    description: string;
    amount: number;
    quantity: number;
    taxCategory?: string;
  }[];
}) {
  // 1. 税金計算
  const taxCalculation = await calculateTax({
    billingAddress: params.customerInfo.billingAddress,
    lineItems: params.lineItems,
  });

  // 2. 決済実行
  const transaction = await createPaymentTransaction({
    amount: params.amount + taxCalculation.totalTax,
    currency: params.currency,
    paymentMethod: params.paymentMethodId,
    customer: params.customerInfo,
    taxAmount: taxCalculation.totalTax,
  });

  return transaction;
}
```

### 5.2 Stripe統合

#### 概要
広く使用される決済プロセッサー。ClickFunnelsとのシームレスな統合を提供。

#### 接続方法
1. OAuth認証フロー
2. 既存Stripeアカウント接続 or 新規作成

#### 機能
- **決済方法**:
  - クレジット/デビットカード
  - Apple Pay
  - Google Pay
  - その他Stripe対応決済方法

- **Stripe Tax**:
  - リアルタイム税金計算
  - 商品税カテゴリー設定
  - 税込/税抜表示設定

- **Stripe Elements**:
  - セキュアなカード入力フォーム
  - PCI DSS準拠
  - カスタマイズ可能なスタイル

- **Webhook**:
  - 決済イベント通知
  - サブスクリプション更新通知
  - 返金通知

#### 実装要件

```typescript
// Stripe初期化
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Stripe Elements初期化（フロントエンド）
const elements = stripe.elements({
  mode: 'payment',
  amount: total * 100, // cents
  currency: 'usd',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#FEB95F',
    },
  },
});

const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// PaymentIntent作成（バックエンド）
async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount * 100, // cents
    currency: params.currency,
    customer: params.customerId,
    metadata: params.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

// 決済確認（フロントエンド）
async function confirmPayment(clientSecret: string) {
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/order-confirmation`,
    },
  });

  if (error) {
    throw error;
  }

  return paymentIntent;
}

// Stripe Tax使用
async function calculateStripeTax(params: {
  lineItems: {
    amount: number;
    reference: string;
    taxCode?: string;
  }[];
  customerAddress: Address;
  shippingCost?: number;
}) {
  const taxCalculation = await stripe.tax.calculations.create({
    currency: 'usd',
    line_items: params.lineItems.map(item => ({
      amount: item.amount * 100,
      reference: item.reference,
      tax_code: item.taxCode || 'txcd_99999999', // general
    })),
    customer_details: {
      address: {
        line1: params.customerAddress.address1,
        city: params.customerAddress.city,
        state: params.customerAddress.state,
        postal_code: params.customerAddress.postalCode,
        country: params.customerAddress.country,
      },
      address_source: 'billing',
    },
    shipping_cost: params.shippingCost
      ? { amount: params.shippingCost * 100 }
      : undefined,
  });

  return taxCalculation;
}

// Webhook処理
async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancel(event.data.object);
      break;
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
  }
}
```

### 5.3 PayPal統合

#### 概要
PayPalはPayments AIを通じてのみ利用可能。

#### 要件
- Payments AIが有効化されている必要がある
- PayPal V2 API使用

#### 実装要件

```typescript
// PayPal有効化
async function enablePayPal(paymentsAIAccountId: string) {
  await updatePaymentsAIConfig(paymentsAIAccountId, {
    paymentMethods: {
      paypal: true,
    },
  });
}

// PayPalボタンレンダリング（フロントエンド）
paypal.Buttons({
  createOrder: async () => {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        currency: 'USD',
        orderId: checkoutId,
      }),
    });
    const data = await response.json();
    return data.orderID;
  },
  onApprove: async (data) => {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderID: data.orderID,
      }),
    });
    const orderData = await response.json();
    // 注文完了処理
  },
}).render('#paypal-button-container');
```

### 5.4 セキュリティ要件

#### PCI DSS準拠
- カード情報は直接サーバーに送信しない
- Stripe ElementsやPayments AIのホストフィールド使用
- トークン化された決済方法IDのみ保存

#### データ暗号化
- 決済ゲートウェイAPIキーは暗号化して保存
- 環境変数で管理
- Key Management Service (KMS) 使用推奨

#### 不正検出
- Stripe Radarなどの不正検出ツール活用
- 異常な取引パターンの監視
- 3Dセキュア対応

#### Webhook検証
- Webhook署名の必須検証
- リプレイ攻撃防止（タイムスタンプチェック）
- HTTPSエンドポイントのみ

```typescript
// Webhook署名検証例
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
```

---

## 6. データベーススキーマ要件

### 6.1 主要テーブル

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('physical', 'digital', 'subscription', 'membership')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  INDEX idx_products_workspace (workspace_id),
  INDEX idx_products_status (status),
  INDEX idx_products_type (type)
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  "order" INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_product_images_product (product_id)
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE,
  options JSONB NOT NULL, -- [{name: "Size", value: "Large"}]
  price_override DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  inventory_quantity INTEGER DEFAULT 0,
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(10),
  image_id UUID REFERENCES product_images(id),
  status VARCHAR(50) DEFAULT 'active',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_variants_product (product_id),
  INDEX idx_variants_sku (sku)
);

-- Product Prices
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('one_time', 'subscription', 'payment_plan')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  compare_at_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  visible BOOLEAN DEFAULT true,

  -- Subscription fields
  subscription_interval VARCHAR(20),
  subscription_interval_count INTEGER,
  trial_period_days INTEGER,
  trial_price DECIMAL(10, 2),
  billing_cycle_limit INTEGER,

  -- Payment plan fields
  payment_plan_installments INTEGER,
  payment_plan_initial_payment DECIMAL(10, 2),
  payment_plan_recurring_payment DECIMAL(10, 2),
  payment_plan_interval INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_prices_product (product_id),
  INDEX idx_prices_variant (variant_id)
);

-- Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- for pending orders
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,

  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (product_id, variant_id, location_id),
  INDEX idx_inventory_product (product_id),
  INDEX idx_inventory_location (location_id)
);

-- Inventory Locations
CREATE TABLE inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_inventory_locations_workspace (workspace_id)
);

-- Inventory History
CREATE TABLE inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID REFERENCES inventory_locations(id),
  action VARCHAR(50) NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_inventory_history_product (product_id),
  INDEX idx_inventory_history_created (created_at)
);

-- Carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_carts_session (session_id),
  INDEX idx_carts_user (user_id),
  INDEX idx_carts_expires (expires_at)
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  price_id UUID NOT NULL REFERENCES product_prices(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  variant_options JSONB,
  custom_fields JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_cart_items_cart (cart_id),
  INDEX idx_cart_items_product (product_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  customer_email VARCHAR(255) NOT NULL,

  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',

  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  shipping_address JSONB,
  billing_address JSONB,

  payment_method VARCHAR(100),
  payment_gateway VARCHAR(50),
  transaction_id VARCHAR(255),

  discount_codes JSONB,
  notes TEXT,
  tags JSONB,

  is_test BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  INDEX idx_orders_workspace (workspace_id),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_order_number (order_number),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',

  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  product_id UUID NOT NULL REFERENCES products(id),
  price_id UUID NOT NULL REFERENCES product_prices(id),

  status VARCHAR(50) NOT NULL,

  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,

  billing_cycle_interval VARCHAR(20) NOT NULL,
  billing_cycle_interval_count INTEGER NOT NULL,

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  trial_start TIMESTAMP,
  trial_end TIMESTAMP,

  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  cancel_reason TEXT,

  paused_at TIMESTAMP,
  pause_until TIMESTAMP,
  pause_reason TEXT,

  payment_method_id VARCHAR(255) NOT NULL,
  payment_gateway VARCHAR(50) NOT NULL,

  next_billing_date TIMESTAMP,

  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_subscriptions_workspace (workspace_id),
  INDEX idx_subscriptions_customer (customer_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_next_billing (next_billing_date)
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  customer_email VARCHAR(255) NOT NULL,

  order_id UUID REFERENCES orders(id),
  subscription_id UUID REFERENCES subscriptions(id),

  status VARCHAR(50) NOT NULL,
  fulfillment_status VARCHAR(50),

  issue_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP,

  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  billing_address JSONB,
  shipping_address JSONB,

  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP,

  memo TEXT,
  footer TEXT,

  pdf_url TEXT,

  sent_at TIMESTAMP,
  sent_to JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  voided_at TIMESTAMP,

  INDEX idx_invoices_workspace (workspace_id),
  INDEX idx_invoices_customer (customer_id),
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_issue_date (issue_date)
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),

  INDEX idx_invoice_items_invoice (invoice_id)
);

-- Fulfillments
CREATE TABLE fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL,

  shipping_address JSONB NOT NULL,
  shipping_method VARCHAR(255),

  carrier VARCHAR(100),
  tracking_number VARCHAR(255),
  tracking_url TEXT,

  shipping_label_url TEXT,
  packing_slip_url TEXT,

  shipment_date TIMESTAMP,
  estimated_delivery_date TIMESTAMP,
  delivered_at TIMESTAMP,

  fulfillment_method VARCHAR(50) NOT NULL,
  external_fulfillment_id VARCHAR(255),

  notify_customer BOOLEAN DEFAULT true,
  notification_sent_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  fulfilled_at TIMESTAMP,

  INDEX idx_fulfillments_order (order_id),
  INDEX idx_fulfillments_status (status),
  INDEX idx_fulfillments_tracking (tracking_number)
);

-- Fulfillment Line Items
CREATE TABLE fulfillment_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id UUID NOT NULL REFERENCES fulfillments(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  sku VARCHAR(100),

  INDEX idx_fulfillment_items_fulfillment (fulfillment_id),
  INDEX idx_fulfillment_items_order_item (order_item_id)
);

-- Payment Gateways
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  config JSONB NOT NULL, -- encrypted sensitive data
  supported_payment_methods JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  connected_at TIMESTAMP,

  INDEX idx_payment_gateways_workspace (workspace_id),
  INDEX idx_payment_gateways_provider (provider)
);

-- Payment Transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  gateway_id UUID NOT NULL REFERENCES payment_gateways(id),
  gateway_transaction_id VARCHAR(255) NOT NULL,

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,

  payment_method VARCHAR(50) NOT NULL,
  payment_method_details JSONB,

  status VARCHAR(50) NOT NULL,

  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,

  INDEX idx_transactions_order (order_id),
  INDEX idx_transactions_gateway (gateway_id),
  INDEX idx_transactions_gateway_transaction (gateway_transaction_id),
  INDEX idx_transactions_status (status)
);

-- Payment Refunds
CREATE TABLE payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,

  INDEX idx_refunds_transaction (transaction_id)
);

-- Discounts
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  code VARCHAR(100) UNIQUE NOT NULL,

  type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,

  minimum_purchase_amount DECIMAL(10, 2),
  maximum_discount_amount DECIMAL(10, 2),

  applies_to VARCHAR(50) NOT NULL,
  product_ids JSONB,
  collection_ids JSONB,

  usage_limit INTEGER,
  usage_limit_per_customer INTEGER,
  one_use_per_customer BOOLEAN DEFAULT false,
  stackable BOOLEAN DEFAULT false,

  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,

  customer_eligibility VARCHAR(50) NOT NULL,
  customer_ids JSONB,
  customer_segment_ids JSONB,

  status VARCHAR(50) NOT NULL,

  times_used INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_discount_given DECIMAL(10, 2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  INDEX idx_discounts_workspace (workspace_id),
  INDEX idx_discounts_code (code),
  INDEX idx_discounts_status (status),
  INDEX idx_discounts_valid (valid_from, valid_until)
);

-- Discount Usage
CREATE TABLE discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),

  discount_code VARCHAR(100) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,

  used_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_discount_usage_discount (discount_id),
  INDEX idx_discount_usage_order (order_id),
  INDEX idx_discount_usage_customer (customer_id)
);

-- Tax Settings
CREATE TABLE tax_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  method VARCHAR(50) NOT NULL,

  automatic_tax_enabled BOOLEAN DEFAULT false,
  business_location JSONB,
  tax_id VARCHAR(100),
  taxjar_enabled BOOLEAN DEFAULT false,
  taxjar_api_key TEXT, -- encrypted

  stripe_tax_enabled BOOLEAN DEFAULT false,
  stripe_tax_behavior VARCHAR(20),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (workspace_id)
);

-- Tax Zones (Manual)
CREATE TABLE tax_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  countries JSONB NOT NULL,
  regions JSONB,
  rate DECIMAL(5, 2) NOT NULL,
  tax_name VARCHAR(100) NOT NULL,
  compound BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_tax_zones_workspace (workspace_id)
);
```

---

## 7. フロントエンド要件

### 7.1 技術スタック
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI or shadcn/ui
- **状態管理**: Zustand or React Context
- **フォーム**: React Hook Form + Zod
- **決済UI**: Stripe Elements, PayPal SDK

### 7.2 レスポンシブデザイン
- モバイルファースト
- ブレークポイント: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- タッチ操作対応

### 7.3 アクセシビリティ
- WCAG 2.1 AA準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応
- ARIA属性適切に使用

### 7.4 パフォーマンス
- Core Web Vitals最適化
- 画像最適化（Next.js Image）
- コード分割
- レイジーローディング

---

## 8. 参考資料

本ドキュメントは以下のClickFunnels公式ドキュメントとWeb検索結果を基に作成されました:

1. [How to Create and Manage Products - ClickFunnels](https://support.myclickfunnels.com/docs/how-to-create-and-manage-products)
2. [Product Settings Overview - ClickFunnels](https://support.myclickfunnels.com/docs/products-product-settings-overview)
3. [Add to Cart | ClickFunnels](https://www.clickfunnels.com/features/add-to-cart)
4. [Is Shopping Cart Available on ClickFunnels 2.0?](https://supplygem.com/clickfunnels-shopping-cart/)
5. [Managing Order Fulfillment in ClickFunnels](https://support.myclickfunnels.com/docs/managing-order-fulfillment-in-clickfunnels)
6. [How to Create and Manage Orders - ClickFunnels](https://support.myclickfunnels.com/docs/orders-how-to-manage-orders)
7. [Invoices Overview - ClickFunnels](https://support.myclickfunnels.com/docs/invoices-invoices-overview)
8. [Payment Gateway Integrations - ClickFunnels](https://support.clickfunnels.com/support/solutions/articles/150000153069-payment-gateway-integrations)
9. [Setting Up Tax Collection (Sales Tax, VAT, or GST) in ClickFunnels Products](https://support.myclickfunnels.com/docs/setting-up-tax-collection-sales-tax-vat-or-gst-in-clickfunnels-products-1)
10. [What is Payments.AI & How Does it Work With ClickFunnels?](https://www.clickfunnels.com/blog/payments-ai-and-clickfunnels/)
11. [ClickFunnels Payment Gateways – Payments AI & More (2025)](https://supplygem.com/clickfunnels-payment-gateways/)

---

## 9. まとめ

本要件定義書は、ClickFunnelsの商品・コマース機能を完全に再現するための包括的なガイドです。実装時には以下の優先順位で進めることを推奨します:

### Phase 1: 基礎（MVP）
1. 商品管理（作成、編集、削除）
2. 基本的な価格設定（ワンタイム決済）
3. ショッピングカート
4. チェックアウト（Stripe統合）
5. 注文管理（基本）

### Phase 2: 拡張機能
6. 商品バリアント
7. サブスクリプション
8. 在庫管理
9. 税金計算（自動）
10. 割引・クーポン

### Phase 3: 高度な機能
11. 履行管理（手動）
12. 請求書管理
13. Payments AI統合
14. サードパーティ連携（ShipStation、Zendrop）
15. 高度な分析・レポート

各機能の実装は本ドキュメントのデータモデル、API仕様、UI要素を参考に進めてください。
