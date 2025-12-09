# アカウント・ワークスペース管理機能 要件定義書

## 1. 概要

本ドキュメントは、ClickFunnelsクローンアプリケーション「Sakaduki」のアカウント管理およびワークスペース管理機能の詳細要件を定義します。

### 1.1 目的
- ユーザーアカウントの作成、管理、認証機能の提供
- マルチワークスペース環境でのチーム協業機能の実現
- セキュアなアクセス制御と監査ログ機能の実装

### 1.2 対象範囲
- アカウント管理（プロファイル、パスワード、2FA）
- サブスクリプション管理
- ワークスペース管理
- チーム・コラボレーター管理
- 監査ログ

---

## 2. 機能一覧

### 2.1 アカウント管理機能
1. **プロファイルカスタマイズ**
2. **アカウント詳細・パスワード管理**
3. **二要素認証(2FA)**
4. **ログイン・認証**
5. **アカウント一時停止**

### 2.2 サブスクリプション管理機能
6. **サブスクリプションプラン管理**
7. **請求・インボイス管理**

### 2.3 ワークスペース管理機能
8. **ワークスペース切り替え**
9. **ワークスペース一般設定**
10. **ワークスペースコラボレーター管理**

### 2.4 チーム管理機能
11. **チームメンバー・サブユーザー管理**
12. **チームダッシュボード**

### 2.5 監査・セキュリティ機能
13. **監査ログ・アクティビティ追跡**

---

## 3. 各機能の詳細要件

### 3.1 プロファイルカスタマイズ

#### 3.1.1 機能名
ユーザープロファイル編集・カスタマイズ機能

#### 3.1.2 説明
ユーザーが自身のプロファイル情報（名前、メールアドレス、プロファイル画像、タイムゾーン等）を編集・管理できる機能。

#### 3.1.3 UI要素
- **プロファイル編集フォーム**
  - 姓 (First Name) - テキスト入力フィールド
  - 名 (Last Name) - テキスト入力フィールド
  - メールアドレス (Email) - メール入力フィールド
  - プロファイル画像 - 画像アップロード/削除ボタン
  - タイムゾーン (Timezone) - ドロップダウンセレクト
  - 言語設定 (Language) - ドロップダウンセレクト
  - 電話番号 (Phone Number) - テキスト入力フィールド（任意）
- **アクションボタン**
  - 保存 (Save) ボタン
  - キャンセル (Cancel) ボタン
  - 画像削除 (Remove Image) ボタン
- **プレビュー表示**
  - 現在のプロファイル画像プレビュー
  - ユーザー名表示

#### 3.1.4 ユーザーアクション
1. プロファイルページへのアクセス
2. 各フィールドの編集
3. プロファイル画像のアップロード（ドラッグ&ドロップ/ファイル選択）
4. プロファイル画像の削除
5. タイムゾーンの選択
6. 言語の選択
7. 変更の保存
8. 変更のキャンセル

#### 3.1.5 データモデル

```typescript
interface UserProfile {
  id: string;                    // ユーザーID（UUID）
  firstName: string;             // 姓
  lastName: string;              // 名
  email: string;                 // メールアドレス（一意）
  profileImageUrl?: string;      // プロファイル画像URL
  timezone: string;              // タイムゾーン（例: "Asia/Tokyo"）
  language: string;              // 言語コード（例: "ja", "en"）
  phoneNumber?: string;          // 電話番号（任意）
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}
```

#### 3.1.6 バリデーションルール
- **firstName**: 必須、1-50文字
- **lastName**: 必須、1-50文字
- **email**: 必須、有効なメール形式、一意性チェック
- **profileImageUrl**: 任意、画像ファイル形式（jpg, png, gif）、最大5MB
- **timezone**: 必須、有効なタイムゾーン値
- **language**: 必須、サポート対象言語コード
- **phoneNumber**: 任意、有効な電話番号形式

#### 3.1.7 API要件
- `GET /api/v1/users/me/profile` - プロファイル取得
- `PUT /api/v1/users/me/profile` - プロファイル更新
- `POST /api/v1/users/me/profile/image` - プロファイル画像アップロード
- `DELETE /api/v1/users/me/profile/image` - プロファイル画像削除

---

### 3.2 アカウント詳細・パスワード管理

#### 3.2.1 機能名
アカウント詳細表示・パスワード変更・リセット機能

#### 3.2.2 説明
ユーザーがアカウント情報を確認し、パスワードを変更・リセットできる機能。セキュリティ強化のため、現在のパスワード検証を必須とする。

#### 3.2.3 UI要素
- **アカウント詳細表示セクション**
  - アカウントID表示（読み取り専用）
  - メールアドレス表示（読み取り専用）
  - アカウント作成日表示（読み取り専用）
  - 最終ログイン日時表示（読み取り専用）
  - アカウントステータス表示（Active/Paused/Suspended）

- **パスワード変更フォーム**
  - 現在のパスワード (Current Password) - パスワード入力フィールド
  - 新しいパスワード (New Password) - パスワード入力フィールド
  - パスワード確認 (Confirm Password) - パスワード入力フィールド
  - パスワード強度インジケーター
  - パスワード要件表示（最小文字数、記号含む等）

- **アクションボタン**
  - パスワード変更 (Change Password) ボタン
  - パスワードリセットメール送信 (Send Reset Email) リンク
  - キャンセル (Cancel) ボタン

- **通知・メッセージ**
  - 成功メッセージ（パスワード変更成功時）
  - エラーメッセージ（検証失敗時）
  - 確認メッセージ（変更前の確認）

#### 3.2.4 ユーザーアクション
1. アカウント詳細ページへのアクセス
2. 現在のパスワード入力
3. 新しいパスワード入力
4. パスワード確認入力
5. パスワード変更の実行
6. パスワードリセットメールの要求
7. パスワードリセットリンクからの新パスワード設定

#### 3.2.5 データモデル

```typescript
interface AccountDetails {
  id: string;                    // アカウントID
  email: string;                 // メールアドレス
  status: AccountStatus;         // アカウントステータス
  createdAt: DateTime;           // 作成日時
  lastLoginAt?: DateTime;        // 最終ログイン日時
  passwordChangedAt: DateTime;   // パスワード最終変更日時
  isEmailVerified: boolean;      // メール認証済みフラグ
  is2FAEnabled: boolean;         // 2FA有効フラグ
}

enum AccountStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

interface PasswordChangeRequest {
  currentPassword: string;       // 現在のパスワード
  newPassword: string;           // 新しいパスワード
  confirmPassword: string;       // パスワード確認
}

interface PasswordResetToken {
  id: string;                    // トークンID
  userId: string;                // ユーザーID
  token: string;                 // リセットトークン（ハッシュ化）
  expiresAt: DateTime;           // 有効期限
  usedAt?: DateTime;             // 使用日時
  createdAt: DateTime;           // 作成日時
}
```

#### 3.2.6 バリデーションルール
- **currentPassword**: 必須、正しい現在のパスワード
- **newPassword**:
  - 必須
  - 最小8文字
  - 大文字・小文字・数字・記号を各1文字以上含む
  - 現在のパスワードと異なる
  - 過去3回のパスワードと異なる
- **confirmPassword**: 必須、newPasswordと一致
- **resetToken**: 有効期限内（24時間）、未使用

#### 3.2.7 API要件
- `GET /api/v1/users/me/account` - アカウント詳細取得
- `POST /api/v1/users/me/password/change` - パスワード変更
- `POST /api/v1/users/password/reset-request` - パスワードリセット要求
- `POST /api/v1/users/password/reset` - パスワードリセット実行
- `GET /api/v1/users/password/validate-token` - リセットトークン検証

---

### 3.3 二要素認証（2FA）

#### 3.3.1 機能名
二要素認証（Two-Factor Authentication）設定・管理機能

#### 3.3.2 説明
アカウントのセキュリティを強化するため、TOTP（Time-based One-Time Password）方式の二要素認証を有効化・無効化できる機能。

#### 3.3.3 UI要素
- **2FAステータス表示**
  - 現在の2FA状態（有効/無効）
  - 有効化日時表示
  - ステータスバッジ（Enabled/Disabled）

- **2FA有効化フロー**
  - QRコード表示エリア
  - セットアップキー表示（手動入力用）
  - 認証アプリダウンロードリンク（Google Authenticator, Authy等）
  - 検証コード入力フィールド（6桁）
  - バックアップコード表示エリア（10個のコード）
  - バックアップコードダウンロードボタン
  - バックアップコードコピーボタン

- **2FA無効化フロー**
  - 確認メッセージ表示
  - 現在のパスワード入力フィールド
  - 2FAコード入力フィールド

- **アクションボタン**
  - 2FAを有効化 (Enable 2FA) ボタン
  - 2FAを無効化 (Disable 2FA) ボタン
  - QRコード再生成 (Regenerate) ボタン
  - バックアップコード再生成 (Regenerate Backup Codes) ボタン
  - キャンセル (Cancel) ボタン

#### 3.3.4 ユーザーアクション
1. 2FA設定ページへのアクセス
2. 2FA有効化の開始
3. QRコードのスキャン（または手動キー入力）
4. 認証アプリでのアカウント登録
5. 検証コードの入力
6. バックアップコードの保存
7. 2FAの有効化完了
8. 2FA無効化の要求
9. パスワードと2FAコードでの無効化確認
10. バックアップコードの再生成

#### 3.3.5 データモデル

