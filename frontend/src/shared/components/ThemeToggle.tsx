import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-background/60 backdrop-blur-md text-foreground/70 transition-all hover:bg-background/80 hover:text-foreground',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
