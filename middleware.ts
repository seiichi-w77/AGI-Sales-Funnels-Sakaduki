import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// 開発環境フラグ（テスト用に認証をスキップ）
const SKIP_AUTH_FOR_DEV = true;

// 認証が必要なパス
const protectedPaths = ['/dashboard', '/products', '/contacts', '/funnels', '/email', '/workflows', '/courses', '/line', '/analytics', '/affiliates', '/billing', '/settings', '/workspaces'];

// 認証不要なパス
const _publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/api/auth'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // APIリクエストはスキップ（各API Routeで認証チェック）
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 静的ファイルはスキップ
  if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // localeを除去したパスを取得
  const pathWithoutLocale = pathname.replace(/^\/(ja|en)/, '') || '/';

  // 保護されたパスかチェック
  const isProtectedPath = protectedPaths.some(path => pathWithoutLocale.startsWith(path));

  if (isProtectedPath && !SKIP_AUTH_FOR_DEV) {
    // セッショントークンをチェック
    const sessionToken = request.cookies.get('next-auth.session-token') ||
                         request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      // 未認証の場合はログインページにリダイレクト
      const locale = pathname.match(/^\/(ja|en)/)?.[1] || 'ja';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // i18nミドルウェアを実行
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next`, `/_vercel`, or contain a dot (e.g. `favicon.ico`)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
