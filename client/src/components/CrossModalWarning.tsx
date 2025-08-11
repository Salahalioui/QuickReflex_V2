import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, X, ExternalLink } from "lucide-react";
import { StimulusTypeEnum } from "@shared/schema";

interface CrossModalWarningProps {
  stimulusTypes: StimulusTypeEnum[];
  onAcknowledge: () => void;
  onCancel: () => void;
  show: boolean;
}

export default function CrossModalWarning({ 
  stimulusTypes, 
  onAcknowledge, 
  onCancel, 
  show 
}: CrossModalWarningProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!show || stimulusTypes.length <= 1) {
    return null;
  }

  // Define stimulus-specific latency information
  const stimulusInfo = {
    visual: {
      neuralLatency: "20-40ms",
      systemLatency: "Display refresh rate + pixel response time",
      description: "Visual stimuli are processed through the visual cortex with inherent display system delays",
      color: "blue"
    },
    auditory: {
      neuralLatency: "8-10ms",
      systemLatency: "Audio buffer delays + speaker activation",
      description: "Auditory stimuli reach the brain fastest but have unique audio system delays",
      color: "green"
    },
    tactile: {
      neuralLatency: "15-25ms",
      systemLatency: "Vibration motor startup latency",
      description: "Tactile stimuli have mechanical activation delays from vibration motors",
      color: "purple"
    }
  };

  return (
    <>
      {/* Main Warning Modal */}
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Cross-Modal Comparison Warning
            </CardTitle>
            <CardDescription>
              Important scientific limitations when comparing reaction times across different stimulus types
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Main Warning */}
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Scientific Limitation:</strong> You have selected multiple stimulus types ({stimulusTypes.join(', ')}). 
                Direct comparison of absolute reaction times between these modalities is scientifically invalid due to 
                fundamental differences in neural pathways and system-level latencies.
              </AlertDescription>
            </Alert>

            {/* Stimulus Types Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold">Your Selected Stimulus Types:</h3>
              <div className="grid gap-3">
                {stimulusTypes.map((type) => {
                  const info = stimulusInfo[type];
                  return (
                    <div 
                      key={type} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className={`bg-${info.color}-100 text-${info.color}-800 dark:bg-${info.color}-900 dark:text-${info.color}-200`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Neural: {info.neuralLatency}
                        </span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-details-${type}`}>
                            <Info className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Stimulus Details</DialogTitle>
                            <DialogDescription>
                              {info.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <strong>Neural Processing Time:</strong> {info.neuralLatency}
                            </div>
                            <div>
                              <strong>System-Level Delays:</strong> {info.systemLatency}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Research Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold">Research Recommendations:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>Analyze each stimulus type separately</li>
                <li>Compare relative changes within the same modality over time</li>
                <li>Use percentile rankings specific to each stimulus type</li>
                <li>Report results with modality-specific disclaimers</li>
                <li>Consider Movement Initiation Time (MIT) subtraction for cognitive processing isolation</li>
              </ul>
            </div>

            {/* Scientific References */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Historical Context:</strong> This limitation has been recognized since the late 19th century. 
                Modern computer-based systems introduce additional unmeasured latencies compared to mechanical apparatus, 
                making cross-modal timing differences even more problematic.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setDetailsOpen(true)}
                data-testid="button-learn-more"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel-warning"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Test
                </Button>
                <Button 
                  onClick={onAcknowledge}
                  data-testid="button-acknowledge-warning"
                >
                  I Understand - Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cross-Modal Latency: Scientific Background</DialogTitle>
            <DialogDescription>
              Understanding why direct comparison across stimulus modalities is scientifically problematic
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Historical Context */}
            <div>
              <h3 className="font-semibold mb-3">Historical Context</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Studies from the late 19th century using mechanical apparatus consistently reported mean Simple Reaction Times (SRT) 
                in the range of 180-190ms. Contemporary computer-based studies report much longer mean SRTs (230-400ms), 
                attributed to unmeasured hardware and software delays, not declining human performance.
              </p>
            </div>

            {/* Detailed Stimulus Information */}
            <div>
              <h3 className="font-semibold mb-3">Stimulus-Specific Latencies</h3>
              <div className="grid gap-4">
                {Object.entries(stimulusInfo).map(([type, info]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <h4 className="font-medium capitalize mb-2">{type} Stimuli</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Neural Processing:</strong> {info.neuralLatency}</div>
                      <div><strong>System Delays:</strong> {info.systemLatency}</div>
                      <div><strong>Description:</strong> {info.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Implications */}
            <div>
              <h3 className="font-semibold mb-3">Research Implications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The fundamental issue is that different sensory modalities have non-equivalent latency chains. 
                Without external hardware calibration to measure and correct for these differences, 
                any comparison of absolute reaction times across modalities lacks scientific validity.
              </p>
            </div>

            {/* Recommended Analysis Approaches */}
            <div>
              <h3 className="font-semibold mb-3">Recommended Analysis Approaches</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>Separate data analysis for each stimulus modality</li>
                <li>Within-modality comparisons over time</li>
                <li>Modality-specific normative data and percentiles</li>
                <li>Movement Initiation Time (MIT) subtraction for cognitive processing isolation</li>
                <li>Clear documentation of modality-specific limitations in reports</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}