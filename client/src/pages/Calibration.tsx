import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Music2 } from 'lucide-react';
import { DeviceProfiler } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

export default function Calibration() {
  const { 
    calibrationData, 
    updateCalibration, 
    saveCalibration,
    currentProfile 
  } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [refreshRateHz, setRefreshRateHz] = useState(calibrationData.refreshRateHz.toString());
  const [touchSamplingHz, setTouchSamplingHz] = useState(calibrationData.touchSamplingHz.toString());
  const [isCustomRefreshRate, setIsCustomRefreshRate] = useState(false);
  const [customRefreshRate, setCustomRefreshRate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const deviceProfiler = new DeviceProfiler();

  useEffect(() => {
    const refreshRate = isCustomRefreshRate ? 
      parseFloat(customRefreshRate) || 60 : 
      parseFloat(refreshRateHz);
    const touchSampling = touchSamplingHz === 'unknown' ? 120 : parseFloat(touchSamplingHz);
    
    updateCalibration({
      refreshRateHz: refreshRate,
      touchSamplingHz: touchSampling,
      deviceLatencyOffsetMs: 0, // Will be computed by updateCalibration
    });
  }, [refreshRateHz, touchSamplingHz, isCustomRefreshRate, customRefreshRate, updateCalibration]);

  const handleSaveCalibration = async () => {
    if (!currentProfile) {
      toast({
        title: "No Profile",
        description: "Please create a profile before calibrating.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const refreshRate = isCustomRefreshRate ? 
        parseFloat(customRefreshRate) || 60 : 
        parseFloat(refreshRateHz);
      const touchSampling = touchSamplingHz === 'unknown' ? 120 : parseFloat(touchSamplingHz);

      // Validate calibration settings
      const validation = await deviceProfiler.runCalibrationCheck(refreshRate, touchSampling);
      
      if (validation.warnings.length > 0) {
        toast({
          title: "Calibration Warnings",
          description: validation.warnings[0],
          variant: "destructive",
        });
      }

      await saveCalibration();
      
      toast({
        title: "Calibration Saved",
        description: `Device calibrated with ${refreshRate}Hz refresh rate and ${touchSampling}Hz touch sampling.`,
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: "Calibration Failed",
        description: "Failed to save calibration settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <Music2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Calibration</h2>
        <p className="text-gray-600">Calibrate your device for accurate timing measurements</p>
      </div>

      {/* Calibration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Display & Touch Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Refresh Rate */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">
              Display Refresh Rate (Hz)
            </Label>
            <Select 
              value={refreshRateHz} 
              onValueChange={(value) => {
                setRefreshRateHz(value);
                setIsCustomRefreshRate(value === 'custom');
              }}
            >
              <SelectTrigger className="w-full" data-testid="select-refresh-rate">
                <SelectValue placeholder="Select refresh rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60 Hz (Standard)</SelectItem>
                <SelectItem value="90">90 Hz</SelectItem>
                <SelectItem value="120">120 Hz (High refresh)</SelectItem>
                <SelectItem value="144">144 Hz (Gaming)</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            
            {isCustomRefreshRate && (
              <Input
                type="number"
                placeholder="Enter custom refresh rate"
                value={customRefreshRate}
                onChange={(e) => setCustomRefreshRate(e.target.value)}
                className="mt-2"
                data-testid="input-custom-refresh-rate"
              />
            )}
          </div>

          {/* Touch Sampling Rate */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">
              Touch Sampling Rate (Hz)
            </Label>
            <Select 
              value={touchSamplingHz} 
              onValueChange={setTouchSamplingHz}
            >
              <SelectTrigger className="w-full" data-testid="select-touch-sampling">
                <SelectValue placeholder="Select touch sampling rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60 Hz (Basic)</SelectItem>
                <SelectItem value="120">120 Hz (Standard)</SelectItem>
                <SelectItem value="240">240 Hz (High-end)</SelectItem>
                <SelectItem value="360">360 Hz (Gaming)</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Computed Latency Offset */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Computed Latency Offset:</span>
              <span className="text-lg font-bold text-primary" data-testid="text-computed-offset">
                {calibrationData.deviceLatencyOffsetMs.toFixed(2)}ms
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This offset will be applied to all reaction time measurements
            </p>
          </div>

          {/* Help Text */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <h4 className="font-medium mb-1">Calibration Help</h4>
              <p className="text-sm">
                Check your device specifications for refresh rate and touch sampling rate. 
                If unknown, select "Unknown" for conservative timing estimates.
              </p>
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:text-gray-200 dark:bg-green-500 dark:hover:bg-green-600 dark:disabled:bg-gray-600" 
            size="lg"
            onClick={handleSaveCalibration}
            disabled={isSaving}
            data-testid="button-save-calibration"
          >
            {isSaving ? 'Saving...' : 'Save Calibration'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Calibration Info */}
      {currentProfile?.calibrationTimestamp && (
        <Card>
          <CardHeader>
            <CardTitle>Current Calibration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Refresh Rate:</span>
                <span data-testid="text-current-refresh-rate">
                  {currentProfile.refreshRateHz} Hz
                </span>
              </div>
              <div className="flex justify-between">
                <span>Touch Sampling:</span>
                <span data-testid="text-current-touch-sampling">
                  {currentProfile.touchSamplingHz} Hz
                </span>
              </div>
              <div className="flex justify-between">
                <span>Device Offset:</span>
                <span data-testid="text-current-offset">
                  {currentProfile.deviceLatencyOffsetMs.toFixed(2)} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Calibrated:</span>
                <span data-testid="text-calibration-date">
                  {new Date(currentProfile.calibrationTimestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
