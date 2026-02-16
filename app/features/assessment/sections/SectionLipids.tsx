import { SectionProps } from "@/app/types/assessment";
import {
  Field,
  FieldLabel,
  FieldHelper,
  FieldError,
} from "@/app/components/ui/Field";
import { Toggle } from "@/app/components/ui/Toggle";
import { RadioGroup } from "@/app/components/ui/RadioGroup";
import { InputTag } from "@/app/components/ui/InputTag";
import { INPUT_CLASS } from "@/app/constants/assessment";
import { getUnitLabel } from "@/app/lib/unit-conversion";

export function SectionLipids({
  data,
  onChange,
  errors = {},
}: SectionProps) {
  const currentUnit = data.cholesterolUnit || "mgdL";
  const unitLabel = getUnitLabel(currentUnit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl bg-sky-50/80 px-4 py-3 text-sm text-sky-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Lab results toggle</p>
          <p className="mt-1">
            WHO supports both lab-based and non-lab models. Toggle off if the
            patient does not have a lipid panel.
          </p>
        </div>
        <Toggle
          labelOn="I have lab results"
          labelOff="Use non-lab model (BMI)"
          value={data.hasLabResults}
          onChange={(value) => onChange("hasLabResults", value)}
        />
      </div>

      {data.hasLabResults ? (
        <>
          <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-200 pb-3">
            <p className="text-base font-medium text-slate-700">
              Required for lab-based models (ASCVD, Framingham, WHO).
            </p>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
              Required (lab model)
            </span>
          </div>

          {/* Unit Toggle */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <FieldLabel>Cholesterol Units</FieldLabel>
            <div className="mt-2">
              <RadioGroup<"mgdL" | "mmolL">
                options={[
                  { label: "mg/dL (US standard)", value: "mgdL" },
                  { label: "mmol/L (International)", value: "mmolL" },
                ]}
                value={currentUnit}
                onChange={(value) => onChange("cholesterolUnit", value)}
              />
            </div>
            <FieldHelper>
              Values will be automatically converted. All calculations use normalized values internally.
            </FieldHelper>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel required>Total Cholesterol</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={currentUnit === "mmolL" ? "0.01" : "1"}
                  placeholder={currentUnit === "mmolL" ? "e.g. 5.2" : "e.g. 200"}
                  value={data.totalCholesterol}
                  onChange={(e) => onChange("totalCholesterol", e.target.value)}
                  className={`${INPUT_CLASS} ${
                    errors.totalCholesterol
                      ? "border-rose-500 focus-visible:border-rose-500"
                      : ""
                  }`}
                />
                <InputTag>{unitLabel}</InputTag>
              </div>
              {errors.totalCholesterol ? (
                <FieldError>{errors.totalCholesterol}</FieldError>
              ) : (
                <FieldHelper>
                  {currentUnit === "mgdL"
                    ? "Typical range: 100–400 mg/dL"
                    : "Typical range: 2.6–10.3 mmol/L"}
                </FieldHelper>
              )}
            </Field>

            <Field>
              <FieldLabel required>HDL Cholesterol</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={currentUnit === "mmolL" ? "0.01" : "1"}
                  placeholder={currentUnit === "mmolL" ? "e.g. 1.3" : "e.g. 50"}
                  value={data.hdlCholesterol}
                  onChange={(e) => onChange("hdlCholesterol", e.target.value)}
                  className={`${INPUT_CLASS} ${
                    errors.hdlCholesterol
                      ? "border-rose-500 focus-visible:border-rose-500"
                      : ""
                  }`}
                />
                <InputTag>{unitLabel}</InputTag>
              </div>
              {errors.hdlCholesterol ? (
                <FieldError>{errors.hdlCholesterol}</FieldError>
              ) : (
                <FieldHelper>
                  {currentUnit === "mgdL"
                    ? "Typical range: 10–100 mg/dL"
                    : "Typical range: 0.26–2.6 mmol/L"}
                </FieldHelper>
              )}
            </Field>

            <Field>
              <FieldLabel>LDL Cholesterol (optional)</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={currentUnit === "mmolL" ? "0.01" : "1"}
                  placeholder="Optional"
                  value={data.ldlCholesterol}
                  onChange={(e) => onChange("ldlCholesterol", e.target.value)}
                  className={INPUT_CLASS}
                />
                <InputTag>{unitLabel}</InputTag>
              </div>
            </Field>

            <Field>
              <FieldLabel>Triglycerides (optional)</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={currentUnit === "mmolL" ? "0.01" : "1"}
                  placeholder="Optional"
                  value={data.triglycerides}
                  onChange={(e) => onChange("triglycerides", e.target.value)}
                  className={INPUT_CLASS}
                />
                <InputTag>{unitLabel}</InputTag>
              </div>
            </Field>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-base text-slate-700">
            No lab results available. Risk will be estimated using non-lab
            models that rely on BMI and blood pressure.
          </p>
          <p className="text-sm text-slate-500">
            Ensure height and weight are completed in the{" "}
            <span className="font-medium">Body Composition</span> step.
          </p>
        </div>
      )}
    </div>
  );
}
