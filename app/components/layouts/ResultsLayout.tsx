type ResultsLayoutProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function ResultsLayout({ children, footer }: ResultsLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f0f9ff_0%,_#e0f2fe_50%,_#f0fdfa_100%)] font-sans">
      <div className="flex flex-col overflow-hidden bg-white">
        {/* Simple header for results page */}
        <header className="border-b border-sky-100 bg-white px-8 py-6 lg:px-12 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3 text-sky-600">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-base font-semibold">
                CR
              </span>
              <span className="text-base font-semibold tracking-wide">
                CardioRisk
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-7xl pb-24">{children}</div>
        </main>

        {/* Fixed footer */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/95 backdrop-blur-sm shadow-lg shadow-slate-200/50">
          <div className="mx-auto max-w-[1920px]">
            <div className="mx-auto max-w-7xl">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
