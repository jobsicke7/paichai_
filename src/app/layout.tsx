import type { Metadata } from 'next';
import { ThemeProvider } from '@/component/ThemeProvider';
import GNB from '@/component/GNB';
import FNB from '@/component/FNB';
import MobileNavigation from '@/component/MobileNavigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paichai.',
  description: '배재고등학교 학생 지원 사이트입니다',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <GNB />
          <main>{children}</main>
          <FNB />
          <MobileNavigation />
        </ThemeProvider>
      </body>
    </html>
  );
}