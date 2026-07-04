import { useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import type { Locale } from '@/i18n';
import { updatePassword } from '@/services/supabase/auth';
import {
  buildAccountExportBundle,
  deleteOwnAccount,
  downloadAccountExport,
} from '@/services/supabase/accountData';
import { removeCustomUserAvatar, uploadUserAvatar } from '@/services/supabase/avatar';
import { updateUserProfile } from '@/services/supabase/profile';
import { dispatchProfilePreferencesSynced } from '@/utils/app/events';
import { saveSettings } from '@/utils/app/settings';
import {
  MULTIPLAYER_PRIVACY_OPTIONS,
  type MultiplayerPrivacy,
} from '@/utils/user/multiplayerPrivacy';
import { getUserDisplay } from '@/utils/user/userDisplay';
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

const PRIVACY_LABEL_KEYS: Record<MultiplayerPrivacy, 'multiplayerPrivacyPublic' | 'multiplayerPrivacyInitials' | 'multiplayerPrivacyAnonymous'> = {
  public: 'multiplayerPrivacyPublic',
  initials: 'multiplayerPrivacyInitials',
  anonymous: 'multiplayerPrivacyAnonymous',
};

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const { t, settings } = useApp();
  const { refreshUser, profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const display = getUserDisplay(user, profile);

  const [displayName, setDisplayName] = useState(
    profile?.display_name?.trim() || display.name,
  );
  const [username, setUsername] = useState(profile?.username?.trim() ?? '');
  const [locale, setLocale] = useState<Locale>(
    profile?.locale === 'es' || profile?.locale === 'en' ? profile.locale : settings.locale,
  );
  const [multiplayerPrivacy, setMultiplayerPrivacy] = useState<MultiplayerPrivacy>(
    profile?.multiplayer_privacy ?? 'public',
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const linkedProviders = [...new Set((user.identities ?? []).map((id) => id.provider))];
  const hasEmailAuth = linkedProviders.includes('email');

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

  const syncLocaleLocally = (nextLocale: Locale) => {
    saveSettings({ locale: nextLocale });
    document.documentElement.lang = nextLocale;
    dispatchProfilePreferencesSynced();
  };

  const handleSave = async () => {
    setErrorKey(null);
    setActionMessage(null);
    setLoading(true);
    const { error } = await updateUserProfile({
      displayName,
      username,
      locale,
      multiplayerPrivacy,
    });
    setLoading(false);

    if (error) {
      setErrorKey(error);
      return;
    }

    syncLocaleLocally(locale);
    await refreshUser();
    onClose();
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    setErrorKey(null);

    if (newPassword.length < 8) {
      setPasswordMessage(t.auth.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t.auth.passwordMismatch);
      return;
    }

    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (error) {
      setPasswordMessage(error);
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage(t.auth.passwordUpdated);
  };

  const handleExport = async () => {
    setActionMessage(null);
    setErrorKey(null);
    setExportLoading(true);
    const bundle = await buildAccountExportBundle();
    setExportLoading(false);

    if (!bundle) {
      setActionMessage(t.auth.exportFailed);
      return;
    }

    downloadAccountExport(bundle);
  };

  const handleDeleteAccount = async () => {
    setActionMessage(null);
    setErrorKey(null);

    if (deleteConfirm.trim().toLowerCase() !== (user.email ?? '').trim().toLowerCase()) {
      setActionMessage(t.auth.deleteAccountConfirm);
      return;
    }

    setDeleteLoading(true);
    const { error } = await deleteOwnAccount();
    setDeleteLoading(false);

    if (error) {
      setActionMessage(error === 'notConfigured' || error === 'notAuthenticated'
        ? t.auth.deleteFailed
        : error);
      return;
    }

    window.location.href = '/';
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

  const busy = loading || passwordLoading || exportLoading || deleteLoading;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[min(92vh,780px)] w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl"
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
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                {t.auth.uploadPhoto}
              </Button>
              {display.hasCustomAvatar && (
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleRemovePhoto}>
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

          <div>
            <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">{t.auth.profileLocale}</p>
            <div className="flex gap-1">
              {(['en', 'es'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  disabled={busy}
                  onClick={() => setLocale(loc)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium uppercase transition',
                    locale === loc
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-key)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                  ].join(' ')}
                >
                  {loc}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.profileLocaleHint}</p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">{t.auth.multiplayerPrivacy}</p>
            <div className="space-y-1.5">
              {MULTIPLAYER_PRIVACY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition',
                    multiplayerPrivacy === option
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]/40',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="multiplayer-privacy"
                    value={option}
                    checked={multiplayerPrivacy === option}
                    disabled={busy}
                    onChange={() => setMultiplayerPrivacy(option)}
                    className="accent-[var(--color-accent)]"
                  />
                  <span className="text-[var(--color-text)]">{t.auth[PRIVACY_LABEL_KEYS[option]]}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.multiplayerPrivacyHint}</p>
          </div>

          {hasEmailAuth && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.changePassword}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.changePasswordDesc}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="profile-new-password" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                    {t.auth.password}
                  </label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                    className={formFieldClassName}
                  />
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                    {t.auth.confirmPassword}
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                    className={formFieldClassName}
                  />
                </div>
                {passwordMessage && (
                  <p className={`text-xs ${passwordMessage === t.auth.passwordUpdated ? 'text-[var(--color-correct)]' : 'text-[var(--color-incorrect)]'}`}>
                    {passwordMessage}
                  </p>
                )}
                <Button type="button" variant="secondary" size="sm" disabled={busy || !newPassword} onClick={handleChangePassword}>
                  {passwordLoading ? t.auth.savingProfile : t.auth.savePassword}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.exportAccountData}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.exportAccountDataDesc}</p>
            <Button type="button" variant="secondary" size="sm" className="mt-3" disabled={busy} onClick={handleExport}>
              {exportLoading ? t.auth.exportingAccount : t.auth.exportAccountBtn}
            </Button>
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

          <div className="rounded-xl border border-[var(--color-incorrect)]/40 bg-[var(--color-incorrect)]/5 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-incorrect)]">
              {t.auth.dangerZone}
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{t.auth.deleteAccount}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.deleteAccountDesc}</p>
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 text-[var(--color-incorrect)] hover:bg-[var(--color-incorrect)]/10"
                disabled={busy}
                onClick={() => setShowDeleteConfirm(true)}
              >
                {t.auth.deleteAccountBtn}
              </Button>
            ) : (
              <div className="mt-3 space-y-2">
                <label htmlFor="delete-confirm-email" className="block text-xs text-[var(--color-text-muted)]">
                  {t.auth.deleteAccountConfirm}
                </label>
                <input
                  id="delete-confirm-email"
                  type="email"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  autoComplete="off"
                  disabled={busy}
                  className={formFieldClassName}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[var(--color-incorrect)] hover:bg-[var(--color-incorrect)]/10"
                    disabled={busy}
                    onClick={handleDeleteAccount}
                  >
                    {deleteLoading ? t.auth.deletingAccount : t.auth.deleteAccountBtn}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirm('');
                    }}
                  >
                    {t.auth.cancel}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]">
              {errorMessage}
            </p>
          )}
          {actionMessage && !errorMessage && (
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]">
              {actionMessage}
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
          <Button type="button" fullWidth disabled={busy} onClick={handleSave}>
            {loading ? t.auth.savingProfile : t.auth.saveProfile}
          </Button>
          <Button type="button" variant="ghost" fullWidth disabled={busy} onClick={onClose}>
            {t.auth.cancel}
          </Button>
        </div>
      </div>
    </>
  );
}
