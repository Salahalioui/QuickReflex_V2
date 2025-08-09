/**
 * Validation and reliability calculation utilities
 */

export interface ReliabilityMetrics {
  icc: number;
  cv: number;
  sem: number;
  meanRT: number;
  sdRT: number;
}

export interface BlandAltmanData {
  difference: number;
  mean: number;
  session1RT: number;
  session2RT: number;
}

/**
 * Calculate Intraclass Correlation Coefficient (ICC)
 * Two-way mixed model, consistency agreement
 */
export function calculateICC(
  session1RTs: number[],
  session2RTs: number[]
): number {
  if (session1RTs.length !== session2RTs.length || session1RTs.length === 0) {
    throw new Error('Sessions must have equal length and contain data');
  }
  
  const n = session1RTs.length;
  const grandMean = [...session1RTs, ...session2RTs].reduce((sum, rt) => sum + rt, 0) / (2 * n);
  
  // Calculate between-subjects variance
  const subjectMeans = session1RTs.map((rt1, i) => (rt1 + session2RTs[i]) / 2);
  const betweenSubjectVariance = subjectMeans.reduce((sum, mean) => 
    sum + Math.pow(mean - grandMean, 2), 0
  ) / (n - 1);
  
  // Calculate within-subjects variance  
  const withinSubjectVariance = session1RTs.reduce((sum, rt1, i) => {
    const rt2 = session2RTs[i];
    const subjectMean = (rt1 + rt2) / 2;
    return sum + Math.pow(rt1 - subjectMean, 2) + Math.pow(rt2 - subjectMean, 2);
  }, 0) / n;
  
  // Calculate ICC(3,1) - two-way mixed, consistency
  const icc = (betweenSubjectVariance - withinSubjectVariance / 2) / 
               (betweenSubjectVariance + withinSubjectVariance / 2);
  
  return Math.max(0, Math.min(1, icc));
}

/**
 * Calculate Coefficient of Variation (CV%)
 */
export function calculateCV(reactionTimes: number[]): number {
  if (reactionTimes.length === 0) return 0;
  
  const mean = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;
  const variance = reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / reactionTimes.length;
  const sd = Math.sqrt(variance);
  
  return mean === 0 ? 0 : (sd / mean) * 100;
}

/**
 * Calculate Standard Error of Measurement (SEM)
 */
export function calculateSEM(reactionTimes: number[], reliability: number): number {
  if (reactionTimes.length === 0) return 0;
  
  const variance = reactionTimes.reduce((sum, rt) => {
    const mean = reactionTimes.reduce((s, r) => s + r, 0) / reactionTimes.length;
    return sum + Math.pow(rt - mean, 2);
  }, 0) / reactionTimes.length;
  
  const sd = Math.sqrt(variance);
  return sd * Math.sqrt(1 - reliability);
}

/**
 * Calculate comprehensive reliability metrics
 */
export function calculateReliabilityMetrics(
  session1RTs: number[],
  session2RTs: number[]
): ReliabilityMetrics {
  const allRTs = [...session1RTs, ...session2RTs];
  const meanRT = allRTs.reduce((sum, rt) => sum + rt, 0) / allRTs.length;
  const sdRT = Math.sqrt(
    allRTs.reduce((sum, rt) => sum + Math.pow(rt - meanRT, 2), 0) / allRTs.length
  );
  
  const icc = calculateICC(session1RTs, session2RTs);
  const cv = calculateCV(allRTs);
  const sem = calculateSEM(allRTs, icc);
  
  return {
    icc,
    cv,
    sem,
    meanRT,
    sdRT,
  };
}

/**
 * Prepare data for Bland-Altman analysis
 */
export function prepareBlandAltmanData(
  session1RTs: number[],
  session2RTs: number[]
): BlandAltmanData[] {
  if (session1RTs.length !== session2RTs.length) {
    throw new Error('Sessions must have equal length');
  }
  
  return session1RTs.map((rt1, i) => {
    const rt2 = session2RTs[i];
    return {
      difference: rt1 - rt2,
      mean: (rt1 + rt2) / 2,
      session1RT: rt1,
      session2RT: rt2,
    };
  });
}

/**
 * Calculate Bland-Altman statistics
 */
export function calculateBlandAltmanStats(data: BlandAltmanData[]) {
  const differences = data.map(d => d.difference);
  const meanDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  const sdDifference = Math.sqrt(
    differences.reduce((sum, diff) => sum + Math.pow(diff - meanDifference, 2), 0) / differences.length
  );
  
  const lowerLimit = meanDifference - 1.96 * sdDifference;
  const upperLimit = meanDifference + 1.96 * sdDifference;
  
  // Count outliers (points outside limits of agreement)
  const outliers = differences.filter(diff => 
    diff < lowerLimit || diff > upperLimit
  ).length;
  
  return {
    meanDifference,
    sdDifference,
    lowerLimit,
    upperLimit,
    outliers,
    totalPoints: data.length,
    outlierPercentage: (outliers / data.length) * 100,
  };
}

/**
 * Device profiler for manual calibration validation
 */
export class DeviceProfiler {
  private measurements: number[] = [];
  
  async runCalibrationCheck(
    refreshRateHz: number,
    touchSamplingHz: number
  ): Promise<{
    isValid: boolean;
    estimatedRefreshRate?: number;
    estimatedTouchSampling?: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    
    // Validate refresh rate
    if (refreshRateHz < 30 || refreshRateHz > 240) {
      warnings.push(`Unusual refresh rate: ${refreshRateHz}Hz. Common values are 60, 90, 120, or 144Hz.`);
    }
    
    // Validate touch sampling
    if (touchSamplingHz < 60 || touchSamplingHz > 1000) {
      warnings.push(`Unusual touch sampling: ${touchSamplingHz}Hz. Common values are 120-360Hz.`);
    }
    
    // Check if touch sampling is lower than refresh rate
    if (touchSamplingHz < refreshRateHz) {
      warnings.push('Touch sampling rate is lower than display refresh rate. This may affect accuracy.');
    }
    
    const computedOffset = (1000 / refreshRateHz) / 2 + (1000 / touchSamplingHz) / 2;
    
    if (computedOffset > 50) {
      warnings.push(`High device latency offset: ${computedOffset.toFixed(2)}ms. Consider using a device with higher refresh and touch sampling rates.`);
    }
    
    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }
  
  recordMeasurement(timestamp: number): void {
    this.measurements.push(timestamp);
  }
  
  analyzeMeasurements(): {
    averageInterval: number;
    estimatedFrameRate: number;
    jitter: number;
  } {
    if (this.measurements.length < 2) {
      return {
        averageInterval: 0,
        estimatedFrameRate: 0,
        jitter: 0,
      };
    }
    
    const intervals = [];
    for (let i = 1; i < this.measurements.length; i++) {
      intervals.push(this.measurements[i] - this.measurements[i - 1]);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const estimatedFrameRate = 1000 / averageInterval;
    
    const jitter = Math.sqrt(
      intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length
    );
    
    return {
      averageInterval,
      estimatedFrameRate,
      jitter,
    };
  }
  
  reset(): void {
    this.measurements = [];
  }
}
