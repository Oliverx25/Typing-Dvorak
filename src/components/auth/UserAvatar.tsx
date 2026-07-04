import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  initials: string;
  size?: number;
}

export default function UserAvatar({ name, avatarUrl, initials, size = 36 }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = avatarUrl && !imageFailed;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)]/20 ring-2 ring-[var(--color-border)]"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="font-semibold text-[var(--color-accent)]"
          style={{ fontSize: size * 0.36 }}
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
