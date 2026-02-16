import { STEP_LABELS } from "@/app/constants/assessment";

type StepChipProps = {
  currentStep: number;
};

export function StepChips({ currentStep }: StepChipProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-3 text-sm">
      {STEP_LABELS.map((label, index) => {
        const stepIndex = index + 1;
        const isActive = stepIndex === currentStep;
        const isCompleted = stepIndex < currentStep;

        return (
          <div
            key={label}
            className={[
              "inline-flex items-center gap-2.5 rounded-full border px-4 py-2",
              isActive
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : isCompleted
                  ? "border-emerald-500/60 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600",
            ].join(" ")}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold">
              {isCompleted ? "✓" : stepIndex}
            </span>
            <span className="font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
