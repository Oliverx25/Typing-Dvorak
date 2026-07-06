import { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import type { Locale } from '@/i18n';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { downloadExport, importProgress } from '@/utils/progress/exportImport';
import { dispatchSessionComplete, dispatchKeyStatsUpdated } from '@/utils/app/events';
import { HIGHLIGHT_THEME_IDS, HIGHLIGHT_THEMES, type HighlightThemeId } from '@/utils/app/highlightTheme';
import {
  clampPacerWpm,
  PACER_MAX_WPM,
  PACER_MIN_WPM,
  type AppSettings,
} from '@/utils/app/settings';
import { SettingsToggle, Button } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsDraft = Pick<
  AppSettings,
  | 'locale'
  | 'sound'
  | 'blindMode'
  | 'fingerColors'
  | 'highlightTheme'
  | 'zenMode'
  | 'ghostMode'
  | 'pacerEnabled'
  | 'pacerTargetWpm'
  | 'caretStyle'
  | 'caretAnimation'
  | 'stopOnError'
  | 'stopOnWord'
>;

function pickDraft(settings: AppSettings): SettingsDraft {
  return {
    locale: settings.locale,
    sound: settings.sound,
    blindMode: settings.blindMode,
    fingerColors: settings.fingerColors,
    highlightTheme: settings.highlightTheme,
    zenMode: settings.zenMode,
    ghostMode: settings.ghostMode,
    pacerEnabled: settings.pacerEnabled,
    pacerTargetWpm: settings.pacerTargetWpm,
    caretStyle: settings.caretStyle,
    caretAnimation: settings.caretAnimation,
    stopOnError: settings.stopOnError,
    stopOnWord: settings.stopOnWord,
  };
}

const cardClassName =
  'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  useLockBodyScroll();

  const { t, settings, updateSettings } = useApp();
  const { user } = useAuth();
  const [draft, setDraft] = useState<SettingsDraft>(() => pickDraft(settings));
  const [importMsg, setImportMsg] = useState<'success' | 'error' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patchDraft = (partial: Partial<SettingsDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    updateSettings(draft);
    onClose();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importProgress(reader.result as string);
      setImportMsg(ok ? 'success' : 'error');
      if (ok) {
        dispatchSessionComplete();
        dispatchKeyStatsUpdated();
      }
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl">
        <div className="shrink-0 border-b border-[var(--color-border)] px-6 py-4">
          <h2 id="settings-modal-title" className="text-base font-semibold text-[var(--color-text)]">
            {t.settings.modalTitle}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t.settings.modalDesc}</p>
          {!user && (
            <p className="mt-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
              {t.settings.guestHint}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <section className={cardClassName}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.settings.sectionPreferences}
              </h3>
              <div className="mt-4 space-y-4">
                <SettingRow label={t.settings.language}>
                  <div className="flex gap-1">
                    {(['en', 'es'] as Locale[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => patchDraft({ locale: loc })}
                        className={[
                          'rounded-md px-3 py-1.5 text-xs font-medium uppercase transition',
                          draft.locale === loc
                            ? 'bg-[var(--color-highlight)] text-white'
                            : 'bg-[var(--color-key)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                        ].join(' ')}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingsToggle
                  title={t.settings.sound}
                  description={t.settings.soundDesc}
                  checked={draft.sound}
                  onChange={(v) => patchDraft({ sound: v })}
                />
                <SettingsToggle
                  title={t.settings.blindMode}
                  description={t.settings.blindDesc}
                  checked={draft.blindMode}
                  onChange={(v) => patchDraft({ blindMode: v })}
                />
                <SettingsToggle
                  title={t.settings.fingerColors}
                  description={t.settings.fingerDesc}
                  checked={draft.fingerColors}
                  onChange={(v) => patchDraft({ fingerColors: v })}
                />
              </div>
            </section>

            <section className={cardClassName}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.settings.sectionPractice}
              </h3>
              <div className="mt-4 space-y-4">
                <SettingsToggle
                  title={t.settings.zenMode}
                  description={t.settings.zenModeDesc}
                  checked={draft.zenMode}
                  onChange={(v) => patchDraft({ zenMode: v })}
                />
                <SettingsToggle
                  title={t.settings.ghostMode}
                  description={t.settings.ghostModeDesc}
                  checked={draft.ghostMode}
                  onChange={(v) => patchDraft({ ghostMode: v })}
                />
                <SettingsToggle
                  title={t.settings.pacer}
                  description={t.settings.pacerDesc}
                  checked={draft.pacerEnabled}
                  onChange={(v) => patchDraft({ pacerEnabled: v })}
                />
                {draft.pacerEnabled && (
                  <SettingRow label={t.settings.pacerTargetWpm}>
                    <input
                      type="number"
                      min={PACER_MIN_WPM}
                      max={PACER_MAX_WPM}
                      step={5}
                      value={draft.pacerTargetWpm}
                      onChange={(e) =>
                        patchDraft({ pacerTargetWpm: clampPacerWpm(Number(e.target.value)) })
                      }
                      className={`${formFieldClassName} w-20 text-right font-mono`}
                    />
                  </SettingRow>
                )}
                <SettingRow label={t.settings.caretStyle}>
                  <div className="flex flex-wrap gap-1">
                    {(['line', 'block', 'underline'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => patchDraft({ caretStyle: style })}
                        className={[
                          'rounded-md px-2.5 py-1 text-xs font-medium transition',
                          draft.caretStyle === style
                            ? 'bg-[var(--color-highlight)] text-white'
                            : 'bg-[var(--color-key)] text-[var(--color-text-muted)]',
                        ].join(' ')}
                      >
                        {style === 'line'
                          ? t.settings.caretLine
                          : style === 'block'
                            ? t.settings.caretBlock
                            : t.settings.caretUnderline}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow label={t.settings.caretAnimation}>
                  <div className="flex flex-wrap gap-1">
                    {(['smooth', 'blink', 'off'] as const).map((anim) => (
                      <button
                        key={anim}
                        type="button"
                        onClick={() => patchDraft({ caretAnimation: anim })}
                        className={[
                          'rounded-md px-2.5 py-1 text-xs font-medium transition',
                          draft.caretAnimation === anim
                            ? 'bg-[var(--color-highlight)] text-white'
                            : 'bg-[var(--color-key)] text-[var(--color-text-muted)]',
                        ].join(' ')}
                      >
                        {anim === 'smooth'
                          ? t.settings.caretSmooth
                          : anim === 'blink'
                            ? t.settings.caretBlink
                            : t.settings.caretOff}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingsToggle
                  title={t.settings.stopOnError}
                  description={t.settings.stopOnErrorDesc}
                  checked={draft.stopOnError}
                  onChange={(v) => patchDraft({ stopOnError: v })}
                />
                <SettingsToggle
                  title={t.settings.stopOnWord}
                  description={t.settings.stopOnWordDesc}
                  checked={draft.stopOnWord}
                  onChange={(v) => patchDraft({ stopOnWord: v })}
                />
              </div>
            </section>

            <section className={`${cardClassName} md:col-span-2`}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.settings.sectionAppearance}
              </h3>
              <HighlightThemePicker
                label={t.settings.highlightTheme}
                description={t.settings.highlightThemeDesc}
                value={draft.highlightTheme}
                themeLabels={t.settings.highlightThemes}
                onChange={(id) => patchDraft({ highlightTheme: id })}
              />
            </section>

            <section className={`${cardClassName} md:col-span-2`}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.settings.sectionData}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{t.settings.exportData}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.settings.exportDesc}</p>
                  <Button type="button" variant="secondary" size="sm" className="mt-2.5" onClick={() => downloadExport()}>
                    {t.settings.exportBtn}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{t.settings.importData}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t.settings.importDesc}</p>
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
                  <Button type="button" variant="secondary" size="sm" className="mt-2.5" onClick={() => fileRef.current?.click()}>
                    {t.settings.importBtn}
                  </Button>
                  {importMsg === 'success' && (
                    <p className="mt-1.5 text-[11px] text-[var(--color-correct)]">{t.settings.importSuccess}</p>
                  )}
                  {importMsg === 'error' && (
                    <p className="mt-1.5 text-[11px] text-[var(--color-incorrect)]">{t.settings.importError}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.auth.cancel}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t.settings.saveSettings}
          </Button>
        </div>
      </div>
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
    <div className="mt-4">
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-3 flex flex-wrap gap-3">
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
                  ? 'border-[var(--color-text)] ring-2 ring-[var(--color-highlight)] ring-offset-2 ring-offset-[var(--color-surface)]'
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
