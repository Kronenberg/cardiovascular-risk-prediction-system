import { IconHeart } from "@/app/components/ui/MedicalIcons";

type ResultsLayoutProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function ResultsLayout({ children, footer }: ResultsLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,_#f8fafc_0%,_#f0f9ff_40%,_#e0f2fe_100%)] font-sans">
      <div className="flex flex-col overflow-hidden bg-white shadow-lg shadow-slate-200/50">
        {/* Professional header */}
        <header className="border-b border-slate-100 bg-white/98 backdrop-blur-sm px-8 py-6 lg:px-12 lg:py-7">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <IconHeart size={24} />
              </div>
              <div>
                <h1 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] tracking-tight">
                  CardioRisk
                </h1>
                <p className="text-[length:var(--text-helper)] text-slate-500 mt-0.5">
                  Cardiovascular Risk Assessment
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-4xl pb-24">{children}</div>
        </main>

        {/* Fixed footer */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/98 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <div className="mx-auto max-w-[1920px]">
            <div className="mx-auto max-w-4xl">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
