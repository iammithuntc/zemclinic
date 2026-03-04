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
---

# Development Plan - v1.1.0

## Phase 6: UI Refinement & Branding Alignment
- **Terminology Migration**: System-wide replacement of "Clinical Plan" with "Treatment Plan" in components and translations.
- **Timeline Logic**: Implementation of `useEffect` in `TreatmentPlansList.tsx` for automated `approxEndDate` calculation.
- **Responsive Layout**: Re-structuring the treatment plan modal to accommodate new timeline and budget inputs.

## Phase 7: Financial Architecture & Security
- **Data Modeling**: Extending `TreatmentPlan` and `PlanStage` schemas to support `budget` (Number) and `approxDuration` (Number).
- **Backend Masking**: Implementing logic in API `GET` routes to strip budget fields for users who are not Admins or the Primary Doctor.
- **Write Protection**: Strengthening `POST` and `PUT` API endpoints with role-based validation to ensure sensitive cost data is only modifiable by authorized roles.

## Phase 8: Aggregation & Audit
- **Budget Summation**: Real-time aggregation of stage-level budgets into the parent `totalBudget` field.
- **Enhanced Logging**: Updating audit history to capture modifications to duration, target end dates, and financial estimates.
---

# Development Plan - v1.2.0

## Phase 9: UI Migration & Page Routing
- **Page Implementation**: Creation of dedicated `/new` and `/[planId]/edit` routes for Treatment Plans within the `[id]/treatment-plans` directory.
- **Component Factoring**: Migration of form logic from `TreatmentPlansList.tsx` into the standalone `TreatmentPlanForm.tsx` component.
- **Protected Routing**: Ensuring proper auth and role checks on the new dedicated pages.

## Phase 10: Template Management System
- **Template Architecture**: Implementation of the `TreatmentPlanTemplate` model with stages and budget blueprints.
- **API Development**: Building the `/api/treatment-plan-templates` endpoint to support template listing and admin-only creation.
- **UI Integration**: Adding the "Create from Template" selection modal and "Save as Template" action for Admins in the main form.

## Phase 11: Internationalization & Localization Refined
- **Currency Provider**: Utilization of `SettingsContext` to dynamically render currency symbols across the treatment plan lifecycle.
- **Formatting Standards**: Implementation of standardized currency and number formatting in the new form components.

## Phase 12: Backend Stability & Audit Enhancement
- **Conflict Resolution**: Refactoring the `PUT` handler to resolve Mongoose path collision during history updates.
- **Granular History**: Extending history entry details to specifically document stage-level mutations (Add/Edit/Delete).
- **TypeScript Optimization**: System-wide resolution of linting errors in the Treatment Plan module for enhanced code quality.
---

# Development Plan - v1.2.5 & v1.2.6

## Phase 13: Clinical Infrastructure Extensions
- **Data Modeling**: Update `Patient` schema for `familyHistory` and create `StageType` model.
- **API Extension**: Implementation of `/api/stage-types` to support administrative categorization of treatment stages.
- **Frontend Integration**: Enabling `TreatmentPlanForm` to fetch and display dynamic stage categories.

## Phase 14: Patient Record Enrichment
- **Detailed Componentry**: Development of full-text renderer for medical history and clinical notes in the `PatientView` sidebar.
- **Dynamic Terminology**: Synchronization of clinical labels (Allergies, Meds, History) across all patient-specific views.

---

# Development Plan - v1.2.7, v1.2.8 & v1.2.9

## Phase 15: Patient View Layout & State Management
- **Dashboard Refactor**: Re-ordering of tab sequences in `PatientViewPage` and embedding medical records into the primary details grid.
- **Edit Logic Hardening**: Expanding `EditPatientPage` state to manage the full suite of clinical fields.
- **Persistence Verification**: Debugging and resolving data-loss edge cases in the `NewPatientPage` submission handler.

---

# Development Plan - v1.2.10, v1.2.11 & v1.2.12

## Phase 16: Sidebar Widget Optimization Part I
- **Structural Cleanup**: Removal of legacy header components and conditional rendering of the clinical sidebar based on patient availability.
- **Visual Refactoring**: Building a new card-based primitive for displaying patient clinical data with premium shadows and borders.

## Phase 17: Sidebar Widget Optimization Part II
- **Space & Fluidity**: Dynamic layout switching for clinical attributes (moving blood group to the name card, expanding text-heavy sections to full width).
- **Typography Standardization**: 
    - Implementing a rigid typography system for clinical labels (Subtitle-down style).
    - Hardening font weights and sizes to ensure cross-module aesthetic balance.
    - Final UI audit and walkthrough documentation generation.

---

# Development Plan - v1.2.14 & v1.2.15

## Phase 18: Layout Reversion & Integrity Fixes
- **Label Repositioning**: Moving clinical labels back above the data blocks for specific fields (Allergies, Medications, History).
- **Payload Sanitization**: Updating `TreatmentPlanForm` submission logic to map empty doctor strings to `null` to satisfy Mongoose Schema validation.

## Phase 19: Plan Management UX
- **Action Menu Refactor**: Transitioning static list actions to a dynamic 3-dot dropdown menu.
- **Access Control Logic**: Implementing client-side role checks to hide destructive actions (Delete) from non-admin users.
- **Soft-Delete Bridge**: Connecting the new action menu to the `DELETE` API route with a transaction confirmation modal.

---

# Development Plan - v1.3.0

## Phase 20: UI Refinement & Data Visibility
- **Relative Positioning Audit**: Correcting absolute menu offsets in Treatment Stage tables.
- **Conditional Visibility**: Implementing industry-standard empty states for financials (`-` instead of `0`).
- **View Expansion**: Adding Treatment Area, Clinical Notes, and Document attachments to the primary plan view.

## Phase 21: Enhanced Assets Management
- **File Uploader Overhaul**: Transitions from `prompt`-based metadata to standard file selection.
- **Metadata Tagging**: Implementing a tagging system for documents linked to specific stages or categories.
---

# Development Plan - v1.4.0

## Phase 22: Advanced Status Workflow
- **Data Hardening**: Update `PlanStage` schema with `COMPLETED`, `ON_GOING`, and `customStatus` fields.
- **Dynamic Statuses**: Integrate admin-defined custom statuses from `Settings` into the stage lifecycle.
- **Financial Refinement**: Standardize budget displays in the detailed view and resolve local currency conflicts.

## Phase 23: Stage Verification System
- **Authorized Oversight**: Develop a verification middleware/module for stage finalizing by Admins/In-charge docs.
- **Evidence Tracking**: Ensure all verification events (who, when, details) are captured and displayed in the primary audit interface.
- **UI Overflow Polish**: Solve persistent clipping issues in the Treatment Stages summary and action menus.

---

# Development Plan - v1.4.1

## Phase 24: Critical Stability & Accessibility
- **Doctor Null Guard**: Refactor stage-to-form mapping to ensure unassigned `doctorId` and `doctorName` fields are handled safely, preventing runtime crashes.
- **Action Menu Continuity**: Implement global event listeners for `mousedown`/`click` to enable intuitive click-outside closing of stage and plan menus.
- **Dynamic information Priority**: Implement conditional `z-index` elevation for the active treatment plan card to ensure menus correctly overlay all sibling elements, particularly on the first row of a high-density list.
- **Workflow Streamlining**: Update `TreatmentPlanForm` and `TreatmentPlanView` to reflect the simplified "Primary Three" status model (NOT STARTED, IN PROGRESS, COMPLETED).
