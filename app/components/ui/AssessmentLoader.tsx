"use client";

type AssessmentLoaderProps = {
  message?: string;
};

export function AssessmentLoader({ message = "Analyzing your risk profile..." }: AssessmentLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer pulse ring */}
        <div
          className="absolute inset-0 animate-ping rounded-full bg-sky-400/30"
          style={{ animationDuration: "2s" }}
        />
        {/* Dual spinning rings */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-24 w-24 animate-spin rounded-full border-4 border-sky-200/50 border-t-sky-500" />
          <div
            className="absolute h-16 w-16 rounded-full border-4 border-slate-300/50 border-b-sky-400"
            style={{ animation: "spin 1.2s linear infinite reverse" }}
          />
          {/* Heart icon */}
          <svg
            className="h-8 w-8 animate-pulse text-sky-500"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        {/* Progress dots */}
        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-sky-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-6 text-lg font-medium text-white">{message}</p>
      <p className="mt-2 text-sm text-slate-400">
        Running ASCVD, Framingham & WHO models
      </p>
    </div>
  );
}
