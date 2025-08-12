import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { 
      id: 'home', 
      path: '/', 
      icon: 'dashboard', 
      label: 'Dashboard',
      color: 'text-primary',
      testId: 'nav-home'
    },
    { 
      id: 'tests', 
      path: '/test/select', 
      icon: 'flash_on', 
      label: 'Tests',
      color: 'text-accent',
      testId: 'nav-tests'
    },
    { 
      id: 'results', 
      path: '/results', 
      icon: 'trending_up', 
      label: 'Results',
      color: 'text-success',
      testId: 'nav-results'
    },
    { 
      id: 'settings', 
      path: '/settings', 
      icon: 'tune', 
      label: 'Settings',
      color: 'text-secondary',
      testId: 'nav-settings'
    },
    { 
      id: 'about', 
      path: '/about', 
      icon: 'info', 
      label: 'About',
      color: 'text-blue-600',
      testId: 'nav-about'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto performance-card border-t-2 border-primary/10 elevation-4">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location === item.path || 
                          (item.id === 'home' && location === '/') ||
                          (item.id === 'tests' && location.startsWith('/test'));
          
          return (
            <button
              key={item.id}
              className={cn(
                "flex-1 py-3 px-2 text-center transition-all duration-300 rounded-t-xl",
                isActive 
                  ? `bg-gradient-to-t from-${item.color.split('-')[1]}/10 to-transparent`
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
              onClick={() => setLocation(item.path)}
              data-testid={item.testId}
            >
              <span 
                className={cn(
                  "material-icons block mx-auto text-lg transition-all duration-200",
                  isActive ? item.color : "text-gray-500 dark:text-gray-400"
                )}
              >
                {item.icon}
              </span>
              <span 
                className={cn(
                  "text-xs mt-1 block font-medium transition-all duration-200",
                  isActive 
                    ? `${item.color} font-semibold` 
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
