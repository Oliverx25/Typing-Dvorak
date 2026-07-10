import { useApp } from '@/contexts/AppProvider';
import SegmentedControl from '@/components/practice/SegmentedControl';
import ModifierToggle from '@/components/practice/ModifierToggle';
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

  const contentOptions: { value: SandboxContent; label: string }[] = [
    { value: 'en', label: t.practice.toolbar.english },
    { value: 'es', label: t.practice.toolbar.spanish },
    { value: 'code', label: t.practice.toolbar.code },
    { value: 'prose', label: t.practice.toolbar.prose },
  ];

  const modeOptions: { value: SandboxMode; label: string }[] = [
    { value: 'time', label: t.practice.toolbar.time },
    { value: 'words', label: t.practice.toolbar.words },
  ];

  const lengthOptions =
    config.mode === 'time'
      ? SANDBOX_TIME_OPTIONS.map((value) => ({ value, label: String(value) }))
      : SANDBOX_WORD_OPTIONS.map((value) => ({ value, label: String(value) }));

  const lengthValue = config.mode === 'time' ? config.timeSeconds : config.wordCount;

  return (
    <nav
      aria-label={t.practice.toolbar.label}
      className="flex w-full max-w-7xl flex-nowrap items-center justify-center gap-x-4 overflow-x-auto text-sm font-medium text-slate-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        role="group"
        aria-label={t.sandbox.modifiersLabel}
        className="flex shrink-0 items-center rounded-lg bg-slate-200/60 p-1 dark:bg-slate-800/40"
      >
        <ModifierToggle
          active={config.includePunctuation}
          label={t.practice.toolbar.punctuation}
          onClick={() => onChange({ includePunctuation: !config.includePunctuation })}
        />
        <span className="text-slate-400/60" aria-hidden="true">
          |
        </span>
        <ModifierToggle
          active={config.includeNumbers}
          label={t.practice.toolbar.numbers}
          onClick={() => onChange({ includeNumbers: !config.includeNumbers })}
        />
        <span className="text-slate-400/60" aria-hidden="true">
          |
        </span>
        <ModifierToggle
          active={config.includeCaps}
          label={t.practice.toolbar.caps}
          onClick={() => onChange({ includeCaps: !config.includeCaps })}
        />
      </div>

      <SegmentedControl
        ariaLabel={t.sandbox.contentLabel}
        options={contentOptions}
        value={config.content}
        onChange={(content) => onChange({ content })}
      />

      <SegmentedControl
        ariaLabel={t.sandbox.modeLabel}
        options={modeOptions}
        value={config.mode}
        onChange={(mode) => onChange({ mode })}
      />

      <SegmentedControl
        ariaLabel={config.mode === 'time' ? t.sandbox.durationLabel : t.sandbox.wordCountLabel}
        options={lengthOptions}
        value={lengthValue}
        onChange={(value) =>
          onChange(
            config.mode === 'time'
              ? { timeSeconds: value as SandboxConfig['timeSeconds'] }
              : { wordCount: value as SandboxConfig['wordCount'] },
          )
        }
      />
    </nav>
  );
}
