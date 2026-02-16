import { SectionProps, ActivityLevel, AlcoholIntake } from "@/app/types/assessment";
import { Field, FieldLabel } from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";

export function SectionLifestyle({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Lifestyle variables are not required for classical models but can be
        useful for counseling and future extensions.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Physical activity</FieldLabel>
          <RadioGroup<ActivityLevel>
            options={[
              { label: "&lt; 1x per week", value: "<1" },
              { label: "1–3x per week", value: "1-3" },
              { label: "≥ 4x per week", value: "4plus" },
            ]}
            value={data.physicalActivity}
            onChange={(value) => onChange("physicalActivity", value)}
          />
        </Field>

        <Field>
          <FieldLabel>Alcohol intake</FieldLabel>
          <RadioGroup<AlcoholIntake>
            options={[
              { label: "None", value: "none" },
              { label: "Moderate", value: "moderate" },
              { label: "Heavy", value: "heavy" },
            ]}
            value={data.alcoholIntake}
            onChange={(value) => onChange("alcoholIntake", value)}
          />
        </Field>
      </div>
    </div>
  );
}
