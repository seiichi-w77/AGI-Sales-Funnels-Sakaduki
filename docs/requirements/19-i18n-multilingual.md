# 多言語対応（i18n）機能要件定義書

## 1. 概要

### 1.1 目的
AGI Sales Funnels Sakadukiアプリケーションにおいて、日本語と英語の2言語をサポートし、ユーザーがシームレスに言語を切り替えられる機能を提供する。

### 1.2 対象範囲
- 管理画面（ダッシュボード、設定画面等）
- ファネルビルダー
- ページエディター
- メール/LINE配信画面
- 会員サイト
- カスタマーセンター
- エラーメッセージ
- 通知メッセージ
- メールテンプレート
- システムメール

### 1.3 対応言語
| コード | 言語 | デフォルト |
|--------|------|-----------|
| ja | 日本語 | ○ |
| en | 英語 | - |

---

## 2. 機能要件

### 2.1 言語切り替えスイッチ

#### 2.1.1 UI仕様

```typescript
interface LanguageSwitcher {
  // 現在の言語
  currentLanguage: 'ja' | 'en';

  // 利用可能な言語
  availableLanguages: Language[];

  // 言語切り替え関数
  switchLanguage: (lang: 'ja' | 'en') => void;
}

interface Language {
  code: 'ja' | 'en';
  name: string;           // 言語名（その言語での表記）
  nativeName: string;     // 日本語, English
  flag?: string;          // 国旗アイコン（オプション）
}
```

#### 2.1.2 スイッチの配置場所
- **ヘッダー右上**: グローバルナビゲーション内
- **ログイン画面**: ログインフォーム下部
- **ユーザー設定画面**: 言語設定セクション

#### 2.1.3 スイッチのデザインパターン

**パターン1: トグルスイッチ**
```
[日本語] ◉ ○ [English]
```

**パターン2: ドロップダウン**
```
🌐 日本語 ▼
  ├── 日本語 ✓
  └── English
```

**パターン3: セグメントコントロール**
```
┌─────────┬─────────┐
│ 日本語  │ English │
└─────────┴─────────┘
```

**推奨**: パターン2（ドロップダウン）- 将来の言語追加に対応しやすい

### 2.2 言語切り替え動作

#### 2.2.1 即座に切り替え
- 言語選択後、ページリロードなしで全UIを切り替え
- React/Next.jsの場合、i18n Contextを使用

#### 2.2.2 切り替え対象
| カテゴリ | 対象 | 即時反映 |
|---------|------|---------|
| UI要素 | ボタン、ラベル、メニュー | ○ |
| メッセージ | エラー、成功、確認 | ○ |
| プレースホルダー | 入力欄のヒントテキスト | ○ |
| 日付/時刻 | フォーマット（例: 2025/12/09 → Dec 9, 2025） | ○ |
| 数値 | フォーマット（例: 1,000 → 1,000） | ○ |
| 通貨 | 表示形式（¥1,000 / $10.00） | ○ |

#### 2.2.3 切り替え対象外（ユーザーコンテンツ）
- ユーザーが作成したファネル名
- ユーザーが作成したページコンテンツ
- ユーザーが入力したメール本文
- 商品名・商品説明

### 2.3 言語設定の保存

#### 2.3.1 保存場所
```typescript
interface UserPreferences {
  // ユーザー設定の言語
  language: 'ja' | 'en';

  // タイムゾーン
  timezone: string;

  // 日付フォーマット
  dateFormat: 'YYYY/MM/DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
}
```

#### 2.3.2 保存の優先順位
1. **ユーザー設定**: ログイン後のユーザープロファイル設定
2. **ブラウザ localStorage**: 非ログイン時の一時保存
3. **ブラウザ言語設定**: 初回アクセス時のデフォルト
4. **システムデフォルト**: 日本語（ja）

#### 2.3.3 保存タイミング
- 言語切り替え時に即座に保存
- ログアウト後も localStorage に保持

---

## 3. データモデル

### 3.1 翻訳リソース構造

