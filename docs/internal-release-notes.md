# Internal Release Notes - v1.0.0

## [1.0.0] - 2026-03-02

### Summary
Version 1.0.0 introduces fundamental clinical workflows, multi-stage treatment planning, and enterprise-grade security for the ZemClinic platform. This release focuses on clinical data integrity and a refined user experience for both medical staff and patients.

### New Features

#### 1. Treatment Planning Engine
- **Multi-Visit Workflow**: Practitioners can now design complex treatment journeys over multiple stages.
- **Drill-down Analytics**: New detailed views for each plan and stage, showing linked appointments and encounter history.
- **Lead Doctor Management**: Clear accountability with Primary Doctor assignment for every plan.

#### 2. Clinical Encounter System
- **Holistic Records**: Consolidated view of clinical notes and prescriptions linked to specific patient encounters.
- **Workflow Automation**: One-click encounter creation from scheduled appointments.

#### 3. Enterprise Branding
- **Dynamic Identity**: Clinic-wide customization of logos and favicons through the Settings dashboard.
- **Professional Presence**: Dynamic page titles across all modules for a polished, integrated feel.

### Security & Privacy
- **Hardened RBAC**: Global enforcement of role-based access for treatment plans.
- **Audit Trails**: Full lifecycle tracking for clinical plan modifications, ensuring accountability and compliance.

### Technical Improvements
- **Population Engine**: Integrated Mongoose `.populate()` for real-time data consistency across the doctor and patient directories.
- **Strict Typing**: Massive reduction in `any` types, particularly in the Treatment Plan and Inventory components.
- **Asset Integrity**: Document upload system now supports metadata tagging for precise clinical relevance.

### Bug Fixes
- Resolved critical UI clipping issues in Treatment Plan option menus.
- fixed appointment auto-fill logic for patients and doctors.
---

## [1.1.0] - 2026-03-02

### Summary
Version 1.1.0 focuses on financial transparency and timeline automation within the Treatment Plan module. This update introduces automated date calculations, stage-level budgeting, and enhanced role-based security for sensitive financial data.

### New Features

#### 1. Automated Timeline Management
- **Intelligent End-Dates**: Dynamic calculation of the `approxEndDate` based on the specified plan duration and start date.
- **Duration Tracking**: Users can now specify the approximate duration (in days) for a complete treatment journey.

#### 2. Fiscal Planning & Stage Budgeting
- **Granular Costing**: Estimated budgets can now be assigned to individual treatment stages.
- **Total Plan Estimates**: Automatic summation of all stage budgets to provide a high-level financial overview of the entire plan.

#### 3. Financial RBAC & Data Masking
- **Sensitive Data Visibility**: Pricing and budget information is strictly visible to **Admins** and the **In-Charge Doctor** only.
- **Backend Security**: Implementation of backend masking to ensure budget fields are omitted from API responses for unauthorized users.
- **Write Verification**: Role-based validation on `POST` and `PUT` endpoints to prevent unauthorized financial modifications.

### Technical Improvements
- **Model Evolution**: Updated `TreatmentPlan` and `PlanStage` schemas with duration and budget attributes.
- **Component Refactoring**: Complete rebuild of `TreatmentPlansList.tsx` for improved modularity and consistency.
- **Consistent Branding**: Batch renaming of "Clinical Plan" to "Treatment Plan" across the entire patient dashboard.

### Bug Fixes
- Resolved syntax and nesting errors in the treatment plan creation and edit modals.
- Fixed an issue where legacy plans without duration data caused UI rendering glitches.
---

## [1.2.0] - 2026-03-02

### Summary
Version 1.2.0 introduces a major structural refactor of the Treatment Plan module and a new Template Management system. This release also standardizes internationalization with dynamic currency support and resolves significant backend technical debt.

### New Features

#### 1. Decoupled Page-Based Architecture
- **Dedicated Routes**: Treatment plan creation and editing have been moved from nested modals to standalone pages for absolute clarity and stability.
- **Workflow Integrity**: Prevents accidental modal closures and UI clipping in complex dental workflows.

#### 2. Clinical Workflow Templates
- **Template Library**: Ability for Admins to create and curate "blueprint" plans that can be instantly applied to any patient.
- **Save as Template**: Any new clinical plan can now be converted into a template with a single click by Admin staff.
- **Rapid Initiation**: "Create from Template" button reduces data entry time by pre-populating stages, budgets, and instructions.

#### 3. Dynamic Currency & Localization
- **Multi-Currency Ready**: Automated rendering of preferred currency symbols (₹, $, etc.) across all financial views.
- **Contextual Pricing**: Real-time budget updates that respect global hospital/clinic settings.

### Technical Improvements
- **Resolved Atomic Path Collision**: Refactored the Treatment Plan update logic to prevent Mongoose `history` path conflicts.
- **Enhanced Audit Trail**: Improved detail logging for lifecycle actions including stage additions and deletions.
- **Type Compliance**: Final system-wide cleanup of implicit `any` types and TypeScript linting issues.

### Bug Fixes
- Fixed a critical "history path conflict" error during plan updates.
- Resolved an issue with session data availability in the treatment plan list view.
- Corrected various TypeScript linting errors in the new form components.

---

## [1.2.1] - 2026-03-02

### Summary
Version 1.2.1 is a targeted UI update to improve the discoverability of the Template Management system for administrators.

