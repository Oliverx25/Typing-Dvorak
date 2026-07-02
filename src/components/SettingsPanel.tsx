import { useState } from 'react';
import { useApp } from '../contexts/AppProvider';
import type { Locale } from '../i18n';

export default function SettingsPanel() {
  const { t, settings, updateSettings, setLocale } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        aria-label={t.settings.title}
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t.settings.title}</h3>
            <div className="space-y-4">
              <SettingRow label={t.settings.language}>
                <div className="flex gap-1">
                  {(['en', 'es'] as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocale(loc)}
                      className={[
                        'rounded-md px-2.5 py-1 text-xs font-medium uppercase transition',
                        settings.locale === loc
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-key)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                      ].join(' ')}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <Toggle
                label={t.settings.sound}
                description={t.settings.soundDesc}
                checked={settings.sound}
                onChange={(v) => updateSettings({ sound: v })}
              />
              <Toggle
                label={t.settings.blindMode}
                description={t.settings.blindDesc}
                checked={settings.blindMode}
                onChange={(v) => updateSettings({ blindMode: v })}
              />
              <Toggle
                label={t.settings.fingerColors}
                description={t.settings.fingerDesc}
                checked={settings.fingerColors}
                onChange={(v) => updateSettings({ fingerColors: v })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <div>
        <p className="text-sm text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  );
}