```typescript
// 翻訳キーの型定義
interface TranslationKeys {
  common: CommonTranslations;
  auth: AuthTranslations;
  dashboard: DashboardTranslations;
  funnel: FunnelTranslations;
  email: EmailTranslations;
  line: LineTranslations;
  products: ProductTranslations;
  contacts: ContactTranslations;
  settings: SettingsTranslations;
  errors: ErrorTranslations;
  validation: ValidationTranslations;
}

// 共通翻訳
interface CommonTranslations {
  save: string;           // 保存 / Save
  cancel: string;         // キャンセル / Cancel
  delete: string;         // 削除 / Delete
  edit: string;           // 編集 / Edit
  create: string;         // 作成 / Create
  search: string;         // 検索 / Search
  filter: string;         // フィルター / Filter
  loading: string;        // 読み込み中... / Loading...
  confirm: string;        // 確認 / Confirm
  back: string;           // 戻る / Back
  next: string;           // 次へ / Next
  submit: string;         // 送信 / Submit
  close: string;          // 閉じる / Close
  yes: string;            // はい / Yes
  no: string;             // いいえ / No
  actions: string;        // アクション / Actions
  status: string;         // ステータス / Status
  name: string;           // 名前 / Name
  description: string;    // 説明 / Description
  date: string;           // 日付 / Date
  time: string;           // 時刻 / Time
}

// 認証関連
interface AuthTranslations {
  login: string;          // ログイン / Login
  logout: string;         // ログアウト / Logout
  register: string;       // 登録 / Register
  email: string;          // メールアドレス / Email
  password: string;       // パスワード / Password
  forgotPassword: string; // パスワードを忘れた / Forgot Password
  resetPassword: string;  // パスワードリセット / Reset Password
  rememberMe: string;     // ログイン状態を保持 / Remember Me
}

// ダッシュボード
interface DashboardTranslations {
  title: string;          // ダッシュボード / Dashboard
  overview: string;       // 概要 / Overview
  recentActivity: string; // 最近のアクティビティ / Recent Activity
  quickActions: string;   // クイックアクション / Quick Actions
  statistics: string;     // 統計 / Statistics
}

// ファネル関連
interface FunnelTranslations {
  title: string;          // ファネル / Funnels
  createFunnel: string;   // ファネル作成 / Create Funnel
  editFunnel: string;     // ファネル編集 / Edit Funnel
  funnelName: string;     // ファネル名 / Funnel Name
  funnelType: string;     // ファネルタイプ / Funnel Type
  funnelSteps: string;    // ファネルステップ / Funnel Steps
  addStep: string;        // ステップ追加 / Add Step
  publish: string;        // 公開 / Publish
  unpublish: string;      // 非公開 / Unpublish
  preview: string;        // プレビュー / Preview
  duplicate: string;      // 複製 / Duplicate
  share: string;          // 共有 / Share
  analytics: string;      // 分析 / Analytics
}

// メール関連
interface EmailTranslations {
  broadcasts: string;     // 一斉配信 / Broadcasts
  createBroadcast: string; // 一斉配信作成 / Create Broadcast
  subject: string;        // 件名 / Subject
  body: string;           // 本文 / Body
  recipients: string;     // 受信者 / Recipients
  sendNow: string;        // 今すぐ送信 / Send Now
  schedule: string;       // スケジュール / Schedule
  draft: string;          // 下書き / Draft
  sent: string;           // 送信済み / Sent
  opened: string;         // 開封済み / Opened
  clicked: string;        // クリック済み / Clicked
}

// LINE関連
interface LineTranslations {
  friends: string;        // 友だち / Friends
  chat: string;           // チャット / Chat
  broadcast: string;      // 一斉送信 / Broadcast
  richMenu: string;       // リッチメニュー / Rich Menu
  autoResponse: string;   // 自動応答 / Auto Response
  messageTypes: {
    text: string;         // テキスト / Text
    image: string;        // 画像 / Image
    video: string;        // 動画 / Video
    audio: string;        // 音声 / Audio
    sticker: string;      // スタンプ / Sticker
    button: string;       // ボタン / Button
    carousel: string;     // カルーセル / Carousel
  };
}

// エラーメッセージ
interface ErrorTranslations {
  generic: string;        // エラーが発生しました / An error occurred
  notFound: string;       // ページが見つかりません / Page not found
  unauthorized: string;   // 認証が必要です / Authentication required
  forbidden: string;      // アクセス権限がありません / Access denied
  serverError: string;    // サーバーエラー / Server error
  networkError: string;   // ネットワークエラー / Network error
  validationError: string; // 入力内容に誤りがあります / Validation error
}

// バリデーションメッセージ
interface ValidationTranslations {
  required: string;       // この項目は必須です / This field is required
  email: string;          // 有効なメールアドレスを入力してください / Please enter a valid email
  minLength: string;      // {min}文字以上で入力してください / Must be at least {min} characters
  maxLength: string;      // {max}文字以下で入力してください / Must be at most {max} characters
  passwordMatch: string;  // パスワードが一致しません / Passwords do not match
  invalidUrl: string;     // 有効なURLを入力してください / Please enter a valid URL
}
```

