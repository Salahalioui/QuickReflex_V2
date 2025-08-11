import type { Profile, TestSession, Trial, TestTypeEnum, StimulusTypeEnum } from '@shared/schema';

export * from '@shared/schema';

// UI-specific types
export interface CalibrationData {
  refreshRateHz: number;
  touchSamplingHz: number;
  deviceLatencyOffsetMs: number;
  isCustomRefreshRate?: boolean;
}

export interface TestConfiguration {
  type: TestTypeEnum;
  stimulusType: StimulusTypeEnum;
  totalTrials: number;
  practiceTrials: number;
  isiMin: number; // Inter-stimulus interval minimum (ms)
  isiMax: number; // Inter-stimulus interval maximum (ms)
}

export interface TestResult {
  sessionId: string;
  type: TestTypeEnum;
  stimulusType: StimulusTypeEnum;
  trials: Trial[];
  meanRT: number;
  sdRT: number;
  validTrials: number;
  outliers: number;
  accuracy?: number; // For Go/No-Go tests
  completedAt: Date;
}

export interface NavigationState {
  currentPage: 'dashboard' | 'tests' | 'results' | 'profile' | 'calibration' | 'test-running';
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
}

export interface ExportData {
  profile: Profile;
  sessions: TestSession[];
  trials: Trial[];
  metadata: {
    exportDate: string;
    version: string;
    deviceInfo: string;
  };
}

// Test runner state
export interface TestRunnerState {
  isActive: boolean;
  currentTrial: number;
  totalTrials: number;
  configuration: TestConfiguration;
  showCue: boolean;
  awaitingResponse: boolean;
  trialStartTime: number;
  responseTime?: number;
  practiceMode: boolean;
}

export interface MITResult {
  meanMIT: number;
  sdMIT: number;
  reliability: number;
  validTaps: number;
}
