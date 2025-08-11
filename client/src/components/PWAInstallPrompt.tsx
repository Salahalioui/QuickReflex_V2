import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has previously dismissed the prompt
      const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA install accepted');
      } else {
        console.log('PWA install dismissed');
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleLaterClick = () => {
    setShowPrompt(false);
    // Don't set dismissed flag, so it can appear again later
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md shadow-lg border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-semibold">Install QuickReflex</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs text-gray-600 dark:text-gray-300">
          Install as an app for the best experience - works offline and faster performance
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            Install App
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLaterClick}
            className="text-xs h-8 border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Later
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ✓ Works offline • ✓ Faster loading • ✓ App-like experience
        </div>
      </CardContent>
    </Card>
  );
}