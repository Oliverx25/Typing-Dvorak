import ToggleSwitch from '@/components/ui/controls/ToggleSwitch';

interface SettingsToggleProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

/**
 * Labeled settings row with a switch. Thin wrapper over `ToggleSwitch` so all
 * settings options share one styled control (DRY).
 */
export default function SettingsToggle({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  id,
}: SettingsToggleProps) {
  return (
    <ToggleSwitch
      label={title}
      description={description}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      id={id}
    />
  );
}
