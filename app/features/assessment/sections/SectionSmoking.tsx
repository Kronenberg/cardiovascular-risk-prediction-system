import { SectionProps, SmokingStatus } from "@/app/types/assessment";
import {
  Field,
  FieldLabel,
  FieldHelper,
  FieldError,
} from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";

export function SectionSmoking({
  data,
  onChange,
  errors = {},
}: SectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Smoking status is a core predictor in all major CVD risk equations.
        Most models use a binary current smoker flag.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel required>Smoking status</FieldLabel>
          <RadioGroup<SmokingStatus>
            options={[
              { label: "Never smoker", value: "never" },
              { label: "Former smoker", value: "former" },
              { label: "Current smoker", value: "current" },
            ]}
            value={data.smokingStatus}
            onChange={(value) => onChange("smokingStatus", value)}
          />
          {errors.smokingStatus ? (
            <FieldError>{errors.smokingStatus}</FieldError>
          ) : (
            <FieldHelper>
              Internally most equations encode this as current smoker (yes/no).
            </FieldHelper>
          )}
        </Field>
      </div>
    </div>
  );
}
