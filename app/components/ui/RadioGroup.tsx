type RadioOption<T extends string> = {
  label: string;
  value: T;
};

type RadioGroupProps<T extends string> = {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: "stacked" | "two-column";
};

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  layout = "stacked",
}: RadioGroupProps<T>) {
  const gridClass =
    layout === "two-column"
      ? "grid grid-cols-2 gap-3"
      : "flex flex-col gap-2.5";

  return (
    <div className={gridClass}>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
              checked
                ? "border-sky-500 bg-sky-50 text-sky-800 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60",
            ].join(" ")}
          >
            <span className="font-medium">{option.label}</span>
            <span
              className={[
                "inline-flex h-5 w-5 items-center justify-center rounded-full border-2",
                checked
                  ? "border-sky-500 bg-sky-500"
                  : "border-slate-300 bg-white",
              ].join(" ")}
            >
              {checked && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
