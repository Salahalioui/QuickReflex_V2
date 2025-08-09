import { ReactNode } from "react";
import { useStore } from "@/store/useStore";
import BottomNavigation from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentProfile } = useStore();
  const [location, setLocation] = useLocation();

  const isTestRunning = location === "/test/running";

  if (isTestRunning) {
    // Full-screen test mode without navigation
    return <div className="test-mode">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col pwa-container">
      {/* Header */}
      <header className="performance-card elevation-2 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <span className="material-icons text-white text-xl">bolt</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              QuickReflex
            </h1>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {currentProfile
                ? `${currentProfile.name}`
                : "No Profile Selected"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 text-gray-700 dark:text-gray-300"
          onClick={() => setLocation("/settings")}
          data-testid="button-settings"
        >
          <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