```typescript
interface TwoFactorAuth {
  id: string;                    // 2FA設定ID
  userId: string;                // ユーザーID
  secret: string;                // TOTP秘密鍵（暗号化保存）
  isEnabled: boolean;            // 有効フラグ
  enabledAt?: DateTime;          // 有効化日時
  backupCodes: string[];         // バックアップコード（ハッシュ化）
  backupCodesGeneratedAt: DateTime; // バックアップコード生成日時
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

interface TwoFactorSetup {
  secret: string;                // TOTP秘密鍵
  qrCodeDataUrl: string;         // QRコードデータURL
  manualEntryKey: string;        // 手動入力用キー
  backupCodes: string[];         // バックアップコード（平文、初回のみ）
}

interface TwoFactorVerification {
  code: string;                  // 6桁の検証コード
  isBackupCode?: boolean;        // バックアップコード使用フラグ
}
```

#### 3.3.6 バリデーションルール
- **code**: 必須、6桁の数字、有効な時間窓内（±30秒）
- **backupCode**: 10文字の英数字、未使用のコード
- **password**: 2FA無効化時に必須、正しい現在のパスワード
- **secret**: 32文字のBase32エンコード文字列

#### 3.3.7 API要件
- `GET /api/v1/users/me/2fa/status` - 2FA状態取得
- `POST /api/v1/users/me/2fa/setup` - 2FAセットアップ開始（QRコード生成）
- `POST /api/v1/users/me/2fa/verify` - 2FA検証・有効化
- `POST /api/v1/users/me/2fa/disable` - 2FA無効化
- `POST /api/v1/users/me/2fa/backup-codes/regenerate` - バックアップコード再生成
- `POST /api/v1/auth/verify-2fa` - ログイン時の2FA検証

#### 3.3.8 セキュリティ要件
- TOTP秘密鍵は暗号化して保存
- バックアップコードはハッシュ化して保存
- QRコードは一時的にのみ表示、再表示不可
- バックアップコードは一度のみ表示、使用後は無効化
- 2FA無効化には現在のパスワードと2FAコードの両方が必要
- レート制限: 2FA検証失敗は5回まで、その後アカウントロック（15分間）

---

### 3.4 ログイン・認証

#### 3.4.1 機能名
ユーザー認証・ログイン機能

#### 3.4.2 説明
メールアドレスとパスワードによる基本認証、2FA対応、セッション管理、ログイン履歴追跡を含む包括的な認証システム。

#### 3.4.3 UI要素
- **ログインフォーム**
  - メールアドレス (Email) 入力フィールド
  - パスワード (Password) 入力フィールド
  - パスワード表示/非表示トグル
  - ログイン状態を保持 (Remember Me) チェックボックス
  - ログイン (Login) ボタン
  - パスワードを忘れた (Forgot Password) リンク
  - アカウント作成 (Sign Up) リンク

- **2FAログインフォーム**（2FA有効時）
  - 6桁コード入力フィールド
  - バックアップコードを使用 (Use Backup Code) リンク
  - 認証 (Verify) ボタン
  - 戻る (Back) ボタン

- **エラー・通知メッセージ**
  - ログイン失敗メッセージ
  - アカウントロックメッセージ
  - 2FA要求メッセージ
  - セッション期限切れメッセージ

- **ログアウト**
  - ログアウトボタン（ヘッダー/メニュー内）
  - 全デバイスからログアウトオプション

#### 3.4.4 ユーザーアクション
1. ログインページへのアクセス
2. メールアドレスの入力
3. パスワードの入力
4. Remember Meのチェック（任意）
5. ログインボタンのクリック
6. 2FAコードの入力（2FA有効時）
7. ダッシュボードへのリダイレクト
8. ログアウト操作
9. パスワードリセット要求

#### 3.4.5 データモデル

```typescript
interface LoginRequest {
  email: string;                 // メールアドレス
  password: string;              // パスワード
  rememberMe: boolean;           // ログイン状態保持フラグ
}

interface LoginResponse {
  accessToken: string;           // アクセストークン（JWT）
  refreshToken: string;          // リフレッシュトークン
  expiresIn: number;             // トークン有効期限（秒）
  requires2FA: boolean;          // 2FA要求フラグ
  sessionId: string;             // セッションID
}

interface Session {
  id: string;                    // セッションID
  userId: string;                // ユーザーID
  accessToken: string;           // アクセストークン（ハッシュ化）
  refreshToken: string;          // リフレッシュトークン（ハッシュ化）
  ipAddress: string;             // IPアドレス
  userAgent: string;             // ユーザーエージェント
  deviceInfo?: string;           // デバイス情報
  isActive: boolean;             // アクティブフラグ
  expiresAt: DateTime;           // 有効期限
  lastActivityAt: DateTime;      // 最終アクティビティ日時
  createdAt: DateTime;           // 作成日時
}

interface LoginAttempt {
  id: string;                    // ログイン試行ID
  email: string;                 // メールアドレス
  ipAddress: string;             // IPアドレス
  userAgent: string;             // ユーザーエージェント
  isSuccessful: boolean;         // 成功フラグ
  failureReason?: string;        // 失敗理由
  attemptedAt: DateTime;         // 試行日時
}

interface AccountLock {
  id: string;                    // ロックID
  userId: string;                // ユーザーID
  reason: LockReason;            // ロック理由
  lockedAt: DateTime;            // ロック日時
  unlocksAt: DateTime;           // ロック解除日時
  isActive: boolean;             // アクティブフラグ
}

enum LockReason {
  TOO_MANY_FAILED_LOGINS = 'too_many_failed_logins',
  TOO_MANY_2FA_FAILURES = 'too_many_2fa_failures',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_LOCK = 'admin_lock'
}
```

#### 3.4.6 バリデーションルール
- **email**: 必須、有効なメール形式
- **password**: 必須、1-1000文字
- **2FAコード**: 6桁の数字、有効な時間窓内
- **セッション**:
  - アクセストークン有効期限: 1時間
  - リフレッシュトークン有効期限: 30日（Remember Me時）/ 24時間（通常）
- **ログイン試行制限**:
  - 5回失敗でアカウントロック（15分間）
  - IPアドレスごとに10回/分まで

#### 3.4.7 API要件
- `POST /api/v1/auth/login` - ログイン
- `POST /api/v1/auth/login/verify-2fa` - 2FA検証
- `POST /api/v1/auth/logout` - ログアウト
- `POST /api/v1/auth/logout-all` - 全セッションログアウト
- `POST /api/v1/auth/refresh` - トークンリフレッシュ
- `GET /api/v1/auth/sessions` - アクティブセッション一覧取得
- `DELETE /api/v1/auth/sessions/:sessionId` - 特定セッション削除
- `GET /api/v1/auth/login-history` - ログイン履歴取得

#### 3.4.8 セキュリティ要件
- パスワードはbcryptでハッシュ化（コスト係数12以上）
- JWTトークンにはRS256アルゴリズムを使用
- リフレッシュトークンはローテーション方式を採用
- CSRF対策としてトークンを実装
- レート制限とブルートフォース攻撃対策
- セッション固定攻撃対策
- XSS対策（HTTPOnly Cookie使用）
- ログイン履歴の記録と異常検知

---

### 3.5 アカウント一時停止

#### 3.5.1 機能名
アカウント一時停止・再開機能

#### 3.5.2 説明
ユーザーが自身のアカウントを一時的に停止し、後で再開できる機能。停止中は課金が停止され、データは保持される。

#### 3.5.3 UI要素
- **アカウント停止セクション**
  - 停止機能の説明テキスト
  - 停止時の影響説明（課金停止、アクセス不可等）
  - データ保持期間の表示
  - 確認チェックボックス（「理解しました」等）
  - アカウントを停止 (Pause Account) ボタン

- **確認ダイアログ**
  - 警告メッ�ッセージ
  - パスワード入力フィールド
  - 停止理由選択（ドロップダウン/ラジオボタン）
  - フィードバック入力フィールド（任意）
  - 確認 (Confirm) ボタン
  - キャンセル (Cancel) ボタン

- **停止中の状態表示**
  - アカウント停止バナー
  - 停止日時表示
  - 再開ボタン (Reactivate Account)
  - データ削除予定日表示（90日後等）

- **アカウント再開フォーム**
  - 再開の説明
  - パスワード入力フィールド
  - 再開 (Reactivate) ボタン

#### 3.5.4 ユーザーアクション
1. アカウント設定ページへのアクセス
2. アカウント停止オプションの選択
3. 停止の影響に関する説明の確認
4. 確認チェックボックスのチェック
5. パスワードの入力
6. 停止理由の選択（任意）
7. フィードバックの入力（任意）
8. アカウント停止の確定
9. 停止確認メールの受信
10. ログアウト
11. 再開時のログイン
12. アカウント再開の実行
13. 再開確認メールの受信

#### 3.5.5 データモデル

```typescript
interface AccountPause {
  id: string;                    // 停止レコードID
  userId: string;                // ユーザーID
  reason?: PauseReason;          // 停止理由
  feedback?: string;             // フィードバック（任意）
  pausedAt: DateTime;            // 停止日時
  reactivatedAt?: DateTime;      // 再開日時
  scheduledDeletionAt: DateTime; // データ削除予定日時（90日後）
  status: PauseStatus;           // ステータス
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum PauseReason {
  TEMPORARY_BREAK = 'temporary_break',           // 一時的な休止
  COST_CONCERNS = 'cost_concerns',               // コスト懸念
  NOT_USING = 'not_using',                       // 使用していない
  SWITCHING_PLATFORM = 'switching_platform',     // プラットフォーム変更
  TECHNICAL_ISSUES = 'technical_issues',         // 技術的問題
  OTHER = 'other'                                 // その他
}

enum PauseStatus {
  ACTIVE_PAUSED = 'active_paused',     // 停止中
  REACTIVATED = 'reactivated',         // 再開済み
  DELETED = 'deleted'                   // 削除済み
}

interface AccountStatus {
  isPaused: boolean;             // 停止フラグ
  pausedAt?: DateTime;           // 停止日時
  scheduledDeletionAt?: DateTime; // 削除予定日時
  canReactivate: boolean;        // 再開可能フラグ
}
```

