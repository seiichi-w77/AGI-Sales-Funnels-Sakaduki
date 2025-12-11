'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
import {
  User,
  Shield,
  CreditCard,
  Users,
  Bell,
  Key,
  Smartphone,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Clock,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/i18n';

// Timezone options
const timezones = [
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
];

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profileForm, setProfileForm] = useState({
    firstName: session?.user?.name?.split(' ')[0] || 'Dev',
    lastName: session?.user?.name?.split(' ')[1] || 'User',
    email: session?.user?.email || 'dev@example.com',
    phone: '',
    timezone: 'Asia/Tokyo',
    language: 'ja',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetupMode, setIs2FASetupMode] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  const [manualEntryKey] = useState('JBSWY3DPEHPK3PXP');

  // Notification state
  const [notifications, setNotifications] = useState({
    emailMarketing: true,
    emailSecurity: true,
    emailUpdates: false,
    pushNotifications: true,
    weeklyDigest: true,
  });

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 12.5;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 12.5;
    return Math.min(strength, 100);
  }, []);

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile image updated');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsPasswordSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength(0);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Handle 2FA setup
  const handleEnable2FA = () => {
    setIs2FASetupMode(true);
    // Generate mock backup codes
    setBackupCodes([
      'ABCD-1234-EFGH',
      'IJKL-5678-MNOP',
      'QRST-9012-UVWX',
      'YZAB-3456-CDEF',
      'GHIJ-7890-KLMN',
      'OPQR-1234-STUV',
      'WXYZ-5678-ABCD',
      'EFGH-9012-IJKL',
      'MNOP-3456-QRST',
      'UVWX-7890-YZAB',
    ]);
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIs2FAEnabled(true);
      setIs2FASetupMode(false);
      toast.success('Two-factor authentication enabled');
    } catch {
      toast.error('Invalid verification code');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIs2FAEnabled(false);
      toast.success('Two-factor authentication disabled');
    } catch {
      toast.error('Failed to disable 2FA');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">アカウント設定と個人情報を管理</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">セキュリティ</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">{t('billing')}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('team')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('notifications')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                プロフィール情報
              </CardTitle>
              <CardDescription>個人情報とプロフィール画像を更新</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || session?.user?.image || ''} />
                  <AvatarFallback className="text-2xl">
                    {profileForm.firstName[0]}{profileForm.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      画像を変更
                    </Button>
                    {profileImage && (
                      <Button
                        variant="ghost"
                        onClick={() => setProfileImage(null)}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        削除
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF形式。最大5MB。
                  </p>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">姓</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">名</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    メールアドレスの変更はサポートにお問い合わせください
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    電話番号（任意）
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+81 90-1234-5678"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Regional Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    タイムゾーン
                  </Label>
                  <Select
                    value={profileForm.timezone}
                    onValueChange={(value) => setProfileForm(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <LanguageSwitcher variant="full" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={isProfileSaving}>
                  {isProfileSaving ? '保存中...' : '変更を保存'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                パスワード変更
              </CardTitle>
              <CardDescription>定期的にパスワードを更新してアカウントを保護</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.newPassword && (
                  <div className="space-y-1">
                    <Progress value={passwordStrength} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      パスワード強度: {passwordStrength < 50 ? '弱い' : passwordStrength < 75 ? '普通' : '強い'}
                    </p>
                  </div>
                )}
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                    • 8文字以上
                  </li>
                  <li className={passwordForm.newPassword.match(/[A-Z]/) ? 'text-green-600' : ''}>
                    • 大文字を含む
                  </li>
                  <li className={passwordForm.newPassword.match(/[a-z]/) ? 'text-green-600' : ''}>
                    • 小文字を含む
                  </li>
                  <li className={passwordForm.newPassword.match(/[0-9]/) ? 'text-green-600' : ''}>
                    • 数字を含む
                  </li>
                  <li className={passwordForm.newPassword.match(/[^a-zA-Z0-9]/) ? 'text-green-600' : ''}>
                    • 記号を含む
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-destructive">パスワードが一致しません</p>
                )}
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={isPasswordSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {isPasswordSaving ? '更新中...' : 'パスワードを更新'}
              </Button>
            </CardContent>
          </Card>

          {/* 2FA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                二要素認証（2FA）
              </CardTitle>
              <CardDescription>認証アプリを使用してアカウントのセキュリティを強化</CardDescription>
            </CardHeader>
            <CardContent>
              {!is2FASetupMode ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${is2FAEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <Shield className={`h-5 w-5 ${is2FAEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        ステータス:
                        <Badge variant={is2FAEnabled ? 'default' : 'secondary'}>
                          {is2FAEnabled ? '有効' : '無効'}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {is2FAEnabled
                          ? 'アカウントは二要素認証で保護されています'
                          : '認証アプリで2FAを有効にしてアカウントを保護'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={is2FAEnabled ? 'destructive' : 'default'}
                    onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                  >
                    {is2FAEnabled ? '2FAを無効化' : '2FAを有効化'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="font-medium">1. 認証アプリでQRコードをスキャン</p>
                      <div className="bg-white p-4 rounded-lg border inline-block">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">または手動でキーを入力:</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                            {manualEntryKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(manualEntryKey, 'キー')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="font-medium">2. 認証コードを入力</p>
                      <div className="space-y-2">
                        <Input
                          placeholder="6桁のコードを入力"
                          value={twoFACode}
                          onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                        <Button onClick={handleVerify2FA} className="w-full">
                          <Check className="h-4 w-4 mr-2" />
                          認証して有効化
                        </Button>
                      </div>
                    </div>
                  </div>

                  {backupCodes.length > 0 && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          バックアップコード
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(backupCodes.join('\n'), 'バックアップコード')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          コピー
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        認証アプリにアクセスできない場合に使用できます。安全な場所に保管してください。
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <code key={index} className="bg-background px-2 py-1 rounded text-sm font-mono">
                            {code}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="ghost" onClick={() => setIs2FASetupMode(false)}>
                    キャンセル
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Pause/Delete Section */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                危険な操作
              </CardTitle>
              <CardDescription>これらの操作は取り消しできません</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">アカウントを一時停止</p>
                  <p className="text-sm text-muted-foreground">
                    一時的にアカウントを停止します。データは90日間保持されます。
                  </p>
                </div>
                <Button variant="outline">一時停止</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <p className="font-medium text-destructive">アカウントを削除</p>
                  <p className="text-sm text-muted-foreground">
                    アカウントとすべてのデータを完全に削除します
                  </p>
                </div>
                <Button variant="destructive">削除する</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                現在のプラン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Badge className="mb-2">Pro プラン</Badge>
                  <p className="text-2xl font-bold">¥4,980<span className="text-sm font-normal text-muted-foreground">/月</span></p>
                  <p className="text-sm text-muted-foreground">次回請求日: 2025年1月10日</p>
                </div>
                <Button variant="outline">プランを変更</Button>
              </div>

              <div className="mt-6 space-y-4">
                <p className="font-medium">使用状況</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ファネル</span>
                      <span>5 / 10</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>訪問者</span>
                      <span>8,500 / 10,000</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>メール送信</span>
                      <span>2,100 / 5,000</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>支払い方法</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-2 rounded">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Visa •••• 4242</p>
                    <p className="text-sm text-muted-foreground">有効期限: 12/26</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">デフォルト</Badge>
                  <Button variant="ghost" size="sm">編集</Button>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <CreditCard className="h-4 w-4 mr-2" />
                カードを追加
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>請求履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: '2024年12月10日', amount: '¥4,980', status: '支払い済み' },
                  { date: '2024年11月10日', amount: '¥4,980', status: '支払い済み' },
                  { date: '2024年10月10日', amount: '¥4,980', status: '支払い済み' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">Pro プラン - 月額</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{invoice.amount}</span>
                      <Badge variant="outline" className="text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                チームメンバー
              </CardTitle>
              <CardDescription>ワークスペースのメンバーを管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Dev User', email: 'dev@example.com', role: 'オーナー', avatar: 'D' },
                  { name: '田中 太郎', email: 'tanaka@example.com', role: '管理者', avatar: '田' },
                  { name: '鈴木 花子', email: 'suzuki@example.com', role: 'メンバー', avatar: '鈴' },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'オーナー' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {member.role !== 'オーナー' && (
                        <Button variant="ghost" size="sm">編集</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                <Users className="h-4 w-4 mr-2" />
                メンバーを招待
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知設定
              </CardTitle>
              <CardDescription>メールやプッシュ通知の設定を管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">メール通知</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">マーケティングメール</p>
                      <p className="text-sm text-muted-foreground">新機能やプロモーション情報</p>
                    </div>
                    <Switch
                      checked={notifications.emailMarketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMarketing: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">セキュリティ通知</p>
                      <p className="text-sm text-muted-foreground">ログイン試行やパスワード変更</p>
                    </div>
                    <Switch
                      checked={notifications.emailSecurity}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailSecurity: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">製品アップデート</p>
                      <p className="text-sm text-muted-foreground">新機能やバグ修正のお知らせ</p>
                    </div>
                    <Switch
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">週間レポート</p>
                      <p className="text-sm text-muted-foreground">週次のアクティビティサマリー</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">プッシュ通知</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ブラウザ通知</p>
                    <p className="text-sm text-muted-foreground">重要なアクティビティをリアルタイムで通知</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
              </div>

              <Button onClick={() => toast.success('通知設定を保存しました')}>
                設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
