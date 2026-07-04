import { useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { getUserDisplay } from '@/utils/user/userDisplay';
import { removeCustomUserAvatar, uploadUserAvatar } from '@/services/supabase/avatar';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui';

interface EditAvatarModalProps {
  user: User;
  onClose: () => void;
}

export default function EditAvatarModal({ user, onClose }: EditAvatarModalProps) {
  const { t } = useApp();
  const { refreshUser, profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const display = getUserDisplay(user, profile);

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
    onClose();
  };

  const handleRemove = async () => {
    setErrorKey(null);
    setLoading(true);
    const { error } = await removeCustomUserAvatar();
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
    if (errorKey === 'invalidType') return t.auth.avatarInvalidType;
    if (errorKey === 'tooLarge') return t.auth.avatarTooLarge;
    if (errorKey === 'notConfigured') return t.auth.avatarNotConfigured;
    if (errorKey === 'notAuthenticated') return t.auth.avatarNotAuthenticated;
    return errorKey;
  })();

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-avatar-title"
        className="fixed left-1/2 top-1/2 z-[70] w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-2xl"
      >
        <h2 id="edit-avatar-title" className="text-base font-semibold text-[var(--color-text)]">
          {t.auth.changePhoto}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.auth.changePhotoDesc}</p>

        <div className="mt-5 flex justify-center">
          <UserAvatar
            avatarUrl={previewUrl ?? display.avatarUrl}
            initials={display.initials}
            avatarSource={previewUrl ? 'custom' : display.avatarSource}
            size={88}
          />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]">
            {errorMessage}
          </p>
        )}

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

        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" fullWidth disabled={loading} onClick={() => fileRef.current?.click()}>
            {t.auth.uploadPhoto}
          </Button>
          {display.hasCustomAvatar && (
            <Button type="button" variant="secondary" fullWidth disabled={loading} onClick={handleRemove}>
              {t.auth.removePhoto}
            </Button>
          )}
          <Button type="button" variant="ghost" fullWidth disabled={loading} onClick={onClose}>
            {t.auth.cancel}
          </Button>
        </div>
      </div>
    </>
  );
}
