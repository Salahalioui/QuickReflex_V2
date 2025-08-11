import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

const testModules = [
  {
    id: 'SRT',
    title: 'Simple Reaction Time',
    description: 'Basic response speed test',
    icon: 'speed',
    bgClass: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/30',
    color: 'bg-speed text-white',
    trials: '20 trials',
    duration: '~3 min',
    path: '/test/srt',
    testId: 'test-module-srt'
  },
  {
    id: 'CRT',
    title: 'Choice Reaction Time',
    description: 'Multi-stimulus decision test',
    icon: 'psychology',
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/30',
    color: 'bg-focus text-white',
    trials: '40 trials',
    duration: '~5 min',
    path: '/test/crt',
    testId: 'test-module-crt'
  },
  {
    id: 'GO_NO_GO',
    title: 'Go/No-Go Test',
    description: 'Inhibitory control assessment',
    icon: 'target',
    bgClass: 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/20 dark:to-cyan-800/30',
    color: 'bg-precision text-white',
    trials: '40 trials',
    duration: '~5 min',
    path: '/test/gonogo',
    testId: 'test-module-gonogo'
  },
  {
    id: 'MIT',
    title: 'Movement Time Test',
    description: 'Finger tapping for movement isolation',
    icon: 'touch_app',
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/30',
    color: 'bg-orange-500 text-white',
    trials: '20+ taps',
    duration: '~2 min',
    path: '/test/mit',
    testId: 'test-module-mit'
  }
];

export default function TestSelect() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Choose Your Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a reaction time test to begin your training session
        </p>
      </div>

      {/* Test Modules */}
      <div className="space-y-4">
        {testModules.map((module) => (
          <Card
            key={module.id}
            className={`${module.bgClass} cursor-pointer transition-all duration-300 hover:scale-[1.02] elevation-2 hover:elevation-4 border-2`}
            onClick={() => setLocation(module.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${module.color} shadow-lg`}>
                    <span className="material-icons text-xl">{module.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white">{module.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{module.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{module.trials}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{module.duration}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}


      </div>
    </div>
  );
}