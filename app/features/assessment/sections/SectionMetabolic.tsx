import { SectionProps, YesNo } from "@/app/types/assessment";
import {
  Field,
  FieldLabel,
  FieldHelper,
  FieldError,
} from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";
import { INPUT_CLASS } from "@/app/constants/assessment";

export function SectionMetabolic({
  data,
  onChange,
  errors = {},
}: SectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        ASCVD equations directly include diabetes status. Advanced models may
        also use fasting glucose or HbA1c.
      </p>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Field>
          <FieldLabel required>Diagnosed with diabetes?</FieldLabel>
          <RadioGroup<YesNo>
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            value={data.hasDiabetes}
            onChange={(value) => onChange("hasDiabetes", value)}
          />
          {errors.hasDiabetes && (
            <FieldError>{errors.hasDiabetes}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Fasting glucose or HbA1c (optional)</FieldLabel>
          <input
            type="text"
            placeholder="e.g. FPG 110 mg/dL or HbA1c 6.2%"
            value={data.glucoseOrA1c}
            onChange={(e) => onChange("glucoseOrA1c", e.target.value)}
            className={INPUT_CLASS}
          />
          <FieldHelper>Optional advanced field for diabetes-focused models.</FieldHelper>
        </Field>
      </div>
    </div>
  );
}
