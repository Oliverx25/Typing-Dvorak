const LIBRETRANSLATE_URL = 'https://translate.argosopentech.com/translate';
const TRANSLATE_TIMEOUT_MS = 3_000;

function mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(signals);
  }

  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

/** Translates English text to Spanish via LibreTranslate with a strict timeout. */
export async function translateToSpanish(text: string, signal?: AbortSignal): Promise<string> {
  const timeoutController = new AbortController();
  const timeoutId = globalThis.setTimeout(() => timeoutController.abort(), TRANSLATE_TIMEOUT_MS);
  const mergedSignal = signal
    ? mergeAbortSignals([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'es',
        format: 'text',
      }),
      signal: mergedSignal,
    });

    if (!response.ok) throw new Error(`LibreTranslate failed (${response.status})`);

    const data = (await response.json()) as { translatedText?: string };
    const translated = data.translatedText?.trim();
    if (!translated) throw new Error('Empty translation');
    return translated;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
