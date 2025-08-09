/**
 * Timing utilities for precise reaction time measurements
 */

export interface TimingResult {
  startTime: number;
  endTime: number;
  reactionTime: number;
  correctedReactionTime: number;
}

/**
 * Get random inter-stimulus interval within specified range
 */
export function getRandomISI(minMs: number, maxMs: number): number {
  return Math.random() * (maxMs - minMs) + minMs;
}

/**
 * High-precision timestamp using performance.now()
 */
export function getHighPrecisionTime(): number {
  return performance.now();
}

/**
 * Apply latency correction to raw reaction time
 */
export function applyLatencyCorrection(rtRaw: number, deviceLatencyOffsetMs: number): number {
  return Math.max(0, rtRaw - deviceLatencyOffsetMs);
}

/**
 * Schedule a cue display using requestAnimationFrame for precise timing
 */
export function startCueWithRAF(
  displayElement: HTMLElement,
  onCueDisplayed: (timestamp: number) => void,
  delay: number = 0
): () => void {
  let rafId: number;
  let timeoutId: number;
  
  const showCue = () => {
    rafId = requestAnimationFrame((timestamp) => {
      displayElement.style.visibility = 'visible';
      onCueDisplayed(performance.now());
    });
  };
  
  if (delay > 0) {
    timeoutId = setTimeout(showCue, delay);
  } else {
    showCue();
  }
  
  // Return cleanup function
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * Record response with high precision timing
 */
export function recordResponse(
  startTime: number,
  deviceLatencyOffsetMs: number
): TimingResult {
  const endTime = performance.now();
  const reactionTime = endTime - startTime;
  const correctedReactionTime = applyLatencyCorrection(reactionTime, deviceLatencyOffsetMs);
  
  return {
    startTime,
    endTime,
    reactionTime,
    correctedReactionTime,
  };
}

/**
 * Clean reaction time data by removing outliers
 */
export function cleanReactionTimes(
  trials: Array<{ rtRaw: number; rtCorrected?: number }>,
  options: {
    minRT: number;
    maxRT: number;
    removeMinMax: boolean;
    stdDeviations: number;
  } = {
    minRT: 100,
    maxRT: 1000,
    removeMinMax: true,
    stdDeviations: 2.5,
  }
): Array<{ index: number; excluded: boolean; reason?: string }> {
  const results = trials.map((_, index) => ({ index, excluded: false, reason: undefined as string | undefined }));
  
  // Step 1: Remove trials outside min/max bounds
  trials.forEach((trial, index) => {
    const rt = trial.rtCorrected || trial.rtRaw;
    if (rt < options.minRT) {
      results[index].excluded = true;
      results[index].reason = `RT below minimum (${options.minRT}ms)`;
    } else if (rt > options.maxRT) {
      results[index].excluded = true;
      results[index].reason = `RT above maximum (${options.maxRT}ms)`;
    }
  });
  
  // Get valid trials for further processing
  const validTrials = trials.filter((_, index) => !results[index].excluded);
  const validIndices = results.filter(r => !r.excluded).map(r => r.index);
  
  if (validTrials.length < 3) {
    return results; // Not enough data for further cleaning
  }
  
  // Step 2: Remove min and max values (one each)
  if (options.removeMinMax && validTrials.length > 4) {
    const validRTs = validTrials.map(t => t.rtCorrected || t.rtRaw);
    const minIndex = validIndices[validRTs.indexOf(Math.min(...validRTs))];
    const maxIndex = validIndices[validRTs.indexOf(Math.max(...validRTs))];
    
    results[minIndex].excluded = true;
    results[minIndex].reason = 'Minimum value removed';
    results[maxIndex].excluded = true;
    results[maxIndex].reason = 'Maximum value removed';
  }
  
  // Get remaining valid trials
  const remainingTrials = trials.filter((_, index) => !results[index].excluded);
  const remainingIndices = results.filter(r => !r.excluded).map(r => r.index);
  
  if (remainingTrials.length < 3) {
    return results;
  }
  
  // Step 3: Remove outliers based on standard deviation
  const remainingRTs = remainingTrials.map(t => t.rtCorrected || t.rtRaw);
  const mean = remainingRTs.reduce((sum, rt) => sum + rt, 0) / remainingRTs.length;
  const stdDev = Math.sqrt(
    remainingRTs.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / remainingRTs.length
  );
  
  const threshold = options.stdDeviations * stdDev;
  
  remainingRTs.forEach((rt, relativeIndex) => {
    const actualIndex = remainingIndices[relativeIndex];
    if (Math.abs(rt - mean) > threshold) {
      results[actualIndex].excluded = true;
      results[actualIndex].reason = `Outlier (${options.stdDeviations}σ rule)`;
    }
  });
  
  return results;
}

/**
 * Preload audio files for auditory tests
 */
export async function preloadAudio(urls: string[]): Promise<HTMLAudioElement[]> {
  const audioElements = urls.map(url => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    return audio;
  });
  
  // Wait for all audio to load
  await Promise.all(
    audioElements.map(audio => 
      new Promise((resolve) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.load();
      })
    )
  );
  
  return audioElements;
}

/**
 * Freeze non-essential rendering during tests
 */
export function freezeNonEssentialRendering(): () => void {
  // Disable smooth scrolling
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  
  // Disable transitions
  const style = document.createElement('style');
  style.innerHTML = `
    *, *::before, *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
    }
  `;
  document.head.appendChild(style);
  
  // Return cleanup function
  return () => {
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
    document.head.removeChild(style);
  };
}
