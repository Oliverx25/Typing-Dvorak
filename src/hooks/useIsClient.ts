import { useEffect, useState } from 'react';

/** True after mount — keeps the first client render aligned with SSR output. */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}
