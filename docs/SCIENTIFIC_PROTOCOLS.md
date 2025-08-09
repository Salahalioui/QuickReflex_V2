# Scientific Protocols

This document details the scientific standards and protocols implemented in QuickReflex for research-grade reaction time testing.

## Overview

QuickReflex implements established protocols from cognitive psychology and neuroscience research to ensure data validity and comparability with published literature.

## Timing Precision

### High-Resolution Timing
- Uses `performance.now()` API for sub-millisecond precision
- Compensates for display refresh rate and touch sampling rate
- Provides device-specific latency calibration

### Calibration Process
1. **Refresh Rate Detection**: Measures actual display refresh rate
2. **Touch Sampling**: Determines touch input sampling frequency  
3. **Latency Compensation**: Calculates device-specific offset
4. **Validation**: Warns about potential timing issues

```javascript
deviceLatencyOffset = (1000 / refreshRate) / 2 + (1000 / touchSampling) / 2
```

## Test Protocols

### Simple Reaction Time (SRT)

**Protocol**: Measure response time to a single, unpredictable stimulus

**Parameters**:
- Trials: 20 (main test) + 5 (practice)
- Inter-stimulus interval: 1.5-4.0 seconds (randomized)
- Stimulus modalities: Visual, auditory, tactile

**Standards**:
- Based on Donders (1869) and modern implementations
- Follows recommendations from Woods et al. (2015)

### Choice Reaction Time (CRT)

**Protocol**: Measure response time when choosing between alternatives

**2-Choice Version**:
- Trials: 40 (main test) + 8 (practice)
- Stimuli: Left/right directional cues
- Response: Touch left/right side of screen
- Spatial validation: Response location must match stimulus

**4-Choice Version**:
- Trials: 40 (main test) + 8 (practice)  
- Stimuli: Up/down/left/right directional cues
- Response: Touch corresponding screen quadrant
- Spatial threshold: 100px from center for valid response

**Standards**:
- Implements Hick-Hyman Law principles
- Spatial accuracy validation per Fitts & Posner (1967)

### Go/No-Go Test

**Protocol**: Measure inhibitory control and response suppression

**Parameters**:
- Go trials: 28 (green "GO" stimulus)
- No-Go trials: 12 (red "STOP" stimulus)
- Practice: 8 trials (70% Go, 30% No-Go)
- Inter-stimulus interval: 1.5-3.0 seconds
- No-Go timeout: 1.5 seconds (auto-advance)

**Response Classification**:
- **Hit**: Correct response to Go stimulus
- **Miss**: No response to Go stimulus
- **False Alarm**: Incorrect response to No-Go stimulus
- **Correct Rejection**: No response to No-Go stimulus

**Standards**:
- Based on Donders Go/No-Go paradigm
- Distribution follows Verbruggen & Logan (2008) recommendations
- False alarm handling per Ratcliff et al. (2018)

## Data Quality Control

### Outlier Detection

**Automatic Exclusion Criteria**:

1. **Anticipatory Responses**: RT < 100ms
   - Rationale: Faster than possible neural transmission
   - Reference: Woodworth & Schlosberg (1954)

2. **Delayed Responses**: 
   - SRT/CRT: RT > 1500ms
   - Go/No-Go: RT > 1000ms
   - Rationale: Indicates inattention or task disengagement

3. **False Alarms** (Go/No-Go only):
   - Responses to No-Go stimuli excluded from RT analysis
   - Included in accuracy calculations only
   - Standard practice per Logan & Cowan (1984)

### Statistical Cleaning

**Multi-step Process**:
1. Remove trials outside absolute bounds (100ms - 1000ms/1500ms)
2. Remove fastest and slowest trials (optional)
3. Apply 2.5 standard deviation rule for remaining outliers
4. Require minimum 3 valid trials for analysis

**Implementation**:
```javascript
function cleanReactionTimes(trials, options = {
  minRT: 100,
  maxRT: 1000, 
  removeMinMax: true,
  stdDeviations: 2.5
})
```

## Scientific Validity

### Reliability Measures
- **Test-Retest Reliability**: Assessed via repeated sessions
- **Internal Consistency**: Cronbach's alpha for multi-trial tests
- **Split-Half Reliability**: Odd/even trial correlation

### Validity Considerations
- **Construct Validity**: Tests measure intended cognitive processes
- **Ecological Validity**: Touch interface approximates real-world responses
- **Concurrent Validity**: Results comparable to established paradigms

### Metadata Collection
- Device specifications (screen size, refresh rate, touch sampling)
- Calibration parameters and timestamps
- Environmental factors (if available)
- Participant demographics (user-provided)

## Export Standards

### Data Formats

**CSV Export**:
- Individual trial data with metadata
- Exclusion flags and reasons
- Calibration parameters
- Summary statistics

**JSON Export**:
- Complete session data
- Hierarchical structure (session -> trials)
- Full metadata preservation

**SPSS Syntax**:
- Import commands for statistical software
- Variable definitions and labels
- Exclusion logic for replication

### Statistical Measures

**Descriptive Statistics**:
- Mean reaction time (valid trials only)
- Standard deviation
- Median and quartiles
- Coefficient of variation

**Go/No-Go Specific**:
- Hit rate (correct Go responses)
- False alarm rate (incorrect No-Go responses)
- Signal detection theory measures (d', β)
- Inhibition success rate

## Research Applications

### Suitable For
- Cognitive psychology experiments
- Clinical assessment batteries
- Sports performance evaluation
- Aging and neurodegeneration studies
- Pharmacological intervention studies

### Limitations
- Touch interface timing (vs. button press)
- Device variability requires calibration
- Network latency in online studies
- Self-paced vs. controlled environment

## References

- Donders, F. C. (1869). On the speed of mental processes.
- Fitts, P. M., & Posner, M. I. (1967). Human performance.
- Logan, G. D., & Cowan, W. B. (1984). On the ability to inhibit thought and action.
- Ratcliff, R., et al. (2018). Modeling response times for two-choice decisions.
- Verbruggen, F., & Logan, G. D. (2008). Response inhibition in the stop-signal paradigm.
- Woods, D. L., et al. (2015). Factors influencing the latency of simple reaction time.
- Woodworth, R. S., & Schlosberg, H. (1954). Experimental psychology.

## Validation Studies

Future validation should compare QuickReflex results with:
- Laboratory-based reaction time tasks
- Established cognitive batteries (CANTAB, CNS-VS)
- Published normative data
- Test-retest reliability studies

For research use, consider:
- Power analysis for sample size determination
- Control for device and environment standardization
- Appropriate statistical methods for RT data
- Replication of key findings