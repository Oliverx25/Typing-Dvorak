import { memo, useState } from 'react';

interface GlassCardBackgroundProps {
  coverUrl?: string | null;
}

function GlassCardBackground({ coverUrl }: GlassCardBackgroundProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(coverUrl && !coverFailed);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      {showCover ? (
        <>
          <img
            src={coverUrl!}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover"
            onError={() => setCoverFailed(true)}
          />
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 backdrop-blur-md" />
      )}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}

export default memo(GlassCardBackground);
