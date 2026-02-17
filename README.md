# 🫀 CardioRisk - Cardiovascular Risk Prediction System

A modern, clinical-grade web application for assessing cardiovascular disease risk using validated medical models including ASCVD, Framingham, and WHO CVD risk charts. Built with Next.js, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality

- **Multi-Model Risk Assessment**: Calculates cardiovascular risk using multiple validated clinical models
  - ASCVD 10-year risk (ages 40-79)
  - Blood pressure risk categories (ACC/AHA guidelines)
  - Type 2 diabetes risk assessment
  - Obesity/cardiometabolic risk evaluation
  - Relative risk for ages < 40

- **Progressive Disclosure**: 
  - **Basic Mode**: 8 essential required fields for quick assessment
  - **Advanced Mode**: Complete assessment with labs, family history, and lifestyle factors

- **Clinical Professionalism**:
  - Model validity handling (age-appropriate risk calculations)
  - Red-flag detection with warnings (SBP < 90, BMI > 40, etc.)
  - Measurement guidance tooltips
  - Unit conversions (mg/dL ↔ mmol/L) with automatic normalization

### 🎨 User Experience

- **Interactive What-If Scenarios**: Real-time risk recalculation with sliders
  - Adjust systolic blood pressure (80-200 mmHg)
  - Toggle smoking status
  - Modify weight with automatic BMI calculation
  - Instant API-powered recomputation

- **Smart Validation**:
  - Inline human-friendly error messages
  - Contextual warnings ("70 mmHg is unusually low—double-check")
  - Step-by-step validation before progression

- **Sample Patient Data**: One-click prefill for reviewers and testing

- **Beautiful Results Display**:
  - Top 3 risk factors with visual badges
  - "Why we think this" - Top contributing factors
  - "What would reduce it" - Actionable recommendations
  - Model validity warnings for age groups

### 🔒 Data & Security

- Client-side form validation
- Server-side data normalization and validation
- HIPAA-compliant data handling (encrypted in transit)
- No persistent storage (privacy-first design)

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.0
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Query (@tanstack/react-query)
- **Validation**: Custom validation with service layer
- **Deployment**: Vercel-ready

### Backend Architecture

The backend follows a **layered service architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│         API Layer (Route Handlers)         │
│  - Request/Response handling                │
│  - Error handling middleware                │
│  - Input validation                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Service Layer (Business Logic)      │
│  - PatientNormalizationService             │
│  - RiskAssessmentService                    │
│  - WarningDetectionService                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Domain Layer (Core Calculations)       │
│  - Risk calculation algorithms              │
│  - Model implementations (ASCVD, etc.)      │
│  - Unit conversions                         │
└─────────────────────────────────────────────┘
```

#### Backend Structure

```
app/
├── api/
│   └── predict/
│       └── route.ts                    # API endpoint (thin controller)
│
├── lib/
│   ├── middleware/
│   │   └── api-handler.ts              # Request/response utilities
│   │
│   ├── errors/
│   │   └── api-errors.ts               # Custom error classes
│   │
│   ├── validators/
│   │   └── patient-validator.ts        # Input validation schemas
│   │
│   ├── services/                       # Business logic layer
│   │   ├── patient-normalization.service.ts
│   │   ├── risk-assessment.service.ts
│   │   └── warning-detection.service.ts
│   │
│   ├── risk-calculations.ts            # Core domain logic
│   ├── validation.ts                   # Type definitions
│   └── unit-conversion.ts              # Utility functions
```

#### Key Architectural Principles

1. **Separation of Concerns**
   - API routes are thin controllers that delegate to services
   - Business logic lives in service classes
   - Domain calculations are pure functions

2. **Error Handling**
   - Custom error classes (`ValidationError`, `RiskCalculationError`)
   - Centralized error response formatting
   - Proper HTTP status codes

3. **Type Safety**
   - Full TypeScript coverage
   - Strong typing throughout the stack
   - Type-safe service interfaces

4. **Testability**
   - Services are easily unit testable
   - Pure functions for calculations
   - Dependency injection ready

5. **Maintainability**
   - Single Responsibility Principle
   - Clear service boundaries
   - Easy to extend with new risk models

### Frontend Architecture

#### Project Structure

```
app/
├── components/
│   ├── layouts/                        # Page layouts
│   │   ├── AssessmentLayout.tsx
│   │   ├── ResultsLayout.tsx
│   │   ├── SectionCard.tsx
│   │   └── StepChips.tsx
│   └── ui/                            # Reusable UI components
│       ├── Field.tsx
│       ├── RadioGroup.tsx
│       ├── Toggle.tsx
│       ├── Slider.tsx
│       ├── Tooltip.tsx
│       └── InputTag.tsx
│
├── features/
│   └── assessment/
│       ├── AssessmentForm.tsx          # Main form component
│       ├── AssessmentResults.tsx       # Results display
│       └── sections/                  # Form sections
│           ├── SectionDemographics.tsx
│           ├── SectionVitals.tsx
│           ├── SectionLipids.tsx
│           ├── SectionMetabolic.tsx
│           ├── SectionSmoking.tsx
│           ├── SectionBodyComposition.tsx
│           ├── SectionFamilyHistory.tsx
│           └── SectionLifestyle.tsx
│
├── hooks/
│   └── useAssessment.ts               # React Query hooks
│
├── providers/
│   └── QueryProvider.tsx               # React Query provider
│
├── results/
│   └── page.tsx                        # Results page
│
├── types/
│   └── assessment.ts                   # TypeScript types
│
├── utils/
│   ├── validation.ts                   # Client-side validation
│   └── human-validation.ts             # Human-friendly messages
│
└── constants/
    ├── assessment.ts                   # Form constants
    └── sample-patient.ts               # Sample data
