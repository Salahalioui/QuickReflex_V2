import { useParams, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Play } from 'lucide-react';
import TestRunner from '@/components/TestRunner';
import type { TestConfiguration, TestTypeEnum, StimulusTypeEnum } from '@/types';
import { useToast } from '@/hooks/use-toast';

const TEST_CONFIGURATIONS: Record<string, Partial<TestConfiguration>> = {
  'srt': {
    type: 'SRT',
    totalTrials: 20,
    practiceTrials: 5,
    isiMin: 1500,
    isiMax: 4000,
  },
  'crt': {
    type: 'CRT_2',
    totalTrials: 40,
    practiceTrials: 8,
    isiMin: 1500,
    isiMax: 3000,
  },
  'gonogo': {
    type: 'GO_NO_GO',
    totalTrials: 40,
    practiceTrials: 8,
    isiMin: 1500,
    isiMax: 3000,
  },
  'battery': {
    type: 'SRT',
    totalTrials: 100,
    practiceTrials: 15,
    isiMin: 1500,
    isiMax: 4000,
  },
};

export default function TestModule() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { 
    currentProfile, 
    isCalibrated, 
    startTest, 
    completeTest 
  } = useStore();
  const { toast } = useToast();
  
  const [selectedStimulus, setSelectedStimulus] = useState<StimulusTypeEnum>('visual');
  const [selectedVariant, setSelectedVariant] = useState<'2' | '4'>('2');
  const [isRunning, setIsRunning] = useState(false);
  const [configuration, setConfiguration] = useState<TestConfiguration | null>(null);

  const testType = params.type?.toLowerCase() || 'srt';
  const baseConfig = TEST_CONFIGURATIONS[testType];

  useEffect(() => {
    if (!baseConfig) {
      toast({
        title: "Invalid Test",
        description: "Unknown test type specified.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    // Build configuration based on test type and selections
    let finalType: TestTypeEnum = baseConfig.type!;
    
    if (testType === 'crt') {
      finalType = selectedVariant === '2' ? 'CRT_2' : 'CRT_4';
    }

    setConfiguration({
      ...baseConfig,
      type: finalType,
      stimulusType: selectedStimulus,
    } as TestConfiguration);
  }, [testType, selectedStimulus, selectedVariant, baseConfig, setLocation, toast]);

  const handleStartTest = async () => {
    if (!currentProfile) {
      toast({
        title: "No Profile",
        description: "Please create a profile before starting a test.",
        variant: "destructive",
      });
      setLocation('/settings');
      return;
    }

    if (!isCalibrated) {
      toast({
        title: "Calibration Required",
        description: "Please calibrate your device before starting a test.",
        variant: "destructive",
      });
      setLocation('/calibration');
      return;
    }

    if (!configuration) {
      toast({
        title: "Configuration Error",
        description: "Test configuration is invalid.",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTest(configuration);
      setIsRunning(true);
    } catch (error) {
      toast({
        title: "Failed to Start Test",
        description: "Could not initialize the test session.",
        variant: "destructive",
      });
    }
  };

  const handleTestComplete = async () => {
    try {
      await completeTest();
      setIsRunning(false);
      toast({
        title: "Test Complete",
        description: "Your results have been saved.",
      });
      setLocation('/results');
    } catch (error) {
      toast({
        title: "Failed to Save Results",
        description: "There was an error saving your test results.",
        variant: "destructive",
      });
      setIsRunning(false);
      setLocation('/');
    }
  };

  if (isRunning && configuration) {
    return (
      <TestRunner 
        configuration={configuration}
        onComplete={handleTestComplete}
      />
    );
  }

  if (!baseConfig) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Invalid Test Type</h3>
            <p className="text-gray-600 mb-4">The specified test type is not supported.</p>
            <Button onClick={() => setLocation('/')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTestInfo = () => {
    switch (testType) {
      case 'srt':
        return {
          title: 'Simple Reaction Time',
          description: 'Measure your basic reaction time to a single stimulus',
          icon: 'visibility',
          color: 'text-primary',
        };
      case 'crt':
        return {
          title: 'Choice Reaction Time',
          description: 'React to different stimuli with specific responses',
          icon: 'call_split',
          color: 'text-accent',
        };
      case 'gonogo':
        return {
          title: 'Go/No-Go Test',
          description: 'Test your inhibitory control and response accuracy',
          icon: 'stop_circle',
          color: 'text-secondary',
        };
      case 'battery':
        return {
          title: 'Full Test Battery',
          description: 'Complete assessment with all test types',
          icon: 'playlist_play',
          color: 'text-primary',
        };
      default:
        return {
          title: 'Reaction Time Test',
          description: 'Measure your reaction time',
          icon: 'psychology',
          color: 'text-primary',
        };
    }
  };

  const testInfo = getTestInfo();

  return (
    <div className="p-4 space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
              <span className={`material-icons text-2xl ${testInfo.color}`}>
                {testInfo.icon}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{testInfo.title}</CardTitle>
              <p className="text-gray-600 mt-1">{testInfo.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calibration Warning */}
      {!isCalibrated && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Device calibration required</strong>
                <p className="text-sm mt-1">
                  Calibrate your device for accurate timing measurements.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setLocation('/calibration')}
                data-testid="button-calibrate-from-test"
              >
                Calibrate
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stimulus Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stimulus Type
            </label>
            <Select 
              value={selectedStimulus} 
              onValueChange={(value: StimulusTypeEnum) => setSelectedStimulus(value)}
            >
              <SelectTrigger data-testid="select-stimulus-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="auditory">Auditory</SelectItem>
                <SelectItem value="tactile">Tactile (Vibration)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedStimulus === 'visual' && 'React to colored visual cues'}
              {selectedStimulus === 'auditory' && 'React to audio beeps (requires sound)'}
              {selectedStimulus === 'tactile' && 'React to device vibration'}
            </p>
          </div>

          {/* CRT Variant Selection */}
          {testType === 'crt' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choice Type
              </label>
              <Select 
                value={selectedVariant} 
                onValueChange={(value: '2' | '4') => setSelectedVariant(value)}
              >
                <SelectTrigger data-testid="select-crt-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2-Choice (Left/Right)</SelectItem>
                  <SelectItem value="4">4-Choice (Up/Down/Left/Right)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Test Parameters Display */}
          {configuration && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Test Parameters</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Practice Trials:</span>
                  <span className="ml-2 font-medium" data-testid="text-practice-trials">
                    {configuration.practiceTrials}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Test Trials:</span>
                  <span className="ml-2 font-medium" data-testid="text-total-trials">
                    {configuration.totalTrials}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">ISI Range:</span>
                  <span className="ml-2 font-medium" data-testid="text-isi-range">
                    {configuration.isiMin}-{configuration.isiMax}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Est. Duration:</span>
                  <span className="ml-2 font-medium" data-testid="text-duration">
                    ~{Math.ceil((configuration.totalTrials + configuration.practiceTrials) * 
                      ((configuration.isiMin + configuration.isiMax) / 2 + 500) / 60000)}min
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {testType === 'srt' && (
              <div>
                <p>• Tap the screen as quickly as possible when you detect the stimulus</p>
                <p>• Keep your finger ready above the screen</p>
                <p>• Focus on being fast but avoid false starts</p>
              </div>
            )}
            
            {testType === 'crt' && (
              <div>
                <p>• Different stimuli require different responses</p>
                {selectedVariant === '2' ? (
                  <div>
                    <p>• Blue stimulus (left) = Tap left side</p>
                    <p>• Green stimulus (right) = Tap right side</p>
                  </div>
                ) : (
                  <div>
                    <p>• Red = Up, Blue = Down, Green = Left, Yellow = Right</p>
                    <p>• Tap the corresponding area of the screen</p>
                  </div>
                )}
                <p>• Be both fast and accurate</p>
              </div>
            )}
            
            {testType === 'gonogo' && (
              <div>
                <p>• Green "GO" stimulus = Tap the screen quickly</p>
                <p>• Red "STOP" stimulus = DO NOT tap (inhibit response)</p>
                <p>• Focus on accuracy - avoiding false alarms is important</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="font-medium">General Tips:</p>
              <p>• Find a comfortable position and hold your device steady</p>
              <p>• Minimize distractions during the test</p>
              <p>• Take a short break if you feel fatigued</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex space-x-4">
        <Button 
          size="lg" 
          className="flex-1"
          onClick={handleStartTest}
          disabled={!currentProfile || !isCalibrated}
          data-testid="button-start-test"
        >
          <Play className="h-5 w-5 mr-2" />
          Start Test
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
