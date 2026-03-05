import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stromverbrauch & Stromkosten berechnen für jedes Gerät | kilowattly',
  description: 'Berechnen Sie exakt den Stromverbrauch und die jährlichen Stromkosten für über 1.000 Haushaltsgeräte. Kostenlos, sofort und ohne Anmeldung.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${jakarta.variable} font-sans antialiased text-slate-800 bg-slate-50 min-h-screen flex flex-col selection:bg-brand-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
