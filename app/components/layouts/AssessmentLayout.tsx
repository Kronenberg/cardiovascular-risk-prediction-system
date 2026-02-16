import { StepChips } from "./StepChips";
import { TOTAL_STEPS } from "@/app/constants/assessment";

type AssessmentLayoutProps = {
  currentStep: number;
  progress: number;
  totalSteps?: number;
  children: React.ReactNode;
  footer: React.ReactNode;
  headerActions?: React.ReactNode;
};

export function AssessmentLayout({
  currentStep,
  progress,
  totalSteps = TOTAL_STEPS,
  children,
  footer,
  headerActions,
}: AssessmentLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-[linear-gradient(135deg,_#f0f9ff_0%,_#e0f2fe_50%,_#f0fdfa_100%)] font-sans">
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <header className="sticky top-0 z-10 border-b border-sky-100 bg-white/95 backdrop-blur-sm px-8 pb-6 pt-6 lg:px-12 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3 text-sky-600">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-base font-semibold">
                CR
              </span>
              <span className="text-base font-semibold tracking-wide">
                CardioRisk
              </span>
            </div>
            {headerActions && (
              <div className="mt-4 flex justify-end">
                {headerActions}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                  Cardiovascular Risk Assessment
                </h1>
                <p className="mt-2 text-base text-slate-600">
                  Based on validated clinical models including ASCVD, Framingham,
                  and WHO CVD risk charts.
                </p>
                <p className="mt-1.5 text-sm text-slate-500">
                  Your data is encrypted and HIPAA compliant.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>{`Step ${currentStep} of ${totalSteps}`}</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-sky-500 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <StepChips currentStep={currentStep} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-7xl pb-24">{children}</div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/95 backdrop-blur-sm shadow-lg shadow-slate-200/50">
          <div className="mx-auto max-w-[1920px]">
            <div className="mx-auto max-w-7xl">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
