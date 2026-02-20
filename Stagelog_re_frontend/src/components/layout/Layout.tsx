import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 사이드바 (모바일용) */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default Layout;
