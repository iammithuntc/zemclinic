# Requirements - v1.0.0

## Core Modules & Features

### 1. Custom Branding & Identity
- **Logo Upload**: Implementation of custom logo upload in settings with global application across the Sidebar and Login pages.
- **Favicon Management**: Support for dynamic favicon uploads to align with clinic branding.
- **SEO & Dynamic Titles**: Implementation of dynamic page titles and metadata templates for all application routes.

### 2. Encounter Management
- **Unified Clinical Records**: Introduction of the `Encounter` model to link appointments, admissions, and reports.
- **OPD & Inpatient Workflows**: Structured clinical note-taking for both outpatient and inpatient visits.
- **Historical Data Linking**: Automated linking of past encounters and prescriptions to patient profiles.

### 3. Advanced Treatment Planning
- **Multi-visit Workflows**: Ability to create structured treatment plans with multiple clinical stages.
- **Doctor Assignment**: Granular doctor assignment at both the plan and individual stage level.
- **Progress Tracking**: Real-time status updates and scheduling for each treatment stage.
- **Clinical Documentation**: Tagging of uploaded documents (radiology, lab results) specifically to treatment stages.

### 4. System Integrity & Security
- **Data Normalization**: Strict typing and reference population for Doctors and Patients across all models.
- **Audit Logging**: Comprehensive history tracking for treatment plan modifications and lifecycle changes.
- **Role-Based Access Control (RBAC)**: Hardened API security ensuring data is only accessible to authorized Admins, assigned Doctors, or the respective Patients.

### 5. Internationalization (i18n)
- **Multi-language Support**: Standardized translation keys across English (en), Spanish (es), and French (fr).
- **Translation Cleanup**: Resolution of duplicate keys and missing translations.

## Technical Tasks (v1.0.0)
- [x] Create API routes for branding assets (Logo/Favicon)
- [x] Refactor all page components for dynamic metadata
- [x] Implement Encounter and Prescription schemas
- [x] Build Treatment Plan CRUD and Stage management UI
- [x] Implement `.populate()` logic for doctor/patient references
- [x] Establish backend audit log system
---

# Requirements - v1.1.0

## Treatment Plan Enhancements

### 1. UI/UX Refinement
- **Terminology Update**: Standardized renaming of "clinical plan" to **"Treatment Plan"** across all user-facing modals, buttons, and list views.
- **Dynamic Timeline Calculation**: Implementation of an automated `approxEndDate` calculator based on the plan's `startDate` and a user-defined `approxDuration` (in days).

### 2. Financial Tracking & Budgeting
- **Stage-Level Budgeting**: Ability to assign an estimated budget to each individual treatment stage.
- **Aggregated Plan Budget**: Real-time summation of all stage budgets to display a total estimated budget for the entire treatment plan.

### 3. Role-Based Financial Security
- **Visibility Restrictions**: Pricing and budget fields are strictly restricted to **Admins** and the **In-Charge (Primary) Doctor**.
- **Data Masking**: Backend implementation to ensure sensitive budget data is stripped from API responses for unauthorized users.
- **Write Protection**: API-level validation to prevent unauthorized users from submitting or modifying budget information.

## Technical Tasks (v1.1.0)
- [x] Update `TreatmentPlan` and `PlanStage` Mongoose models with duration and budget fields
- [x] Refactor `TreatmentPlansList.tsx` for terminology consistency and automated calculations
- [x] Implement backend utility for budget and duration-based logic
- [x] Harden API routes (`GET`, `POST`, `PUT`) with role-based budget masking and protection
---

# Requirements - v1.2.0

## Treatment Plan & Template Architecture

### 1. Structural UI Migration
- **Decoupled Forms**: Transition from modal-based plan management to dedicated pages for creation and editing to prevent UI nesting issues.
- **Reusable Components**: Extraction of the template/plan form logic into a high-order `TreatmentPlanForm` component for architectural consistency.

### 2. Treatment Plan Templates
- **Template Library**: Introduction of the `TreatmentPlanTemplate` model to store reusable clinical workflows.
- **Quick Initiation**: Ability to "Create from Template" within the patient dashboard, pre-populating all stages, budgets, and instructions.
- **Admin-Controlled Curation**: Template management (creation/modification) is restricted to Admins, while all doctors can utilize them for patient care.

### 3. Localization & Currency Standards
- **Global Settings Integration**: Dynamic detection of preferred currency symbols (₹, $, €, etc.) across all financial modules of the Treatment Plan.
- **Consistent Unit Display**: Standardized display of currency units in both summary lists and detailed forms.

