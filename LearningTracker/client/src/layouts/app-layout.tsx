import { ReactNode, useState } from 'react';
import Sidebar from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-surface border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-bold text-xl flex items-center">
            <span className="mr-2">⏱️</span>
            TimeTrack
          </h1>
          <button 
            className="p-2 rounded-md hover:bg-gray-800 transition-all"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
