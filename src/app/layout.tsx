// src/app/layout.tsx

import './globals.css';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // ✅ import the Footer component

export const metadata = {
  title: 'remotejobbay',
  description: 'High-quality, fully remote jobs that you can do from any country',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <UserProvider>
          <Header />

          {/* Page Content */}
          {children}

          {/* ✅ Use the reusable Footer component */}
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