### 3.2 翻訳ファイル構造

```
/locales
├── ja/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── funnel.json
│   ├── email.json
│   ├── line.json
│   ├── products.json
│   ├── contacts.json
│   ├── settings.json
│   └── errors.json
└── en/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── funnel.json
    ├── email.json
    ├── line.json
    ├── products.json
    ├── contacts.json
    ├── settings.json
    └── errors.json
```

### 3.3 翻訳ファイル例

**ja/common.json**
```json
{
  "save": "保存",
  "cancel": "キャンセル",
  "delete": "削除",
  "edit": "編集",
  "create": "作成",
  "search": "検索",
  "filter": "フィルター",
  "loading": "読み込み中...",
  "confirm": "確認",
  "back": "戻る",
  "next": "次へ",
  "submit": "送信",
  "close": "閉じる",
  "yes": "はい",
  "no": "いいえ"
}
```

**en/common.json**
```json
{
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "search": "Search",
  "filter": "Filter",
  "loading": "Loading...",
  "confirm": "Confirm",
  "back": "Back",
  "next": "Next",
  "submit": "Submit",
  "close": "Close",
  "yes": "Yes",
  "no": "No"
}
```

---

## 4. 技術実装

### 4.1 推奨ライブラリ

| ライブラリ | 用途 | 推奨度 |
|-----------|------|--------|
| next-intl | Next.js App Router対応 | ★★★ |
| react-i18next | React汎用 | ★★★ |
| next-i18next | Next.js Pages Router対応 | ★★ |
| formatjs | ICU MessageFormat対応 | ★★ |

### 4.2 Next.js + next-intl 実装例

#### 4.2.1 設定ファイル

**next.config.js**
```javascript
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // Next.js設定
});
```

**i18n.ts**
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./locales/${locale}/index.json`)).default
}));
```

#### 4.2.2 Provider設定

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### 4.2.3 翻訳の使用

```typescript
// コンポーネント内での使用
import { useTranslations } from 'next-intl';

function SaveButton() {
  const t = useTranslations('common');

  return (
    <button>{t('save')}</button>
  );
}
```

#### 4.2.4 言語切り替えコンポーネント

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface Language {
  code: 'ja' | 'en';
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // 現在のパスから言語コードを置換
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);

    // localStorageに保存
    localStorage.setItem('preferred-language', newLocale);
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-transparent border rounded px-3 py-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### 4.3 日付・数値のローカライズ

```typescript
import { useFormatter } from 'next-intl';

function FormattedContent() {
  const format = useFormatter();

  // 日付フォーマット
  const formattedDate = format.dateTime(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // ja: 2025年12月9日
  // en: December 9, 2025

  // 数値フォーマット
  const formattedNumber = format.number(1234567.89, {
    style: 'currency',
    currency: 'JPY' // または 'USD'
  });
  // ja: ¥1,234,568
  // en: ¥1,234,568 (JPY) or $1,234,567.89 (USD)

  // 相対時間
  const relativeTime = format.relativeTime(
    new Date('2025-12-01'),
    new Date('2025-12-09')
  );
  // ja: 8日前
  // en: 8 days ago

  return (
    <div>
      <p>{formattedDate}</p>
      <p>{formattedNumber}</p>
      <p>{relativeTime}</p>
    </div>
  );
}
```

---

## 5. UI/UX要件

### 5.1 言語切り替えスイッチのデザイン

```tsx
// ヘッダーナビゲーション内のスイッチ
<header className="flex items-center justify-between px-6 py-4">
  <Logo />
  <nav className="flex items-center gap-4">
    <NavLinks />
    <LanguageSwitcher />
    <UserMenu />
  </nav>
</header>
```

