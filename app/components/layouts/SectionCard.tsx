import { TOTAL_STEPS } from "@/app/constants/assessment";
import type { ValidationErrors } from "@/app/types/assessment";

type SectionCardProps = {
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  errors?: ValidationErrors;
};

export function SectionCard({
  index,
  title,
  subtitle,
  children,
  errors = {},
}: SectionCardProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section aria-label={title}>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-[length:var(--text-section)] font-semibold text-white shadow-sm tabular-nums">
            {index}
          </div>
          <div>
            <h2 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] md:text-[length:var(--text-section-lg)]">{title}</h2>
            <p className="mt-1.5 text-[length:var(--text-helper)] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-full bg-slate-50 px-4 py-1.5 text-[length:var(--text-helper)] font-medium uppercase tracking-wide text-slate-500 tabular-nums">
          Step {index} of {TOTAL_STEPS}
        </div>
      </div>
      {hasErrors && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-rose-600" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="text-[length:var(--text-label)] font-semibold text-rose-700">
                Please fix the following errors to continue:
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-[length:var(--text-helper)] text-rose-600">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-8 rounded-2xl border border-slate-100 bg-slate-50/60 px-7 py-7">
        {children}
      </div>
    </section>
  );
}
