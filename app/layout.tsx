import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AGI Sales Funnels Sakaduki',
  description: 'ClickFunnels 2.0 + UTAGE LINE Clone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
