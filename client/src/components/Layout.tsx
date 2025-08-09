import { ReactNode } from 'react';
import { useStore } from '@/store/useStore';
import BottomNavigation from './BottomNavigation';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentProfile } = useStore();
  const [location, setLocation] = useLocation();
  
  const isTestRunning = location === '/test/running';

  if (isTestRunning) {
    // Full-screen test mode without navigation
    return <div className="test-mode">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white elevation-2 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="material-icons text-primary text-3xl mr-3">psychology</span>
          <div>
            <h1 className="text-xl font-medium text-gray-900">QuickReflex</h1>
            <p className="text-xs text-gray-600">
              {currentProfile ? `${currentProfile.name}` : 'No Profile Selected'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setLocation('/settings')}
          data-testid="button-settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
