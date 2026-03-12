import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LocaleProvider } from '@/components/providers/locale-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { AiPanel } from '@/components/ai/ai-panel';
import { Toaster } from 'sonner';
import zhMessages from '@/i18n/messages/zh.json';
import { ServiceWorkerCleanup } from '@/components/service-worker-cleanup';

import { AuthProvider } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'ReportHub — 21 天晨读营数据展示与分析后台',
  description:
    '为 21 天 7 个习惯晨读营构建的数据 BI 后台，支持数据浏览、多维度统计分析和 AI 深度洞察。',
  keywords: ['晨读营', '数据分析', 'BI', '读书会', 'ReportHub'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LocaleProvider initialLocale="zh" initialMessages={zhMessages}>
            <ServiceWorkerCleanup />
            <AuthProvider>
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <main className="flex-1 min-w-0 overflow-auto">
                    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                      {children}
                    </div>
                  </main>
                </div>
                <AiPanel />
              </ProtectedRoute>
            </AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
