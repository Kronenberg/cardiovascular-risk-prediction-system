import { SectionProps } from "@/app/types/assessment";
import { Field, FieldLabel } from "@/app/components/ui/Field";
import { InputTag } from "@/app/components/ui/InputTag";
import { INPUT_CLASS } from "@/app/constants/assessment";

export function SectionBodyComposition({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Used in diabetes risk and non-lab CVD models. BMI will be calculated
        automatically when height and weight are entered.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <FieldLabel required>Height</FieldLabel>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 170"
              value={data.heightCm}
              onChange={(e) => onChange("heightCm", e.target.value)}
              className={INPUT_CLASS}
            />
            <InputTag>cm</InputTag>
          </div>
        </Field>

        <Field>
          <FieldLabel required>Weight</FieldLabel>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 70"
              value={data.weightKg}
              onChange={(e) => onChange("weightKg", e.target.value)}
              className={INPUT_CLASS}
            />
            <InputTag>kg</InputTag>
          </div>
        </Field>

        <Field>
          <FieldLabel>Body Mass Index (BMI)</FieldLabel>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
            {data.bmi ? (
              <>
                <span className="font-semibold">{data.bmi}</span>
                <span className="text-xs text-slate-500">kg/m²</span>
              </>
            ) : (
              <span className="text-xs text-slate-500">
                Enter height and weight to calculate automatically.
              </span>
            )}
          </div>
        </Field>
      </div>
    </div>
  );
}
