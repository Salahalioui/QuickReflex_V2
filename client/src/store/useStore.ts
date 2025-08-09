import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db';
import type { 
  Profile, 
  TestSession, 
  Trial, 
  TestResult, 
  NavigationState, 
  AppSettings, 
  TestRunnerState,
  TestConfiguration,
  CalibrationData 
} from '@/types';

interface AppStore extends NavigationState {
  // Profile state
  currentProfile: Profile | null;
  profiles: Profile[];
  
  // Settings
  settings: AppSettings;
  
  // Test state
  testRunner: TestRunnerState | null;
  currentSession: TestSession | null;
  recentResults: TestResult[];
  
  // Calibration
  calibrationData: CalibrationData;
  isCalibrated: boolean;
  
  // Actions
  setCurrentPage: (page: NavigationState['currentPage']) => void;
  setCurrentProfile: (profile: Profile | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Calibration actions
  updateCalibration: (data: CalibrationData) => Promise<void>;
  saveCalibration: () => Promise<void>;
  
  // Profile actions
  createProfile: (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Profile>;
  updateProfile: (id: string, profileData: Partial<Profile>) => Promise<void>;
  loadProfiles: () => Promise<void>;
  
  // Test actions
  startTest: (config: TestConfiguration) => Promise<void>;
  completeTest: () => Promise<void>;
  updateTestRunner: (state: Partial<TestRunnerState>) => void;
  recordTrial: (trialData: Omit<Trial, 'id' | 'createdAt'>) => Promise<void>;
  
  // Results actions
  loadRecentResults: () => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
}

const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
};

const defaultCalibration: CalibrationData = {
  refreshRateHz: 60,
  touchSamplingHz: 120,
  deviceLatencyOffsetMs: 12.5, // (1000/60)/2 + (1000/120)/2
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPage: 'dashboard',
      currentProfile: null,
      profiles: [],
      settings: defaultSettings,
      testRunner: null,
      currentSession: null,
      recentResults: [],
      calibrationData: defaultCalibration,
      isCalibrated: false,
      
      // Navigation actions
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Profile actions
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      
      createProfile: async (profileData) => {
        const profile = await db.createProfile({
          ...profileData,
          refreshRateHz: get().calibrationData.refreshRateHz,
          touchSamplingHz: get().calibrationData.touchSamplingHz,
          deviceLatencyOffsetMs: get().calibrationData.deviceLatencyOffsetMs,
          deviceInfoString: navigator.userAgent,
        });
        
        set((state) => ({
          profiles: [...state.profiles, profile],
          currentProfile: profile,
        }));
        
        return profile;
      },
      
      updateProfile: async (id, profileData) => {
        await db.updateProfile(id, profileData);
        await get().loadProfiles();
      },
      
      loadProfiles: async () => {
        const profiles = await db.getProfiles();
        set({ profiles });
        
        if (!get().currentProfile && profiles.length > 0) {
          set({ currentProfile: profiles[0] });
        }
      },
      
      // Settings actions
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      // Calibration actions
      updateCalibration: async (data) => {
        const deviceLatencyOffsetMs = (1000 / data.refreshRateHz) / 2 + (1000 / data.touchSamplingHz) / 2;
        
        set({
          calibrationData: {
            ...data,
            deviceLatencyOffsetMs,
          },
        });
      },
      
      saveCalibration: async () => {
        const { currentProfile, calibrationData } = get();
        
        if (currentProfile) {
          await get().updateProfile(currentProfile.id, {
            refreshRateHz: calibrationData.refreshRateHz,
            touchSamplingHz: calibrationData.touchSamplingHz,
            deviceLatencyOffsetMs: calibrationData.deviceLatencyOffsetMs,
            calibrationTimestamp: new Date(),
          });
        }
        
        set({ isCalibrated: true });
      },
      
      // Test actions
      startTest: async (config) => {
        const { currentProfile } = get();
        if (!currentProfile) throw new Error('No profile selected');
        
        const session = await db.createTestSession({
          profileId: currentProfile.id,
          testType: config.type,
          stimulusType: config.stimulusType,
          metadata: { configuration: config },
          status: 'in_progress',
        });
        
        set({
          currentSession: session,
          testRunner: {
            isActive: true,
            currentTrial: 0,
            totalTrials: config.totalTrials,
            configuration: config,
            showCue: false,
            awaitingResponse: false,
            trialStartTime: 0,
            practiceMode: true,
          },
          currentPage: 'test-running',
        });
      },
      
      completeTest: async () => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        await db.updateTestSession(currentSession.id, {
          completedAt: new Date(),
          status: 'completed',
        });
        
        set({
          testRunner: null,
          currentSession: null,
          currentPage: 'results',
        });
        
        await get().loadRecentResults();
      },
      
      updateTestRunner: (state) =>
        set((prevState) => ({
          testRunner: prevState.testRunner ? { ...prevState.testRunner, ...state } : null,
        })),
      
      recordTrial: async (trialData) => {
        const { currentSession } = get();
        if (!currentSession) throw new Error('No active session');
        
        await db.createTrial({
          ...trialData,
          sessionId: currentSession.id,
        });
      },
      
      // Results actions
      loadRecentResults: async () => {
        const { currentProfile } = get();
        if (!currentProfile) return;
        
        const results = await db.getRecentResults(currentProfile.id);
        set({ recentResults: results });
      },
      
      exportData: async (format) => {
        const { currentProfile } = get();
        if (!currentProfile) return;
        
        // Export implementation would go here
        console.log(`Exporting data in ${format} format for profile:`, currentProfile.id);
      },
    }),
    {
      name: 'quickreflex-storage',
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        settings: state.settings,
        calibrationData: state.calibrationData,
        isCalibrated: state.isCalibrated,
      }),
    }
  )
);
