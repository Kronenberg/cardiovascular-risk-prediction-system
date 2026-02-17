type FieldProps = {
  children: React.ReactNode;
};

export function Field({ children }: FieldProps) {
  return <div className="space-y-2">{children}</div>;
}

type FieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

export function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <label className="flex items-center gap-1.5 text-[length:var(--text-label)] font-medium text-[#1a1a1a]">
      {children}
      {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

type FieldHelperProps = {
  children: React.ReactNode;
  className?: string;
};

export function FieldHelper({ children, className = "" }: FieldHelperProps) {
  return <p className={`text-[length:var(--text-helper)] text-slate-500 ${className}`}>{children}</p>;
}

type FieldErrorProps = {
  children: React.ReactNode;
};

export function FieldError({ children }: FieldErrorProps) {
  return <p className="text-[length:var(--text-helper)] font-medium text-rose-600">{children}</p>;
}
