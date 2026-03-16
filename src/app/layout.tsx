import './globals.css';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.remotejobbay.com'),
  title: 'RemoteJobBay',
  description: 'High-quality, fully remote jobs that you can do from any country',
  keywords: 'remote jobs, work from home, global opportunities, remote work',
  openGraph: {
    title: 'RemoteJobBay - Remote Jobs Worldwide',
    description: 'Discover the best remote jobs from anywhere in the world.',
    url: 'https://www.remotejobbay.com',
    siteName: 'RemoteJobBay',
    images: [
      {
        url: 'https://www.remotejobbay.com/default-logo.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemoteJobBay - Remote Jobs Worldwide',
    description: 'Discover the best remote jobs from anywhere in the world.',
    images: ['https://www.remotejobbay.com/default-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-9W914ZELWS"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9W914ZELWS');
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} bg-gradient-to-br from-teal-50 via-indigo-50 to-orange-50 text-gray-900 min-h-screen font-inter`}>
        <UserProvider>
          <div className="relative min-h-screen backdrop-blur-md bg-white/30">
            <Header />
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
              {children}
            </main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
