import { SectionProps, YesNo } from "@/app/types/assessment";
import {
  Field,
  FieldLabel,
  FieldHelper,
  FieldError,
} from "@/app/components/ui/Field";
import { RadioGroup } from "@/app/components/ui/RadioGroup";
import { InputTag } from "@/app/components/ui/InputTag";
import { Tooltip } from "@/app/components/ui/Tooltip";
import { INPUT_CLASS } from "@/app/constants/assessment";
import { getHumanValidationMessage } from "@/app/utils/human-validation";
import { useEffect, useState } from "react";

export function SectionVitals({
  data,
  onChange,
  errors = {},
}: SectionProps) {
  const [humanMessages, setHumanMessages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const messages: Record<string, string | null> = {};
    if (data.systolicBp) {
      messages.systolicBp = getHumanValidationMessage("systolicBp", data.systolicBp, data);
    }
    if (data.diastolicBp) {
      messages.diastolicBp = getHumanValidationMessage("diastolicBp", data.diastolicBp, data);
    }
    setHumanMessages(messages);
  }, [data.systolicBp, data.diastolicBp, data.onBpMeds]);

  return (
    <div className="space-y-6">
      <p className="text-base text-slate-700">
        ACC/AHA and ASCVD equations explicitly adjust for systolic blood pressure
        and treatment for hypertension.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel required>Systolic Blood Pressure</FieldLabel>
            <Tooltip content="SBP should be average of 2–3 readings, taken seated, after 5 minutes of rest. Use the most recent clinical measurement.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">ℹ️</span>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 120"
              value={data.systolicBp}
              onChange={(e) => onChange("systolicBp", e.target.value)}
              className={`${INPUT_CLASS} ${
                errors.systolicBp
                  ? "border-rose-500 focus-visible:border-rose-500"
                  : ""
              }`}
            />
            <InputTag>mmHg</InputTag>
          </div>
          {errors.systolicBp ? (
            <FieldError>{errors.systolicBp}</FieldError>
          ) : humanMessages.systolicBp ? (
            <FieldHelper className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {humanMessages.systolicBp}
            </FieldHelper>
          ) : (
            <FieldHelper>Typical clinical range: 90–180 mmHg.</FieldHelper>
          )}
        </Field>

        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel>Diastolic Blood Pressure</FieldLabel>
            <Tooltip content="DBP should be average of 2–3 readings, taken seated, after 5 minutes of rest.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">ℹ️</span>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 80"
              value={data.diastolicBp}
              onChange={(e) => onChange("diastolicBp", e.target.value)}
              className={INPUT_CLASS}
            />
            <InputTag>mmHg</InputTag>
          </div>
          {humanMessages.diastolicBp ? (
            <FieldHelper className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {humanMessages.diastolicBp}
            </FieldHelper>
          ) : (
            <FieldHelper>Optional in ASCVD but clinically realistic.</FieldHelper>
          )}
        </Field>

        <Field>
          <FieldLabel required>Currently taking BP medication?</FieldLabel>
          <RadioGroup<YesNo>
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            value={data.onBpMeds}
            onChange={(value) => onChange("onBpMeds", value)}
          />
          {errors.onBpMeds && <FieldError>{errors.onBpMeds}</FieldError>}
        </Field>
      </div>
    </div>
  );
}
