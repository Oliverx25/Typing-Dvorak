import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Icon } from '@/components/ui';
import {
  DEFAULT_SANDBOX_CONFIG,
  SANDBOX_TIME_OPTIONS,
  SANDBOX_WORD_OPTIONS,
  saveSandboxConfig,
  type SandboxConfig,
  type SandboxContent,
  type SandboxMode,
} from '@/utils/practice/sandboxConfig';

interface ToggleChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function ToggleChip({ active, label, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-wider transition',
        active
          ? 'border-[var(--color-highlight)] bg-[var(--color-highlight)]/15 text-[var(--color-highlight)]'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-highlight)]/40',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function SandboxConfigurator() {
  const { t } = useApp();
  const [config, setConfig] = useState<SandboxConfig>(() => DEFAULT_SANDBOX_CONFIG);

  const update = (partial: Partial<SandboxConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveSandboxConfig(next);
      return next;
    });
  };

  const handleStart = () => {
    saveSandboxConfig(config);
    window.location.href = '/practice/sandbox';
  };

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
    <section className="mb-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {t.sandbox.graduationBadge}
      </p>

      <article className="overflow-hidden rounded-2xl border-2 border-fuchsia-500/35 bg-[var(--color-surface-elevated)] p-6 shadow-lg shadow-fuchsia-500/10">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-400">
            <Icon name="sparkles" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)]">
              {t.sandbox.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.sandbox.desc}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              {t.sandbox.modeLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {modeOptions.map((opt) => (
                <ToggleChip
                  key={opt.id}
                  active={config.mode === opt.id}
                  label={opt.label}
                  onClick={() => update({ mode: opt.id })}
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
                <ToggleChip
                  key={value}
                  active={
                    config.mode === 'time'
                      ? config.timeSeconds === value
                      : config.wordCount === value
                  }
                  label={
                    config.mode === 'time'
                      ? t.sandbox.secondsOption.replace('{n}', String(value))
                      : String(value)
                  }
                  onClick={() =>
                    update(
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
                <ToggleChip
                  key={opt.id}
                  active={config.content === opt.id}
                  label={opt.label}
                  onClick={() => update({ content: opt.id })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              {t.sandbox.modifiersLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={config.includeCaps}
                label={t.sandbox.modCaps}
                onClick={() => update({ includeCaps: !config.includeCaps })}
              />
              <ToggleChip
                active={config.includeNumbers}
                label={t.sandbox.modNumbers}
                onClick={() => update({ includeNumbers: !config.includeNumbers })}
              />
              <ToggleChip
                active={config.includePunctuation}
                label={t.sandbox.modPunctuation}
                onClick={() => update({ includePunctuation: !config.includePunctuation })}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-fuchsia-500 px-6 py-3.5 text-base font-semibold uppercase tracking-wide text-white transition hover:bg-fuchsia-400"
        >
          {t.sandbox.start}
        </button>
      </article>
    </section>
  );
}
