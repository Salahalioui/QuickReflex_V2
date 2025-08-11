import { useStore } from '@/store/useStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function Dashboard() {
  const { 
    currentProfile, 
    isCalibrated, 
    recentResults,
    loadRecentResults 
  } = useStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (currentProfile) {
      loadRecentResults();
    }
  }, [currentProfile, loadRecentResults]);

  // Calculate summary stats
  const stats = recentResults.length > 0 ? {
    avgSRT: recentResults
      .filter(r => r.type === 'SRT')
      .reduce((sum, r, _, arr) => sum + r.meanRT / arr.length, 0),
    sessions: recentResults.length,
    accuracy: recentResults
      .filter(r => r.accuracy !== undefined)
      .reduce((sum, r, _, arr) => sum + (r.accuracy || 0) / arr.length, 0),
  } : { avgSRT: 0, sessions: 0, accuracy: 0 };

  const testModules = [
    {
      id: 'SRT',
      icon: 'bolt',
      title: 'Simple Reaction Time',
      description: 'Visual, Auditory & Tactile',
      trials: '20 trials',
      duration: '~5 min',
      color: 'bg-speed text-white',
      bgClass: 'test-module-srt',
      testId: 'button-start-srt'
    },
    {
      id: 'CRT',
      icon: 'psychology',
      title: 'Choice Reaction Time',
      description: '2-Choice & 4-Choice',
      trials: '40 trials',
      duration: '~8 min',
      color: 'bg-focus text-white',
      bgClass: 'test-module-crt',
      testId: 'button-start-crt'
    },
    {
      id: 'GO_NO_GO',
      icon: 'center_focus_strong',
      title: 'Go/No-Go',
      description: 'Inhibitory Control',
      trials: '40 trials',
      duration: '~6 min',
      color: 'bg-precision text-white',
      bgClass: 'test-module-gonogo',
      testId: 'button-start-gonogo'
    },
    {
      id: 'MOVEMENT_TIME',
      icon: 'gesture',
      title: 'Movement Time',
      description: 'Motor Response Estimation',
      trials: '20 trials',
      duration: '~3 min',
      color: 'bg-blue-500 text-white',
      bgClass: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300/30',
      testId: 'button-start-movement'
    },
  ];

  if (!currentProfile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <span className="material-icons text-6xl text-gray-400 mb-4">person</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Welcome to QuickReflex</h3>
            <p className="text-gray-600 mb-4">
              Create a profile to start reaction time testing
            </p>
            <Button 
              onClick={() => setLocation('/settings')}
              data-testid="button-create-profile"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Calibration Status */}
      {!isCalibrated && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Calibration Required</strong>
                <p className="text-sm mt-1">
                  Your device needs calibration for accurate timing measurements.
                </p>
              </div>
              <Button 
                size="sm" 
                className="ml-4 text-[#000000]"
                onClick={() => setLocation('/calibration')}
                data-testid="button-calibrate"
              >
                Calibrate
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <Card className="performance-card elevation-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="material-icons mr-2 text-primary">trending_up</span>
            Recent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-speed/10 border border-pink-200/30">
              <div className="w-10 h-10 bg-speed rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-icons text-white text-sm">speed</span>
              </div>
              <div className="text-2xl font-bold text-speed" data-testid="stat-avg-srt">
                {stats.avgSRT > 0 ? Math.round(stats.avgSRT) : '--'}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg SRT (ms)</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-focus/10 border border-purple-200/30">
              <div className="w-10 h-10 bg-focus rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-icons text-white text-sm">psychology</span>
              </div>
              <div className="text-2xl font-bold text-focus" data-testid="stat-sessions">
                {stats.sessions}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Sessions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-precision/10 border border-cyan-200/30">
              <div className="w-10 h-10 bg-precision rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-icons text-white text-sm">target</span>
              </div>
              <div className="text-2xl font-bold text-precision" data-testid="stat-accuracy">
                {stats.accuracy > 0 ? Math.round(stats.accuracy) : '--'}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Accuracy %</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Test Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testModules.map((module) => (
              <div
                key={module.id}
                className={`${module.bgClass} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] elevation-2 hover:elevation-4 border-2`}
                onClick={() => {
                  const urlPath = module.id === 'GO_NO_GO' ? 'gonogo' : 
                                  module.id === 'MOVEMENT_TIME' ? 'movement' : 
                                  module.id.toLowerCase();
                  setLocation(`/test/${urlPath}`);
                }}
                data-testid={module.testId}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${module.color} shadow-lg`}>
                      <span className="material-icons text-xl">{module.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 dark:text-white">{module.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{module.trials}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{module.duration}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Battery Mode */}
            <div className="bg-energy rounded-xl p-6 shadow-lg border-2 border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="material-icons text-xl text-yellow-600">battery_charging_full</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Full Battery</h4>
                    <p className="text-sm text-gray-700 font-medium">Complete Assessment Suite</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">All Tests</div>
                  <div className="text-xs text-gray-700 font-medium">~20 min</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Sessions
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/results')}
              data-testid="button-view-all-results"
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-gray-400 mb-2">analytics</span>
              <p className="text-gray-600">No test sessions yet</p>
              <p className="text-sm text-gray-500">Complete a test to see your results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.slice(0, 3).map((result, index) => (
                <div key={result.sessionId} className="border-b border-gray-100 py-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm" data-testid={`session-type-${index}`}>
                        {result.type} - {result.stimulusType}
                      </div>
                      <div className="text-xs text-gray-500" data-testid={`session-date-${index}`}>
                        {result.completedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" data-testid={`session-rt-${index}`}>
                        {Math.round(result.meanRT)}ms
                      </div>
                      <div className="text-xs text-gray-500" data-testid={`session-trials-${index}`}>
                        {result.validTrials} trials
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