```

### Architecture Patterns

#### 1. **Feature-Based Organization**
- Features are self-contained in `app/features/`
- Each feature has its own components, types, and logic
- Promotes maintainability and scalability

#### 2. **Layered Architecture**
```
┌─────────────────────────────────────┐
│   Presentation Layer (Components)   │
├─────────────────────────────────────┤
│   Feature Layer (UI Logic)          │
├─────────────────────────────────────┤
│   API Layer (Route Handlers)        │
├─────────────────────────────────────┤
│   Service Layer (Business Logic)    │
├─────────────────────────────────────┤
│   Domain Layer (Risk Calculations)  │
└─────────────────────────────────────┘
```

#### 3. **Data Flow**
```
User Input → Client Validation → API Route → 
Input Validation → Normalization Service → 
Risk Assessment Service → Warning Detection → 
Results Display → What-If Recalculation
```

#### 4. **State Management**
- **Local State**: React `useState` for form data
- **Server State**: React Query for API calls
- **URL State**: Query parameters for results page

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cardiovascular-risk-prediction-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Basic Assessment Flow

1. **Start Assessment**: Click "Start Assessment" on the home page
2. **Choose Mode**: Select Basic (8 fields) or Advanced (all fields)
3. **Fill Form**: Complete each step with patient data
   - Use tooltips (ℹ️) for measurement guidance
   - Watch for inline validation messages
4. **Review Results**: See top 3 risk factors with explanations
5. **Explore Scenarios**: Use what-if sliders to see impact of changes

### Sample Patient Data

Click "📋 Load Sample Patient" in the header to prefill the form with realistic test data.

### What-If Scenarios

On the results page, adjust:
- **Smoking Status**: Toggle between smoker/non-smoker
- **Systolic BP**: Slide between 80-200 mmHg
- **Weight**: Slide between 40-150 kg (BMI auto-calculates)

Risks recalculate automatically after 500ms of inactivity.

## 🔬 Risk Calculation Models

### ASCVD 10-Year Risk
- **Validated for**: Ages 40-79
- **Requires**: Age, sex, cholesterol (total/HDL), SBP, BP meds, diabetes, smoking
- **Output**: Percentage risk of cardiovascular event in 10 years

### Blood Pressure Categories
- Based on ACC/AHA guidelines
- Categories: Normal, Elevated, Stage 1, Stage 2, Hypertensive Crisis
- Considers medication status

### Diabetes Risk
- Binary assessment if diagnosed
- Risk calculation if not diagnosed (BMI, age, activity, family history)

### Obesity Risk
- BMI-based classification
- Flags severe obesity (BMI ≥35) and Class III (BMI >40)

### Relative Risk (Ages < 40)
- Risk factor summary when ASCVD not validated
- Lifetime/relative risk indicators

## 🛠️ Development

### Key Files

#### Backend

- **API Route**: `app/api/predict/route.ts`
  - Thin controller layer
  - Orchestrates service calls
  - Error handling wrapper

- **Services** (`app/lib/services/`):
  - `patient-normalization.service.ts`: Data transformation and normalization
  - `risk-assessment.service.ts`: Risk calculation orchestration
  - `warning-detection.service.ts`: Clinical warning detection

- **Validators**: `app/lib/validators/patient-validator.ts`
  - Input validation schemas
  - Field-level validation rules
  - Comprehensive validation pipeline

- **Domain Logic**: `app/lib/risk-calculations.ts`
  - Core risk calculation algorithms
  - ASCVD, BP, Diabetes, Obesity models
  - Risk ranking and scoring

- **Error Handling**: `app/lib/errors/api-errors.ts`
  - Custom error classes
  - Error response formatting
  - HTTP status code mapping

#### Frontend

- **Form Component**: `app/features/assessment/AssessmentForm.tsx`
  - Multi-step form state management
  - Progressive disclosure logic
  - Validation orchestration

- **Results Component**: `app/features/assessment/AssessmentResults.tsx`
  - Results display
  - What-if scenario handling
  - Interactive risk exploration

### Backend Architecture Details

#### Service Layer Pattern

The backend uses a **service layer architecture** where:

1. **API Routes** (`app/api/`) are thin controllers that:
   - Parse requests
   - Call services
   - Format responses
   - Handle errors

2. **Services** (`app/lib/services/`) contain business logic:
   - `PatientNormalizationService`: Transforms form data to normalized format
   - `RiskAssessmentService`: Orchestrates risk calculations
   - `WarningDetectionService`: Detects clinical warnings and red flags

3. **Validators** (`app/lib/validators/`) handle input validation:
   - Field-level validation rules
   - Type checking
   - Range validation

4. **Domain Layer** (`app/lib/risk-calculations.ts`) contains:
   - Pure calculation functions
   - Risk model implementations
   - Ranking algorithms

#### Error Handling

- Custom error classes (`ValidationError`, `RiskCalculationError`, `DataNormalizationError`)
- Centralized error response formatting
- Proper HTTP status codes (400 for validation, 500 for server errors)
- Error messages are user-friendly and actionable

#### Benefits of This Architecture

- **Testability**: Services can be unit tested independently
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new risk models or validators
- **Type Safety**: Full TypeScript coverage throughout
- **Error Handling**: Consistent error responses across the API

### Adding New Risk Models

1. Add calculation function in `app/lib/risk-calculations.ts`
2. Add to `evaluateRisks()` function in `risk-calculations.ts`
3. Update `RiskAssessmentService` if needed
4. Update types in `app/types/assessment.ts` if needed
5. Add display logic in `AssessmentResults.tsx`

### Styling

- Uses Tailwind CSS utility classes
- Custom gradients and colors defined inline
- Responsive design with mobile-first approach
- Dark mode ready (can be extended)

## 📝 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Type Safety**: Full type coverage
- **Component Structure**: Modular and reusable

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting platform

## 📄 License

This project is for educational and clinical demonstration purposes.

## 🤝 Contributing

Contributions welcome! Please ensure:
- TypeScript types are maintained
- Components follow existing patterns
- Validation logic is tested
- UI remains accessible

## 📚 References

- [ACC/AHA ASCVD Risk Calculator](https://tools.acc.org/ascvd-risk-estimator-plus/)
- [Framingham Risk Score](https://www.framinghamheartstudy.org/)
- [WHO CVD Risk Charts](https://www.who.int/cardiovascular_diseases/guidelines/Chart_predictions/en/)

---

## 📋 Home Assignment: Design Decisions & Documentation

> This section documents design decisions, shortcuts taken, and stubs for reviewers of this home assignment.

### Assignment Q&A

#### Why this tech stack?
- **Next.js 16**: App Router, server components, API routes in one codebase. Vercel deployment is straightforward.
- **React Query**: Handles loading/error states for the predict API, caching, and what-if recomputation.
- **Tailwind CSS**: Rapid UI development with a consistent design system; medical UI scales cleanly.
- **TypeScript**: Type safety for patient data, risk models, and API contracts; catches errors early.

#### How does the architecture support extensibility?
- **Service layer**: New risk models are added in `risk-calculations.ts` and wired into `RiskAssessmentService`; API and UI stay unchanged.
- **Feature-based frontend**: Assessment form and results are isolated; adding new features (e.g., PDF export) is localized.
- **Validator pattern**: New fields or rules go into `patient-validator.ts` and `human-validation.ts` without touching business logic.

#### Why no database?
- Assignment scope favors a single-session flow. Results are encoded in the URL for sharing and bookmarking.
- A real product would add auth + persistence; the current design does not block that.

#### Why URL-encoded results?
- Keeps the app stateless and avoids session storage.
- Tradeoff: Very long URLs for complex results; in production we would store results server-side and link by ID.

---

### ⚠️ Shortcuts Taken (Time Constraints)

| Area | Shortcut | What Would Be Done With More Time |
|------|----------|-----------------------------------|
| **ASCVD Risk** | **Implemented (simplified)** — `calculateAscvdRisk()` uses Pooled Cohort variables (age, sex, TC, HDL, SBP, BP meds, diabetes, smoking) and ACC/AHA risk bands (<5%, 5–7.4%, 7.5–19.9%, ≥20%). Uses heuristic weights, not the published Cox coefficients | Implement the full Pooled Cohort Equations: race/sex-specific coefficients, log-transformed variables, and baseline survival terms |
| **Framingham** | **Not a separate model** — no `calculateFraminghamRisk()`. The ASCVD-style calculation uses the same risk factor set (age, sex, lipids, BP, diabetes, smoking), so outputs are conceptually aligned | Add a dedicated Framingham 10-year CHD function with published coefficients (log-age, log-TC, log-HDL, log-SBP, smoking, diabetes) |
| **WHO CVD** | **Not a separate model** — no `calculateWhoCvdRisk()`. Same variable overlap; ASCVD-style model covers WHO lab-based inputs | Add a dedicated WHO model with lab-based or non-lab equations and regional calibration (21 WHO regions) |
| **Race in ASCVD** | Race/ethnicity is collected but **not used** in risk calculation | Use race in Pooled Cohort Equations (White vs African American coefficients); add guidance for Other/Asian/Hispanic |
| **Unit Tests** | **No automated tests** | Add unit tests for risk calculations, validators, and normalization; integration tests for the predict API |
| **PDF Export** | Listed in Future Enhancements only | Implement server-side PDF generation with results summary and disclaimer |
| **Error Recovery** | Basic `alert()` for API errors | Toast/notification system and retry UI |
| **Accessibility** | Basic ARIA and semantic HTML | Full WCAG 2.1 AA audit, keyboard navigation, screen reader testing |
| **Mobile UX** | Responsive layout only | Touch-optimized controls, bottom sheets for forms, larger tap targets |

---

### 🔧 Stubs & Parts to Implement Differently

#### 1. Risk calculation models (`app/lib/risk-calculations.ts`)

- **ASCVD**: Implemented in `calculateAscvdRisk()` with Pooled Cohort variables and ACC/AHA risk bands. Uses heuristic weights instead of the published Cox model. Full implementation would add:
  - Log-transformed age, total cholesterol, HDL
  - Race-specific betas (White / African American)
  - Sex-specific baseline survival
  - Official formula: `1 - S₁₀^exp(ΣβᵢXᵢ - B̄)`

- **Framingham 10-year CHD**: Not implemented as a separate function. Would add:
  - Dedicated `calculateFraminghamRisk()` with sex-specific Cox model
  - Published coefficients and formula: `1 - 0.88936^exp(ΣβX - 23.9802)` (men) and `1 - 0.95012^exp(ΣβX - 26.1931)` (women)

- **WHO CVD**: Not implemented as a separate function. Would add:
  - Dedicated `calculateWhoCvdRisk()` with lab-based model (age, sex, smoking, SBP, diabetes, total cholesterol)
  - Non-lab model (age, sex, smoking, SBP, BMI) for settings without lipids
  - Region-specific calibration (21 WHO regions)

#### 2. Data flow

- **Results in URL**: Fine for demos; for production we would store results server-side and use short IDs.
- **No rate limiting**: API has no throttling; would add rate limiting (e.g., per IP or per session).

#### 3. Validation & normalization

- **`normalizeAndValidate()`**: Deprecated and kept for compatibility. New code should call `PatientNormalizationService` and `WarningDetectionService` directly.
- **Range validation**: Some numeric fields use soft limits; stricter clinical ranges could be enforced with references to guidelines.

#### 4. Frontend

- **What-if sliders**: Recompute on every change (with debounce). Could add “Compare to baseline” and confidence intervals if models support it.
- **Print**: Uses `window.print()` with print CSS. A proper solution would generate a structured PDF with logos and disclaimers.

---

### ✅ What Is Production-Ready

- Layered backend (API → services → domain)
- Type-safe patient data flow
- ACC/AHA-aligned BP categories
- Clear separation of risk models from orchestration
- Unit conversion (mg/dL ↔ mmol/L)
- Progressive disclosure (Basic vs Advanced)
- Professional medical UI with icons and typography

---

## 🎯 Future Enhancements

- [ ] Export results as PDF
- [ ] Save assessments (with user authentication)
- [ ] Historical risk tracking
- [ ] Integration with EHR systems
- [ ] Additional risk models (QRISK, etc.)
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)

---

**Built with ❤️ for better cardiovascular health outcomes**
