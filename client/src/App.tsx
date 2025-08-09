import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import { db } from "@/lib/db";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Calibration from "@/pages/Calibration";
import TestModule from "@/pages/TestModule";
import Results from "@/pages/Results";
import Settings from "@/pages/Settings";

function App() {
  const { loadProfiles, isCalibrated } = useStore();

  useEffect(() => {
    // Initialize database and load data
    const initializeApp = async () => {
      try {
        await db.init();
        await loadProfiles();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, [loadProfiles]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="pwa-container bg-background-app">
          {/* PWA Status Bar */}
          <div className="bg-primary text-white px-4 py-1 text-sm text-center">
            <span className="material-icons text-sm align-middle mr-1">
              {navigator.onLine ? 'wifi' : 'wifi_off'}
            </span>
            {navigator.onLine ? 'Online' : 'Offline Mode - Data synced locally'}
          </div>
          
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/calibration" component={Calibration} />
              <Route path="/test/:type" component={TestModule} />
              <Route path="/results" component={Results} />
              <Route path="/settings" component={Settings} />
              
              {/* Catch-all route */}
              <Route>
                <Dashboard />
              </Route>
            </Switch>
          </Layout>
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
