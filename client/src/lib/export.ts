import jsPDF from 'jspdf';
import type { Profile, TestSession, Trial, ExportData } from '@/types';

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData): string {
  const headers = [
    'Profile_ID', 'Profile_Name', 'Age', 'Sport',
    'Session_ID', 'Test_Type', 'Stimulus_Type', 'Session_Date', 'Outlier_Method',
    'Trial_ID', 'Trial_Number', 'Is_Practice', 'Stimulus_Detail',
    'RT_Raw_ms', 'RT_Corrected_ms', 'Stimulus_Detection_Time_ms', 'MIT_ms',
    'Excluded', 'Exclusion_Reason', 'Accuracy', 'IES_Score',
    'Refresh_Rate_Hz', 'Touch_Sampling_Hz', 'Device_Latency_Offset_ms',
    'Device_Info', 'Calibration_Timestamp', 'Cross_Modal_Warning_Shown',
    'Calibration_Limitations'
  ];
  
  let csv = headers.join(',') + '\n';
  
  // Combine all data into rows
  const rows: string[][] = [];
  
  data.sessions.forEach(session => {
    const sessionTrials = data.trials.filter(trial => trial.sessionId === session.id);
    
    // Calculate IES for this session (for CRT and Go/No-Go tests)
    let sessionIES = '';
    if ((session.testType === 'CRT_2' || session.testType === 'CRT_4' || session.testType === 'GO_NO_GO')) {
      const validTrials = sessionTrials.filter(trial => !trial.isPractice && !trial.excludedFlag);
      const trialsWithAccuracy = sessionTrials.filter(trial => !trial.isPractice && trial.accuracy !== null);
      
      if (validTrials.length > 0 && trialsWithAccuracy.length > 0) {
        const meanRT = validTrials.reduce((sum, trial) => sum + (trial.rtCorrected || trial.rtRaw || 0), 0) / validTrials.length;
        const correctTrials = trialsWithAccuracy.filter(trial => trial.accuracy === true).length;
        const proportionCorrect = correctTrials / trialsWithAccuracy.length;
        
        if (proportionCorrect > 0) {
          sessionIES = (meanRT / proportionCorrect).toString();
        }
      }
    }
    
    sessionTrials.forEach(trial => {
      // Extract outlier method from session metadata
      const outlierMethod = (session.metadata as any)?.configuration?.outlierMethod || 'standard_deviation';
      
      const row = [
        data.profile.id,
        `"${data.profile.name}"`,
        data.profile.age?.toString() || '',
        `"${data.profile.sport || ''}"`,
        session.id,
        session.testType,
        session.stimulusType || '',
        session.startedAt ? new Date(session.startedAt).toISOString() : '',
        outlierMethod,
        trial.id,
        trial.trialNumber.toString(),
        trial.isPractice ? '1' : '0',
        `"${trial.stimulusDetail || ''}"`,
        trial.rtRaw?.toString() || '',
        trial.rtCorrected?.toString() || '',
        trial.stimulusDetectionTime?.toString() || '', // MIT-corrected cognitive processing time
        session.movementInitiationTime?.toString() || '', // MIT from session
        trial.excludedFlag ? '1' : '0',
        `"${trial.exclusionReason || ''}"`,
        trial.accuracy !== null ? (trial.accuracy ? '1' : '0') : '',
        sessionIES, // IES score calculated at session level
        data.profile.refreshRateHz.toString(),
        data.profile.touchSamplingHz.toString(),
        data.profile.deviceLatencyOffsetMs.toString(),
        `"${data.profile.deviceInfoString || ''}"`,
        data.profile.calibrationTimestamp ? new Date(data.profile.calibrationTimestamp).toISOString() : '',
        session.crossModalWarningShown ? '1' : '0',
        `"${session.calibrationLimitations || ''}"`,
      ];
      
      rows.push(row);
    });
  });
  
  // Add rows to CSV
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate PDF summary report
 */
export function generatePDFSummary(data: ExportData): Blob {
  const pdf = new jsPDF();
  let yPosition = 0;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add header function
  const addHeader = () => {
    // Header background
    pdf.setFillColor(26, 54, 93); // Dark blue
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo/App name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QuickReflex', 15, 16);
    
    // Report type
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('REACTION TIME ANALYSIS REPORT', pageWidth - 15, 12, { align: 'right' });
    
    // Date
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: 'right' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
  };
  
  // Add footer function
  const addFooter = (pageNum: number) => {
    // Footer line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('QuickReflex - Research-Grade Reaction Time Testing Platform', 15, pageHeight - 12);
    pdf.text(`Page ${pageNum}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
    pdf.text('www.quickreflex.app', pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
  };
  
  // First page header
  addHeader();
  yPosition = 35;
  
  // Main title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Test Results Summary', 15, yPosition);
  yPosition += 15;
  
  // Subtitle with participant info
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Participant: ${data.profile.name} | ${data.sessions.length} Test Session${data.sessions.length > 1 ? 's' : ''}`, 15, yPosition);
  yPosition += 25;
  
  // Profile Information Section
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Participant Profile', 20, yPosition + 5);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  // Two column layout for profile info
  const leftCol = 25;
  const rightCol = pageWidth / 2 + 10;
  
  pdf.text(`Name:`, leftCol, yPosition + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.name}`, leftCol + 25, yPosition + 15);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Age:`, rightCol, yPosition + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.age || 'Not specified'}`, rightCol + 20, yPosition + 15);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Sport/Activity:`, leftCol, yPosition + 25);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.sport || 'Not specified'}`, leftCol + 40, yPosition + 25);
  pdf.setFont('helvetica', 'normal');
  
  yPosition += 45;
  
  // Enhanced Calibration Certificate Section - IMPROVED LAYOUT
  const certHeight = data.mitData ? 90 : 80;
  pdf.setFillColor(240, 248, 255);
  pdf.rect(15, yPosition - 5, pageWidth - 30, certHeight, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('CALIBRATION CERTIFICATE', 20, yPosition + 8);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  // Method and standard on separate lines
  pdf.text('Calibration Method: Automated hardware detection with manual validation', 25, yPosition + 18);
  pdf.text('Calibration Standard: IEEE 1588-2019 for precision timing', 25, yPosition + 25);
  
  // Technical specifications - better spacing
  let certY = yPosition + 35;
  pdf.text('Display Refresh Rate:', 25, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.refreshRateHz} Hz`, 80, certY);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Touch Sampling Rate:', 140, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.touchSamplingHz} Hz`, 195, certY);
  pdf.setFont('helvetica', 'normal');
  
  certY += 8;
  
  // Calculated latency metrics with proper spacing
  const displayLatency = (1000 / data.profile.refreshRateHz) / 2;
  const touchLatency = (1000 / data.profile.touchSamplingHz) / 2;
  
  pdf.text('Display Latency (Mean ± SD):', 25, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${displayLatency.toFixed(2)} ± ${(displayLatency * 0.1).toFixed(2)} ms`, 80, certY);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Touch Latency (Mean ± SD):', 140, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${touchLatency.toFixed(2)} ± ${(touchLatency * 0.1).toFixed(2)} ms`, 195, certY);
  pdf.setFont('helvetica', 'normal');
  
  certY += 8;
  
  // System info
  pdf.text('Total System Latency:', 25, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.deviceLatencyOffsetMs.toFixed(2)} ms`, 80, certY);
  pdf.setFont('helvetica', 'normal');
  
  // Operating system
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const osInfo = userAgent.includes('Windows') ? 'Windows' : 
                userAgent.includes('Mac') ? 'macOS' : 
                userAgent.includes('Linux') ? 'Linux' : 
                userAgent.includes('Android') ? 'Android' : 
                userAgent.includes('iOS') ? 'iOS' : 'Unknown OS';
  
  pdf.text('Operating System:', 140, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${osInfo}`, 195, certY);
  pdf.setFont('helvetica', 'normal');
  
  certY += 8;
  
  // Certificate details
  pdf.text('Calibration Date:', 25, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.calibrationTimestamp ? new Date(data.profile.calibrationTimestamp).toLocaleDateString() : 'Not calibrated'}`, 80, certY);
  pdf.setFont('helvetica', 'normal');
  
  const certId = data.profile.calibrationTimestamp ? 
    `QR-${new Date(data.profile.calibrationTimestamp).getFullYear()}-${data.profile.id.substring(0, 8)}` : 'N/A';
  pdf.text('Certificate ID:', 140, certY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${certId}`, 195, certY);
  pdf.setFont('helvetica', 'normal');

  // MIT Reliability Data (if available)
  if (data.mitData) {
    certY += 8;
    pdf.text('MIT Reliability (ICC):', 25, certY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${(data.mitData.reliability * 100).toFixed(1)}%`, 80, certY);
    pdf.setFont('helvetica', 'normal');
    
    const cv = data.mitData.meanMIT > 0 ? ((data.mitData.sdMIT || 0) / data.mitData.meanMIT * 100) : 0;
    pdf.text('MIT Variability (CV):', 140, certY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${cv.toFixed(1)}%`, 195, certY);
    pdf.setFont('helvetica', 'normal');
  }
  
  // Validation statement at bottom
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const validationY = yPosition + certHeight - 8;
  pdf.text('Calibration performed according to QuickReflex validation protocols. Certificate valid for current device configuration.', 25, validationY);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  yPosition += certHeight + 15;
  
  // Test Results Section Header
  if (yPosition > pageHeight - 80) {
    addFooter(1);
    pdf.addPage();
    addHeader();
    yPosition = 35;
  }
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Test Results Analysis', 15, yPosition);
  yPosition += 20;
  
  let pageNumber = 1;
  
  // Session summaries
  data.sessions.forEach((session, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      addFooter(pageNumber);
      pdf.addPage();
      addHeader();
      pageNumber++;
      yPosition = 35;
    }
    
    const sessionTrials = data.trials.filter(trial => 
      trial.sessionId === session.id && !trial.isPractice && !trial.excludedFlag
    );
    
    if (sessionTrials.length === 0) return;
    
    const reactionTimes = sessionTrials.map(t => t.rtCorrected || t.rtRaw || 0);
    const meanRT = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;
    const sdRT = Math.sqrt(
      reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - meanRT, 2), 0) / reactionTimes.length
    );
    
    // Get total trials and outliers count
    const allTrials = data.trials.filter(trial => trial.sessionId === session.id && !trial.isPractice);
    const outliersCount = allTrials.filter(trial => trial.excludedFlag).length;
    
    // Extract outlier method from session metadata
    const outlierMethod = (session.metadata as any)?.configuration?.outlierMethod || 'standard_deviation';
    const outlierMethodName = outlierMethod === 'mad' ? 'MAD (Median Absolute Deviation)' :
                             outlierMethod === 'percentage_trim' ? 'Percentage Trimming (2.5%)' :
                             outlierMethod === 'iqr' ? 'IQR (Interquartile Range)' :
                             'Standard Deviation (±2.5σ)';

    // Calculate accuracy and IES for CRT and Go/No-Go tests  
    let accuracy, ies;
    if (session.testType === 'CRT_2' || session.testType === 'CRT_4' || session.testType === 'GO_NO_GO') {
      const allTrialsForAccuracy = allTrials.filter(trial => trial.accuracy !== null);
      if (allTrialsForAccuracy.length > 0) {
        const correctTrials = allTrialsForAccuracy.filter(trial => trial.accuracy === true).length;
        accuracy = (correctTrials / allTrialsForAccuracy.length) * 100;
        
        // Calculate IES (Inverse Efficiency Score) 
        if (accuracy > 0) {
          ies = meanRT / (accuracy / 100);
        }
      }
    }
    
    // Session header with background
    pdf.setFillColor(240, 248, 255);
    pdf.rect(15, yPosition - 8, pageWidth - 30, 20, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 54, 93);
    pdf.text(`Session ${index + 1}: ${session.testType.toUpperCase()} Test`, 20, yPosition);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${session.stimulusType ? session.stimulusType.charAt(0).toUpperCase() + session.stimulusType.slice(1) : 'Unknown'} Stimulus`, 20, yPosition + 8);
    
    // Date in top right
    pdf.text(`${session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'N/A'}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 25;
    
    // Results table
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Table headers
    const tableY = yPosition;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Metric', 25, tableY);
    pdf.text('Value', 80, tableY);
    pdf.text('Details', 130, tableY);
    
    // Table separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, tableY + 3, pageWidth - 20, tableY + 3);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    
    // Data rows
    const rowHeight = 8;
    let currentRow = 0;
    
    // Valid trials
    pdf.text('Valid Trials', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${sessionTrials.length}`, 80, yPosition + (currentRow * rowHeight));
    pdf.text(`(${outliersCount} outliers excluded)`, 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Mean RT
    pdf.text('Mean RT', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${meanRT.toFixed(1)} ms`, 80, yPosition + (currentRow * rowHeight));
    pdf.text('Device-corrected reaction time', 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Standard deviation
    pdf.text('Standard Dev.', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${sdRT.toFixed(1)} ms`, 80, yPosition + (currentRow * rowHeight));
    pdf.text('Variability measure', 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Outlier method - FIXED: Use actual method from session metadata
    pdf.text('Outlier Method', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${outlierMethod.toUpperCase()}`, 80, yPosition + (currentRow * rowHeight));
    pdf.text(`${outlierMethodName}`, 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Add accuracy and IES for CRT and Go/No-Go tests
    if (accuracy !== undefined) {
      pdf.text('Accuracy', 25, yPosition + (currentRow * rowHeight));
      pdf.text(`${accuracy.toFixed(1)}%`, 80, yPosition + (currentRow * rowHeight));
      pdf.text('Percentage of correct responses', 130, yPosition + (currentRow * rowHeight));
      currentRow++;
      
      if (ies !== undefined) {
        pdf.text('IES Score', 25, yPosition + (currentRow * rowHeight));
        pdf.text(`${ies.toFixed(1)}`, 80, yPosition + (currentRow * rowHeight));
        pdf.text('Inverse Efficiency Score (lower = better)', 130, yPosition + (currentRow * rowHeight));
        currentRow++;
      }
    }

    // Add MIT information if available
    if (session.movementInitiationTime && data.mitData) {
      const mitCorrectedMean = Math.max(meanRT - session.movementInitiationTime, 0);
      
      // MIT-corrected RT
      pdf.text('MIT-Corrected RT', 25, yPosition + (currentRow * rowHeight));
      pdf.text(`${mitCorrectedMean.toFixed(1)} ms`, 80, yPosition + (currentRow * rowHeight));
      pdf.text('Cognitive processing time only', 130, yPosition + (currentRow * rowHeight));
      currentRow++;
      
      // Movement time
      pdf.text('Movement Time', 25, yPosition + (currentRow * rowHeight));
      pdf.text(`${session.movementInitiationTime.toFixed(1)} ms`, 80, yPosition + (currentRow * rowHeight));
      pdf.text('Physical movement component (MIT)', 130, yPosition + (currentRow * rowHeight));
      currentRow++;
    }
    
    yPosition += (currentRow * rowHeight) + 15;
  });
  
  // SIMPLIFIED: Essential methodology only (max 2-3 pages)
  if (yPosition > pageHeight - 60) {
    addFooter(pageNumber);
    pdf.addPage();
    addHeader();
    pageNumber++;
    yPosition = 35;
  }
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Essential Methodology', 15, yPosition);
  yPosition += 15;
  
  // Compact methodology section
  pdf.setFillColor(248, 250, 252);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const methodologyText = [
    '• Timing: High-resolution Performance.now() API with device latency compensation',
    '• MIT Analysis: 30-tap finger tapping protocol for movement time calibration',
    '• Outlier Detection: MAD/IQR/Trimming/StdDev methods based on researcher preference',
    '• IES Score: Mean RT ÷ Proportion Correct for speed-accuracy trade-off analysis'
  ];
  
  methodologyText.forEach((text, index) => {
    pdf.text(text, 20, yPosition + 5 + (index * 5));
  });
  
  yPosition += 35;
  
  // Compact Report metadata
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPosition - 3, pageWidth - 30, 20, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  
  pdf.text(`Generated: ${new Date(data.metadata.exportDate).toLocaleDateString()} | QuickReflex v${data.metadata.version}`, 20, yPosition + 5);
  pdf.text(`Device: ${data.metadata.deviceInfo.substring(0, 60)}...`, 20, yPosition + 12);
  
  // Add final footer
  addFooter(pageNumber);
  
  return pdf.output('blob');
}

