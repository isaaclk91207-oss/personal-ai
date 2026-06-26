interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 rounded-full
          transition-colors duration-200 ease-out cursor-pointer
          ${checked ? 'bg-primary' : 'bg-bg-surface-light border border-border-primary'}
        `}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`
            inline-block h-5 w-5 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-out transform
            ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
            mt-[2px]
          `}
        />
      </button>
    </div>
  );
}
