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
      icon: 'visibility',
      title: 'Simple Reaction Time',
      description: 'Visual, Auditory & Tactile',
      trials: '20 trials',
      duration: '~5 min',
      color: 'bg-primary/10 text-primary',
      testId: 'button-start-srt'
    },
    {
      id: 'CRT',
      icon: 'call_split',
      title: 'Choice Reaction Time',
      description: '2-Choice & 4-Choice',
      trials: '40 trials',
      duration: '~8 min',
      color: 'bg-accent/10 text-accent',
      testId: 'button-start-crt'
    },
    {
      id: 'GO_NO_GO',
      icon: 'stop_circle',
      title: 'Go/No-Go',
      description: 'Inhibitory Control',
      trials: '40 trials',
      duration: '~6 min',
      color: 'bg-secondary/10 text-secondary',
      testId: 'button-start-gonogo'
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
                className="ml-4"
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-avg-srt">
                {stats.avgSRT > 0 ? Math.round(stats.avgSRT) : '--'}
              </div>
              <div className="text-xs text-gray-600">Avg SRT (ms)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-sessions">
                {stats.sessions}
              </div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-accuracy">
                {stats.accuracy > 0 ? Math.round(stats.accuracy) : '--'}
              </div>
              <div className="text-xs text-gray-600">Accuracy %</div>
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
          <div className="space-y-3">
            {testModules.map((module) => (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setLocation(`/test/${module.id.toLowerCase()}`)}
                data-testid={module.testId}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${module.color}`}>
                      <span className="material-icons">{module.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-success">{module.trials}</div>
                    <div className="text-xs text-gray-500">{module.duration}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Battery Mode */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-primary">playlist_play</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Full Battery</h4>
                    <p className="text-sm text-gray-600">Complete Assessment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">All Tests</div>
                  <div className="text-xs text-gray-500">~20 min</div>
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