### New Features

#### 1. Enhanced Empty Template State
- **Admin Guidance**: Added a prominent "Create Your First Template" button in the template selection modal when no templates exist.
- **Improved Messaging**: Re-styled the empty state with clearer instructions and role-specific call-to-actions.
- **Direct Redirection**: Streamlined the path for admins to initiate their first reusable workflow.

### Technical Improvements
- Improved responsiveness and visual hierarchy of the template selection placeholder.

---

## [1.2.2] - 2026-03-02

### Summary
Version 1.2.2 completes the transition to a modern, decoupled UI for Treatment Plans by moving the "Plan View" functionality to a dedicated page.

### New Features

#### 1. Dedicated View Page
- **Full-Screen Summary**: A new dedicated route (`/patients/[id]/treatment-plans/[planId]`) for inspecting plan details.
- **Enhanced Data Layout**: Improved presentation of clinical stages, lead physician info, and change history.
- **Improved Performance**: Reduced the weight of the patient profile page by externalizing complex detail view logic.

### Technical Improvements
- Removed the last legacy modal from the `TreatmentPlansList` component.
- Centralized data fetching patterns for treatment plan detail inspection.

---

## [1.2.3] - 2026-03-02

### Summary
Version 1.2.3 focuses on standardizing terminology and refining navigation based on initial feedback from the full-page decoupling.

### Refinements & Fixes

#### 1. Terminology Update
- Renamed "Lead Doctor" and "In-charge Physician" to **"In-charge Doctor"** for cross-module consistency.

#### 2. Robust Date Parsing
- Fixed a bug where legacy or empty date fields displayed as "Invalid Date" in the view page. These now gracefully fallback to a placeholder.

#### 3. Navigational Continuity
- Updated the back-navigation system to preserve state. Users returning from a New/Edit/View page are now automatically returned to the **"Treatment Plans"** tab of the patient profile, rather than the default details view.

### Technical Improvements
- Added support for `tab` query parameters in the main Patient View component.
- Improved date formatting utility functions.

---

## [1.2.4] - 2026-03-02

### Summary
Version 1.2.4 addresses data visibility issues in the full-page view and refines the template-based creation workflow.

### Fixes & Improvements

#### 1. Start Date & Doctor Visibility
- Fixed a data mapping error where the start date and in-charge doctor were not displaying in the detailed full-page view.

#### 2. Template Lifecycle Logic
- Updated the template loading mechanism to ensure that any new plan created from a template automatically defaults to **Today's Date** for the `startDate`. This prevents legacy template dates from being accidentally applied to new plans.
- Verified that all clinical workflow stages are correctly populated from templates while maintaining patient isolation.

---

## [1.2.5] - 2026-03-02

### Summary
Version 1.2.5 introduces foundational clinical infrastructure for stage categorization and expanded patient medical history tracking.

### New Features
#### 1. Stage Type Categorization
- **Admin Management**: New system settings module for managing clinical stage categories (Surgery, Consultation, etc.).
- **Smart Categorization**: Integration into the treatment plan form for better workflow organization.

#### 2. Expanded Patient Schema
- **Family History Tracking**: Addition of structured family history records to the unified patient profile.

### Technical Improvements
- Created `StageType` model and RESTful API endpoints.
- Updated Patient API and Mongoose schemas to support persistent family history.

---

## [1.2.6 & 1.2.7] - 2026-03-02

### Summary
These versions focus on maximizing clinical data visibility within the patient record and optimizing the profile layout.

### New Features
#### 1. Integrated Medical Dashboard
- **Instant Visibility**: Full-text medical history, allergies, and medications are now integrated directly into the primary "Patient Details" tab.
- **Improved Scannability**: High-density UI for clinical notes to ensure zero-click access to vital data.

#### 2. Tab Navigation Refinement
- **Medical-First Flow**: Re-ordered profile tabs to prioritize "Medical Information" for faster clinical review.

---

## [1.2.8 & 1.2.9] - 2026-03-02

### Summary
Maintenance releases focused on clinical data integrity and completeness of the patient lifecycle management.

### Bug Fixes & Refinements
#### 1. Edit Form Parity
- Fixed missing medical fields in the "Edit Patient" interface, enabling full CRUD for Allergies, Medications, and Family History.
#### 2. Creation Persistence
- Resolved a critical bug in the new patient flow that prevented family history from being saved to the database.

---

## [1.2.10, 1.2.11 & 1.2.12] - 2026-03-03

### Summary
A trilogy of UI/UX updates focused on premium aesthetics and information density within the Treatment Plan module.

### New Features & Refinements
#### 1. Premium Clinical Sidebar
- **De-cluttered Interface**: Removed redundant headers and alert icons for a cleaner, focused experience.
- **Card-Based Architecture**: Redesigned patient identity and medical sections into premium cards matching the hospital design system.

#### 2. Adaptive Information Display
- **Integrated Identity**: Merged blood group indicators into the patient profile card to save space.
- **Full-Width Capacity**: Expanded Allergies and Medications into full-width sections to accommodate detailed clinical prescriptions and notes.

#### 3. Typography & Style Standardization
- **Label Consistency**: Standardized all clinical labels to the "Identity format" (labels placed logically below values).
- **Unified Style Guide**: Enforced strict font weights (**bold**) and sizes (**text-xs**) across all clinical cards, removing inconsistent italics for a professional finish.
