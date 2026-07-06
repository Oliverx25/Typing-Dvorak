import { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Icon } from '@/components/ui';
import SettingsModal from '@/components/layout/settings/SettingsModal';
import { headerIconButtonClassName } from '@/components/layout/headerClasses';

export default function SettingsPanel() {
  const { t } = useApp();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
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
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          returnFocusRef={triggerRef}
        />
      ) : null}
    </>
  );
}