#### 3.5.6 バリデーションルール
- **password**: 必須、正しい現在のパスワード
- **reason**: 任意、有効なPauseReason値
- **feedback**: 任意、最大1000文字
- **再開条件**:
  - アカウントが停止状態であること
  - データ削除予定日前であること
  - サブスクリプション未払いがないこと

#### 3.5.7 API要件
- `POST /api/v1/users/me/pause` - アカウント停止
- `POST /api/v1/users/me/reactivate` - アカウント再開
- `GET /api/v1/users/me/pause/status` - 停止状態取得
- `GET /api/v1/users/me/pause/history` - 停止履歴取得

#### 3.5.8 ビジネスロジック
- アカウント停止時:
  - すべてのアクティブセッションを終了
  - サブスクリプションの課金を停止
  - チームメンバー/コラボレーターのアクセスを制限
  - 定期実行ジョブ（メール送信等）を停止
  - ワークスペースを読み取り専用モードに設定
  - 停止確認メールを送信

- アカウント再開時:
  - ユーザーステータスをアクティブに変更
  - サブスクリプションの課金を再開
  - チームメンバー/コラボレーターのアクセスを復元
  - 定期実行ジョブを再開
  - ワークスペースを通常モードに戻す
  - 再開確認メールを送信

- データ保持期間:
  - 停止から90日間はデータを完全保持
  - 90日経過後は自動的に完全削除
  - 削除7日前に警告メールを送信

---

### 3.6 サブスクリプションプラン管理

#### 3.6.1 機能名
サブスクリプションプラン選択・変更・管理機能

#### 3.6.2 説明
ユーザーがサブスクリプションプランを選択、変更、アップグレード/ダウングレード、キャンセルできる機能。使用量の確認と制限管理も含む。

#### 3.6.3 UI要素
- **現在のプラン表示**
  - プラン名表示（Free/Startup/Pro/Enterprise等）
  - 月額/年額料金表示
  - 次回請求日表示
  - プランステータスバッジ
  - 使用量メーター（ファネル数、訪問者数等）

- **プラン比較テーブル**
  - プラン名列（Free/Startup/Pro/Enterprise）
  - 料金行（月額/年額）
  - 機能比較行
    - ファネル数制限
    - 訪問者数制限
    - ワークスペース数
    - チームメンバー数
    - カスタムドメイン数
    - Eメール送信数
    - A/Bテスト機能
    - 優先サポート
    - カスタム統合
  - 選択ボタン（現在のプランには「Current Plan」表示）

- **プラン変更フォーム**
  - 新しいプラン選択
  - 請求サイクル選択（月次/年次）
  - 年次割引表示（例: 2ヶ月分無料）
  - 即時変更/次回請求日変更の選択
  - 料金計算表示（日割り計算/クレジット適用）
  - 確認チェックボックス

- **アクションボタン**
  - プランをアップグレード (Upgrade) ボタン
  - プランをダウングレード (Downgrade) ボタン
  - プランをキャンセル (Cancel Plan) ボタン
  - 変更を確定 (Confirm Change) ボタン
  - 戻る (Back) ボタン

- **使用量ダッシュボード**
  - ファネル使用量（現在数/上限）
  - 訪問者数（今月/上限）
  - メール送信数（今月/上限）
  - ストレージ使用量
  - 各メーターのプログレスバー
  - 上限超過警告

#### 3.6.4 ユーザーアクション
1. サブスクリプション管理ページへのアクセス
2. 現在のプランと使用量の確認
3. プラン比較テーブルの閲覧
4. 新しいプランの選択
5. 請求サイクルの選択（月次/年次）
6. 料金計算の確認
7. プラン変更の確定
8. 支払い情報の確認/更新
9. プランキャンセルの実行
10. 使用量アラート設定

#### 3.6.5 データモデル

```typescript
interface Subscription {
  id: string;                    // サブスクリプションID
  userId: string;                // ユーザーID
  workspaceId: string;           // ワークスペースID
  planId: string;                // プランID
  status: SubscriptionStatus;    // ステータス
  billingCycle: BillingCycle;    // 請求サイクル
  currentPeriodStart: DateTime;  // 現在の期間開始日
  currentPeriodEnd: DateTime;    // 現在の期間終了日
  cancelAt?: DateTime;           // キャンセル予定日
  canceledAt?: DateTime;         // キャンセル日時
  trialStart?: DateTime;         // トライアル開始日
  trialEnd?: DateTime;           // トライアル終了日
  stripeSubscriptionId?: string; // Stripe サブスクリプションID
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

interface Plan {
  id: string;                    // プランID
  name: string;                  // プラン名
  displayName: string;           // 表示名
  description: string;           // 説明
  tier: PlanTier;                // ティア
  monthlyPrice: number;          // 月額料金（セント）
  yearlyPrice: number;           // 年額料金（セント）
  currency: string;              // 通貨コード（USD, JPY等）
  features: PlanFeatures;        // 機能制限
  isActive: boolean;             // アクティブフラグ
  displayOrder: number;          // 表示順序
  stripePriceIdMonthly?: string; // Stripe 月次価格ID
  stripePriceIdYearly?: string;  // Stripe 年次価格ID
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum PlanTier {
  FREE = 'free',
  STARTUP = 'startup',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

interface PlanFeatures {
  maxFunnels: number;            // 最大ファネル数（-1は無制限）
  maxVisitorsPerMonth: number;   // 月間最大訪問者数
  maxWorkspaces: number;         // 最大ワークスペース数
  maxTeamMembers: number;        // 最大チームメンバー数
  maxCustomDomains: number;      // 最大カスタムドメイン数
  maxEmailsPerMonth: number;     // 月間最大メール送信数
  maxStorageGB: number;          // 最大ストレージ（GB）
  hasABTesting: boolean;         // A/Bテスト機能
  hasPrioritySupport: boolean;   // 優先サポート
  hasCustomIntegrations: boolean; // カスタム統合
  hasAdvancedAnalytics: boolean; // 高度な分析機能
  hasWhiteLabel: boolean;        // ホワイトラベル機能
  hasAPI: boolean;               // API アクセス
}

enum SubscriptionStatus {
  ACTIVE = 'active',             // アクティブ
  TRIALING = 'trialing',         // トライアル中
  PAST_DUE = 'past_due',         // 支払い遅延
  CANCELED = 'canceled',         // キャンセル済み
  INCOMPLETE = 'incomplete',     // 不完全
  PAUSED = 'paused'              // 一時停止
}

enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

interface Usage {
  id: string;                    // 使用量レコードID
  subscriptionId: string;        // サブスクリプションID
  workspaceId: string;           // ワークスペースID
  periodStart: DateTime;         // 期間開始日
  periodEnd: DateTime;           // 期間終了日
  funnelsCount: number;          // ファネル数
  visitorsCount: number;         // 訪問者数
  emailsSent: number;            // メール送信数
  storageUsedGB: number;         // ストレージ使用量（GB）
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

interface PlanChangeRequest {
  newPlanId: string;             // 新プランID
  billingCycle: BillingCycle;    // 請求サイクル
  effectiveDate: ChangeEffectiveDate; // 適用日
  prorationBehavior: ProrationBehavior; // 日割り計算動作
}

enum ChangeEffectiveDate {
  IMMEDIATE = 'immediate',       // 即時
  END_OF_PERIOD = 'end_of_period' // 期間終了時
}

enum ProrationBehavior {
  CREATE_PRORATIONS = 'create_prorations',   // 日割り計算する
  NONE = 'none',                              // 日割り計算しない
  ALWAYS_INVOICE = 'always_invoice'           // 常に請求
}
```

#### 3.6.6 バリデーションルール
- **プラン変更**:
  - 新プランは現在のプランと異なる必要がある
  - ダウングレード時は使用量が新プランの制限内である必要がある
  - 支払い情報が登録されている必要がある（Freeプランを除く）

- **使用量制限**:
  - 各リソースが上限に達した場合は警告
  - 上限超過時は新規作成をブロック
  - エンタープライズプランはソフトリミット

#### 3.6.7 API要件
- `GET /api/v1/subscriptions/plans` - プラン一覧取得
- `GET /api/v1/subscriptions/plans/:planId` - プラン詳細取得
- `GET /api/v1/subscriptions/me` - 現在のサブスクリプション取得
- `POST /api/v1/subscriptions/change-plan` - プラン変更
- `POST /api/v1/subscriptions/cancel` - サブスクリプションキャンセル
- `POST /api/v1/subscriptions/reactivate` - サブスクリプション再開
- `GET /api/v1/subscriptions/usage` - 使用量取得
- `GET /api/v1/subscriptions/preview-change` - プラン変更プレビュー（料金計算）

#### 3.6.8 ビジネスロジック
- **プラン変更時の料金計算**:
  - アップグレード: 即時適用、日割り計算で差額請求
  - ダウングレード: 次回請求日に適用、クレジット発行
  - 年次→月次: 次回請求日に適用
  - 月次→年次: 即時適用可能

- **使用量制限の適用**:
  - ソフトリミット: 警告表示のみ（エンタープライズ）
  - ハードリミット: 上限到達で新規作成ブロック
  - 上限80%到達でメール通知
  - 上限100%到達で管理者通知

- **トライアル期間**:
  - 新規ユーザーは14日間のトライアル（Proプラン機能）
  - トライアル終了後はFreeプランに自動移行（支払い情報未登録時）
  - トライアル終了7日前に通知メール送信

---

### 3.7 請求・インボイス管理

#### 3.7.1 機能名
請求履歴・インボイスダウンロード機能

#### 3.7.2 説明
ユーザーが請求履歴を確認し、インボイスをダウンロードできる機能。支払い方法の管理も含む。

#### 3.7.3 UI要素
- **請求履歴テーブル**
  - 日付列（請求日）
  - 説明列（プラン名、請求サイクル）
  - 金額列
  - ステータス列（成功/失敗/保留）
  - インボイス列（ダウンロードリンク/ボタン）
  - アクション列（詳細表示、再試行等）
  - ページネーション

