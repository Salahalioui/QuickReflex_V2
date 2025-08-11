import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info, Monitor, Volume2, Smartphone, Clock } from "lucide-react";
import { CalibrationLimitationEnum, StimulusTypeEnum } from "@shared/schema";

interface CalibrationTransparencyProps {
  stimulusType: StimulusTypeEnum;
  deviceInfo?: string;
  refreshRateHz?: number;
  limitations: CalibrationLimitationEnum[];
  onLimitationsUpdate: (limitations: CalibrationLimitationEnum[]) => void;
}

export default function CalibrationTransparency({ 
  stimulusType, 
  deviceInfo, 
  refreshRateHz = 60,
  limitations,
  onLimitationsUpdate 
}: CalibrationTransparencyProps) {
  
  // Define stimulus-specific calibration information
  const stimulusCalibrationInfo = {
    visual: {
      icon: Monitor,
      title: "Visual Stimulus Calibration",
      description: "Display-related timing measurements and limitations",
      measurements: [
        { label: "Display Refresh Rate", value: `${refreshRateHz}Hz`, estimated: true, limitation: false },
        { label: "Pixel Response Time", value: "Unknown", limitation: true, estimated: false },
        { label: "Input Lag", value: "Unknown", limitation: true, estimated: false },
        { label: "Frame Buffer Delay", value: "Unknown", limitation: true, estimated: false }
      ],
      knownLimitations: [
        "no_external_hardware_calibration",
        "display_refresh_rate_estimation_only",
        "system_latency_not_precisely_measured"
      ] as CalibrationLimitationEnum[]
    },
    auditory: {
      icon: Volume2,
      title: "Auditory Stimulus Calibration", 
      description: "Audio system timing measurements and limitations",
      measurements: [
        { label: "Audio Buffer Size", value: "Unknown", limitation: true, estimated: false },
        { label: "Sample Rate", value: "Unknown", limitation: true, estimated: false },
        { label: "Speaker/Headphone Lag", value: "Unknown", limitation: true, estimated: false },
        { label: "Audio Driver Delay", value: "Unknown", limitation: true, estimated: false }
      ],
      knownLimitations: [
        "no_external_hardware_calibration",
        "audio_buffer_delay_unknown",
        "system_latency_not_precisely_measured"
      ] as CalibrationLimitationEnum[]
    },
    tactile: {
      icon: Smartphone,
      title: "Tactile Stimulus Calibration",
      description: "Vibration motor timing measurements and limitations", 
      measurements: [
        { label: "Motor Startup Time", value: "Unknown", limitation: true, estimated: false },
        { label: "Vibration Intensity", value: "Device Default", estimated: true, limitation: false },
        { label: "Motor Response Curve", value: "Unknown", limitation: true, estimated: false },
        { label: "Device API Delay", value: "Unknown", limitation: true, estimated: false }
      ],
      knownLimitations: [
        "no_external_hardware_calibration",
        "tactile_motor_startup_latency_unknown",
        "system_latency_not_precisely_measured"
      ] as CalibrationLimitationEnum[]
    }
  };

  const currentStimulus = stimulusCalibrationInfo[stimulusType];
  const IconComponent = currentStimulus.icon;

  // Update limitations when component mounts or stimulus changes
  React.useEffect(() => {
    const newLimitations = Array.from(new Set([...limitations, ...currentStimulus.knownLimitations]));
    if (JSON.stringify(newLimitations.sort()) !== JSON.stringify(limitations.sort())) {
      onLimitationsUpdate(newLimitations);
    }
  }, [stimulusType, limitations, onLimitationsUpdate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-blue-500" />
          {currentStimulus.title}
        </CardTitle>
        <CardDescription>
          {currentStimulus.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* What We Measure */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Current Measurements
          </h3>
          <div className="grid gap-2">
            {currentStimulus.measurements.map((measurement, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-sm">{measurement.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{measurement.value}</span>
                  {measurement.estimated && (
                    <Badge variant="secondary" className="text-xs">Estimated</Badge>
                  )}
                  {measurement.limitation && (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                      Unknown
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Device Information */}
        {deviceInfo && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Device Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {deviceInfo}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Calibration Limitations */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Known Limitations
          </h3>
          
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>What "calibration" means here:</strong> We measure basic system properties like refresh rate, 
              but cannot perform true hardware-level calibration without external equipment. 
              This provides system characterization, not precise timing correction.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {currentStimulus.knownLimitations.map((limitation) => {
              const limitationDescriptions = {
                no_external_hardware_calibration: "No external hardware used to measure actual stimulus-to-perception latency",
                cross_modal_timing_differences_not_measured: "Cannot measure timing differences between stimulus modalities",
                system_latency_not_precisely_measured: "System-level delays are estimated, not precisely measured",
                display_refresh_rate_estimation_only: "Display refresh rate is estimated from browser API, not measured",
                audio_buffer_delay_unknown: "Audio buffer and driver delays are not measured",
                tactile_motor_startup_latency_unknown: "Vibration motor startup time is not characterized"
              };

              return (
                <div key={limitation} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5" />
                  <span className="text-xs text-amber-800 dark:text-amber-200">
                    {limitationDescriptions[limitation]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* What This Means */}
        <div>
          <h3 className="font-semibold mb-3">Implications for Your Data</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              • <strong>Absolute timing:</strong> Your reaction times include unmeasured system delays
            </p>
            <p>
              • <strong>Relative changes:</strong> Comparisons over time within the same setup are valid
            </p>
            <p>
              • <strong>Cross-device:</strong> Results may not be comparable across different devices
            </p>
            <p>
              • <strong>Research use:</strong> Consider these limitations when interpreting results
            </p>
          </div>
        </div>

        {/* Recommendation for True Calibration */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>For research-grade measurements:</strong> Consider using external hardware like photodiodes 
            (for visual), microphones (for auditory), or accelerometers (for tactile) to measure actual 
            stimulus-to-perception latencies and correct for system delays.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Hook to get calibration limitations for a stimulus type
export function useCalibrationLimitations(stimulusType: StimulusTypeEnum): CalibrationLimitationEnum[] {
  const limitationsMap = {
    visual: [
      "no_external_hardware_calibration",
      "display_refresh_rate_estimation_only", 
      "system_latency_not_precisely_measured"
    ] as CalibrationLimitationEnum[],
    auditory: [
      "no_external_hardware_calibration",
      "audio_buffer_delay_unknown",
      "system_latency_not_precisely_measured"
    ] as CalibrationLimitationEnum[],
    tactile: [
      "no_external_hardware_calibration", 
      "tactile_motor_startup_latency_unknown",
      "system_latency_not_precisely_measured"
    ] as CalibrationLimitationEnum[]
  };

  return limitationsMap[stimulusType] || [];
}