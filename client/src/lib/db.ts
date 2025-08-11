import type { Profile, TestSession, Trial, TestResult } from '@/types';

class IndexedDBStorage {
  private dbName = 'QuickReflexDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
          profileStore.createIndex('name', 'name', { unique: false });
        }
        
        // Test sessions store
        if (!db.objectStoreNames.contains('testSessions')) {
          const sessionStore = db.createObjectStore('testSessions', { keyPath: 'id' });
          sessionStore.createIndex('profileId', 'profileId', { unique: false });
          sessionStore.createIndex('testType', 'testType', { unique: false });
          sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
        }
        
        // Trials store
        if (!db.objectStoreNames.contains('trials')) {
          const trialStore = db.createObjectStore('trials', { keyPath: 'id' });
          trialStore.createIndex('sessionId', 'sessionId', { unique: false });
          trialStore.createIndex('trialNumber', 'trialNumber', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // Profile operations
  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const db = await this.ensureDB();
    const now = new Date();
    const profile: Profile = {
      ...profileData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      const request = store.add(profile);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(profile);
    });
  }

  async getProfiles(): Promise<Profile[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const profile = getRequest.result;
        if (profile) {
          const updatedProfile = { 
            ...profile, 
            ...updates, 
            updatedAt: new Date() 
          };
          const putRequest = store.put(updatedProfile);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          reject(new Error('Profile not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Test session operations
  async createTestSession(sessionData: Omit<TestSession, 'id' | 'startedAt'>): Promise<TestSession> {
    const db = await this.ensureDB();
    const session: TestSession = {
      ...sessionData,
      id: this.generateId(),
      startedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['testSessions'], 'readwrite');
      const store = transaction.objectStore('testSessions');
      const request = store.add(session);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(session);
    });
  }

  async updateTestSession(id: string, updates: Partial<TestSession>): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['testSessions'], 'readwrite');
      const store = transaction.objectStore('testSessions');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (session) {
          const updatedSession = { ...session, ...updates };
          const putRequest = store.put(updatedSession);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          reject(new Error('Session not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getTestSessions(): Promise<TestSession[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['testSessions'], 'readonly');
      const store = transaction.objectStore('testSessions');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Trial operations
  async createTrial(trialData: Omit<Trial, 'id' | 'createdAt'>): Promise<Trial> {
    const db = await this.ensureDB();
    const trial: Trial = {
      ...trialData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trials'], 'readwrite');
      const store = transaction.objectStore('trials');
      const request = store.add(trial);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(trial);
    });
  }

  async getTrialsBySession(sessionId: string): Promise<Trial[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trials'], 'readonly');
      const store = transaction.objectStore('trials');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateTrial(trialId: string, updates: Partial<Trial>): Promise<Trial> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trials'], 'readwrite');
      const store = transaction.objectStore('trials');
      const getRequest = store.get(trialId);
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const trial = getRequest.result;
        if (!trial) {
          reject(new Error('Trial not found'));
          return;
        }
        
        const updatedTrial = { ...trial, ...updates };
        const putRequest = store.put(updatedTrial);
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve(updatedTrial);
      };
    });
  }

  // Results aggregation
  async getRecentResults(profileId: string, limit: number = 10): Promise<TestResult[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['testSessions', 'trials'], 'readonly');
      const sessionStore = transaction.objectStore('testSessions');
      const trialStore = transaction.objectStore('trials');
      const index = sessionStore.index('profileId');
      const request = index.getAll(profileId);
      
      request.onsuccess = async () => {
        const sessions = request.result
          .filter(session => session.status === 'completed')
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, limit);
        
        const results: TestResult[] = [];
        
        for (const session of sessions) {
          const trialsRequest = trialStore.index('sessionId').getAll(session.id);
          
          await new Promise((trialResolve) => {
            trialsRequest.onsuccess = () => {
              const trials = trialsRequest.result.filter(trial => !trial.isPractice && !trial.excludedFlag);
              
              if (trials.length > 0) {
                const reactionTimes = trials.map(t => t.rtCorrected || t.rtRaw || 0);
                const meanRT = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
                const sdRT = Math.sqrt(
                  reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - meanRT, 2), 0) / reactionTimes.length
                );
                
                const accuracy = session.testType === 'GO_NO_GO' 
                  ? trials.filter(t => t.accuracy).length / trials.length * 100
                  : undefined;
                
                results.push({
                  sessionId: session.id,
                  type: session.testType as any,
                  stimulusType: session.stimulusType as any,
                  trials: trialsRequest.result,
                  meanRT,
                  sdRT,
                  validTrials: trials.length,
                  outliers: trialsRequest.result.filter(t => t.excludedFlag).length,
                  accuracy,
                  completedAt: session.completedAt || session.startedAt,
                });
              }
              trialResolve(undefined);
            };
          });
        }
        
        resolve(results);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new IndexedDBStorage();