- **フィルター・検索**
  - 期間選択（日付範囲）
  - ステータスフィルター（全て/成功/失敗/保留）
  - 金額範囲フィルター
  - 検索ボックス

- **支払い方法セクション**
  - クレジットカード情報表示（下4桁、有効期限）
  - カードブランドロゴ（Visa, Mastercard等）
  - デフォルト支払い方法バッジ
  - カード追加ボタン
  - カード削除ボタン
  - デフォルト設定ボタン

- **次回請求情報**
  - 次回請求日表示
  - 請求予定金額表示
  - 請求対象プラン表示
  - 請求方法表示

- **インボイス詳細モーダル**
  - インボイス番号
  - 請求日
  - 支払い期限
  - 請求先情報
  - 明細（項目、数量、単価、金額）
  - 小計、税額、合計
  - 支払いステータス
  - ダウンロードボタン（PDF）
  - 印刷ボタン

#### 3.7.4 ユーザーアクション
1. 請求管理ページへのアクセス
2. 請求履歴の閲覧
3. 期間やステータスでのフィルタリング
4. インボイスのダウンロード（PDF）
5. インボイス詳細の表示
6. インボイスの印刷
7. 支払い方法の追加
8. 支払い方法の削除
9. デフォルト支払い方法の変更
10. 失敗した支払いの再試行
11. 請求先情報の編集

#### 3.7.5 データモデル

```typescript
interface Invoice {
  id: string;                    // インボイスID
  invoiceNumber: string;         // インボイス番号（例: INV-2025-0001）
  userId: string;                // ユーザーID
  subscriptionId: string;        // サブスクリプションID
  status: InvoiceStatus;         // ステータス
  description: string;           // 説明
  subtotal: number;              // 小計（セント）
  tax: number;                   // 税額（セント）
  total: number;                 // 合計（セント）
  currency: string;              // 通貨コード
  billingPeriodStart: DateTime;  // 請求期間開始日
  billingPeriodEnd: DateTime;    // 請求期間終了日
  dueDate: DateTime;             // 支払い期限
  paidAt?: DateTime;             // 支払い日時
  attemptedAt?: DateTime;        // 試行日時
  stripeInvoiceId?: string;      // Stripe インボイスID
  invoiceUrl?: string;           // インボイスURL
  pdfUrl?: string;               // PDF URL
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum InvoiceStatus {
  DRAFT = 'draft',               // 下書き
  OPEN = 'open',                 // 未払い
  PAID = 'paid',                 // 支払い済み
  VOID = 'void',                 // 無効
  UNCOLLECTIBLE = 'uncollectible' // 回収不能
}

interface InvoiceLineItem {
  id: string;                    // 明細ID
  invoiceId: string;             // インボイスID
  description: string;           // 説明
  quantity: number;              // 数量
  unitAmount: number;            // 単価（セント）
  amount: number;                // 金額（セント）
  currency: string;              // 通貨コード
  periodStart?: DateTime;        // 期間開始日
  periodEnd?: DateTime;          // 期間終了日
  createdAt: DateTime;           // 作成日時
}

interface PaymentMethod {
  id: string;                    // 支払い方法ID
  userId: string;                // ユーザーID
  type: PaymentMethodType;       // タイプ
  isDefault: boolean;            // デフォルトフラグ
  cardBrand?: string;            // カードブランド（Visa, Mastercard等）
  cardLast4?: string;            // カード下4桁
  cardExpMonth?: number;         // 有効期限（月）
  cardExpYear?: number;          // 有効期限（年）
  billingDetails: BillingDetails; // 請求先情報
  stripePaymentMethodId?: string; // Stripe 支払い方法ID
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal'
}

interface BillingDetails {
  name: string;                  // 名前
  email: string;                 // メールアドレス
  phone?: string;                // 電話番号
  address: Address;              // 住所
}

interface Address {
  line1: string;                 // 住所1
  line2?: string;                // 住所2
  city: string;                  // 市区町村
  state?: string;                // 都道府県
  postalCode: string;            // 郵便番号
  country: string;               // 国コード（ISO 3166-1 alpha-2）
}

interface Payment {
  id: string;                    // 支払いID
  invoiceId: string;             // インボイスID
  userId: string;                // ユーザーID
  paymentMethodId: string;       // 支払い方法ID
  amount: number;                // 金額（セント）
  currency: string;              // 通貨コード
  status: PaymentStatus;         // ステータス
  failureReason?: string;        // 失敗理由
  stripePaymentIntentId?: string; // Stripe PaymentIntent ID
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum PaymentStatus {
  PENDING = 'pending',           // 保留中
  PROCESSING = 'processing',     // 処理中
  SUCCEEDED = 'succeeded',       // 成功
  FAILED = 'failed',             // 失敗
  CANCELED = 'canceled'          // キャンセル
}
```

#### 3.7.6 バリデーションルール
- **請求先情報**:
  - name: 必須、1-100文字
  - email: 必須、有効なメール形式
  - address.line1: 必須、1-100文字
  - address.city: 必須、1-50文字
  - address.postalCode: 必須、有効な郵便番号形式
  - address.country: 必須、有効な国コード

- **クレジットカード**:
  - 有効期限が未来の日付
  - カード番号はLuhnアルゴリズムで検証
  - CVCは3-4桁

#### 3.7.7 API要件
- `GET /api/v1/billing/invoices` - インボイス一覧取得
- `GET /api/v1/billing/invoices/:invoiceId` - インボイス詳細取得
- `GET /api/v1/billing/invoices/:invoiceId/pdf` - インボイスPDFダウンロード
- `POST /api/v1/billing/invoices/:invoiceId/retry` - 支払い再試行
- `GET /api/v1/billing/payment-methods` - 支払い方法一覧取得
- `POST /api/v1/billing/payment-methods` - 支払い方法追加
- `DELETE /api/v1/billing/payment-methods/:paymentMethodId` - 支払い方法削除
- `PUT /api/v1/billing/payment-methods/:paymentMethodId/default` - デフォルト設定
- `GET /api/v1/billing/upcoming-invoice` - 次回請求情報取得
- `PUT /api/v1/billing/details` - 請求先情報更新

#### 3.7.8 統合要件
- **Stripe統合**:
  - Stripe Checkout使用
  - Stripe Billing使用
  - Webhookイベント処理（invoice.paid, payment_intent.succeeded等）
  - SCA（Strong Customer Authentication）対応
  - 3Dセキュア対応

- **インボイス生成**:
  - PDF生成（会社ロゴ、請求先、明細含む）
  - 多言語対応
  - 税計算（地域別）
  - 自動メール送信

---

### 3.8 ワークスペース切り替え

#### 3.8.1 機能名
ワークスペース切り替え・選択機能

#### 3.8.2 説明
ユーザーが複数のワークスペース間をシームレスに切り替えられる機能。現在のワークスペースコンテキストを管理し、ユーザーエクスペリエンスを向上させる。

#### 3.8.3 UI要素
- **ワークスペースセレクター（ヘッダー内）**
  - 現在のワークスペース名表示
  - ワークスペースアイコン/ロゴ
  - ドロップダウンアイコン
  - クリックでドロップダウンメニュー表示

- **ワークスペースドロップダウンメニュー**
  - ワークスペース一覧
    - 各ワークスペース名
    - 各ワークスペースアイコン
    - ロール表示（Owner/Admin/Member）
    - 現在のワークスペースにチェックマーク
  - 区切り線
  - 新しいワークスペース作成ボタン
  - ワークスペース設定リンク
  - 検索ボックス（ワークスペース数が多い場合）

- **ワークスペース作成モーダル**
  - ワークスペース名入力フィールド
  - ワークスペース説明入力フィールド（任意）
  - ワークスペースアイコンアップロード
  - 作成 (Create) ボタン
  - キャンセル (Cancel) ボタン

- **切り替えローディング**
  - ローディングスピナー
  - 切り替え中メッセージ

#### 3.8.4 ユーザーアクション
1. ワークスペースセレクターのクリック
2. ドロップダウンメニューの表示
3. ワークスペース一覧の閲覧
4. ワークスペースの検索（多数の場合）
5. 別のワークスペースの選択
6. ワークスペースの切り替え
7. 新しいワークスペースの作成
8. ワークスペース設定へのアクセス

#### 3.8.5 データモデル

```typescript
interface Workspace {
  id: string;                    // ワークスペースID
  name: string;                  // ワークスペース名
  slug: string;                  // スラッグ（URL用、一意）
  description?: string;          // 説明
  iconUrl?: string;              // アイコンURL
  ownerId: string;               // オーナーID
  subscriptionId?: string;       // サブスクリプションID
  settings: WorkspaceSettings;   // 設定
  isActive: boolean;             // アクティブフラグ
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

interface WorkspaceSettings {
  timezone: string;              // タイムゾーン
  currency: string;              // 通貨
  language: string;              // 言語
  dateFormat: string;            // 日付フォーマット
  allowMemberInvites: boolean;   // メンバー招待許可
}

interface WorkspaceMember {
  id: string;                    // メンバーID
  workspaceId: string;           // ワークスペースID
  userId: string;                // ユーザーID
  role: WorkspaceRole;           // ロール
  permissions: string[];         // 権限リスト
  invitedBy?: string;            // 招待者ID
  joinedAt: DateTime;            // 参加日時
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum WorkspaceRole {
  OWNER = 'owner',               // オーナー（全権限）
  ADMIN = 'admin',               // 管理者
  MEMBER = 'member',             // メンバー
  VIEWER = 'viewer'              // 閲覧者
}

interface UserWorkspace {
  workspace: Workspace;          // ワークスペース情報
  membership: WorkspaceMember;   // メンバーシップ情報
  user: UserProfile;             // ユーザー情報
}

interface CurrentWorkspaceContext {
  workspaceId: string;           // 現在のワークスペースID
  userId: string;                // ユーザーID
  role: WorkspaceRole;           // ロール
  permissions: string[];         // 権限リスト
  lastAccessedAt: DateTime;      // 最終アクセス日時
}
```

