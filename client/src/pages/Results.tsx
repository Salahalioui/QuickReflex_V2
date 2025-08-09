import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TestResult } from '@/types';
import { exportToCSV, exportToJSON, generatePDFSummary, downloadFile, generateSPSSSyntax } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function Results() {
  const { 
    currentProfile, 
    recentResults, 
    loadRecentResults 
  } = useStore();
  const { toast } = useToast();
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (currentProfile) {
      loadRecentResults();
    }
  }, [currentProfile, loadRecentResults]);

  useEffect(() => {
    if (recentResults.length > 0 && !selectedResult) {
      setSelectedResult(recentResults[0]);
    }
  }, [recentResults, selectedResult]);

  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'spss') => {
    if (!currentProfile || !selectedResult) {
      toast({
        title: "No Data",
        description: "No results available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = {
        profile: currentProfile,
        sessions: [{ 
          id: selectedResult.sessionId,
          profileId: currentProfile.id,
          testType: selectedResult.type,
          stimulusType: selectedResult.stimulusType,
          startedAt: selectedResult.completedAt,
          completedAt: selectedResult.completedAt,
          metadata: null,
          status: 'completed' as const,
        }],
        trials: selectedResult.trials,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          deviceInfo: navigator.userAgent,
        },
      };

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const baseFilename = `quickreflex-${selectedResult.type}-${timestamp}`;

      switch (format) {
        case 'csv':
          const csv = exportToCSV(exportData);
          downloadFile(csv, `${baseFilename}.csv`, 'text/csv');
          break;
        case 'json':
          const json = exportToJSON(exportData);
          downloadFile(json, `${baseFilename}.json`, 'application/json');
          break;
        case 'pdf':
          const pdf = generatePDFSummary(exportData);
          downloadFile(pdf, `${baseFilename}.pdf`, 'application/pdf');
          break;
        case 'spss':
          const spssScript = generateSPSSSyntax();
          downloadFile(spssScript, `${baseFilename}-import.sps`, 'text/plain');
          break;
      }

      toast({
        title: "Export Complete",
        description: `Results exported in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results.",
        variant: "destructive",
      });
    }
  };

  if (!currentProfile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">No Profile Selected</h3>
            <p className="text-gray-600">Please select a profile to view results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recentResults.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <span className="material-icons text-6xl text-gray-400 mb-4">analytics</span>
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p className="text-gray-600">Complete some tests to see your results here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const chartData = selectedResult?.trials
    .filter(trial => !trial.isPractice && !trial.excludedFlag)
    .map((trial, index) => ({
      trial: index + 1,
      rt: trial.rtCorrected || trial.rtRaw || 0,
    })) || [];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          data-testid="button-export-results"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentResults.map((result, index) => (
              <div
                key={result.sessionId}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedResult?.sessionId === result.sessionId 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedResult(result)}
                data-testid={`session-card-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {result.type} - {result.stimulusType}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.completedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round(result.meanRT)}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.validTrials} trials
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedResult && (
        <>
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-mean-rt">
                    {Math.round(selectedResult.meanRT)}
                  </div>
                  <div className="text-sm text-gray-600">Mean RT (ms)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="stat-sd-rt">
                    {Math.round(selectedResult.sdRT)}
                  </div>
                  <div className="text-sm text-gray-600">SD (ms)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success" data-testid="stat-valid-trials">
                    {selectedResult.validTrials}
                  </div>
                  <div className="text-sm text-gray-600">Valid Trials</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error" data-testid="stat-outliers">
                    {selectedResult.outliers}
                  </div>
                  <div className="text-sm text-gray-600">Outliers</div>
                </div>
              </div>
              
              {selectedResult.accuracy !== undefined && (
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-accuracy">
                    {Math.round(selectedResult.accuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Trial-by-Trial Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="chart-trial-results">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="trial" 
                      label={{ value: 'Trial Number', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Reaction Time (ms)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} ms`, 'Reaction Time']}
                      labelFormatter={(trial) => `Trial ${trial}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rt" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Trial</th>
                      <th className="text-left py-2">RT (ms)</th>
                      <th className="text-left py-2">Corrected</th>
                      {(selectedResult.type === 'CRT_2' || selectedResult.type === 'CRT_4' || selectedResult.type === 'GO_NO_GO') && (
                        <th className="text-left py-2">Accuracy</th>
                      )}
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.trials
                      .filter(trial => !trial.isPractice)
                      .map((trial, index) => (
                        <tr 
                          key={trial.id} 
                          className="border-b border-gray-100"
                          data-testid={`trial-row-${index}`}
                        >
                          <td className="py-2">{trial.trialNumber}</td>
                          <td className="py-2">{trial.rtRaw?.toFixed(0) || '--'}</td>
                          <td className="py-2">{trial.rtCorrected?.toFixed(0) || '--'}</td>
                          {(selectedResult.type === 'CRT_2' || selectedResult.type === 'CRT_4' || selectedResult.type === 'GO_NO_GO') && (
                            <td className="py-2">
                              {trial.accuracy !== undefined ? (
                                <span 
                                  className={`px-2 py-1 text-xs rounded ${
                                    trial.accuracy 
                                      ? 'bg-success/10 text-success' 
                                      : 'bg-error/10 text-error'
                                  }`}
                                >
                                  {trial.accuracy ? 'Correct' : 'Incorrect'}
                                </span>
                              ) : (
                                '--'
                              )}
                            </td>
                          )}
                          <td className="py-2">
                            <span 
                              className={`px-2 py-1 text-xs rounded ${
                                trial.excludedFlag 
                                  ? 'bg-error/10 text-error' 
                                  : 'bg-success/10 text-success'
                              }`}
                            >
                              {trial.excludedFlag ? 'Excluded' : 'Valid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('csv')}
                  data-testid="button-export-csv"
                >
                  <span className="material-icons mr-2">description</span>
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('json')}
                  data-testid="button-export-json"
                >
                  <span className="material-icons mr-2">code</span>
                  JSON
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('pdf')}
                  data-testid="button-export-pdf"
                >
                  <span className="material-icons mr-2">picture_as_pdf</span>
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('spss')}
                  data-testid="button-export-spss"
                >
                  <span className="material-icons mr-2">assessment</span>
                  SPSS
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
