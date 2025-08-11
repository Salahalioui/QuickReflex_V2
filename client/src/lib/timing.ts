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
 * Outlier detection method types
 */
export type OutlierMethod = 'standard_deviation' | 'mad' | 'percentage_trim' | 'iqr';

/**
 * Enhanced outlier detection options
 */
export interface OutlierDetectionOptions {
  minRT: number;
  maxRT: number;
  removeMinMax: boolean;
  method: OutlierMethod;
  // Standard deviation method
  stdDeviations: number;
  // MAD method  
  madThreshold: number;
  // Percentage trimming method
  trimPercentage: number;
  // IQR method
  iqrMultiplier: number;
}

/**
 * Calculate median of an array
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

/**
 * Calculate Median Absolute Deviation (MAD)
 */
function calculateMAD(values: number[]): { median: number; mad: number } {
  const median = calculateMedian(values);
  const deviations = values.map(value => Math.abs(value - median));
  const mad = calculateMedian(deviations);
  return { median, mad };
}

/**
 * Calculate Interquartile Range (IQR) boundaries
 */
function calculateIQR(values: number[]): { q1: number; q3: number; iqr: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  return { q1, q3, iqr };
}

/**
 * Clean reaction time data by removing outliers using robust methods
 */
export function cleanReactionTimes(
  trials: Array<{ rtRaw: number; rtCorrected?: number }>,
  options: Partial<OutlierDetectionOptions> = {}
): Array<{ index: number; excluded: boolean; reason?: string }> {
  // Default options
  const config: OutlierDetectionOptions = {
    minRT: 100,
    maxRT: 1000,
    removeMinMax: true,
    method: 'mad', // Default to MAD for robustness
    stdDeviations: 2.5,
    madThreshold: 3.0, // ~equivalent to 2.5 SD in normal distribution
    trimPercentage: 2.5, // Remove top/bottom 2.5%
    iqrMultiplier: 1.5, // Standard IQR outlier detection
    ...options
  };

  const results = trials.map((_, index) => ({ 
    index, 
    excluded: false, 
    reason: undefined as string | undefined 
  }));
  
  // Step 1: Remove trials outside absolute physiological bounds
  trials.forEach((trial, index) => {
    const rt = trial.rtCorrected || trial.rtRaw;
    if (rt < config.minRT) {
      results[index].excluded = true;
      results[index].reason = `RT below minimum (${config.minRT}ms)`;
    } else if (rt > config.maxRT) {
      results[index].excluded = true;
      results[index].reason = `RT above maximum (${config.maxRT}ms)`;
    }
  });
  
  // Get valid trials for further processing
  const validTrials = trials.filter((_, index) => !results[index].excluded);
  const validIndices = results.filter(r => !r.excluded).map(r => r.index);
  
  if (validTrials.length < 3) {
    return results; // Not enough data for further cleaning
  }
  
  // Step 2: Remove min and max values (optional)
  if (config.removeMinMax && validTrials.length > 4) {
    const validRTs = validTrials.map(t => t.rtCorrected || t.rtRaw);
    const minIndex = validIndices[validRTs.indexOf(Math.min(...validRTs))];
    const maxIndex = validIndices[validRTs.indexOf(Math.max(...validRTs))];
    
    results[minIndex].excluded = true;
    results[minIndex].reason = 'Minimum value removed';
    results[maxIndex].excluded = true;
    results[maxIndex].reason = 'Maximum value removed';
  }
  
  // Get remaining valid trials for outlier detection
  const remainingTrials = trials.filter((_, index) => !results[index].excluded);
  const remainingIndices = results.filter(r => !r.excluded).map(r => r.index);
  
  if (remainingTrials.length < 3) {
    return results;
  }
  
  const remainingRTs = remainingTrials.map(t => t.rtCorrected || t.rtRaw);
  
  // Step 3: Apply selected outlier detection method
  switch (config.method) {
    case 'mad': {
      const { median, mad } = calculateMAD(remainingRTs);
      const threshold = config.madThreshold * mad;
      
      remainingRTs.forEach((rt, relativeIndex) => {
        const actualIndex = remainingIndices[relativeIndex];
        if (Math.abs(rt - median) > threshold) {
          results[actualIndex].excluded = true;
          results[actualIndex].reason = `Outlier (MAD method, ${config.madThreshold}×MAD)`;
        }
      });
      break;
    }
    
    case 'percentage_trim': {
      const sortedRTs = [...remainingRTs].sort((a, b) => a - b);
      const trimCount = Math.floor(sortedRTs.length * (config.trimPercentage / 100));
      const lowerBound = sortedRTs[trimCount];
      const upperBound = sortedRTs[sortedRTs.length - 1 - trimCount];
      
      remainingRTs.forEach((rt, relativeIndex) => {
        const actualIndex = remainingIndices[relativeIndex];
        if (rt <= lowerBound || rt >= upperBound) {
          results[actualIndex].excluded = true;
          results[actualIndex].reason = `Outlier (${config.trimPercentage}% trimming)`;
        }
      });
      break;
    }
    
    case 'iqr': {
      const { q1, q3, iqr } = calculateIQR(remainingRTs);
      const lowerBound = q1 - (config.iqrMultiplier * iqr);
      const upperBound = q3 + (config.iqrMultiplier * iqr);
      
      remainingRTs.forEach((rt, relativeIndex) => {
        const actualIndex = remainingIndices[relativeIndex];
        if (rt < lowerBound || rt > upperBound) {
          results[actualIndex].excluded = true;
          results[actualIndex].reason = `Outlier (IQR method, ${config.iqrMultiplier}×IQR)`;
        }
      });
      break;
    }
    
    case 'standard_deviation':
    default: {
      // Original SD method (kept for comparison)
      const mean = remainingRTs.reduce((sum, rt) => sum + rt, 0) / remainingRTs.length;
      const stdDev = Math.sqrt(
        remainingRTs.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / remainingRTs.length
      );
      const threshold = config.stdDeviations * stdDev;
      
      remainingRTs.forEach((rt, relativeIndex) => {
        const actualIndex = remainingIndices[relativeIndex];
        if (Math.abs(rt - mean) > threshold) {
          results[actualIndex].excluded = true;
          results[actualIndex].reason = `Outlier (${config.stdDeviations}σ rule)`;
        }
      });
      break;
    }
  }
  
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
    if (style.parentNode) {
      document.head.removeChild(style);
    }
  };
}
