import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VitalPath – Your Health Journey',
  description: '6-month preventive health coaching programme',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