#### 3.8.6 バリデーションルール
- **workspace.name**: 必須、1-50文字、ユーザー内で一意
- **workspace.slug**: 必須、3-50文字、英数字とハイフンのみ、グローバルで一意
- **workspace.description**: 任意、最大500文字
- **workspace.iconUrl**: 任意、画像ファイル形式、最大2MB

#### 3.8.7 API要件
- `GET /api/v1/workspaces` - ワークスペース一覧取得（ユーザーが所属するもの）
- `GET /api/v1/workspaces/:workspaceId` - ワークスペース詳細取得
- `POST /api/v1/workspaces` - ワークスペース作成
- `PUT /api/v1/workspaces/:workspaceId` - ワークスペース更新
- `DELETE /api/v1/workspaces/:workspaceId` - ワークスペース削除
- `POST /api/v1/workspaces/switch` - ワークスペース切り替え
- `GET /api/v1/workspaces/current` - 現在のワークスペース取得
- `PUT /api/v1/workspaces/current` - 現在のワークスペース設定

#### 3.8.8 ビジネスロジック
- **ワークスペース作成時**:
  - 作成ユーザーを自動的にオーナーとして設定
  - デフォルト設定を適用
  - サブスクリプションをFreeプランで開始（または作成者のプラン継承）

- **ワークスペース切り替え時**:
  - セッションに現在のワークスペースIDを保存
  - 最終アクセス日時を更新
  - 権限とロールをキャッシュ
  - ダッシュボードにリダイレクト

- **ワークスペース制限**:
  - Freeプラン: 1ワークスペース
  - Startupプラン: 3ワークスペース
  - Proプラン: 10ワークスペース
  - Enterpriseプラン: 無制限

---

### 3.9 ワークスペース一般設定

#### 3.9.1 機能名
ワークスペース設定管理機能

#### 3.9.2 説明
ワークスペースの基本情報、地域設定、セキュリティ設定等を管理する機能。オーナーと管理者のみがアクセス可能。

#### 3.9.3 UI要素
- **一般設定セクション**
  - ワークスペース名入力フィールド
  - ワークスペーススラッグ入力フィールド
  - 説明入力エリア
  - ワークスペースアイコンアップロード
  - 保存ボタン

- **地域設定セクション**
  - タイムゾーン選択ドロップダウン
  - 言語選択ドロップダウン
  - 通貨選択ドロップダウン
  - 日付フォーマット選択ドロップダウン
  - 時刻フォーマット選択（12時間/24時間）
  - 保存ボタン

- **セキュリティ設定セクション**
  - メンバー招待権限設定
    - オーナーのみ許可ラジオボタン
    - 管理者も許可ラジオボタン
    - 全メンバー許可ラジオボタン
  - 2FA必須化トグル
  - IPアドレス制限設定
    - 許可IPアドレスリスト
    - IP追加/削除ボタン
  - セッションタイムアウト設定（分）
  - 保存ボタン

- **通知設定セクション**
  - メール通知設定
    - 新メンバー参加通知
    - ファネル公開通知
    - 週次レポート通知
  - Slack統合設定
  - Webhook URL設定
  - 保存ボタン

- **危険な操作セクション**
  - ワークスペース削除ボタン（赤色）
  - 削除確認モーダル
    - 警告メッセージ
    - ワークスペース名入力（確認用）
    - パスワード入力
    - 削除確定ボタン

#### 3.9.4 ユーザーアクション
1. ワークスペース設定ページへのアクセス
2. 各セクションの表示
3. ワークスペース名の変更
4. スラッグの変更
5. 説明の編集
6. アイコンのアップロード/変更
7. タイムゾーンの変更
8. 言語の変更
9. 通貨の変更
10. セキュリティ設定の変更
11. 通知設定の変更
12. 設定の保存
13. ワークスペースの削除（確認付き）

#### 3.9.5 データモデル

```typescript
interface WorkspaceSettings {
  // 一般設定
  timezone: string;              // タイムゾーン
  language: string;              // 言語
  currency: string;              // 通貨
  dateFormat: string;            // 日付フォーマット
  timeFormat: TimeFormat;        // 時刻フォーマット

  // セキュリティ設定
  allowMemberInvites: boolean;   // メンバー招待許可
  invitePermission: InvitePermission; // 招待権限レベル
  require2FA: boolean;           // 2FA必須化
  allowedIpAddresses: string[];  // 許可IPアドレスリスト
  sessionTimeoutMinutes: number; // セッションタイムアウト（分）

  // 通知設定
  emailNotifications: EmailNotificationSettings;
  slackWebhookUrl?: string;      // Slack Webhook URL
  webhookUrl?: string;           // カスタムWebhook URL

  // その他
  customDomain?: string;         // カスタムドメイン
  brandingColor?: string;        // ブランディングカラー
  logoUrl?: string;              // ロゴURL
}

enum TimeFormat {
  TWELVE_HOUR = '12h',
  TWENTY_FOUR_HOUR = '24h'
}

enum InvitePermission {
  OWNER_ONLY = 'owner_only',
  ADMIN_AND_OWNER = 'admin_and_owner',
  ALL_MEMBERS = 'all_members'
}

interface EmailNotificationSettings {
  newMemberJoined: boolean;      // 新メンバー参加通知
  funnelPublished: boolean;      // ファネル公開通知
  weeklyReport: boolean;         // 週次レポート
  monthlyReport: boolean;        // 月次レポート
  systemAlerts: boolean;         // システムアラート
}

interface WorkspaceDeletion {
  workspaceId: string;           // ワークスペースID
  requestedBy: string;           // 要求者ID
  confirmationName: string;      // 確認用ワークスペース名
  password: string;              // パスワード
  deletedAt: DateTime;           // 削除日時
  scheduledDeletionAt: DateTime; // 完全削除予定日時（30日後）
}
```

#### 3.9.6 バリデーションルール
- **name**: 必須、1-50文字
- **slug**: 必須、3-50文字、英数字とハイフンのみ、グローバルで一意、変更は慎重に（URLに影響）
- **description**: 任意、最大500文字
- **timezone**: 必須、有効なIANAタイムゾーン
- **language**: 必須、サポート対象言語コード
- **currency**: 必須、有効なISO 4217通貨コード
- **sessionTimeoutMinutes**: 5-1440（5分〜24時間）
- **allowedIpAddresses**: 有効なIPv4/IPv6アドレスまたはCIDR形式
- **削除確認**: 入力されたワークスペース名が完全一致、正しいパスワード

#### 3.9.7 API要件
- `GET /api/v1/workspaces/:workspaceId/settings` - 設定取得
- `PUT /api/v1/workspaces/:workspaceId/settings/general` - 一般設定更新
- `PUT /api/v1/workspaces/:workspaceId/settings/regional` - 地域設定更新
- `PUT /api/v1/workspaces/:workspaceId/settings/security` - セキュリティ設定更新
- `PUT /api/v1/workspaces/:workspaceId/settings/notifications` - 通知設定更新
- `DELETE /api/v1/workspaces/:workspaceId` - ワークスペース削除
- `POST /api/v1/workspaces/:workspaceId/restore` - ワークスペース復元（30日以内）

#### 3.9.8 権限要件
- **閲覧**: Admin, Owner
- **編集**: Admin, Owner
- **削除**: Owner のみ
- **復元**: Owner のみ

---

### 3.10 ワークスペースコラボレーター管理

#### 3.10.1 機能名
ワークスペースコラボレーター招待・管理機能

#### 3.10.2 説明
ワークスペースにコラボレーターを招待し、ロールと権限を管理する機能。チーム協業を実現するための中核機能。

#### 3.10.3 UI要素
- **コラボレーター一覧テーブル**
  - プロファイル画像列
  - 名前列
  - メールアドレス列
  - ロール列（ドロップダウンで変更可能）
  - ステータス列（Active/Pending/Suspended）
  - 最終アクセス日時列
  - アクション列（編集、削除ボタン）
  - ページネーション

- **コラボレーター招待セクション**
  - メールアドレス入力フィールド（複数可、カンマ区切り）
  - ロール選択ドロップダウン
  - 招待メッセージ入力エリア（任意）
  - 招待送信 (Send Invites) ボタン

- **フィルター・検索**
  - 検索ボックス（名前、メール）
  - ロールフィルター（All/Owner/Admin/Member/Viewer）
  - ステータスフィルター（All/Active/Pending/Suspended）

- **ロール編集モーダル**
  - ユーザー情報表示
  - 現在のロール表示
  - 新しいロール選択
  - カスタム権限設定（チェックボックスリスト）
  - 保存ボタン
  - キャンセルボタン

- **削除確認モーダル**
  - 警告メッセージ
  - ユーザー名表示
  - 確認チェックボックス
  - 削除確定ボタン
  - キャンセルボタン

- **招待リンク生成**
  - 招待リンクURL表示
  - コピーボタン
  - 有効期限表示
  - リンク再生成ボタン

#### 3.10.4 ユーザーアクション
1. コラボレーター管理ページへのアクセス
2. 現在のコラボレーター一覧の閲覧
3. メールアドレスによる新規招待
4. 招待リンクの生成
5. 招待リンクのコピー・共有
6. コラボレーターのロール変更
7. コラボレーターの権限カスタマイズ
8. コラボレーターの削除
9. 保留中の招待のキャンセル
10. 招待の再送信
11. コラボレーターの検索・フィルタリング
12. コラボレーターのアクセス履歴確認

#### 3.10.5 データモデル

