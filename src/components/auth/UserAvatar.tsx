import { useState } from 'react';

interface UserAvatarProps {
  avatarUrl: string | null;
  initials: string;
  size?: number;
}

export default function UserAvatar({ avatarUrl, initials, size = 36 }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = avatarUrl && !imageFailed;

  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-[var(--color-accent)]/20"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          draggable={false}
          className="block h-full w-full object-cover object-center"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-semibold text-[var(--color-accent)]"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
