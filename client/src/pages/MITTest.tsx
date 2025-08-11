import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Play, RotateCcw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TapData {
  timestamp: number;
  interval?: number;
}

interface MITTestProps {
  onComplete: (mitResult: { 
    averageMIT: number; 
    tapData: TapData[]; 
    standardDeviation: number;
    reliability: number;
  }) => void;
  onCancel: () => void;
}

export default function MITTest({ onComplete, onCancel }: MITTestProps) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'testing' | 'results'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [tapData, setTapData] = useState<TapData[]>([]);
  const [currentTapCount, setCurrentTapCount] = useState(0);
  const [testDuration] = useState(10000); // 10 seconds of tapping
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(testDuration);
  
  const tapAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

  const targetTaps = 20; // Minimum number of taps needed
  const maxTestDuration = 15000; // Maximum 15 seconds

  // Calculate MIT results
  const calculateMIT = (taps: TapData[]): {
    averageMIT: number;
    standardDeviation: number;
    reliability: number;
  } => {
    if (taps.length < 3) {
      return { averageMIT: 0, standardDeviation: 0, reliability: 0 };
    }

    // Calculate intervals between consecutive taps
    const intervals: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      const interval = taps[i].timestamp - taps[i - 1].timestamp;
      if (interval > 50 && interval < 2000) { // Filter out unrealistic intervals
        intervals.push(interval);
        taps[i].interval = interval;
      }
    }

    if (intervals.length < 2) {
      return { averageMIT: 0, standardDeviation: 0, reliability: 0 };
    }

    // Calculate average MIT
    const averageMIT = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Calculate standard deviation
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageMIT, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate reliability (coefficient of variation - lower is better)
    const reliability = Math.max(0, 1 - (standardDeviation / averageMIT));

    return { averageMIT, standardDeviation, reliability };
  };

  // Handle tap events
  const handleTap = () => {
    if (phase !== 'testing' || !startTime) return;

    const now = performance.now();
    const newTap: TapData = { timestamp: now };
    
    setTapData(prev => [...prev, newTap]);
    setCurrentTapCount(prev => prev + 1);

    // Check if we have enough taps or time is up
    if (currentTapCount + 1 >= targetTaps) {
      finishTest();
    }
  };

  // Start countdown
  const startCountdown = () => {
    setPhase('countdown');
    let count = 3;
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        startTest();
      }
    }, 1000);
  };

  // Start the tapping test
  const startTest = () => {
    setPhase('testing');
    setStartTime(performance.now());
    setTapData([]);
    setCurrentTapCount(0);
    setTimeRemaining(testDuration);

    // Start timer
    const startTimestamp = performance.now();
    
    const updateTimer = () => {
      const elapsed = performance.now() - startTimestamp;
      const remaining = Math.max(0, testDuration - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining <= 0 || currentTapCount >= targetTaps) {
        finishTest();
        return;
      }
      
      animationRef.current = requestAnimationFrame(updateTimer);
    };
    
    animationRef.current = requestAnimationFrame(updateTimer);

    // Maximum duration failsafe
    intervalRef.current = setTimeout(() => {
      finishTest();
    }, maxTestDuration);
  };

  // Finish the test and calculate results
  const finishTest = () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setPhase('results');
    
    // Calculate MIT from tap data
    const results = calculateMIT(tapData);
    
    // Only complete if we have valid results
    if (results.averageMIT > 0 && tapData.length >= 3) {
      onComplete({
        averageMIT: results.averageMIT,
        tapData: tapData,
        standardDeviation: results.standardDeviation,
        reliability: results.reliability
      });
    }
  };

  // Reset test
  const resetTest = () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setPhase('instructions');
    setCountdown(3);
    setTapData([]);
    setCurrentTapCount(0);
    setStartTime(null);
    setTimeRemaining(testDuration);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const progress = Math.min(100, (currentTapCount / targetTaps) * 100);
  const timeProgress = phase === 'testing' ? ((testDuration - timeRemaining) / testDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Movement Initiation Time Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tap as fast as you can to measure your movement time
          </p>
        </div>

        {/* Instructions Phase */}
        {phase === 'instructions' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Test Instructions
              </CardTitle>
              <CardDescription>
                This test measures your Movement Initiation Time (MIT) - the time it takes to execute a motor response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Scientific Purpose:</strong> MIT helps isolate cognitive processing time from total reaction time, 
                  providing a purer measure of perceptual and central processing speed.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Instructions:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Tap the screen as rapidly and consistently as possible</li>
                  <li>Try to maintain a steady rhythm</li>
                  <li>Use the same finger throughout the test</li>
                  <li>You need at least {targetTaps} taps to complete the test</li>
                  <li>The test will automatically end after {testDuration / 1000} seconds or {targetTaps} taps</li>
                </ul>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your average tap interval will be used to calculate Movement Initiation Time, 
                    which can then be subtracted from reaction times to estimate Stimulus Detection Time.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={onCancel} variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
                <Button onClick={startCountdown} data-testid="button-start">
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Countdown Phase */}
        {phase === 'countdown' && (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-16">
              <div className="text-8xl font-bold text-blue-500 dark:text-blue-400 mb-4">
                {countdown}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Get ready to tap...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Testing Phase */}
        {phase === 'testing' && (
          <div className="space-y-6">
            {/* Progress and Status */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currentTapCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Taps ({targetTaps} needed)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.ceil(timeRemaining / 1000)}s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Time remaining
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time</span>
                  <span>{Math.round(timeProgress)}%</span>
                </div>
                <Progress value={timeProgress} className="h-1" />
              </div>
            </div>

            {/* Tap Area */}
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8">
                <div
                  ref={tapAreaRef}
                  className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 
                           rounded-lg cursor-pointer select-none flex items-center justify-center
                           active:scale-95 transition-transform duration-75 touch-manipulation"
                  onClick={handleTap}
                  onTouchStart={handleTap}
                  data-testid="tap-area"
                >
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">TAP HERE</div>
                    <div className="text-sm opacity-80">Tap as fast as possible</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Movement Initiation Time Results</CardTitle>
              <CardDescription>
                Your movement time has been calculated and can now be used to refine reaction time measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tapData.length >= 3 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {calculateMIT(tapData).averageMIT.toFixed(1)}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Average MIT
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(calculateMIT(tapData).reliability * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Reliability
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <Badge variant="secondary">
                      {tapData.length} total taps recorded
                    </Badge>
                    <Badge variant="secondary">
                      ±{calculateMIT(tapData).standardDeviation.toFixed(1)}ms std dev
                    </Badge>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This MIT will be subtracted from your reaction times to calculate 
                      Stimulus Detection Time (SDT), providing a purer measure of cognitive processing speed.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient tap data collected. Please try the test again.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-center gap-4">
                <Button onClick={resetTest} variant="outline" data-testid="button-retry">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                {tapData.length >= 3 && (
                  <Button onClick={() => onComplete({
                    averageMIT: calculateMIT(tapData).averageMIT,
                    tapData: tapData,
                    standardDeviation: calculateMIT(tapData).standardDeviation,
                    reliability: calculateMIT(tapData).reliability
                  })} data-testid="button-complete">
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}