import jsPDF from 'jspdf';
import type { Profile, TestSession, Trial, ExportData } from '@/types';

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData): string {
  const headers = [
    'Profile_ID', 'Profile_Name', 'Age', 'Sport',
    'Session_ID', 'Test_Type', 'Stimulus_Type', 'Session_Date',
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
      const row = [
        data.profile.id,
        `"${data.profile.name}"`,
        data.profile.age?.toString() || '',
        `"${data.profile.sport || ''}"`,
        session.id,
        session.testType,
        session.stimulusType || '',
        session.startedAt ? new Date(session.startedAt).toISOString() : '',
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
  let yPosition = 20;
  
  // Title
  pdf.setFontSize(20);
  pdf.text('QuickReflex - Test Results Summary', 20, yPosition);
  yPosition += 20;
  
  // Profile information
  pdf.setFontSize(14);
  pdf.text('Profile Information', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Name: ${data.profile.name}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Age: ${data.profile.age || 'Not specified'}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Sport: ${data.profile.sport || 'Not specified'}`, 20, yPosition);
  yPosition += 15;
  
  // Calibration information
  pdf.setFontSize(14);
  pdf.text('Device Calibration', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Refresh Rate: ${data.profile.refreshRateHz} Hz`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Touch Sampling: ${data.profile.touchSamplingHz} Hz`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Device Latency Offset: ${data.profile.deviceLatencyOffsetMs.toFixed(2)} ms`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Calibrated: ${data.profile.calibrationTimestamp?.toLocaleDateString() || 'Never'}`, 20, yPosition);
  yPosition += 15;
  
  // Session summaries
  data.sessions.forEach((session, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
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
    
    pdf.setFontSize(14);
    pdf.text(`Session ${index + 1}: ${session.testType} - ${session.stimulusType}`, 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.text(`Date: ${session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'N/A'}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Valid Trials: ${sessionTrials.length}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Mean RT: ${meanRT.toFixed(2)} ms`, 20, yPosition);
    yPosition += 8;
    pdf.text(`SD: ${sdRT.toFixed(2)} ms`, 20, yPosition);
    yPosition += 15;
  });
  
  // Metadata
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(14);
  pdf.text('Export Information', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Export Date: ${new Date(data.metadata.exportDate).toLocaleDateString()}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Application Version: ${data.metadata.version}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Device: ${data.metadata.deviceInfo.substring(0, 50)}`, 20, yPosition);
  
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
    Trial_ID A255
    Trial_Number F8.0
    Is_Practice F1.0
    Stimulus_Detail A255
    RT_Raw_ms F10.2
    RT_Corrected_ms F10.2
    Excluded F1.0
    Exclusion_Reason A255
    Accuracy F1.0
    Refresh_Rate_Hz F10.2
    Touch_Sampling_Hz F10.2
    Device_Latency_Offset_ms F10.4
    Device_Info A1000
    Calibration_Timestamp DATETIME20.

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