### 5.2 レスポンシブ対応

| デバイス | 表示形式 |
|---------|---------|
| デスクトップ | ドロップダウン（フル表示） |
| タブレット | ドロップダウン（アイコン+テキスト） |
| モバイル | ドロップダウン（アイコンのみ） |

### 5.3 アクセシビリティ

```tsx
<select
  aria-label="言語を選択 / Select language"
  role="listbox"
>
  <option role="option" aria-selected={locale === 'ja'}>
    日本語
  </option>
  <option role="option" aria-selected={locale === 'en'}>
    English
  </option>
</select>
```

---

## 6. API要件

### 6.1 ユーザー言語設定API

```typescript
// ユーザー言語設定の更新
// PATCH /api/users/me/preferences
interface UpdateLanguageRequest {
  language: 'ja' | 'en';
}

interface UpdateLanguageResponse {
  success: boolean;
  user: {
    id: string;
    preferences: {
      language: 'ja' | 'en';
    };
  };
}
```

### 6.2 翻訳リソース取得API（オプション）

```typescript
// 翻訳リソースの動的取得（管理画面カスタマイズ用）
// GET /api/i18n/translations/:locale/:namespace

interface TranslationsResponse {
  locale: string;
  namespace: string;
  translations: Record<string, string>;
  lastUpdated: string;
}
```

---

## 7. データベーススキーマ

```sql
-- ユーザー言語設定
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(2) DEFAULT 'ja';

-- 言語設定のバリデーション
ALTER TABLE users ADD CONSTRAINT check_language
  CHECK (preferred_language IN ('ja', 'en'));

-- インデックス
CREATE INDEX idx_users_language ON users(preferred_language);
```

---

## 8. テスト要件

### 8.1 ユニットテスト

```typescript
describe('LanguageSwitcher', () => {
  it('should display current language', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('should switch language when clicked', async () => {
    render(<LanguageSwitcher />);
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'en'
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/en/dashboard');
  });

  it('should save language preference to localStorage', async () => {
    render(<LanguageSwitcher />);
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'en'
    );
    expect(localStorage.getItem('preferred-language')).toBe('en');
  });
});
```

### 8.2 E2Eテスト

```typescript
describe('Multi-language Support', () => {
  it('should display all UI elements in Japanese', () => {
    cy.visit('/ja/dashboard');
    cy.contains('ダッシュボード').should('be.visible');
    cy.contains('保存').should('be.visible');
    cy.contains('キャンセル').should('be.visible');
  });

  it('should display all UI elements in English', () => {
    cy.visit('/en/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Save').should('be.visible');
    cy.contains('Cancel').should('be.visible');
  });

  it('should switch language and persist preference', () => {
    cy.visit('/ja/dashboard');
    cy.get('[data-testid="language-switcher"]').select('en');
    cy.url().should('include', '/en/');
    cy.reload();
    cy.url().should('include', '/en/');
  });
});
```

---

## 9. 実装優先順位

### Phase 1: 基盤構築
1. i18nライブラリ導入（next-intl）
2. 翻訳ファイル構造の設計
3. 言語切り替えスイッチの実装
4. 言語設定の保存機能

### Phase 2: 共通コンポーネント
1. 共通UIの翻訳（ボタン、メニュー等）
2. エラーメッセージの翻訳
3. バリデーションメッセージの翻訳
4. 日付・数値フォーマットの対応

### Phase 3: 機能別翻訳
1. ダッシュボード
2. ファネルビルダー
3. メール/LINE配信
4. 商品管理
5. コンタクト管理
6. 設定画面

### Phase 4: 拡張機能
1. 会員サイトの多言語対応
2. システムメールの多言語対応
3. 動的コンテンツの翻訳管理

---

## 10. 参考資料

- [next-intl公式ドキュメント](https://next-intl-docs.vercel.app/)
- [React i18next公式ドキュメント](https://react.i18next.com/)
- [ICU MessageFormat](https://formatjs.io/docs/core-concepts/icu-syntax/)

---

## 11. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025-12-09 | 1.0 | 初版作成 |

---

**注意**: 本ドキュメントは日本語と英語の2言語対応を前提としています。将来的に他の言語を追加する場合は、言語コードと翻訳ファイルの追加のみで対応可能な設計となっています。