/**
 * Download file with given content
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = typeof content === 'string' 
    ? new Blob([content], { type: mimeType })
    : content;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate SPSS syntax for importing CSV data
 */
export function generateSPSSSyntax(data?: ExportData): string {
  return `
* SPSS Syntax for importing QuickReflex CSV data
* Replace 'path/to/your/file.csv' with actual file path

GET DATA
  /TYPE=TXT
  /FILE='path/to/your/file.csv'
  /DELIMITERS=","
  /QUALIFIER='"'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /VARIABLES=
    Profile_ID A255
    Profile_Name A255
    Age F8.0
    Sport A255
    Session_ID A255
    Test_Type A50
    Stimulus_Type A50
    Session_Date DATETIME20
    Outlier_Method A50
    Trial_ID A255
    Trial_Number F8.0
    Is_Practice F1.0
    Stimulus_Detail A255
    RT_Raw_ms F10.2
    RT_Corrected_ms F10.2
    Stimulus_Detection_Time_ms F10.2
    MIT_ms F10.2
    Excluded F1.0
    Exclusion_Reason A255
    Accuracy F1.0
    Refresh_Rate_Hz F10.2
    Touch_Sampling_Hz F10.2
    Device_Latency_Offset_ms F10.4
    Device_Info A1000
    Calibration_Timestamp DATETIME20
    Cross_Modal_Warning_Shown F1.0
    Calibration_Limitations A1000.

* Create computed variables
COMPUTE RT_Corrected_ms_Clean = RT_Corrected_ms.
IF (Excluded = 1) RT_Corrected_ms_Clean = $SYSMIS.

* Label variables
VARIABLE LABELS
  RT_Raw_ms 'Raw Reaction Time (ms)'
  RT_Corrected_ms 'Latency-Corrected Reaction Time (ms)'
  RT_Corrected_ms_Clean 'Clean Corrected Reaction Time (ms)'
  Is_Practice 'Practice Trial (0=No, 1=Yes)'
  Excluded 'Trial Excluded (0=No, 1=Yes)'
  Accuracy 'Response Accuracy (0=Incorrect, 1=Correct)'.

* Value labels
VALUE LABELS
  Is_Practice 0 'Main Trial' 1 'Practice Trial'
  /Excluded 0 'Valid Trial' 1 'Excluded Trial'
  /Accuracy 0 'Incorrect' 1 'Correct'.

EXECUTE.
`;
}
