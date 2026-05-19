import { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import FooterWrapper from '@/components/FooterWrapper';
import ChatbotWidget from '@/components/ChatbotWidget';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mqnewstoday.my.id'),
  title: {
    default: 'MQ News Today — Truth & Clarity',
    template: '%s | MQ News Today',
  },
  description: 'MQ News Today berdedikasi untuk menyajikan informasi yang sering luput dari media arus utama. Fokus pada kebenaran dan analisis mendalam tentang geopolitik, eskatologi, dan mimpi Muhammad Qasim.',
  keywords: ['berita', 'news', 'MQ News Today', 'geopolitik', 'eskatologi', 'mimpi qasim', 'mubasyirat', 'timur tengah', 'truth and clarity'],
  authors: [{ name: 'MQ News Today' }],
  creator: 'MQ News Today',
  publisher: 'MQ News Today',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://mqnewstoday.my.id',
    siteName: 'MQ News Today',
    title: 'MQ News Today — Truth & Clarity',
    description: 'Portal berita yang berdedikasi menyajikan informasi yang sering luput dari media arus utama.',
    images: [
      {
        url: '/LogoMQN144.png',
        width: 144,
        height: 144,
        alt: 'MQ News Today',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MQ News Today — Truth & Clarity',
    description: 'Portal berita yang berdedikasi menyajikan informasi yang sering luput dari media arus utama.',
    images: ['/LogoMQN144.png'],
  },
  icons: {
    icon: '/LogoMQN144.png',
    shortcut: '/LogoMQN144.png',
    apple: '/LogoMQN144.png',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('mq_theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  const fontSize = localStorage.getItem('mq_font_size') || 'medium';
                  document.documentElement.setAttribute('data-font-size', fontSize);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main id="main-content">
            {children}
          </main>
          <FooterWrapper />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