### 4. System Integrity & Audit Logs
- **Atomic History Updates**: Refactored backend update strategy to handle history entries atomically, resolving Mongoose path conflicts.
- **Enhanced Change Tracking**: Automated recording of specific actions such as stage additions, removals, and detail modifications.

## Technical Tasks (v1.2.0)
- [x] Create dedicated routes for plan creation (`/new`) and editing (`/[id]/edit`)
- [x] Build and integrate `TreatmentPlanTemplate` model and API
- [x] Implement template selection modal and pre-population logic
- [x] Integrate `SettingsContext` for dynamic currency symbol rendering
- [x] Resolve Mongoose history path conflict in PUT route
- [x] Implement "Save as Template" functionality for Admin users

---

# Requirements - v1.2.1

## Template UI Enhancements

### 1. Adaptive Empty States
- **Admin-Specific Guidance**: When no templates exist, admins are presented with a "Create Your First Template" button to encourage workflow standardization.
- **Role-Based Messaging**: Tailored empty state descriptions that explain the value of templates based on the user's role.

## Technical Tasks (v1.2.1)
- [x] Implement role-check for "Create Template" button in selection modal
- [x] Re-style empty template state for better visual guidance

---

# Requirements - v1.2.2

## UI Decoupling - Part II

### 1. Dedicated View Architecture
- **Full-Page Detail View**: Transitioned the treatment plan summary/detail view from a modal to a dedicated route (`/patients/[id]/treatment-plans/[planId]`).
- **Enhanced Data Presentation**: Leveraged the full-page layout to provide a more spacious and informative view of clinical stages and history.
- **Improved UX Flow**: Simplified the patient profile by removing heavy modal logic and providing clear back-navigation to the main dashboard.

## Technical Tasks (v1.2.2)
- [x] Create the `TreatmentPlanViewPage` component and route
- [x] Update `TreatmentPlansList` navigation for detail inspection
- [x] Remove obsolete `Detail View Modal` from the main list component

---

# Requirements - v1.2.3

## UI Polish & Navigation Refinement

### 1. Terminology Standardization
- **Standardized Labels**: Unified the "Lead Doctor" and "In-charge Physician" labels into a consistent "In-charge Doctor" term across the module.

### 2. Robust Date Handling
- **Graceful Fallbacks**: Implemented strict date parsing with safe fallbacks (`-`) in the detail view to eliminate "Invalid Date" messages on legacy or malformed records.

### 3. Contextual Navigation
- **Tab-Aware Routing**: Updated the patient profile page to support `?tab=` query parameters.
- **Improved Return flow**: Re-routed "Back" buttons in treatment plan pages to specifically return to the "Treatment Plan" tab, maintaining user context.

## Technical Tasks (v1.2.3)
- [x] Implement `tab` query param support in `PatientViewPage`
- [x] Rename doctor-related labels in `TreatmentPlanViewPage` and `TreatmentPlanForm`
- [x] Fix date rendering logic in `TreatmentPlanViewPage`
- [x] Update all "Back" links to return to the correct patient tab

---

---

# Requirements - v1.2.5

## Clinical Infrastructure & Stage Categorization

### 1. Stage Type Management
- **Categorization**: Ability to categorize treatment plan stages by type (e.g., Surgery, Lab, Consultation).
- **Admin Control**: Restriction of stage type management (creation/deletion) to Administrators.
- **Doctor Workflow**: Enabling doctors to assign predefined types to stages during plan creation.

### 2. Expanded Medical Schema
- **Family History**: Addition of structured family history tracking to the Patient model.

## Technical Tasks (v1.2.5)
- [x] Create `StageType` model and API endpoints
- [x] Add `familyHistory` to the `Patient` schema and API mapping
- [x] Integrate stage type selection into `TreatmentPlanForm`

---

# Requirements - v1.2.6 & v1.2.7

## Patient Record Visibility & Organization

### 1. Tabbed Navigation Refinement
- **Prioritized Access**: Reordering of patient profile tabs to place "Medical Information" immediately after "Patient Details".
- **Main Tab Integration**: Direct inclusion of detailed medical records (Allergies, Medications, History) in the primary "Patient Details" tab for immediate clinical visibility.

### 2. Expanded Detail View
- **Summarized vs. Detailed**: Transition from showing summaries to full-text records for clinical history and medications.

