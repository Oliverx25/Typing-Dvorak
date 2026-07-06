import { EXPORT_KEYS } from '@/utils/progress/keys';

export interface ExportBundle {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportProgress(): ExportBundle {
  const data: Record<string, unknown> = {};
  if (typeof window === 'undefined') {
    return { version: 1, exportedAt: new Date().toISOString(), data };
  }

  for (const key of EXPORT_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return { version: 1, exportedAt: new Date().toISOString(), data };
}

export function downloadExport(): void {
  const bundle = exportProgress();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `typing-dvorak-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(json: string): boolean {
  try {
    const bundle = JSON.parse(json) as ExportBundle;
    if (bundle.version !== 1 || !bundle.data) return false;
    for (const [key, value] of Object.entries(bundle.data)) {
      if (EXPORT_KEYS.includes(key as (typeof EXPORT_KEYS)[number])) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }
    return true;
  } catch {
    return false;
  }
}
