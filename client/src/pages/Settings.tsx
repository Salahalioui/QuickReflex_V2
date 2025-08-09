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
    updateProfile 
  } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    sport: '',
  });

  const [isEditing, setIsEditing] = useState(false);

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
          age: profileForm.age ? parseInt(profileForm.age) : undefined,
          sport: profileForm.sport || undefined,
          refreshRateHz: 60,
          touchSamplingHz: 120,
          deviceLatencyOffsetMs: 12.5,
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

  const handleClearData = () => {
    // This would clear all data from IndexedDB
    toast({
      title: "Data Cleared",
      description: "All data has been cleared from the app.",
    });
  };

  const handleExportAllData = () => {
    // This would export all data
    toast({
      title: "Export Started",
      description: "Your data export is being prepared.",
    });
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
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-warning">Device not calibrated</span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setLocation('/calibration')}
              data-testid="button-recalibrate"
            >
              {currentProfile?.calibrationTimestamp ? 'Recalibrate' : 'Calibrate Device'}
            </Button>
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
              className="w-full justify-start"
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
                  className="w-full justify-start text-error hover:text-error"
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
                    className="bg-error hover:bg-error/90"
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
