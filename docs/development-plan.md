# Development Plan - v1.0.0

## Phase 1: Branding & Metadata
- **Models**: Update `Settings` model to include `logo` and `favicon` URLs.
- **Context**: Extend `SettingsContext` to provide global access to branding assets.
- **Layout**: Implement `generateMetadata` in the root layout to handle dynamic titles using `title.template`.

## Phase 2: Encounter Management
- **Schema Design**:
    - `Encounter`: Links `Appointment`, `Patient`, and `Doctor`.
    - `Prescription`: Associated with an `Encounter`.
- **API Endpoints**:
    - `POST /api/encounters`: Create clinical encounter from appointment.
    - `GET /api/patients/[id]/encounters`: Retrieve full clinical history.
- **Frontend**: Create `EncountersList` and `EncounterForm` components for consolidated clinical entry.

## Phase 3: Treatment Plans (Multi-stage)
- **Backend Architecture**:
    - `TreatmentPlan`: Parent container for treatment overview.
    - `PlanStage`: Nested or linked stages representing individual clinical steps.
- **Lifecycle Management**:
    - Audit log implementation in the `TreatmentPlan` service layer.
    - Auto-advance logic for appointment creation from stages.
- **UI Refinement**:
    - `TreatmentPlanView` modal for detailed stage breakdown.
    - Document upload interface with `stageId` metadata tagging.

## Phase 4: Data Normalization & Security
- **Mongoose Optimization**:
    - Convert `doctorId` and `patientId` fields to `Schema.Types.ObjectId`.
    - Utilize `.populate('doctorId patientId')` in all aggregate queries.
- **Permission Layer**:
    - Implement middleware-style checks in API routes for `TreatmentPlan` access.
    - Restricted views based on session user role (Admin vs. Doctor vs. Patient).

## Phase 5: Verification & Cleanup
- **Type Safety**: Resolution of `any` types in high-traffic components like `TreatmentPlansList`.
- **Internationalization**: Batch cleanup of `messages/*.json` files to ensure strict key mapping.
- **Build Validation**: End-to-end linting and type checking across Inventory, Radiology, and Patient modules.
