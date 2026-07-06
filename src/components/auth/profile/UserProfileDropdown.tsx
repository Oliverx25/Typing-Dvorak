import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { getUserDisplay } from '@/utils/user/userDisplay';
import { Icon } from '@/components/ui';
import { headerAvatarButtonClassName } from '@/components/layout/headerClasses';
import HeaderMenuPortal from '@/components/layout/header/HeaderMenuPortal';
import EditProfileModal from '@/components/auth/profile/EditProfileModal';

export default function UserProfileDropdown() {
  const { user, profile, signOut, isConfigured } = useAuth();
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!user) return null;

  const display = getUserDisplay(user, profile);
  const showImage = Boolean(display.avatarUrl) && !imageFailed;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  const openProfileModal = () => {
    setOpen(false);
    setProfileModalOpen(true);
  };

  return (
    <>
      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={headerAvatarButtonClassName}
          aria-label={display.name}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {showImage ? (
            <img
              src={display.avatarUrl!}
              alt=""
              draggable={false}
              className="absolute inset-0 block size-full object-cover object-center"
              onError={() => setImageFailed(true)}
            />
          ) : display.avatarSource === 'none' ? (
            <Icon name="user" size={18} className="text-[var(--color-highlight)]" />
          ) : (
            <span className="text-xs font-semibold text-[var(--color-highlight)]">{display.initials}</span>
          )}
        </button>

        <HeaderMenuPortal
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={buttonRef}
          widthClassName="w-56"
          menuClassName="overflow-hidden p-0"
        >
          <div role="menu">
            <div className="border-b border-[var(--color-border)] px-4 py-3">
              <p className="truncate text-sm font-medium text-[var(--color-text)]" title={display.name}>
                {display.name}
              </p>
            </div>
            {isConfigured && (
              <button
                type="button"
                role="menuitem"
                onClick={openProfileModal}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <Icon name="user" size={16} />
                {t.auth.editProfile}
              </button>
            )}
            <a
              href="/achievements"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <Icon name="trophy" size={16} />
              {t.auth.viewAchievements}
            </a>
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
        </HeaderMenuPortal>
      </div>

      {profileModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setProfileModalOpen(false)}
          returnFocusRef={buttonRef}
        />
      )}
    </>
  );
}
