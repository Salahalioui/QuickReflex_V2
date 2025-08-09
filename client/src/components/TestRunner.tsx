import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  getHighPrecisionTime, 
  getRandomISI, 
  recordResponse, 
  startCueWithRAF,
  freezeNonEssentialRendering,
  preloadAudio 
} from '@/lib/timing';
import { cleanReactionTimes } from '@/lib/timing';
import type { TestConfiguration, Trial } from '@/types';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface TestRunnerProps {
  configuration: TestConfiguration;
  onComplete: () => void;
}

interface TestState {
  phase: 'instructions' | 'practice' | 'break' | 'testing' | 'complete';
  currentTrial: number;
  totalTrials: number;
  showCue: boolean;
  awaitingResponse: boolean;
  cueStartTime: number;
  isPractice: boolean;
  practiceTrialsCompleted: number;
  stimulusDetail?: string;
  showFeedback?: boolean;
  feedbackMessage?: string;
  isBreak?: boolean;
}

export default function TestRunner({ configuration, onComplete }: TestRunnerProps) {
  const { 
    currentProfile, 
    recordTrial, 
    settings,
    calibrationData 
  } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [testState, setTestState] = useState<TestState>({
    phase: 'instructions',
    currentTrial: 0,
    totalTrials: configuration.totalTrials,
    showCue: false,
    awaitingResponse: false,
    cueStartTime: 0,
    isPractice: true,
    practiceTrialsCompleted: 0,
  });

  const cueElementRef = useRef<HTMLDivElement>(null);
  const responseAreaRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const trialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unfreezeRenderingRef = useRef<(() => void) | null>(null);

  // Preload audio files for auditory tests
  useEffect(() => {
    if (configuration.stimulusType === 'auditory') {
      const loadAudio = async () => {
        try {
          const audioUrls = ['/audio/beep-high.mp3', '/audio/beep-low.mp3'];
          audioElementsRef.current = await preloadAudio(audioUrls);
        } catch (error) {
          console.warn('Failed to preload audio:', error);
        }
      };
      loadAudio();
    }
  }, [configuration.stimulusType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      if (trialTimeoutRef.current) clearTimeout(trialTimeoutRef.current);
      if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
      if (unfreezeRenderingRef.current) unfreezeRenderingRef.current();
    };
  }, []);

  const playAudioCue = useCallback((frequency: 'high' | 'low' = 'high') => {
    if (audioElementsRef.current.length > 0) {
      const audioIndex = frequency === 'high' ? 0 : 1;
      const audio = audioElementsRef.current[audioIndex];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      }
    }
  }, []);

  const triggerVibration = useCallback(() => {
    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [settings.vibrationEnabled]);

  const generateStimulusDetail = useCallback(() => {
    switch (configuration.type) {
      case 'CRT_2':
        return Math.random() < 0.5 ? 'left' : 'right';
      case 'CRT_4':
        const options = ['up', 'down', 'left', 'right'];
        return options[Math.floor(Math.random() * options.length)];
      case 'GO_NO_GO':
        // Create predetermined sequence for Go/No-Go to ensure exact distribution
        if (testState.isPractice) {
          // For practice: maintain 70/30 ratio randomly
          return Math.random() < 0.7 ? 'go' : 'nogo';
        } else {
          // For main test: use predetermined sequence (28 Go, 12 No-Go)
          const goNoGoSequence = [
            ...Array(28).fill('go'),
            ...Array(12).fill('nogo')
          ].sort(() => Math.random() - 0.5); // Shuffle the sequence
          
          // Use current trial index to get stimulus from sequence
          const currentIndex = testState.currentTrial % 40;
          return goNoGoSequence[currentIndex];
        }
      default:
        return 'stimulus';
    }
  }, [configuration.type, testState.isPractice, testState.currentTrial]);

  const showStimulus = useCallback((stimulusDetail: string) => {
    if (!cueElementRef.current) return;

    const cueElement = cueElementRef.current;
    
    // Reset all styles to ensure clean state
    cueElement.style.backgroundColor = 'transparent';
    cueElement.style.transform = '';
    cueElement.style.borderRadius = '';
    cueElement.style.width = '';
    cueElement.style.height = '';
    cueElement.style.display = '';
    cueElement.style.alignItems = '';
    cueElement.style.justifyContent = '';
    cueElement.style.fontSize = '';
    cueElement.style.fontWeight = '';
    cueElement.style.color = '';
    cueElement.textContent = '';
    
    // Configure visual stimulus based on test type
    switch (configuration.type) {
      case 'SRT':
        if (configuration.stimulusType === 'visual') {
          cueElement.style.backgroundColor = '#FF0000';
          cueElement.style.borderRadius = '50%';
        }
        break;
        
      case 'CRT_2':
        // Precise colors and positioning for 2-choice CRT
        cueElement.style.borderRadius = '12px';
        cueElement.style.width = '60px';
        cueElement.style.height = '60px';
        if (stimulusDetail === 'left') {
          cueElement.style.backgroundColor = '#0066FF'; // Pure blue
          cueElement.style.transform = 'translateX(-80px)';
        } else {
          cueElement.style.backgroundColor = '#00CC00'; // Pure green  
          cueElement.style.transform = 'translateX(80px)';
        }
        break;
        
      case 'CRT_4':
        // Precise colors and positioning for 4-choice CRT  
        const colors = { 
          up: '#FF3333',    // Red
          down: '#3366FF',  // Blue
          left: '#33CC33',  // Green 
          right: '#FFCC00'  // Yellow
        };
        const positions = { 
          up: 'translateY(-80px)', 
          down: 'translateY(80px)', 
          left: 'translateX(-80px)', 
          right: 'translateX(80px)' 
        };
        cueElement.style.backgroundColor = colors[stimulusDetail as keyof typeof colors];
        cueElement.style.transform = positions[stimulusDetail as keyof typeof positions];
        cueElement.style.borderRadius = '12px';
        cueElement.style.width = '60px';
        cueElement.style.height = '60px';
        break;
        
      case 'GO_NO_GO':
        // Precise colors and styling for Go/No-Go
        cueElement.style.borderRadius = '12px';
        cueElement.style.width = '120px';
        cueElement.style.height = '80px';
        cueElement.style.display = 'flex';
        cueElement.style.alignItems = 'center';
        cueElement.style.justifyContent = 'center';
        cueElement.style.fontSize = '24px';
        cueElement.style.fontWeight = 'bold';
        cueElement.style.color = 'white';
        if (stimulusDetail === 'go') {
          cueElement.style.backgroundColor = '#00CC00'; // Pure green
          cueElement.textContent = 'GO';
        } else {
          cueElement.style.backgroundColor = '#FF3333'; // Pure red
          cueElement.textContent = 'STOP';
        }
        break;
    }

    // Show visual cue and handle audio/tactile
    const onCueDisplayed = (timestamp: number) => {
      setTestState(prev => ({ 
        ...prev, 
        showCue: true, 
        awaitingResponse: true, 
        cueStartTime: timestamp 
      }));

      // Audio stimulus
      if (configuration.stimulusType === 'auditory') {
        if (configuration.type === 'CRT_2') {
          playAudioCue(stimulusDetail === 'left' ? 'low' : 'high');
        } else {
          playAudioCue();
        }
      }

      // Tactile stimulus
      if (configuration.stimulusType === 'tactile') {
        triggerVibration();
      }

      // Set stimulus timeout for Go/No-Go STOP signals
      if (configuration.type === 'GO_NO_GO' && stimulusDetail === 'nogo') {
        console.log('Setting STOP timeout for nogo stimulus');
        stimulusTimeoutRef.current = setTimeout(() => {
          console.log('STOP timeout triggered');
          
          // Check if stimulus is still visible and we're awaiting response
          setTestState(currentState => {
            console.log('Current state in timeout:', { showCue: currentState.showCue, awaitingResponse: currentState.awaitingResponse });
            
            if (!currentState.showCue || !currentState.awaitingResponse) {
              console.log('Stimulus already handled, skipping timeout');
              return currentState;
            }

            console.log('Processing STOP timeout');
            
            // Hide stimulus immediately
            if (cueElementRef.current) {
              cueElementRef.current.style.visibility = 'hidden';
              cueElementRef.current.style.backgroundColor = 'transparent';
              cueElementRef.current.style.transform = '';
              cueElementRef.current.style.borderRadius = '';
              cueElementRef.current.style.width = '';
              cueElementRef.current.style.height = '';
              cueElementRef.current.style.display = '';
              cueElementRef.current.style.alignItems = '';
              cueElementRef.current.style.justifyContent = '';
              cueElementRef.current.style.fontSize = '';
              cueElementRef.current.style.fontWeight = '';
              cueElementRef.current.style.color = '';
              cueElementRef.current.textContent = '';
            }

            if (cleanupRef.current) {
              cleanupRef.current();
              cleanupRef.current = null;
            }

            // Clear stimulus timeout
            if (stimulusTimeoutRef.current) {
              clearTimeout(stimulusTimeoutRef.current);
              stimulusTimeoutRef.current = null;
            }

            // Record timeout trial
            recordTrial({
              sessionId: currentProfile?.id || 'anonymous',
              trialNumber: currentState.currentTrial + 1,
              stimulusType: configuration.stimulusType,
              stimulusDetail: currentState.stimulusDetail || '',
              cueTimestamp: currentState.cueStartTime,
              responseTimestamp: null,
              rtRaw: null,
              rtCorrected: null,
              excludedFlag: false,
              exclusionReason: null,
              isPractice: currentState.isPractice,
              accuracy: true, // No-Go timeout is correct
            }).catch(error => console.error('Failed to record timeout trial:', error));

            // Generate feedback message
            const feedbackMessage = currentState.isPractice ? 'Good! You correctly avoided tapping on STOP.' : undefined;

            // Return updated state
            return {
              ...currentState,
              showCue: false,
              awaitingResponse: false,
              showFeedback: currentState.isPractice,
              feedbackMessage
            };
          });

          // Continue to next trial after brief delay
          setTimeout(() => {
            setTestState(currentState => {
              if (currentState.isPractice) {
                const practiceCompleted = currentState.practiceTrialsCompleted + 1;
                if (practiceCompleted >= configuration.practiceTrials) {
                  return { 
                    ...currentState, 
                    phase: 'break',
                    showFeedback: false,
                    isBreak: true
                  };
                } else {
                  // Continue practice
                  const newState = { 
                    ...currentState, 
                    practiceTrialsCompleted: practiceCompleted,
                    showFeedback: false
                  };
                  
                  // Start next trial
                  setTimeout(() => {
                    if (unfreezeRenderingRef.current) {
                      unfreezeRenderingRef.current();
                    }
                    unfreezeRenderingRef.current = freezeNonEssentialRendering();
                    
                    const newStimulusDetail = Math.random() < 0.7 ? 'go' : 'nogo';
                    setTestState(prev => ({ ...prev, stimulusDetail: newStimulusDetail }));
                    
                    const isiDelay = getRandomISI(configuration.isiMin, configuration.isiMax);
                    trialTimeoutRef.current = setTimeout(() => {
                      showStimulus(newStimulusDetail);
                    }, isiDelay);
                  }, 100);
                  
                  return newState;
                }
              } else {
                const nextTrial = currentState.currentTrial + 1;
                if (nextTrial >= currentState.totalTrials) {
                  return { ...currentState, phase: 'complete', showFeedback: false };
                } else {
                  const newState = { 
                    ...currentState, 
                    currentTrial: nextTrial,
                    showFeedback: false
                  };
                  
                  // Start next trial
                  setTimeout(() => {
                    if (unfreezeRenderingRef.current) {
                      unfreezeRenderingRef.current();
                    }
                    unfreezeRenderingRef.current = freezeNonEssentialRendering();
                    
                    const newStimulusDetail = Math.random() < 0.7 ? 'go' : 'nogo';
                    setTestState(prev => ({ ...prev, stimulusDetail: newStimulusDetail }));
                    
                    const isiDelay = getRandomISI(configuration.isiMin, configuration.isiMax);
                    trialTimeoutRef.current = setTimeout(() => {
                      showStimulus(newStimulusDetail);
                    }, isiDelay);
                  }, 100);
                  
                  return newState;
                }
              }
            });
          }, 1500); // Fixed delay for feedback

        }, 1500); // 1.5 second timeout for No-Go signals
      }
    };

    cleanupRef.current = startCueWithRAF(cueElement, onCueDisplayed);
  }, [configuration, playAudioCue, triggerVibration]);



  const handleResponse = useCallback(async (event: PointerEvent) => {
    if (!testState.awaitingResponse) return;

    event.preventDefault();
    event.stopPropagation();

    // Clear any stimulus timeout
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
      stimulusTimeoutRef.current = null;
    }

    const timing = recordResponse(testState.cueStartTime, calibrationData.deviceLatencyOffsetMs);
    
    // Determine accuracy for CRT and Go/No-Go tests
    let accuracy: boolean | undefined;
    if (configuration.type === 'GO_NO_GO') {
      accuracy = testState.stimulusDetail === 'go';
    } else if (configuration.type === 'CRT_2') {
      // For 2-choice CRT: left side = left stimulus, right side = right stimulus
      const isLeftSide = event.clientX < window.innerWidth / 2;
      const correctResponse = testState.stimulusDetail === 'left' ? isLeftSide : !isLeftSide;
      accuracy = correctResponse;
    } else if (configuration.type === 'CRT_4') {
      // For 4-choice CRT: determine response area based on touch/click position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const threshold = 100; // pixels from center
      
      let responseDirection: string;
      if (event.clientY < centerY - threshold) {
        responseDirection = 'up';
      } else if (event.clientY > centerY + threshold) {
        responseDirection = 'down';
      } else if (event.clientX < centerX - threshold) {
        responseDirection = 'left';
      } else if (event.clientX > centerX + threshold) {
        responseDirection = 'right';
      } else {
        responseDirection = 'center'; // Invalid response area
      }
      
      accuracy = responseDirection === testState.stimulusDetail;
    }

    // Generate feedback message based on accuracy and timing
    let feedbackMessage: string | undefined;
    if (testState.isPractice) {
      if (accuracy === false) {
        feedbackMessage = 'Incorrect! Try again.';
      } else if (timing.reactionTime < 100) {
        feedbackMessage = 'Too fast!';
      } else if (timing.reactionTime > 1000) {
        feedbackMessage = 'Too slow!';
      } else {
        feedbackMessage = 'Good!';
      }
    }

    // Hide stimulus
    setTestState(prev => ({ 
      ...prev, 
      showCue: false, 
      awaitingResponse: false,
      showFeedback: prev.isPractice,
      feedbackMessage
    }));

    if (cueElementRef.current) {
      cueElementRef.current.style.visibility = 'hidden';
      cueElementRef.current.style.backgroundColor = 'transparent';
      cueElementRef.current.style.transform = '';
      cueElementRef.current.style.borderRadius = '';
      cueElementRef.current.style.width = '';
      cueElementRef.current.style.height = '';
      cueElementRef.current.style.display = '';
      cueElementRef.current.style.alignItems = '';
      cueElementRef.current.style.justifyContent = '';
      cueElementRef.current.style.fontSize = '';
      cueElementRef.current.style.fontWeight = '';
      cueElementRef.current.style.color = '';
      cueElementRef.current.textContent = '';
    }

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Record trial
    try {
      await recordTrial({
        sessionId: currentProfile?.id || 'anonymous',
        trialNumber: testState.currentTrial + 1,
        stimulusType: configuration.stimulusType,
        stimulusDetail: testState.stimulusDetail || '',
        cueTimestamp: testState.cueStartTime,
        responseTimestamp: timing.endTime,
        rtRaw: timing.reactionTime,
        rtCorrected: timing.correctedReactionTime,
        excludedFlag: false,
        exclusionReason: null,
        isPractice: testState.isPractice,
        accuracy: accuracy ?? null,
      });
    } catch (error) {
      console.error('Failed to record trial:', error);
    }

    // Continue to next trial after feedback delay
    setTimeout(() => {
      if (testState.isPractice) {
        const practiceCompleted = testState.practiceTrialsCompleted + 1;
        if (practiceCompleted >= configuration.practiceTrials) {
          setTestState(prev => ({ 
            ...prev, 
            phase: 'break',
            showFeedback: false,
            isBreak: true
          }));
        } else {
          setTestState(prev => ({ 
            ...prev, 
            practiceTrialsCompleted: practiceCompleted,
            showFeedback: false
          }));
          startNextTrial();
        }
      } else {
        const nextTrial = testState.currentTrial + 1;
        if (nextTrial >= testState.totalTrials) {
          setTestState(prev => ({ ...prev, phase: 'complete', showFeedback: false }));
        } else {
          setTestState(prev => ({ 
            ...prev, 
            currentTrial: nextTrial,
            showFeedback: false
          }));
          startNextTrial();
        }
      }
    }, testState.isPractice ? 1500 : 500);
  }, [testState, configuration, calibrationData.deviceLatencyOffsetMs, recordTrial]);

  const startNextTrial = useCallback(() => {
    if (unfreezeRenderingRef.current) {
      unfreezeRenderingRef.current();
    }
    unfreezeRenderingRef.current = freezeNonEssentialRendering();

    const stimulusDetail = generateStimulusDetail();
    setTestState(prev => ({ ...prev, stimulusDetail }));

    const isiDelay = getRandomISI(configuration.isiMin, configuration.isiMax);
    
    trialTimeoutRef.current = setTimeout(() => {
      showStimulus(stimulusDetail);
    }, isiDelay);
  }, [configuration, generateStimulusDetail, showStimulus]);

  const startPractice = () => {
    setTestState(prev => ({ ...prev, phase: 'practice', isPractice: true }));
    startNextTrial();
  };

  const startMainTest = () => {
    setTestState(prev => ({ 
      ...prev, 
      phase: 'testing', 
      isPractice: false, 
      currentTrial: 0,
      isBreak: false
    }));
    startNextTrial();
  };

  const handleComplete = () => {
    if (unfreezeRenderingRef.current) {
      unfreezeRenderingRef.current();
    }
    onComplete();
  };

  const handleAbort = () => {
    if (cleanupRef.current) cleanupRef.current();
    if (trialTimeoutRef.current) clearTimeout(trialTimeoutRef.current);
    if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
    if (unfreezeRenderingRef.current) unfreezeRenderingRef.current();
    setLocation('/');
  };

  // Handle pointer events
  useEffect(() => {
    const responseArea = responseAreaRef.current;
    if (!responseArea || testState.phase !== 'testing' && testState.phase !== 'practice') return;

    const handlePointerDown = (event: PointerEvent) => {
      handleResponse(event);
    };

    responseArea.addEventListener('pointerdown', handlePointerDown, { passive: false });
    
    return () => {
      responseArea.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [testState.phase, handleResponse]);

  const getInstructions = () => {
    const testName = {
      'SRT': 'Simple Reaction Time',
      'CRT_2': '2-Choice Reaction Time', 
      'CRT_4': '4-Choice Reaction Time',
      'GO_NO_GO': 'Go/No-Go Test'
    }[configuration.type];

    const stimulusName = {
      'visual': 'Visual',
      'auditory': 'Auditory', 
      'tactile': 'Tactile'
    }[configuration.stimulusType];

    return (
      <div className="text-center text-white space-y-6">
        <h1 className="text-3xl font-bold">{testName}</h1>
        <h2 className="text-xl">{stimulusName} Stimulus</h2>
        
        <div className="space-y-4 text-lg">
          {configuration.type === 'SRT' && (
            <p>Tap the screen as quickly as possible when you see/hear/feel the stimulus.</p>
          )}
          
          {configuration.type === 'CRT_2' && (
            <div className="space-y-4">
              <p className="text-xl font-semibold">Two-Choice Response Test</p>
              <div className="space-y-2">
                <p>When a colored square appears:</p>
                <div className="flex justify-center space-x-8 mt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2"></div>
                    <p>BLUE = Tap Left Side</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2"></div>
                    <p>GREEN = Tap Right Side</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Tap the LEFT or RIGHT side of the screen to match the color position.
                    Wrong side = Incorrect response!
                  </p>
                </div>
                <p className="text-green-400 mt-4">Respond as quickly and accurately as possible!</p>
              </div>
            </div>
          )}
          
          {configuration.type === 'CRT_4' && (
            <div className="space-y-4">
              <p className="text-xl font-semibold">Four-Choice Response Test</p>
              <div className="space-y-2">
                <p>When a colored square appears, tap the corresponding area:</p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-2"></div>
                    <p>RED = Tap TOP</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2"></div>
                    <p>BLUE = Tap BOTTOM</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2"></div>
                    <p>GREEN = Tap LEFT</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-2"></div>
                    <p>YELLOW = Tap RIGHT</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Tap the screen area that matches the color position.
                    Wrong area = Incorrect response!
                  </p>
                </div>
                <p className="text-green-400 mt-4">Match the color to the direction quickly!</p>
              </div>
            </div>
          )}
          
          {configuration.type === 'GO_NO_GO' && (
            <div className="space-y-4">
              <p className="text-xl font-semibold">Inhibition Control Test</p>
              <div className="space-y-2">
                <p>You will see two types of signals:</p>
                <div className="flex justify-center space-x-8 mt-4">
                  <div className="text-center">
                    <div className="w-20 h-12 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">GO</span>
                    </div>
                    <p className="text-green-400">TAP IMMEDIATELY</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-12 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">STOP</span>
                    </div>
                    <p className="text-red-400">DO NOT TAP</p>
                  </div>
                </div>
                <p className="text-yellow-400 mt-4">70% will be GO signals, 30% STOP signals</p>
                <p className="text-sm text-gray-300">Test your ability to inhibit responses!</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p>Practice trials: {configuration.practiceTrials}</p>
          <p>Test trials: {configuration.totalTrials}</p>
        </div>
      </div>
    );
  };

  const progress = testState.isPractice 
    ? (testState.practiceTrialsCompleted / configuration.practiceTrials) * 100
    : (testState.currentTrial / testState.totalTrials) * 100;

  if (testState.phase === 'instructions') {
    return (
      <div className="test-mode bg-black text-white flex flex-col items-center justify-center p-8">
        {getInstructions()}
        
        <div className="mt-8 space-y-4">
          <Button 
            size="lg" 
            onClick={startPractice}
            data-testid="button-start-practice"
          >
            Start Practice
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAbort}
            data-testid="button-abort-test"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (testState.phase === 'break') {
    return (
      <div className="test-mode bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Practice Complete</h2>
          <p className="text-lg">
            Great! You completed {configuration.practiceTrials} practice trials.
          </p>
          <p>
            Now you'll begin the main test with {configuration.totalTrials} trials.
          </p>
          <p className="text-yellow-400">
            Remember: Be as fast and accurate as possible!
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button 
            size="lg" 
            onClick={startMainTest}
            data-testid="button-start-main-test"
          >
            Start Main Test
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAbort}
            data-testid="button-abort-test"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (testState.phase === 'complete') {
    return (
      <div className="test-mode bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <span className="material-icons text-6xl text-green-400 mb-4">check_circle</span>
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <p className="text-lg">
            You completed {testState.totalTrials} trials successfully.
          </p>
        </div>
        
        <div className="mt-8">
          <Button 
            size="lg" 
            onClick={handleComplete}
            data-testid="button-view-results"
          >
            View Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-mode bg-black text-white" ref={responseAreaRef}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-bold">
              {configuration.type} - {configuration.stimulusType}
            </h2>
            <p className="text-sm">
              {testState.isPractice ? 'Practice' : 'Test'} Trial{' '}
              {testState.isPractice 
                ? `${testState.practiceTrialsCompleted + 1} of ${configuration.practiceTrials}`
                : `${testState.currentTrial + 1} of ${testState.totalTrials}`
              }
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAbort}
            data-testid="button-abort-test"
          >
            Exit
          </Button>
        </div>
        
        <Progress 
          value={progress} 
          className="mt-2" 
          data-testid="progress-test"
        />
      </div>

      {/* Main test area */}
      <div className="flex flex-col items-center justify-center h-full">
        {testState.showFeedback && testState.feedbackMessage && (
          <div className="text-2xl font-bold mb-8" data-testid="text-feedback">
            {testState.feedbackMessage}
          </div>
        )}

        {!testState.showCue && !testState.showFeedback && (
          <div className="text-center space-y-4">
            <div className="text-xl">Get ready...</div>
            {configuration.type === 'SRT' && (
              <div>Tap anywhere when you see the stimulus</div>
            )}
          </div>
        )}

        {/* Cue display area */}
        <div 
          ref={cueElementRef}
          className="w-32 h-32 border-4 border-gray-600 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ 
            visibility: testState.showCue ? 'visible' : 'hidden',
            backgroundColor: 'transparent'
          }}
          data-testid="cue-stimulus"
        />

        {testState.awaitingResponse && (
          <div className="mt-8 text-lg text-center" data-testid="text-instruction">
            {configuration.type === 'GO_NO_GO' && testState.stimulusDetail === 'nogo' 
              ? "DON'T TAP!" 
              : "TAP NOW!"
            }
          </div>
        )}
      </div>
    </div>
  );
}
