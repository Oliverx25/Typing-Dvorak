import { useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { getUserDisplay } from '@/utils/user/userDisplay';
import { removeCustomUserAvatar, uploadUserAvatar } from '@/services/supabase/avatar';
import { updateUserProfile } from '@/services/supabase/profile';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
}

function providerLabel(provider: string): string {
  if (provider === 'github') return 'GitHub';
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email';
  return provider;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const { t } = useApp();
  const { refreshUser, profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const display = getUserDisplay(user, profile);

  const [displayName, setDisplayName] = useState(
    profile?.display_name?.trim() || display.name,
  );
  const [username, setUsername] = useState(profile?.username?.trim() ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const linkedProviders = [...new Set((user.identities ?? []).map((id) => id.provider))];

  const handleFile = async (file: File) => {
    setErrorKey(null);
    setLoading(true);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const { error } = await uploadUserAvatar(file);
    setLoading(false);

    if (error) {
      setErrorKey(error);
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      return;
    }

    await refreshUser();
    URL.revokeObjectURL(preview);
    setPreviewUrl(null);
  };

  const handleRemovePhoto = async () => {
    setErrorKey(null);
    setLoading(true);
    const { error } = await removeCustomUserAvatar();
    setLoading(false);
    if (error) {
      setErrorKey(error);
      return;
    }
    await refreshUser();
  };

  const handleSave = async () => {
    setErrorKey(null);
    setLoading(true);
    const { error } = await updateUserProfile({ displayName, username });
    setLoading(false);

    if (error) {
      setErrorKey(error);
      return;
    }

    await refreshUser();
    onClose();
  };

  const errorMessage = (() => {
    if (!errorKey) return null;
    const map: Record<string, string | undefined> = {
      invalidType: t.auth.avatarInvalidType,
      tooLarge: t.auth.avatarTooLarge,
      notConfigured: t.auth.avatarNotConfigured,
      notAuthenticated: t.auth.avatarNotAuthenticated,
      displayNameRequired: t.auth.displayNameRequired,
      displayNameTooShort: t.auth.displayNameTooShort,
      displayNameTooLong: t.auth.displayNameTooLong,
      usernameTooShort: t.auth.usernameTooShort,
      usernameTooLong: t.auth.usernameTooLong,
      usernameInvalid: t.auth.usernameInvalid,
      usernameTaken: t.auth.usernameTaken,
    };
    return map[errorKey] ?? errorKey;
  })();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[min(90vh,720px)] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl"
      >
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 id="edit-profile-title" className="text-base font-semibold text-[var(--color-text)]">
            {t.auth.editProfile}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.editProfileDesc}</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar
              avatarUrl={previewUrl ?? display.avatarUrl}
              initials={display.initials}
              avatarSource={previewUrl ? 'custom' : display.avatarSource}
              size={88}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => fileRef.current?.click()}>
                {t.auth.uploadPhoto}
              </Button>
              {display.hasCustomAvatar && (
                <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={handleRemovePhoto}>
                  {t.auth.removePhoto}
                </Button>
              )}
            </div>
            <p className="text-center text-xs text-[var(--color-text-muted)]">{t.auth.changePhotoDesc}</p>
          </div>

          <div>
            <label htmlFor="profile-display-name" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              {t.auth.displayName}
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              autoComplete="name"
              className={formFieldClassName}
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.displayNameHint}</p>
          </div>

          <div>
            <label htmlFor="profile-username" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              {t.auth.username}
            </label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={24}
              autoComplete="username"
              className={formFieldClassName}
              placeholder={t.auth.usernamePlaceholder}
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.usernameHint}</p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.auth.accountInfo}
            </p>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="text-[var(--color-text-muted)]">{t.auth.email}</dt>
                <dd className="truncate font-medium text-[var(--color-text)]">{user.email ?? '—'}</dd>
              </div>
              {linkedProviders.length > 0 && (
                <div>
                  <dt className="text-[var(--color-text-muted)]">{t.auth.linkedProviders}</dt>
                  <dd className="font-medium text-[var(--color-text)]">
                    {linkedProviders.map(providerLabel).join(' · ')}
                  </dd>
                </div>
              )}
              {memberSince && (
                <div>
                  <dt className="text-[var(--color-text-muted)]">{t.auth.memberSince}</dt>
                  <dd className="font-medium text-[var(--color-text)]">{memberSince}</dd>
                </div>
              )}
            </dl>
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]">
              {errorMessage}
            </p>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-5 py-4">
          <Button type="button" fullWidth disabled={loading} onClick={handleSave}>
            {loading ? t.auth.savingProfile : t.auth.saveProfile}
          </Button>
          <Button type="button" variant="ghost" fullWidth disabled={loading} onClick={onClose}>
            {t.auth.cancel}
          </Button>
        </div>
      </div>
    </>
  );
}
