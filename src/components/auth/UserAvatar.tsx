import { Icon } from '@/components/ui';
import type { AvatarSource } from '@/utils/user/userDisplay';

interface UserAvatarProps {
  avatarUrl: string | null;
  initials: string;
  avatarSource?: AvatarSource;
  size?: number;
}

export default function UserAvatar({
  avatarUrl,
  initials,
  avatarSource = 'none',
  size = 36,
}: UserAvatarProps) {
  const showImage = Boolean(avatarUrl);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)]/15"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={avatarUrl!}
          alt=""
          draggable={false}
          className="absolute inset-0 block size-full object-cover object-center"
        />
      ) : avatarSource === 'none' ? (
        <Icon
          name="user"
          size={Math.round(size * 0.48)}
          className="text-[var(--color-accent)]"
        />
      ) : (
        <span
          className="font-semibold text-[var(--color-accent)]"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
