import { useState } from 'react';

interface BlurredImageBackdropProps {
  src?: string | null;
}

export default function BlurredImageBackdrop({ src }: BlurredImageBackdropProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
      <img
        src={src}
        alt=""
        onError={() => setImgError(true)}
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-3xl dark:opacity-25"
      />
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-2xl dark:bg-slate-900/65" />
    </div>
  );
}
