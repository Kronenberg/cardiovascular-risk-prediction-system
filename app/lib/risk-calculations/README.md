# Risk calculations module

Production-oriented layout for cardiovascular risk models. Entry point: `index.ts`.

## Layout

| Path | Role |
|------|------|
| `types.ts` | Shared types: `RiskCandidate`, `ValidationResult`, `RiskLevel` |
| `models/bp-risk.ts` | ACC/AHA blood pressure category |
| `models/diabetes-risk.ts` | Diabetes as CV risk + type 2 diabetes risk |
| `models/obesity-risk.ts` | BMI-based obesity / severe obesity |
| `models/relative-risk.ts` | Relative risk for age &lt; 40 (when ASCVD N/A) |
| `ascvd/` | Pooled Cohort Equations (2013 ACC/AHA): constants + calculator |
| `framingham/` | 10-year CHD (D'Agostino 2008): constants + calculator |
| `who/` | WHO CVD 10-year, lab/non-lab, 21 regions: types, constants, calculator |
| `evaluate.ts` | Orchestrator: `evaluateRisks()`, `rankTop3()` |
| `legacy.ts` | Deprecated `normalizeAndValidate()` |

## Imports

Consumers should import from this package only via the barrel:

```ts
import {
  evaluateRisks,
  rankTop3,
  type RiskCandidate,
  type WhoRegion,
} from "@/app/lib/risk-calculations";
```

Internal modules import from `../validation`, `../unit-conversion`, and sibling folders as needed.
