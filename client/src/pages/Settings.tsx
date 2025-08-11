import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { 
    currentProfile, 
    settings, 
    updateSettings,
    createProfile,
    updateProfile,
    getMITResult,
    exportAllData,
    clearAllData
  } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    sport: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [mitData, setMitData] = useState<{ meanMIT: number; sdMIT: number; reliability: number; validTaps: number } | null>(null);

  useEffect(() => {
    if (currentProfile) {
      setProfileForm({
        name: currentProfile.name,
        age: currentProfile.age?.toString() || '',
        sport: currentProfile.sport || '',
      });
    } else {
      setProfileForm({
        name: '',
        age: '',
        sport: '',
      });
    }
  }, [currentProfile]);

  // Load MIT data for calibration display
  useEffect(() => {
    const loadMITData = async () => {
      if (currentProfile) {
        try {
          const result = await getMITResult();
          if (result) {
            setMitData(result);
          }
        } catch (error) {
          console.error('Failed to load MIT data:', error);
        }
      }
    };
    
    loadMITData();
  }, [currentProfile, getMITResult]);

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentProfile) {
        await updateProfile(currentProfile.id, {
          name: profileForm.name,
          age: profileForm.age ? parseInt(profileForm.age) : undefined,
          sport: profileForm.sport || undefined,
        });
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        await createProfile({
          name: profileForm.name,
          age: profileForm.age ? parseInt(profileForm.age) : null,
          sport: profileForm.sport || null,
          refreshRateHz: 60,
          touchSamplingHz: 120,
          deviceLatencyOffsetMs: 12.5,
          calibrationTimestamp: null,
          deviceInfoString: navigator.userAgent,
        });
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully.",
        });
      }
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save profile.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      toast({
        title: "Data Cleared",
        description: "All data has been cleared from the app.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data from the app.",
        variant: "destructive",
      });
    }
  };

  const handleExportAllData = async () => {
    if (!currentProfile) {
      toast({
        title: "Export Failed",
        description: "Please create a profile before exporting data.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportAllData();
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              data-testid="button-edit-profile"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              data-testid="input-name"
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={profileForm.age}
              onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
              disabled={!isEditing}
              data-testid="input-age"
            />
          </div>
          <div>
            <Label htmlFor="sport">Sport/Activity</Label>
            <Input
              id="sport"
              value={profileForm.sport}
              onChange={(e) => setProfileForm(prev => ({ ...prev, sport: e.target.value }))}
              disabled={!isEditing}
              data-testid="input-sport"
            />
          </div>
          
          {isEditing && (
            <Button 
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              data-testid="button-save-profile"
            >
              {currentProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Test Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Test Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sound Effects</div>
              <div className="text-sm text-gray-600">Audio cues and feedback</div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              data-testid="switch-sound"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Vibration</div>
              <div className="text-sm text-gray-600">Haptic feedback</div>
            </div>
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
              data-testid="switch-vibration"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Use dark theme</div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calibration */}
      <Card>
        <CardHeader>
          <CardTitle>Device Calibration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Device Calibration Status */}
            {currentProfile?.calibrationTimestamp ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-success font-medium" data-testid="text-calibration-status">
                    Calibrated
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Calibrated:</span>
                  <span data-testid="text-last-calibrated">
                    {new Date(currentProfile.calibrationTimestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Refresh Rate:</span>
                  <span>{currentProfile.refreshRateHz}Hz</span>
                </div>
                <div className="flex justify-between">
                  <span>Touch Sampling:</span>
                  <span>{currentProfile.touchSamplingHz}Hz</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-warning">Device not calibrated</span>
              </div>
            )}

            {/* MIT Calibration Data */}
            {mitData && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Movement Time Calibration
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Mean MIT:</span>
                    <span className="font-medium">{Math.round(mitData.meanMIT)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reliability:</span>
                    <span className="font-medium">{Math.round(mitData.reliability * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Std Dev:</span>
                    <span className="font-medium">{Math.round(mitData.sdMIT)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Taps:</span>
                    <span className="font-medium">{mitData.validTaps}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  Used for MIT-corrected analysis in test results
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
                onClick={() => setLocation('/calibration')}
                data-testid="button-recalibrate"
              >
                {currentProfile?.calibrationTimestamp ? 'Recalibrate' : 'Calibrate Device'}
              </Button>
              
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
                onClick={() => setLocation('/test/mit')}
                data-testid="button-mit-test"
              >
                {mitData ? 'Redo MIT' : 'MIT Test'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={handleExportAllData}
              data-testid="button-export-all-data"
            >
              <span className="material-icons mr-2">download</span>
              Export All Data
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  data-testid="button-clear-all-data"
                >
                  <span className="material-icons mr-2">delete</span>
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your profiles, test results, and settings. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version</span>
              <span data-testid="text-version">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span data-testid="text-build">{new Date().toISOString().slice(0, 10)}</span>
            </div>
            <div className="flex justify-between">
              <span>Calibration</span>
              <span className={currentProfile?.calibrationTimestamp ? "text-success" : "text-warning"}>
                {currentProfile?.calibrationTimestamp ? 'Active' : 'Required'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
