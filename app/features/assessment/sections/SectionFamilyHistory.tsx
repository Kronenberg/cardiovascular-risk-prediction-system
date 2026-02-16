import { SectionProps, FamilyHistory } from "@/app/types/assessment";
import { Field, FieldLabel } from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";

export function SectionFamilyHistory({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Not part of classic ASCVD equations but strongly associated with risk.
        Premature heart disease is typically defined as male &lt;55, female &lt;65.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Family history of premature heart disease?</FieldLabel>
          <RadioGroup<FamilyHistory>
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
              { label: "Not sure", value: "not_sure" },
            ]}
            value={data.familyHistoryPrematureCvd}
            onChange={(value) => onChange("familyHistoryPrematureCvd", value)}
          />
        </Field>
      </div>
    </div>
  );
}
