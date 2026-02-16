type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  labelOn: string;
  labelOff: string;
};

export function Toggle({ value, onChange, labelOn, labelOff }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={[
        "inline-flex items-center gap-4 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition",
        value
          ? "border-sky-500 bg-white text-sky-800"
          : "border-slate-200 bg-slate-50 text-slate-700",
      ].join(" ")}
    >
      <span
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full bg-slate-200 transition",
          value ? "bg-sky-500" : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </span>
      <span className="font-medium">{value ? labelOn : labelOff}</span>
    </button>
  );
}