## Technical Tasks (v1.2.6 & v1.2.7)
- [x] Reorder tabs in `PatientViewPage`
- [x] Implement detailed medical section in the primary dashboard tab
- [x] Synchronize clinical data display between view and edit modules

---

# Requirements - v1.2.8 & v1.2.9

## Patient Data Management Lifecycle

### 1. Complete Edit Capabilities
- **Field Parity**: Ensuring the Edit Patient form includes all clinical fields (Allergies, Medications, Family History) present in the creation flow.

### 2. Data Persistence Integrity
- **Creation Flow Fix**: Resolution of data loss issues where specific medical fields (Family History) were not persisted during the new patient intake.

## Technical Tasks (v1.2.8 & v1.2.9)
- [x] Update `EditPatientPage` with missing clinical fields
- [x] Fix data submission mapping in `NewPatientPage`
- [x] Verify state consistency during patient updates

---

# Requirements - v1.2.10

## Treatment Plan View Refinement

### 1. UI De-cluttering
- **Header Removal**: Removal of the redundant "Patient Medical Summary" header to maximize vertical space.
- **Icon Standardization**: Removal of distracting alert icons in favor of a clean, text-driven hierarchy.

### 2. Aesthetic Consistency
- **Card-Based UI**: Implementation of a card-based layout for clinical data matching the "In-Charge Doctor" section.

## Technical Tasks (v1.2.10)
- [x] Refactor clinical sidebar widget in `TreatmentPlanViewPage`
- [x] Implement new card styles for patient clinical details

---

# Requirements - v1.2.14

## Sidebar Label Alignment

### 1. Label Position Reversion
- **Specific Field Reversion**: Move labels for **Known Allergies**, **Current Medications**, and **Clinical History** back to their original position **above** the value cards.
- **Hierarchy Retention**: Keep **Patient Identity** as a subtitle (below the value) to maintain clinical focus.

## Technical Tasks (v1.2.14)
- [x] Reposition clinical labels in `TreatmentPlanViewPage` sidebar
- [x] Audit typography for vertical spacing consistency

---

# Requirements - v1.2.15

## Bug Fixes & Action Menu Enhancements

### 1. Plan Persistence Logic
- **BSON Error Resolution**: Ensure `primaryDoctorId` and stage-level `doctorId` fields are sent as `null` (not `""`) when unassigned, preventing casting errors.

### 2. Terminology Alignment
- **Stage Labeling**: Rename "Clinical Stages" to "Treatment Stages" in the Treatment Plan view for cross-module consistency.

### 3. Action Menu (3-Dot Dropdown)
- **Options**: Implement a unified dropdown menu offering:
    1. **View**: Detailed plan progression.
    2. **Edit**: Full plan modification.
    3. **Delete**: Complete plan removal.
- **Security & Safety**:
    - **Role Control**: Restriction of the "Delete" action to Clinic Admins only.
    - **Confirmation Flow**: Integration of a mandatory confirmation dialog warning about data loss before final deletion.

---

# Requirements - v1.3.0

## UI Polish & Enhanced Document Management

### 1. UI Positioning Refinements
- **Stage Action Menu**: Anchor the 3-dot dropdown menu close to the action button within the Treatment Stages table.
- **Pricing Logic**: For stages without an assigned budget, display `"-"` instead of `0` to meet industry standards.
- **Dynamic Financial Visuals**: Ensure the currency icon underlay in the budget card dynamically reflects the clinic's local currency (INR, USD, etc.).

### 2. Treatment Plan View Data Parity
- **Field Visibility**: Ensure all fields managed in the Edit view are visible in the Detailed View:
    - **Treatment Area**: Display prominently in the summary.
    - **Description vs. Notes**: Separate the general plan description from specific clinical notes (avoid merging them).
    - **Document Repository**: Display a dedicated section for all uploaded documents.

### 3. Advanced Document Management
- **File System Integration**: Replace manual name prompting with a standard file selection dialog.
- **Contextual Tagging**: Allow users to tag each document with a **Stage Name** or **Stage Type**.
- **Bulk Operations**: Support applying a single tag to multiple documents during a simultaneous upload session.

## Technical Tasks (v1.3.0)
- [ ] Fix popup anchoring in `TreatmentPlansList`
- [ ] Implement conditional price rendering in `[planId]/page.tsx`
- [ ] Add separate `notes` field to `TreatmentPlanForm` and View
- [ ] Refactor document upload with `input type="file"` and tagging state
- [ ] Sync currency icon in Budget Underlay
- [ ] Audit view page for Area and Document visibility
