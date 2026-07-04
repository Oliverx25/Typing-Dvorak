import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { getUserDisplay } from '@/utils/userDisplay';
import UserAvatar from './UserAvatar';
import { Icon } from '@/components/ui';

export default function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const { name, avatarUrl, initials } = getUserDisplay(user);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full transition hover:ring-2 hover:ring-[var(--color-accent)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        aria-label={name}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} initials={initials} size={36} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl"
          >
            <div className="border-b border-[var(--color-border)] px-4 py-3">
              <p className="truncate text-sm font-medium text-[var(--color-text)]" title={name}>
                {name}
              </p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <Icon name="log-out" size={16} />
              {t.auth.signOut}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
