import { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppProvider';
import type { Locale } from '@/i18n';
import { downloadExport, importProgress } from '@/utils/progress/exportImport';
import { SESSION_COMPLETE_EVENT, KEY_STATS_UPDATED_EVENT } from '@/utils/app/events';
import { HIGHLIGHT_THEME_IDS, HIGHLIGHT_THEMES, type HighlightThemeId } from '@/utils/app/highlightTheme';
import { headerIconButtonClassName } from './headerClasses';
import HeaderMenuPortal from './HeaderMenuPortal';

export default function SettingsPanel() {
  const { t, settings, updateSettings, setLocale } = useApp();
  const [open, setOpen] = useState(false);
  const [importMsg, setImportMsg] = useState<'success' | 'error' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importProgress(reader.result as string);
      setImportMsg(ok ? 'success' : 'error');
      if (ok) {
        window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT));
        window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
      }
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={headerIconButtonClassName}
        aria-label={t.settings.title}
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <HeaderMenuPortal open={open} onClose={() => setOpen(false)} anchorRef={buttonRef} menuClassName="p-4">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t.settings.title}</h3>
        <div className="max-h-[70vh] overflow-y-auto">
          <SettingsSection title={t.settings.sectionPreferences}>
            <SettingRow label={t.settings.language}>
              <div className="flex gap-1">
                {(['en', 'es'] as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocale(loc)}
                    className={[
                      'rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-all duration-300',
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
          </SettingsSection>

          <SettingsSection title={t.settings.sectionAppearance}>
            <HighlightThemePicker
              label={t.settings.highlightTheme}
              description={t.settings.highlightThemeDesc}
              value={settings.highlightTheme}
              themeLabels={t.settings.highlightThemes}
              onChange={(id) => updateSettings({ highlightTheme: id })}
            />
          </SettingsSection>

          <SettingsSection title={t.settings.sectionData} last>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]">{t.settings.exportData}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{t.settings.exportDesc}</p>
                <button
                  type="button"
                  onClick={() => downloadExport()}
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-key)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-all duration-300 hover:border-[var(--color-accent)]"
                >
                  {t.settings.exportBtn}
                </button>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]">{t.settings.importData}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{t.settings.importDesc}</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-key)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-all duration-300 hover:border-[var(--color-accent)]"
                >
                  {t.settings.importBtn}
                </button>
                {importMsg === 'success' && (
                  <p className="mt-1.5 text-xs text-[var(--color-correct)]">{t.settings.importSuccess}</p>
                )}
                {importMsg === 'error' && (
                  <p className="mt-1.5 text-xs text-[var(--color-incorrect)]">{t.settings.importError}</p>
                )}
              </div>
            </div>
          </SettingsSection>
        </div>
      </HeaderMenuPortal>
    </div>
  );
}

function SettingsSection({
  title,
  last = false,
  children,
}: {
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        last
          ? 'pt-4'
          : 'mb-4 border-b border-[var(--color-border)]/50 pb-4'
      }
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </section>
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

function HighlightThemePicker({
  label,
  description,
  value,
  themeLabels,
  onChange,
}: {
  label: string;
  description: string;
  value: HighlightThemeId;
  themeLabels: Record<HighlightThemeId, string>;
  onChange: (id: HighlightThemeId) => void;
}) {
  return (
    <div>
      <p className="text-sm text-[var(--color-text)]">{label}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {HIGHLIGHT_THEME_IDS.map((id) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              title={themeLabels[id]}
              aria-label={themeLabels[id]}
              aria-pressed={selected}
              onClick={() => onChange(id)}
              className={[
                'size-8 rounded-lg border-2 transition-all duration-300 hover:scale-105',
                selected
                  ? 'border-[var(--color-text)] ring-2 ring-[var(--color-highlight)] ring-offset-2 ring-offset-[var(--color-surface-elevated)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
              ].join(' ')}
              style={{ backgroundColor: HIGHLIGHT_THEMES[id].swatch }}
            />
          );
        })}
      </div>
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
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-all duration-300',
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  );
}
