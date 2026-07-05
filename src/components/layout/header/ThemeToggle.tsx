import { useApp } from '@/contexts/AppProvider';
import { Icon } from '@/components/ui';
import { headerIconButtonClassName } from '@/components/layout/headerClasses';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={headerIconButtonClassName}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} />
    </button>
  );
}
