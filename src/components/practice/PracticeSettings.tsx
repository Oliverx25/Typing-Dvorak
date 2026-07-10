import { useApp } from '@/contexts/AppProvider';
import SettingsToggle from '@/components/practice/SettingsToggle';
import {
  SANDBOX_TIME_OPTIONS,
  SANDBOX_WORD_OPTIONS,
  type SandboxConfig,
  type SandboxContent,
  type SandboxMode,
} from '@/utils/practice/sandboxConfig';

interface PracticeSettingsProps {
  config: SandboxConfig;
  onChange: (partial: Partial<SandboxConfig>) => void;
}

export default function PracticeSettings({ config, onChange }: PracticeSettingsProps) {
  const { t } = useApp();

  const contentOptions: { id: SandboxContent; label: string }[] = [
    { id: 'es', label: t.sandbox.contentEs },
    { id: 'en', label: t.sandbox.contentEn },
    { id: 'code', label: t.sandbox.contentCode },
  ];

  const modeOptions: { id: SandboxMode; label: string }[] = [
    { id: 'time', label: t.sandbox.modeTime },
    { id: 'words', label: t.sandbox.modeWords },
  ];

  return (
    <section className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-sm">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {t.sandbox.modeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {modeOptions.map((opt) => (
              <SettingsToggle
                key={opt.id}
                active={config.mode === opt.id}
                label={opt.label}
                onClick={() => onChange({ mode: opt.id })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {config.mode === 'time' ? t.sandbox.durationLabel : t.sandbox.wordCountLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {(config.mode === 'time' ? SANDBOX_TIME_OPTIONS : SANDBOX_WORD_OPTIONS).map((value) => (
              <SettingsToggle
                key={value}
                active={config.mode === 'time' ? config.timeSeconds === value : config.wordCount === value}
                label={
                  config.mode === 'time'
                    ? t.sandbox.secondsOption.replace('{n}', String(value))
                    : String(value)
                }
                onClick={() =>
                  onChange(
                    config.mode === 'time'
                      ? { timeSeconds: value as SandboxConfig['timeSeconds'] }
                      : { wordCount: value as SandboxConfig['wordCount'] },
                  )
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {t.sandbox.contentLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {contentOptions.map((opt) => (
              <SettingsToggle
                key={opt.id}
                active={config.content === opt.id}
                label={opt.label}
                onClick={() => onChange({ content: opt.id })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {t.sandbox.modifiersLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <SettingsToggle
              active={config.includeCaps}
              label={t.sandbox.modCaps}
              onClick={() => onChange({ includeCaps: !config.includeCaps })}
            />
            <SettingsToggle
              active={config.includeNumbers}
              label={t.sandbox.modNumbers}
              onClick={() => onChange({ includeNumbers: !config.includeNumbers })}
            />
            <SettingsToggle
              active={config.includePunctuation}
              label={t.sandbox.modPunctuation}
              onClick={() => onChange({ includePunctuation: !config.includePunctuation })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
