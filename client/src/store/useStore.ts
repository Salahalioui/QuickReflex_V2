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
  
  // MIT actions
  saveMITResult: (mitData: { meanMIT: number; sdMIT: number; reliability: number; validTaps: number }) => Promise<void>;
  getMITResult: () => Promise<{ meanMIT: number; sdMIT: number; reliability: number; validTaps: number } | null>;
  
  // Data management actions
  exportAllData: () => Promise<void>;
  clearAllData: () => Promise<void>;
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
      setCurrentProfile: (profile) => {
        // Check if profile has valid calibration data
        const isProfileCalibrated = profile && 
          profile.calibrationTimestamp && 
          profile.refreshRateHz && 
          profile.touchSamplingHz && 
          profile.deviceLatencyOffsetMs !== undefined;
        
        set({ 
          currentProfile: profile,
          isCalibrated: !!isProfileCalibrated,
          // Update calibration data from profile if available
          ...(isProfileCalibrated && {
            calibrationData: {
              refreshRateHz: profile.refreshRateHz,
              touchSamplingHz: profile.touchSamplingHz,
              deviceLatencyOffsetMs: profile.deviceLatencyOffsetMs,
            }
          })
        });
      },
      
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
        
        // If updating the current profile, refresh its calibration status
        const currentProfile = get().currentProfile;
        if (currentProfile && currentProfile.id === id) {
          // Reload the updated profile
          const profiles = await db.getProfiles();
          const updatedProfile = profiles.find(p => p.id === id);
          if (updatedProfile) {
            get().setCurrentProfile(updatedProfile);
          }
        }
      },
      
      loadProfiles: async () => {
        const profiles = await db.getProfiles();
        set({ profiles });
        
        if (!get().currentProfile && profiles.length > 0) {
          // Use setCurrentProfile to properly handle calibration status
          get().setCurrentProfile(profiles[0]);
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
          movementInitiationTime: null,
          calibrationLimitations: null,
          crossModalWarningShown: false,
          completedAt: null,
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
        const { currentSession, testRunner } = get();
        if (!currentSession || !testRunner) return;
        
        // Get all trials for this session
        const trials = await db.getTrialsBySession(currentSession.id);
        
        // Filter out practice trials for outlier cleaning
        const testTrials = trials.filter(trial => !trial.isPractice);
        
        if (testTrials.length > 0) {
          // Apply outlier cleaning using the cleanReactionTimes function
          const { cleanReactionTimes } = await import('@/lib/timing');
          const validTrials = testTrials.filter(trial => trial.rtRaw !== null);
          const cleaningResults = cleanReactionTimes(validTrials as any[], {
            minRT: 100,
            maxRT: testRunner.configuration.type === 'GO_NO_GO' ? 1000 : 1500,
            removeMinMax: true,
            method: testRunner.configuration.outlierMethod || 'mad',
            stdDeviations: 2.5,
            madThreshold: 3.0,
            trimPercentage: 2.5,
            iqrMultiplier: 1.5,
          });
          
          // Update trials with exclusion flags
          for (let i = 0; i < cleaningResults.length; i++) {
            const result = cleaningResults[i];
            const trial = testTrials[result.index];
            
            if (result.excluded) {
              await db.updateTrial(trial.id, {
                excludedFlag: true,
                exclusionReason: result.reason || 'Unknown',
              });
            }
          }
        }
        
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
      
      // MIT actions
      saveMITResult: async (mitData) => {
        const { currentProfile } = get();
        if (!currentProfile) throw new Error('No profile selected');
        
        // Create a special MIT test session to store the results
        await db.createTestSession({
          profileId: currentProfile.id,
          testType: 'MIT',
          stimulusType: 'tactile',
          metadata: { 
            mitData,
            sessionType: 'MIT_CALIBRATION'
          },
          status: 'completed',
          movementInitiationTime: mitData.meanMIT,
          calibrationLimitations: null,
          crossModalWarningShown: false,
          completedAt: new Date(),
        });
        
        console.log('MIT result saved:', mitData);
      },
      
      getMITResult: async () => {
        const { currentProfile } = get();
        if (!currentProfile) return null;
        
        // Find the most recent MIT session for this profile
        const sessions = await db.getTestSessions();
        const userSessions = sessions.filter((s: any) => s.profileId === currentProfile.id);
        const mitSessions = userSessions
          .filter((s: any) => s.testType === 'MIT' && s.movementInitiationTime)
          .sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
        
        if (mitSessions.length === 0) return null;
        
        const latestMitSession = mitSessions[0];
        const mitData = (latestMitSession.metadata as any)?.mitData;
        
        if (mitData && latestMitSession.movementInitiationTime) {
          return {
            meanMIT: latestMitSession.movementInitiationTime,
            sdMIT: mitData.sdMIT || 0,
            reliability: mitData.reliability || 0,
            validTaps: mitData.validTaps || 0,
          };
        }
        
        return null;
      },
      
      // Data management actions
      exportAllData: async () => {
        const { currentProfile } = get();
        if (!currentProfile) {
          throw new Error('No profile selected');
        }
        
        // Get all data from the database
        const allData = await db.getAllData();
        
        // Filter data for current profile
        const userSessions = allData.sessions.filter(session => session.profileId === currentProfile.id);
        const userTrials = allData.trials.filter(trial => 
          userSessions.some(session => session.id === trial.sessionId)
        );
        
        // Get MIT data
        const mitResult = await get().getMITResult();
        
        // Create export data structure
        const exportData = {
          profile: currentProfile,
          sessions: userSessions,
          trials: userTrials,
          mitData: mitResult,
          metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            deviceInfo: navigator.userAgent,
          },
        };
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quickreflex-data-${currentProfile.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      
      clearAllData: async () => {
        // Clear all data from IndexedDB
        await db.clearAllData();
        
        // Reset store state
        set({
          currentProfile: null,
          profiles: [],
          recentResults: [],
          testRunner: null,
          currentSession: null,
          isCalibrated: false,
          calibrationData: defaultCalibration,
        });
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
