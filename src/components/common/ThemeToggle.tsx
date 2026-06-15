import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-full bg-sage-100 dark:bg-forest-800 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest-400"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-earth-400" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-sage-600" aria-hidden="true" />
      )}
    </button>
  );
}
