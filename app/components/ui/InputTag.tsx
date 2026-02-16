type InputTagProps = {
  children: React.ReactNode;
};

export function InputTag({ children }: InputTagProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
      {children}
    </span>
  );
}
