"use client";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  formatValue?: (value: number) => string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  formatValue,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[length:var(--text-label)] font-medium text-[#1a1a1a]">{label}</label>
        <span className="text-[length:var(--text-label)] font-semibold text-sky-600 tabular-nums">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
        style={{
          background: `linear-gradient(to right, rgb(2 132 199) 0%, rgb(2 132 199) ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) 100%)`,
        }}
      />
      <div className="flex justify-between text-[length:var(--text-helper)] text-slate-500">
        <span>{formatValue ? formatValue(min) : `${min}${unit ? ` ${unit}` : ""}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit ? ` ${unit}` : ""}`}</span>
      </div>
    </div>
  );
}
