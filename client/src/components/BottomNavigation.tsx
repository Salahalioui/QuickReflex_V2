import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { 
      id: 'home', 
      path: '/', 
      icon: 'home', 
      label: 'Home',
      testId: 'nav-home'
    },
    { 
      id: 'tests', 
      path: '/test/select', 
      icon: 'play_circle', 
      label: 'Tests',
      testId: 'nav-tests'
    },
    { 
      id: 'results', 
      path: '/results', 
      icon: 'analytics', 
      label: 'Results',
      testId: 'nav-results'
    },
    { 
      id: 'profile', 
      path: '/settings', 
      icon: 'person', 
      label: 'Profile',
      testId: 'nav-profile'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 elevation-4">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location === item.path || 
                          (item.id === 'home' && location === '/') ||
                          (item.id === 'tests' && location.startsWith('/test'));
          
          return (
            <button
              key={item.id}
              className={cn(
                "flex-1 py-3 px-2 text-center hover:bg-gray-50 transition-colors",
                isActive && "bg-primary/5"
              )}
              onClick={() => setLocation(item.path)}
              data-testid={item.testId}
            >
              <span 
                className={cn(
                  "material-icons block mx-auto",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                {item.icon}
              </span>
              <span 
                className={cn(
                  "text-xs mt-1 block",
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-600"
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
