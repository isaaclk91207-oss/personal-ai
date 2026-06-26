interface SettingsSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SettingsSlider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
}: SettingsSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {description && (
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-sm font-mono text-text-secondary tabular-nums ml-4">{value.toFixed(1)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-bg-surface-light rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-glow-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-bg-surface-light
            [&::-moz-range-track]:rounded-full
          "
        />
        <div
          className="absolute top-0 left-0 h-2 bg-primary rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