```typescript
interface WorkspaceMember {
  id: string;                    // メンバーID
  workspaceId: string;           // ワークスペースID
  userId: string;                // ユーザーID
  role: WorkspaceRole;           // ロール
  customPermissions?: string[];  // カスタム権限（ロールをオーバーライド）
  status: MemberStatus;          // ステータス
  invitedBy?: string;            // 招待者ID
  invitedAt?: DateTime;          // 招待日時
  joinedAt?: DateTime;           // 参加日時
  lastAccessAt?: DateTime;       // 最終アクセス日時
  suspendedAt?: DateTime;        // 停止日時
  suspendedBy?: string;          // 停止実行者ID
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum WorkspaceRole {
  OWNER = 'owner',               // オーナー
  ADMIN = 'admin',               // 管理者
  MEMBER = 'member',             // メンバー
  VIEWER = 'viewer'              // 閲覧者
}

enum MemberStatus {
  ACTIVE = 'active',             // アクティブ
  PENDING = 'pending',           // 招待保留中
  SUSPENDED = 'suspended',       // 停止中
  REMOVED = 'removed'            // 削除済み
}

interface WorkspaceInvitation {
  id: string;                    // 招待ID
  workspaceId: string;           // ワークスペースID
  email: string;                 // 招待メールアドレス
  role: WorkspaceRole;           // 割り当てロール
  inviteToken: string;           // 招待トークン（ハッシュ化）
  invitedBy: string;             // 招待者ID
  message?: string;              // 招待メッセージ
  status: InvitationStatus;      // ステータス
  expiresAt: DateTime;           // 有効期限
  acceptedAt?: DateTime;         // 承認日時
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

enum InvitationStatus {
  PENDING = 'pending',           // 保留中
  ACCEPTED = 'accepted',         // 承認済み
  DECLINED = 'declined',         // 拒否
  EXPIRED = 'expired',           // 期限切れ
  CANCELED = 'canceled'          // キャンセル
}

// 権限定義
const WORKSPACE_PERMISSIONS = {
  // ファネル関連
  'funnels.view': 'ファネルの閲覧',
  'funnels.create': 'ファネルの作成',
  'funnels.edit': 'ファネルの編集',
  'funnels.delete': 'ファネルの削除',
  'funnels.publish': 'ファネルの公開',

  // ページ関連
  'pages.view': 'ページの閲覧',
  'pages.create': 'ページの作成',
  'pages.edit': 'ページの編集',
  'pages.delete': 'ページの削除',

  // 統合関連
  'integrations.view': '統合の閲覧',
  'integrations.manage': '統合の管理',

  // 設定関連
  'settings.view': '設定の閲覧',
  'settings.edit': '設定の編集',

  // メンバー関連
  'members.view': 'メンバーの閲覧',
  'members.invite': 'メンバーの招待',
  'members.manage': 'メンバーの管理',
  'members.remove': 'メンバーの削除',

  // 請求関連
  'billing.view': '請求情報の閲覧',
  'billing.manage': '請求情報の管理',

  // 監査ログ
  'audit.view': '監査ログの閲覧'
} as const;

// ロール別デフォルト権限
const ROLE_PERMISSIONS = {
  [WorkspaceRole.OWNER]: Object.keys(WORKSPACE_PERMISSIONS),
  [WorkspaceRole.ADMIN]: [
    'funnels.view', 'funnels.create', 'funnels.edit', 'funnels.delete', 'funnels.publish',
    'pages.view', 'pages.create', 'pages.edit', 'pages.delete',
    'integrations.view', 'integrations.manage',
    'settings.view', 'settings.edit',
    'members.view', 'members.invite', 'members.manage',
    'billing.view',
    'audit.view'
  ],
  [WorkspaceRole.MEMBER]: [
    'funnels.view', 'funnels.create', 'funnels.edit',
    'pages.view', 'pages.create', 'pages.edit',
    'integrations.view',
    'settings.view',
    'members.view'
  ],
  [WorkspaceRole.VIEWER]: [
    'funnels.view',
    'pages.view',
    'members.view'
  ]
};
```

#### 3.10.6 バリデーションルール
- **email**: 必須、有効なメール形式、ワークスペース内で未招待
- **role**: 必須、有効なWorkspaceRole値
- **message**: 任意、最大500文字
- **inviteToken**: 48時間以内有効、未使用
- **ロール変更**:
  - オーナーは変更不可（譲渡機能は別途）
  - 最低1人のオーナーが必要
  - 自分自身のロールダウングレードには確認必要

#### 3.10.7 API要件
- `GET /api/v1/workspaces/:workspaceId/members` - メンバー一覧取得
- `POST /api/v1/workspaces/:workspaceId/invitations` - 招待送信
- `GET /api/v1/workspaces/:workspaceId/invitations` - 招待一覧取得
- `DELETE /api/v1/workspaces/:workspaceId/invitations/:invitationId` - 招待キャンセル
- `POST /api/v1/workspaces/:workspaceId/invitations/:invitationId/resend` - 招待再送信
- `POST /api/v1/invitations/:token/accept` - 招待承認
- `POST /api/v1/invitations/:token/decline` - 招待拒否
- `PUT /api/v1/workspaces/:workspaceId/members/:memberId/role` - ロール変更
- `PUT /api/v1/workspaces/:workspaceId/members/:memberId/permissions` - 権限変更
- `DELETE /api/v1/workspaces/:workspaceId/members/:memberId` - メンバー削除
- `POST /api/v1/workspaces/:workspaceId/members/:memberId/suspend` - メンバー停止
- `POST /api/v1/workspaces/:workspaceId/members/:memberId/reactivate` - メンバー再開
- `GET /api/v1/workspaces/:workspaceId/invite-link` - 招待リンク生成

#### 3.10.8 権限要件
- **メンバー閲覧**: 全ロール
- **メンバー招待**: 設定に応じて（Owner/Admin/All）
- **ロール変更**: Admin, Owner
- **メンバー削除**: Admin, Owner
- **権限カスタマイズ**: Owner のみ

#### 3.10.9 通知要件
- 招待メール送信（招待リンク含む）
- 招待承認通知（招待者へ）
- ロール変更通知（該当メンバーへ）
- メンバー削除通知（該当メンバーへ）
- 新メンバー参加通知（ワークスペース管理者へ）

---

### 3.11 チームメンバー・サブユーザー管理

#### 3.11.1 機能名
チームメンバー・サブユーザー作成・管理機能

#### 3.11.2 説明
ワークスペース内でサブユーザーアカウントを作成し、個別の認証情報を持たせる機能。コラボレーター機能との違いは、サブユーザーは完全に管理下のアカウントである点。

#### 3.11.3 UI要素
- **サブユーザー一覧テーブル**
  - プロファイル画像列
  - 名前列
  - メールアドレス列
  - ロール列
  - ステータス列（Active/Inactive）
  - 作成日時列
  - 最終ログイン列
  - アクション列（編集、無効化、削除）

- **サブユーザー作成フォーム**
  - 姓入力フィールド
  - 名入力フィールド
  - メールアドレス入力フィールド
  - ロール選択ドロップダウン
  - 初期パスワード入力フィールド
  - パスワード確認入力フィールド
  - パスワード自動生成ボタン
  - 権限設定セクション
  - 作成 (Create) ボタン

- **サブユーザー編集フォーム**
  - 名前編集フィールド
  - メールアドレス編集フィールド（読み取り専用）
  - ロール変更ドロップダウン
  - 権限設定セクション
  - パスワードリセットボタン
  - 保存ボタン

- **権限設定セクション**
  - 権限カテゴリーアコーディオン
  - 各権限チェックボックス
  - 全選択/全解除ボタン
  - プリセット選択（管理者/編集者/閲覧者）

#### 3.11.4 ユーザーアクション
1. サブユーザー管理ページへのアクセス
2. サブユーザー一覧の閲覧
3. 新規サブユーザーの作成
4. サブユーザー情報の編集
5. サブユーザーのロール変更
6. サブユーザーの権限カスタマイズ
7. サブユーザーのパスワードリセット
8. サブユーザーの無効化/有効化
9. サブユーザーの削除
10. サブユーザーの検索・フィルタリング

#### 3.11.5 データモデル

```typescript
interface SubUser {
  id: string;                    // サブユーザーID
  workspaceId: string;           // ワークスペースID
  parentUserId: string;          // 親ユーザー（作成者）ID
  email: string;                 // メールアドレス（一意）
  firstName: string;             // 姓
  lastName: string;              // 名
  role: WorkspaceRole;           // ロール
  customPermissions?: string[];  // カスタム権限
  isActive: boolean;             // アクティブフラグ
  passwordHash: string;          // パスワードハッシュ
  lastLoginAt?: DateTime;        // 最終ログイン日時
  createdAt: DateTime;           // 作成日時
  updatedAt: DateTime;           // 更新日時
}

interface SubUserPasswordReset {
  subUserId: string;             // サブユーザーID
  newPassword: string;           // 新パスワード
  confirmPassword: string;       // パスワード確認
  notifyUser: boolean;           // ユーザー通知フラグ
}
```

#### 3.11.6 バリデーションルール
- **firstName**: 必須、1-50文字
- **lastName**: 必須、1-50文字
- **email**: 必須、有効なメール形式、グローバルで一意
- **password**: 最小8文字、大文字・小文字・数字・記号を各1文字以上含む
- **role**: 必須、有効なWorkspaceRole値（OWNERは不可）

#### 3.11.7 API要件
- `GET /api/v1/workspaces/:workspaceId/subusers` - サブユーザー一覧取得
- `POST /api/v1/workspaces/:workspaceId/subusers` - サブユーザー作成
- `GET /api/v1/workspaces/:workspaceId/subusers/:subuserId` - サブユーザー詳細取得
- `PUT /api/v1/workspaces/:workspaceId/subusers/:subuserId` - サブユーザー更新
- `DELETE /api/v1/workspaces/:workspaceId/subusers/:subuserId` - サブユーザー削除
- `POST /api/v1/workspaces/:workspaceId/subusers/:subuserId/reset-password` - パスワードリセット
- `POST /api/v1/workspaces/:workspaceId/subusers/:subuserId/activate` - 有効化
- `POST /api/v1/workspaces/:workspaceId/subusers/:subuserId/deactivate` - 無効化

