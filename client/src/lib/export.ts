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
    'Excluded', 'Exclusion_Reason', 'Accuracy', 
    'Refresh_Rate_Hz', 'Touch_Sampling_Hz', 'Device_Latency_Offset_ms',
    'Device_Info', 'Calibration_Timestamp', 'Cross_Modal_Warning_Shown',
    'Calibration_Limitations'
  ];
  
  let csv = headers.join(',') + '\n';
  
  // Combine all data into rows
  const rows: string[][] = [];
  
  data.sessions.forEach(session => {
    const sessionTrials = data.trials.filter(trial => trial.sessionId === session.id);
    
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
  
  // Device Calibration Section
  pdf.setFillColor(250, 250, 255);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 40, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Device Calibration & Technical Setup', 20, yPosition + 5);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  // Calibration info in organized layout
  pdf.text(`Display Refresh Rate:`, leftCol, yPosition + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.refreshRateHz} Hz`, leftCol + 60, yPosition + 15);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Touch Sampling Rate:`, rightCol, yPosition + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.touchSamplingHz} Hz`, rightCol + 60, yPosition + 15);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Device Latency Offset:`, leftCol, yPosition + 25);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.deviceLatencyOffsetMs.toFixed(2)} ms`, leftCol + 60, yPosition + 25);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Calibration Date:`, rightCol, yPosition + 25);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.profile.calibrationTimestamp ? new Date(data.profile.calibrationTimestamp).toLocaleDateString() : 'Not calibrated'}`, rightCol + 60, yPosition + 25);
  pdf.setFont('helvetica', 'normal');
  
  yPosition += 50;
  
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
    
    // Extract outlier method from session metadata
    const outlierMethod = (session.metadata as any)?.configuration?.outlierMethod || 'standard_deviation';
    const outlierMethodName = outlierMethod === 'mad' ? 'MAD (Median Absolute Deviation)' :
                             outlierMethod === 'percentage_trim' ? 'Percentage Trimming (2.5%)' :
                             outlierMethod === 'iqr' ? 'IQR (Interquartile Range)' :
                             'Standard Deviation (±2.5σ)';
    
    // Get total trials and outliers count
    const allTrials = data.trials.filter(trial => trial.sessionId === session.id && !trial.isPractice);
    const outliersCount = allTrials.filter(trial => trial.excludedFlag).length;
    
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
    pdf.text('Raw reaction time including all components', 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Standard deviation
    pdf.text('Standard Dev.', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${sdRT.toFixed(1)} ms`, 80, yPosition + (currentRow * rowHeight));
    pdf.text('Variability measure', 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
    // Outlier method
    pdf.text('Outlier Method', 25, yPosition + (currentRow * rowHeight));
    pdf.text(`${outlierMethod.toUpperCase()}`, 80, yPosition + (currentRow * rowHeight));
    pdf.text(`${outlierMethodName}`, 130, yPosition + (currentRow * rowHeight));
    currentRow++;
    
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
  
  // Add a Scientific Methodology section
  if (yPosition > pageHeight - 120) {
    addFooter(pageNumber);
    pdf.addPage();
    addHeader();
    pageNumber++;
    yPosition = 35;
  }
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Scientific Methodology & Data Processing', 15, yPosition);
  yPosition += 20;
  
  // Methodology sections with professional formatting
  const addMethodologySection = (title: string, items: string[], bgColor: [number, number, number] = [250, 250, 250]) => {
    if (yPosition > pageHeight - 100) {
      addFooter(pageNumber);
      pdf.addPage();
      addHeader();
      pageNumber++;
      yPosition = 35;
    }
    
    const sectionHeight = 15 + (items.length * 6);
    pdf.setFillColor(...bgColor);
    pdf.rect(15, yPosition - 5, pageWidth - 30, sectionHeight, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 54, 93);
    pdf.text(title, 20, yPosition + 5);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    items.forEach((item, index) => {
      pdf.text(item, 25, yPosition + 15 + (index * 6));
    });
    
    yPosition += sectionHeight + 10;
  };
  
  // Data processing methods
  addMethodologySection('Outlier Detection Methods', [
    '• MAD (Median Absolute Deviation): Robust statistical method resistant to extreme outliers',
    '• Percentage Trimming: Removes fastest and slowest 2.5% of reaction times',
    '• IQR (Interquartile Range): Uses Q1-1.5×IQR and Q3+1.5×IQR boundaries',
    '• Standard Deviation: Traditional method using mean ± 2.5 standard deviations',
    '• Method selection varies by session based on researcher preference'
  ], [245, 250, 255]);
  
  // MIT methodology
  addMethodologySection('Movement Initiation Time (MIT) Analysis', [
    '• MIT measured using 30-tap finger tapping protocol',
    '• Raw RT = Stimulus Detection Time + Movement Time + System Latency',
    '• MIT-corrected RT isolates cognitive processing by subtracting movement component',
    '• MIT reliability calculated using Intraclass Correlation Coefficient (ICC)',
    '• Only sessions with reliable MIT data (ICC > 0.70) provide corrected values'
  ], [250, 255, 245]);
  
  // Data quality standards
  addMethodologySection('Data Quality Assurance', [
    '• Practice trials excluded from all statistical analyses',
    '• Anticipatory responses (<100ms) automatically flagged as outliers',
    '• Delayed responses (>1000ms for SRT, >1500ms for CRT) flagged as outliers',
    '• False alarm responses in Go/No-Go tests excluded from RT calculations',
    '• Cross-modal stimulus comparisons require scientific interpretation caution'
  ], [255, 250, 245]);
  
  // Technical specifications
  addMethodologySection('Technical Measurement Standards', [
    '• High-resolution timing using Performance.now() API (sub-millisecond precision)',
    '• Device latency compensation through calibration protocols',
    '• Touch event sampling optimized for rapid response detection',
    '• Results valid for within-modality comparisons and longitudinal tracking',
    '• Export data includes both raw and processed values for transparency'
  ], [250, 250, 255]);
  
  // Report footer metadata
  if (yPosition > pageHeight - 80) {
    addFooter(pageNumber);
    pdf.addPage();
    addHeader();
    pageNumber++;
    yPosition = 35;
  }
  
  // Final metadata section
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('Report Generation Information', 20, yPosition + 5);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  pdf.text(`Generated: ${new Date(data.metadata.exportDate).toLocaleDateString()} at ${new Date(data.metadata.exportDate).toLocaleTimeString()}`, 25, yPosition + 15);
  pdf.text(`Platform: QuickReflex v${data.metadata.version} - Research-Grade Reaction Time Testing`, 25, yPosition + 22);
  pdf.text(`Device: ${data.metadata.deviceInfo.substring(0, 80)}`, 25, yPosition + 29);
  
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
