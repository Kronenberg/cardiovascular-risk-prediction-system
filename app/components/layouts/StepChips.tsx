import { STEP_LABELS } from "@/app/constants/assessment";

type StepChipProps = {
  currentStep: number;
  visibleSteps?: number[]; // Array of step numbers to show (e.g., [1,2,3,4,5] for basic mode)
};

export function StepChips({ currentStep, visibleSteps }: StepChipProps) {
  // Filter steps based on visibleSteps if provided
  const stepsToShow = visibleSteps || STEP_LABELS.map((_, index) => index + 1);
  
  return (
    <div className="mt-6 flex flex-wrap gap-3 text-[length:var(--text-label)]">
      {STEP_LABELS.map((label, index) => {
        const stepIndex = index + 1;
        
        // Skip if this step is not in visibleSteps
        if (!stepsToShow.includes(stepIndex)) {
          return null;
        }
        
        // Calculate relative position within visible steps
        const relativePosition = stepsToShow.indexOf(stepIndex) + 1;
        const isActive = relativePosition === currentStep;
        const isCompleted = relativePosition < currentStep;

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
              {isCompleted ? "✓" : relativePosition}
            </span>
            <span className="font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