#### 3.11.8 権限要件
- **作成・管理**: Admin, Owner のみ
- **サブユーザー数制限**: プランに応じて制限

---

### 3.12 チームダッシュボード

#### 3.12.1 機能名
チーム概要・アクティビティダッシュボード

#### 3.12.2 説明
ワークスペース内のチームメンバーのアクティビティ、統計情報、最近の変更履歴を一覧表示するダッシュボード。

#### 3.12.3 UI要素
- **チーム統計カード**
  - 総メンバー数
  - アクティブメンバー数
  - 保留中の招待数
  - 今月の新規メンバー数

- **アクティビティフィード**
  - アクティビティアイテムリスト
    - ユーザーアバター
    - アクティビティ説明
    - タイムスタンプ
    - 関連リソースリンク
  - フィルター（全て/ファネル/ページ/設定等）
  - ページネーション

- **メンバーリスト（簡易版）**
  - メンバーカード
    - アバター
    - 名前
    - ロール
    - 最終アクセス日時
    - オンラインステータス
  - 全メンバー表示リンク

- **最近の変更**
  - 変更履歴リスト
    - 変更タイプアイコン
    - 変更説明
    - 実行者
    - タイムスタンプ

#### 3.12.4 データモデル

```typescript
interface TeamActivity {
  id: string;                    // アクティビティID
  workspaceId: string;           // ワークスペースID
  userId: string;                // ユーザーID
  activityType: ActivityType;    // アクティビティタイプ
  resourceType: ResourceType;    // リソースタイプ
  resourceId: string;            // リソースID
  description: string;           // 説明
  metadata?: Record<string, any>; // メタデータ
  createdAt: DateTime;           // 作成日時
}

enum ActivityType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished'
}

enum ResourceType {
  FUNNEL = 'funnel',
  PAGE = 'page',
  INTEGRATION = 'integration',
  MEMBER = 'member',
  SETTING = 'setting'
}
```

#### 3.12.5 API要件
- `GET /api/v1/workspaces/:workspaceId/team/dashboard` - ダッシュボード情報取得
- `GET /api/v1/workspaces/:workspaceId/team/activities` - アクティビティフィード取得
- `GET /api/v1/workspaces/:workspaceId/team/stats` - チーム統計取得

---

### 3.13 監査ログ・アクティビティ追跡

#### 3.13.1 機能名
監査ログ記録・検索・エクスポート機能

#### 3.13.2 説明
ワークスペース内のすべての重要なアクションを記録し、セキュリティ監査やトラブルシューティングに活用できる機能。

#### 3.13.3 UI要素
- **監査ログテーブル**
  - タイムスタンプ列
  - ユーザー列（名前、アバター）
  - アクション列
  - リソースタイプ列
  - リソース名列
  - IPアドレス列
  - ステータス列（Success/Failed）
  - 詳細ボタン

- **フィルター・検索パネル**
  - 日付範囲選択
  - ユーザーフィルター
  - アクションタイプフィルター
  - リソースタイプフィルター
  - ステータスフィルター
  - IPアドレス検索
  - キーワード検索
  - フィルター適用/クリアボタン

- **詳細モーダル**
  - 完全なイベント情報
  - 変更前/変更後の値
  - リクエストメタデータ
  - ユーザーエージェント
  - 位置情報（IPベース）
  - JSONビュー

- **エクスポート機能**
  - フォーマット選択（CSV/JSON/PDF）
  - 期間選択
  - エクスポートボタン

#### 3.13.4 ユーザーアクション
1. 監査ログページへのアクセス
2. ログの閲覧
3. 日付範囲でのフィルタリング
4. ユーザー別フィルタリング
5. アクションタイプ別フィルタリング
6. キーワード検索
7. ログ詳細の表示
8. ログのエクスポート
9. 異常アクティビティの検出

#### 3.13.5 データモデル

```typescript
interface AuditLog {
  id: string;                    // 監査ログID
  workspaceId: string;           // ワークスペースID
  userId: string;                // ユーザーID
  action: AuditAction;           // アクション
  resourceType: ResourceType;    // リソースタイプ
  resourceId: string;            // リソースID
  resourceName?: string;         // リソース名
  status: AuditStatus;           // ステータス
  ipAddress: string;             // IPアドレス
  userAgent: string;             // ユーザーエージェント
  location?: string;             // 位置情報
  changes?: AuditChange[];       // 変更内容
  metadata?: Record<string, any>; // メタデータ
  createdAt: DateTime;           // 作成日時
}

enum AuditAction {
  // 認証関連
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  TWO_FA_ENABLED = 'two_fa_enabled',
  TWO_FA_DISABLED = 'two_fa_disabled',

  // ワークスペース関連
  WORKSPACE_CREATED = 'workspace_created',
  WORKSPACE_UPDATED = 'workspace_updated',
  WORKSPACE_DELETED = 'workspace_deleted',
  WORKSPACE_SETTINGS_CHANGED = 'workspace_settings_changed',

  // メンバー関連
  MEMBER_INVITED = 'member_invited',
  MEMBER_JOINED = 'member_joined',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_SUSPENDED = 'member_suspended',

  // ファネル関連
  FUNNEL_CREATED = 'funnel_created',
  FUNNEL_UPDATED = 'funnel_updated',
  FUNNEL_DELETED = 'funnel_deleted',
  FUNNEL_PUBLISHED = 'funnel_published',
  FUNNEL_UNPUBLISHED = 'funnel_unpublished',

  // ページ関連
  PAGE_CREATED = 'page_created',
  PAGE_UPDATED = 'page_updated',
  PAGE_DELETED = 'page_deleted',

  // サブスクリプション関連
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  PLAN_CHANGED = 'plan_changed',

  // 統合関連
  INTEGRATION_CONNECTED = 'integration_connected',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',
  INTEGRATION_CONFIGURED = 'integration_configured',

  // その他
  API_KEY_CREATED = 'api_key_created',
  API_KEY_DELETED = 'api_key_deleted',
  EXPORT_CREATED = 'export_created'
}

enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial'
}

interface AuditChange {
  field: string;                 // フィールド名
  oldValue?: any;                // 変更前の値
  newValue?: any;                // 変更後の値
}

interface AuditLogFilter {
  startDate?: DateTime;          // 開始日時
  endDate?: DateTime;            // 終了日時
  userIds?: string[];            // ユーザーIDリスト
  actions?: AuditAction[];       // アクションリスト
  resourceTypes?: ResourceType[]; // リソースタイプリスト
  statuses?: AuditStatus[];      // ステータスリスト
  ipAddress?: string;            // IPアドレス
  keyword?: string;              // キーワード
}
```

#### 3.13.6 API要件
- `GET /api/v1/workspaces/:workspaceId/audit-logs` - 監査ログ一覧取得
- `GET /api/v1/workspaces/:workspaceId/audit-logs/:logId` - 監査ログ詳細取得
- `POST /api/v1/workspaces/:workspaceId/audit-logs/export` - 監査ログエクスポート
- `GET /api/v1/workspaces/:workspaceId/audit-logs/stats` - 監査ログ統計取得

#### 3.13.7 記録要件
- すべての認証イベント
- すべてのCRUD操作（Create, Read は任意）
- すべての設定変更
- すべての権限変更
- すべての失敗した操作
- IPアドレスとユーザーエージェント
- 変更前/変更後の値（機密情報は除く）

#### 3.13.8 保持要件
- 監査ログは最低1年間保持
- エンタープライズプランは無期限保持
- 削除されたワークスペースのログも90日間保持

#### 3.13.9 権限要件
- **閲覧**: Admin, Owner のみ
- **エクスポート**: Owner のみ

---

## 4. API要件

### 4.1 共通仕様

#### 4.1.1 ベースURL
```
Production: https://api.sakaduki.app/v1
Staging: https://api-staging.sakaduki.app/v1
Development: http://localhost:3000/api/v1
```

#### 4.1.2 認証
- **Bearer Token認証**: すべてのAPIリクエストにはAuthorizationヘッダーが必要
```
Authorization: Bearer {access_token}
```

#### 4.1.3 共通ヘッダー
```
Content-Type: application/json
Accept: application/json
X-Workspace-ID: {workspace_id}  // ワークスペースコンテキスト必要時
X-Request-ID: {unique_request_id}  // リクエスト追跡用
```

#### 4.1.4 レスポンス形式

**成功レスポンス:**
```json
{
  "success": true,
  "data": { /* リソースデータ */ },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2025-12-09T10:00:00Z"
  }
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2025-12-09T10:00:00Z"
  }
}
```

#### 4.1.5 ページネーション

**リクエストパラメータ:**
```
?page=1&limit=20&sort=createdAt&order=desc
```

