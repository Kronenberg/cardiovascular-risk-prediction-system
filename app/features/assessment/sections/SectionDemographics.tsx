import { SectionProps, SexAtBirth, RaceEthnicity } from "@/app/types/assessment";
import {
  Field,
  FieldLabel,
  FieldHelper,
  FieldError,
} from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";
import { INPUT_CLASS } from "@/app/constants/assessment";

/**
 * Check if patient is eligible for ASCVD calculation (age 40-79 with lab results)
 * This determines if race/ethnicity should be required
 */
function isAscvdEligible(data: SectionProps["data"]): boolean {
  const age = parseInt(data.age, 10);
  return (
    !isNaN(age) &&
    age >= 40 &&
    age <= 79 &&
    data.hasLabResults === true &&
    data.totalCholesterol &&
    data.totalCholesterol.trim() !== "" &&
    data.hdlCholesterol &&
    data.hdlCholesterol.trim() !== ""
  );
}

export function SectionDemographics({
  data,
  onChange,
  errors = {},
}: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-200 pb-3">
        <p className="text-sm font-medium text-slate-700">
          Required for most validated CVD models.
        </p>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600">
          Required
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <FieldLabel required>Age (years)</FieldLabel>
          <input
            type="number"
            min={20}
            max={79}
            placeholder="e.g. 55"
            value={data.age}
            onChange={(e) => onChange("age", e.target.value)}
            className={`${INPUT_CLASS} ${
              errors.age ? "border-rose-500 focus-visible:border-rose-500" : ""
            }`}
          />
          {errors.age ? (
            <FieldError>{errors.age}</FieldError>
          ) : (
            <FieldHelper>Validated range: 20–79 (ASCVD: 40–79).</FieldHelper>
          )}
        </Field>

        <Field>
          <FieldLabel required>Sex assigned at birth</FieldLabel>
          <RadioGroup<SexAtBirth>
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            value={data.sexAtBirth}
            onChange={(value) => onChange("sexAtBirth", value)}
          />
          {errors.sexAtBirth ? (
            <FieldError>{errors.sexAtBirth}</FieldError>
          ) : (
            <FieldHelper>
              Most validated models use binary biological sex.
            </FieldHelper>
          )}
        </Field>

        <Field>
          <FieldLabel required={isAscvdEligible(data)}>
            Race / Ethnicity
            {isAscvdEligible(data) && (
              <span className="ml-1 text-xs text-slate-500">(required for ASCVD)</span>
            )}
          </FieldLabel>
          <RadioGroup<RaceEthnicity>
            options={[
              { label: "White", value: "white" },
              { label: "Black", value: "black" },
              { label: "Hispanic", value: "hispanic" },
              { label: "Asian", value: "asian" },
              { label: "Other", value: "other" },
              { label: "Prefer not to say", value: "prefer_not_to_say" },
            ]}
            value={data.raceEthnicity}
            onChange={(value) => onChange("raceEthnicity", value)}
            layout="two-column"
          />
          {errors.raceEthnicity ? (
            <FieldError>{errors.raceEthnicity}</FieldError>
          ) : (
            <FieldHelper>
              {isAscvdEligible(data)
                ? "Required for ASCVD risk calculation (uses race-specific coefficients). Other/Asian/Hispanic use White coefficients per guidelines."
                : "ASCVD includes race adjustment; WHO charts vary by region."}
            </FieldHelper>
          )}
        </Field>
      </div>
    </div>
  );
}
