import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Icon } from '@/components/ui';
import SettingsModal from './SettingsModal';
import { headerIconButtonClassName } from '@/components/layout/headerClasses';

export default function SettingsPanel() {
  const { t } = useApp();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSettingsModalOpen(true)}
        className={headerIconButtonClassName}
        aria-label={t.settings.title}
        aria-haspopup="dialog"
        aria-expanded={isSettingsModalOpen}
      >
        <Icon name="settings" size={20} />
      </button>

      {isSettingsModalOpen ? (
        <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      ) : null}
    </>
  );
}
