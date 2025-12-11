import { auth } from '@/lib/auth/auth';
import { DashboardProviders } from '@/components/providers/dashboard-providers';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

// 開発環境用モックセッション
const DEV_MOCK_SESSION = {
  user: {
    id: 'dev-test-user',
    name: 'Dev Test',
    email: 'dev-test@example.com',
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 開発環境ではモックセッションを使用
  const activeSession = session || DEV_MOCK_SESSION;

  return (
    <DashboardProviders session={activeSession}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DashboardProviders>
  );
}
