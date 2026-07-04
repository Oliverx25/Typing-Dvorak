import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { getUserDisplay } from '@/utils/userDisplay';
import { Icon } from '@/components/ui';
import { headerAvatarButtonClassName } from '@/components/layout/headerClasses';

export default function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!user) return null;

  const { name, avatarUrl, initials } = getUserDisplay(user);
  const showImage = avatarUrl && !imageFailed;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={headerAvatarButtonClassName}
        aria-label={name}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {showImage ? (
          <img
            src={avatarUrl}
            alt=""
            draggable={false}
            className="absolute inset-0 block size-full object-cover object-center"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-xs font-semibold text-[var(--color-accent)]">{initials}</span>
        )}
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
