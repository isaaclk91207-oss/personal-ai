import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ChatPage } from '../../pages/ChatPage';
import { MemoryPage } from '../../pages/MemoryPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { ToastContainer } from '../ui/Toast';
import type { PageView } from '../../types';

export function MainLayout() {
  const [activePage, setActivePage] = useState<PageView>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'chat':
        return <ChatPage />;
      case 'memories':
        return <MemoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-in-right">
            <Sidebar activePage={activePage} onPageChange={(page) => { setActivePage(page); setSidebarOpen(false); }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:pt-0 pt-[60px] pb-[64px] lg:pb-0">
        {renderPage()}
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        activePage={activePage}
        onPageChange={setActivePage}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
