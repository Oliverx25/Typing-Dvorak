import { useRef, useState, type RefObject } from 'react';
import type { User } from '@supabase/supabase-js';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { useModalOverlay } from '@/hooks/useModalOverlay';
import { focusRingInsetClassName } from '@/utils/a11y/focusRing';
import { updatePassword } from '@/services/supabase/auth';
import {
  buildAccountExportBundle,
  deleteOwnAccount,
  downloadAccountExport,
} from '@/services/supabase/accountData';
import { removeCustomUserAvatar, uploadUserAvatar } from '@/services/supabase/avatar';
import { updateUserProfile } from '@/services/supabase/profile';
import {
  MULTIPLAYER_PRIVACY_OPTIONS,
  type MultiplayerPrivacy,
} from '@/utils/user/multiplayerPrivacy';
import { getUserDisplay } from '@/utils/user/userDisplay';
import UserAvatar from '@/components/auth/profile/UserAvatar';
import { Button } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
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

const panelClassName =
  'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3';

export default function EditProfileModal({ user, onClose, returnFocusRef }: EditProfileModalProps) {
  const { requestClose, panelRef, backdropClassName, panelClassName } = useModalOverlay({
    onClose,
    returnFocusRef,
  });

  const { t } = useApp();
  const { refreshUser, profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const display = getUserDisplay(user, profile);

  const [displayName, setDisplayName] = useState(
    profile?.display_name?.trim() || display.name,
  );
  const [username, setUsername] = useState(profile?.username?.trim() ?? '');
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

  const handleSave = async () => {
    setErrorKey(null);
    setActionMessage(null);
    setLoading(true);
    const { error } = await updateUserProfile({
      displayName,
      username,
      multiplayerPrivacy,
    });
    setLoading(false);

    if (error) {
      setErrorKey(error);
      return;
    }

    await refreshUser();
    requestClose();
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
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className={`absolute inset-0 bg-black/50 ${backdropClassName}`}
        onClick={requestClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`relative ${panelClassName} flex max-h-[min(92vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl`}
      >
        <div className="shrink-0 border-b border-[var(--color-border)] px-6 py-4">
          <h2 id="edit-profile-title" className="text-base font-semibold text-[var(--color-text)]">
            {t.auth.editProfile}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t.auth.editProfileDesc}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 lg:overflow-visible">
          <div className="grid gap-5 lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:items-start">
            <div className="flex flex-col items-center gap-2.5 lg:pt-1">
              <UserAvatar
                avatarUrl={previewUrl ?? display.avatarUrl}
                initials={display.initials}
                avatarSource={previewUrl ? 'custom' : display.avatarSource}
                size={80}
              />
              <div className="flex flex-wrap justify-center gap-1.5">
                <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                  {t.auth.uploadPhoto}
                </Button>
                {display.hasCustomAvatar && (
                  <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleRemovePhoto}>
                    {t.auth.removePhoto}
                  </Button>
                )}
              </div>
              <p className="text-center text-[11px] leading-snug text-[var(--color-text-muted)]">
                {t.auth.changePhotoDesc}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-display-name" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
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
                <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">{t.auth.displayNameHint}</p>
              </div>

              <div>
                <label htmlFor="profile-username" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
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
                <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">{t.auth.usernameHint}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-1 text-sm font-medium text-[var(--color-text)]">{t.auth.multiplayerPrivacy}</p>
                <div className="flex flex-wrap gap-1">
                  {MULTIPLAYER_PRIVACY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={busy}
                      onClick={() => setMultiplayerPrivacy(option)}
                      className={[
                        'rounded-md px-2 py-1.5 text-[11px] font-medium leading-tight transition',
                        focusRingInsetClassName,
                        multiplayerPrivacy === option
                          ? 'bg-[var(--color-highlight)] text-white'
                          : 'bg-[var(--color-key)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                      ].join(' ')}
                    >
                      {t.auth[PRIVACY_LABEL_KEYS[option]]}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">{t.auth.multiplayerPrivacyHint}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className={panelClassName}>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.auth.accountInfo}
              </p>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="min-w-0">
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

            {hasEmailAuth ? (
              <div className={panelClassName}>
                <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.changePassword}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.auth.changePasswordDesc}</p>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-new-password" className="mb-1 block text-[11px] font-medium text-[var(--color-text-muted)]">
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
                    <label htmlFor="profile-confirm-password" className="mb-1 block text-[11px] font-medium text-[var(--color-text-muted)]">
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
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={busy || !newPassword} onClick={handleChangePassword}>
                    {passwordLoading ? t.auth.savingProfile : t.auth.savePassword}
                  </Button>
                  {passwordMessage && (
                    <p className={`text-[11px] ${passwordMessage === t.auth.passwordUpdated ? 'text-[var(--color-correct)]' : 'text-[var(--color-incorrect)]'}`}>
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={panelClassName}>
                <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.exportAccountData}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.auth.exportAccountDataDesc}</p>
                <Button type="button" variant="secondary" size="sm" className="mt-2.5" disabled={busy} onClick={handleExport}>
                  {exportLoading ? t.auth.exportingAccount : t.auth.exportAccountBtn}
                </Button>
              </div>
            )}
          </div>

          <div className={`mt-4 grid gap-4 ${hasEmailAuth ? 'md:grid-cols-2' : ''}`}>
            {hasEmailAuth && (
              <div className={panelClassName}>
                <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.exportAccountData}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.auth.exportAccountDataDesc}</p>
                <Button type="button" variant="secondary" size="sm" className="mt-2.5" disabled={busy} onClick={handleExport}>
                  {exportLoading ? t.auth.exportingAccount : t.auth.exportAccountBtn}
                </Button>
              </div>
            )}

            <div className={`rounded-xl border border-[var(--color-incorrect)]/40 bg-[var(--color-incorrect)]/5 px-4 py-3 ${hasEmailAuth ? '' : 'md:col-span-2'}`}>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-incorrect)]">
                {t.auth.dangerZone}
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">{t.auth.deleteAccount}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.auth.deleteAccountDesc}</p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-[var(--color-incorrect)] hover:bg-[var(--color-incorrect)]/10"
                    disabled={busy}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    {t.auth.deleteAccountBtn}
                  </Button>
                ) : (
                  <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-xs">
                    <label htmlFor="delete-confirm-email" className="text-[11px] text-[var(--color-text-muted)]">
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
            </div>
          </div>

          {(errorMessage || actionMessage) && (
            <p className="mt-4 rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]">
              {errorMessage ?? actionMessage}
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

        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4">
          <Button type="button" variant="ghost" disabled={busy} onClick={requestClose}>
            {t.auth.cancel}
          </Button>
          <Button type="button" disabled={busy} onClick={handleSave}>
            {loading ? t.auth.savingProfile : t.auth.saveProfile}
          </Button>
        </div>
      </div>
    </div>
  );
}