**レスポンス:**
```json
{
  "success": true,
  "data": [ /* アイテムリスト */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 4.1.6 エラーコード
- `400 BAD_REQUEST` - リクエストが不正
- `401 UNAUTHORIZED` - 認証失敗
- `403 FORBIDDEN` - 権限不足
- `404 NOT_FOUND` - リソースが存在しない
- `409 CONFLICT` - リソースの競合
- `422 VALIDATION_ERROR` - バリデーションエラー
- `429 RATE_LIMIT_EXCEEDED` - レート制限超過
- `500 INTERNAL_SERVER_ERROR` - サーバーエラー
- `503 SERVICE_UNAVAILABLE` - サービス利用不可

#### 4.1.7 レート制限
- **認証済みユーザー**: 1000リクエスト/時間
- **未認証**: 100リクエスト/時間
- **レート制限ヘッダー**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

### 4.2 APIエンドポイント一覧

#### 4.2.1 認証API
- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン
- `POST /auth/logout` - ログアウト
- `POST /auth/refresh` - トークンリフレッシュ
- `POST /auth/verify-email` - メール認証
- `POST /auth/resend-verification` - 認証メール再送信

#### 4.2.2 ユーザーAPI
- `GET /users/me` - 現在のユーザー情報取得
- `PUT /users/me/profile` - プロファイル更新
- `POST /users/me/profile/image` - プロファイル画像アップロード
- `DELETE /users/me/profile/image` - プロファイル画像削除
- `POST /users/me/password/change` - パスワード変更
- `POST /users/password/reset-request` - パスワードリセット要求
- `POST /users/password/reset` - パスワードリセット実行

#### 4.2.3 2FA API
- `GET /users/me/2fa/status` - 2FA状態取得
- `POST /users/me/2fa/setup` - 2FAセットアップ
- `POST /users/me/2fa/verify` - 2FA検証・有効化
- `POST /users/me/2fa/disable` - 2FA無効化
- `POST /users/me/2fa/backup-codes/regenerate` - バックアップコード再生成

#### 4.2.4 サブスクリプションAPI
- `GET /subscriptions/plans` - プラン一覧取得
- `GET /subscriptions/me` - 現在のサブスクリプション取得
- `POST /subscriptions/change-plan` - プラン変更
- `POST /subscriptions/cancel` - キャンセル
- `GET /subscriptions/usage` - 使用量取得

#### 4.2.5 請求API
- `GET /billing/invoices` - インボイス一覧取得
- `GET /billing/invoices/:id` - インボイス詳細取得
- `GET /billing/invoices/:id/pdf` - PDF ダウンロード
- `GET /billing/payment-methods` - 支払い方法一覧取得
- `POST /billing/payment-methods` - 支払い方法追加
- `DELETE /billing/payment-methods/:id` - 支払い方法削除

#### 4.2.6 ワークスペースAPI
- `GET /workspaces` - ワークスペース一覧取得
- `POST /workspaces` - ワークスペース作成
- `GET /workspaces/:id` - ワークスペース詳細取得
- `PUT /workspaces/:id` - ワークスペース更新
- `DELETE /workspaces/:id` - ワークスペース削除
- `POST /workspaces/switch` - ワークスペース切り替え
- `GET /workspaces/:id/settings` - 設定取得
- `PUT /workspaces/:id/settings/*` - 各種設定更新

#### 4.2.7 メンバー管理API
- `GET /workspaces/:id/members` - メンバー一覧取得
- `POST /workspaces/:id/invitations` - 招待送信
- `DELETE /workspaces/:id/invitations/:inviteId` - 招待キャンセル
- `POST /invitations/:token/accept` - 招待承認
- `PUT /workspaces/:id/members/:memberId/role` - ロール変更
- `DELETE /workspaces/:id/members/:memberId` - メンバー削除

#### 4.2.8 監査ログAPI
- `GET /workspaces/:id/audit-logs` - 監査ログ一覧取得
- `GET /workspaces/:id/audit-logs/:logId` - 監査ログ詳細取得
- `POST /workspaces/:id/audit-logs/export` - エクスポート

---

## 5. セキュリティ要件

### 5.1 認証・認可

#### 5.1.1 パスワードポリシー
- 最小8文字
- 大文字・小文字・数字・記号を各1文字以上含む
- 過去3回のパスワードと異なる必要がある
- bcryptでハッシュ化（コスト係数12以上）
- ソルトは自動生成

#### 5.1.2 セッション管理
- JWTトークン使用（RS256アルゴリズム）
- アクセストークン有効期限: 1時間
- リフレッシュトークン有効期限: 30日（Remember Me時）/ 24時間（通常）
- トークンローテーション方式採用
- HTTPOnly Cookie使用（XSS対策）
- Secure Cookie使用（HTTPS限定）
- SameSite=Strict設定（CSRF対策）

#### 5.1.3 二要素認証
- TOTP（Time-based One-Time Password）方式
- 秘密鍵は暗号化して保存
- バックアップコードはハッシュ化して保存
- 6桁コード、30秒窓
- レート制限: 5回失敗でアカウントロック（15分）

#### 5.1.4 ロールベースアクセス制御（RBAC）
- ロール: Owner, Admin, Member, Viewer
- 権限: 詳細権限をロールに紐付け
- カスタム権限設定可能
- 最小権限の原則を適用

### 5.2 データ保護

#### 5.2.1 暗号化
- **転送時**: TLS 1.3使用
- **保存時**:
  - パスワード: bcryptでハッシュ化
  - 2FA秘密鍵: AES-256で暗号化
  - 支払い情報: Stripeに委託（PCI DSS準拠）
  - 機密データ: フィールドレベル暗号化

#### 5.2.2 個人情報保護
- GDPR準拠
- データ最小化原則
- 明示的な同意取得
- データポータビリティ対応
- 削除権（Right to be Forgotten）対応

### 5.3 攻撃対策

#### 5.3.1 ブルートフォース対策
- ログイン試行制限: 5回/15分
- 2FA試行制限: 5回/15分
- IP単位のレート制限
- アカウントロック機能
- CAPTCHA導入（試行回数超過時）

#### 5.3.2 インジェクション対策
- SQL Injection: パラメータ化クエリ使用
- XSS: 入力サニタイゼーション、出力エスケープ
- CSRF: トークン検証、SameSite Cookie
- Command Injection: 入力検証、ホワイトリスト方式

#### 5.3.3 その他
- セッション固定攻撃対策: ログイン時にセッションID再生成
- クリックジャッキング対策: X-Frame-Options設定
- MIME Sniffing対策: X-Content-Type-Options設定
- XSS Protection: Content-Security-Policy設定

### 5.4 監査・ログ

#### 5.4.1 監査ログ記録
- すべての認証イベント
- すべての権限変更
- すべての設定変更
- すべての失敗した操作
- IPアドレス、ユーザーエージェント記録

#### 5.4.2 ログ保持
- 監査ログ: 最低1年間
- アクセスログ: 90日間
- エラーログ: 30日間

### 5.5 コンプライアンス

#### 5.5.1 準拠規格
- GDPR（EU一般データ保護規則）
- CCPA（カリフォルニア州消費者プライバシー法）
- SOC 2 Type II
- ISO 27001（将来的に）

#### 5.5.2 プライバシーポリシー
- データ収集の明示
- 利用目的の明示
- 第三者共有の明示
- ユーザー権利の明示
- 問い合わせ先の明示

---

## 6. 技術スタック推奨

### 6.1 バックエンド
- **言語**: TypeScript（Node.js）
- **フレームワーク**: NestJS または Express
- **ORM**: Prisma または TypeORM
- **データベース**: PostgreSQL
- **キャッシュ**: Redis
- **キュー**: BullMQ（Redis基盤）
- **認証**: Passport.js + JWT
- **バリデーション**: class-validator

### 6.2 フロントエンド
- **言語**: TypeScript
- **フレームワーク**: Next.js（React）
- **状態管理**: Zustand または Redux Toolkit
- **UI ライブラリ**: Tailwind CSS + shadcn/ui
- **フォーム**: React Hook Form + Zod
- **APIクライアント**: TanStack Query（React Query）

### 6.3 インフラ
- **ホスティング**: Vercel（フロント）+ AWS/GCP（バック）
- **データベース**: AWS RDS または Supabase
- **ストレージ**: AWS S3 または Cloudflare R2
- **CDN**: Cloudflare
- **モニタリング**: Sentry + DataDog
- **CI/CD**: GitHub Actions

### 6.4 外部サービス
- **決済**: Stripe
- **メール**: SendGrid または AWS SES
- **認証**: 自前実装（Passport.js）
- **ファイルストレージ**: AWS S3
- **監視**: Sentry, DataDog

---

## 7. 実装優先順位

### Phase 1: 基本認証・アカウント管理（Week 1-2）
1. ユーザー登録・ログイン
2. プロファイル管理
3. パスワード管理
4. メール認証
5. セッション管理

### Phase 2: ワークスペース基盤（Week 3-4）
1. ワークスペース作成・管理
2. ワークスペース切り替え
3. 基本設定
4. メンバー招待（基本）

### Phase 3: サブスクリプション・請求（Week 5-6）
1. Stripe統合
2. プラン管理
3. サブスクリプション管理
4. インボイス管理
5. 使用量追跡

### Phase 4: チーム協業機能（Week 7-8）
1. コラボレーター管理（詳細）
2. ロール・権限管理
3. サブユーザー管理
4. チームダッシュボード

### Phase 5: セキュリティ・監査（Week 9-10）
1. 二要素認証
2. 監査ログ
3. IPアドレス制限
4. セキュリティ強化
5. アカウント一時停止

---

## 8. 付録

### 8.1 用語集
- **ワークスペース**: プロジェクトやチームの作業領域
- **コラボレーター**: 招待により参加したメンバー
- **サブユーザー**: 管理下で作成されたアカウント
- **ロール**: 権限セットの集合体
- **TOTP**: 時間ベースのワンタイムパスワード
- **RBAC**: ロールベースアクセス制御

### 8.2 参考資料
- [ClickFunnels公式ドキュメント](https://support.myclickfunnels.com/)
- [Stripe API ドキュメント](https://stripe.com/docs/api)
- [GDPR 準拠ガイド](https://gdpr.eu/)
- [OWASP セキュリティガイド](https://owasp.org/)

### 8.3 更新履歴
- 2025-12-09: 初版作成

---

**ドキュメント作成日**: 2025年12月9日
**バージョン**: 1.0
**作成者**: Claude (Anthropic)
**プロジェクト**: Sakaduki (ClickFunnels Clone)
