````md
# ZemClinic

## Introduction
Welcome to **ZemClinic**, a comprehensive healthcare practice / hospital management system designed to streamline daily operations. The platform combines core HMS features (patients, appointments, reports, inpatient management, pharmacy, inventory, billing) with AI-assisted tools to support clinical workflows.

### Key Benefits
- Streamlined patient management and record keeping  
- Intelligent appointment scheduling and optimization  
- AI-powered medical assistance and analysis  
- Comprehensive reporting and analytics  
- Secure data management with role-based access and hashed passwords  

---

## Technology Stack & Dependencies
This application is built with modern, secure, and up-to-date technologies. All dependencies have been updated to meet the latest security requirements and best practices.

### Security Status
- ✅ 0 security vulnerabilities  
- ✅ All critical security patches applied  
- ✅ Latest stable versions installed  

### Core Framework
- **Next.js** 15.5.9  
- **React** 19.2.1  
- **React DOM** 19.2.1  
- **TypeScript** ^5  

### Authentication & Database
- **NextAuth.js** ^4.24.13  
- **Mongoose** ^9.0.0  
- **MongoDB** ^6.18.0  
- **@auth/mongodb-adapter** ^3.10.0  

### UI & Styling
- **Tailwind CSS** ^4  
- **Lucide React** ^0.555.0  
- **React Hot Toast** ^2.6.0  

### Additional Libraries
- **next-intl** ^4.3.6  
- **html2canvas** ^1.4.1  
- **jspdf** ^4.0.0  
- **recharts** ^3.7.0  
- **cookies-next** ^6.1.0  
- **bcryptjs** ^3.0.2  

---

## Installation
Pull the latest version from GitHub or download the ZIP.

- `ZemClinic-Build.zip` — The initial download package  
- After extracting `main_files.zip`, you'll get `ZemClinic[version-no].zip` — This is the actual script file  
- Extract `ZemClinic[version-no].zip` to begin installation  

---

## Prerequisites

### 1. Install Node.js
Download and install Node.js from the official website:  
- Download: https://nodejs.org/  
Choose the **LTS (Long Term Support)** version for stability.

Verify installation:
```bash
node --version
npm --version
````

### 2. Install MongoDB

Choose one of the following options:

#### Option A: MongoDB Atlas (Cloud - Recommended)

* Sign up at MongoDB Atlas
* Create a free cluster (M0 tier available)
* Get your connection string

#### Option B: Local MongoDB Installation

* Download from MongoDB Community Server
* Install and start MongoDB service
* Default connection: `mongodb://localhost:27017`

---

## Installation Steps

### Step 1: Download and Extract Files

Download the script from CodeCanyon:

1. Log in to your CodeCanyon account
2. Navigate to your downloads section
3. Download `main_files.zip`
4. Extract `main_files.zip` to get `ai-doctor.zip`
5. Extract `ai-doctor.zip` to your desired location

> **Note:** After extraction, you should have a folder named `ai-doctor` (or similar) containing all project files.

Navigate to the extracted folder:

```bash
cd ai-doctor
```

### Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/ai-doc
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

#### Environment Variables Explained

* **MONGODB_URI**: MongoDB connection string

  * For Atlas:
    `mongodb+srv://username:password@cluster.mongodb.net/ai-doc`
* **NEXTAUTH_URL**: Base URL of your app (use production domain in production)
* **NEXTAUTH_SECRET**: Secret for encrypting JWT tokens

Generate a secret:

```bash
openssl rand -base64 32
```

> **Important:**
>
> * Keep `.env.local` secure and never share it
> * GPT-4.1 API key can be configured later through **Settings → AI Settings**

### Step 4: Set Up Database

Ensure MongoDB is running and accessible:

#### For Local MongoDB

```bash
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

#### For MongoDB Atlas

* Ensure your IP is whitelisted in Atlas **Network Access**
* Create a database user with read/write permissions
* Use the connection string provided by Atlas

### Step 5: Seed Database (Optional)

Populate database with sample data:

```bash
npm run seed
```

This creates sample patients, appointments, and reports for demonstration purposes.

### Step 6: Start Development Server

Run the app in dev mode:

```bash
npm run dev
```

The application will start at:

* [http://localhost:3000](http://localhost:3000)

You should see:

* ✓ Ready in X seconds
* ○ Local: [http://localhost:3000](http://localhost:3000)

---

## AI API Configuration

### Configure GPT-4.1 API Key

To use AI features, configure an API key through the Settings page:

1. Log in to the application
2. Navigate to **Settings → AI Settings**
3. Add your OpenAI API key for GPT-4.1
4. Test the connection
5. Activate GPT-4.1 as your AI model

---

## Production Build

Build and run for production:

```bash
npm run build
npm run start
```

> **Note:** Make sure to:
>
> * Set `NEXTAUTH_URL` to your production domain
> * Use a strong `NEXTAUTH_SECRET`
> * Configure production MongoDB connection string
> * Enable HTTPS for secure connections

---

## Troubleshooting

### Issue: MongoDB Connection Failed

* Verify MongoDB is running: `mongosh` or check service status
* Check connection string in `.env.local`
* For Atlas: verify IP whitelist and credentials
* Check firewall settings

### Issue: Port 3000 Already in Use

* Stop other apps using port 3000
* Or run on another port:

```bash
PORT=3001 npm run dev
```

### Issue: Module Not Found Errors

* Delete `node_modules`
* Delete `package-lock.json`
* Reinstall:

```bash
npm install
```

### Issue: Build Errors

* Clear Next.js cache:

```bash
rm -rf .next
```

* Check TypeScript:

```bash
npm run lint
```

* Ensure all env vars are set

### Issue: AI Features Not Working

* Verify GPT-4.1 API key is configured correctly
* Check API permissions and quotas
* Test API connection in **Settings → AI Settings**
* Check browser console for errors

---

## Available Scripts

* `npm run dev` — Start dev server with hot reload ([http://localhost:3000](http://localhost:3000))
* `npm run build` — Build production app using Turbopack
* `npm run start` — Start production server (requires build)
* `npm run lint` — Run ESLint
* `npm run seed` — Populate DB with sample data
* `npm run test:ai-results` — Test AI results functionality

---

## Getting Started

### 1. Login to Your Account

Access the system and login.

**Demo credentials** (created by `npm run seed`):

* Admin: `admin@aidoc.com` / `password123`
* Doctor: `doctor@aidoc.com` / `password123`

Authentication uses **bcrypt-hashed passwords**. There are no hardcoded/mock credentials in login logic.

### 2. Navigate the Dashboard

Dashboard provides:

* Practice statistics and key metrics
* Recent activities and appointments
* Quick access to common tasks

### 3. Explore Features

Use the left sidebar navigation for:

* patient management
* appointments
* reports
* inpatient modules
* billing
* AI tools

---

## Dashboard

### Statistics Cards

Includes:

* Total Patients
* Appointments Today
* Reports Generated
* AI Insights

Click any card to navigate to the related section.

### Recent Activity

Track:

* New patient registrations
* Appointment bookings
* Report generations
* System updates

### Upcoming Appointments

Quick view:

* Patient names
* Appointment times
* Status indicators

### Quick Actions

* Add New Patient
* Schedule Appointment
* Generate Report

---

## Patient Management

### Patient List

* Search by name, ID, or contact info
* Filter by status, date, etc.
* Quick access to patient details
* Delete patient records (with confirmation)

### Add New Patient

Includes:

* Personal info (name, DOB, contact details)
* Medical history and allergies
* Insurance info
* Emergency contacts

### Patient Details

* Complete medical history
* Past appointments
* Prescriptions and medications
* Test results and reports
* Case notes and documentation

### Edit Patient Information

Update records with a full audit trail.

---

## Appointment Management

### Schedule New Appointment

* Select patient
* Select doctor

  * Admin/staff can choose via searchable doctor select
  * Doctors auto-fill themselves
* Choose date/time slot
* Set type/duration
* Add notes/reminders

### View Appointments

* Daily / weekly / monthly views
* Filter by status or doctor
* Role-based visibility

  * doctors see only assigned appointments
  * patients see only their own
* Quick status updates
* Patient info at a glance

### Edit Appointments

* Modify appointment details
* Change time/date
* Update status
* Add/modify notes

### Reschedule Appointments

* Quick rescheduling options
* Automatic patient notifications
* Conflict detection
* History tracking

---

## Medical Reports

### Create New Report

* Patient info and test results
* Diagnosis and findings
* Recommendations and follow-up
* Attachments and images

### Report Management

* Organized list
* Filter by patient/date/type
* Search
* Status tracking (draft, completed, reviewed)
* Priority-based organization

### Report Actions

* Edit reports
* Download PDF
* Share with patients
* Print reports

---

## Doctors & Staff

Administrators manage user accounts for doctors and staff.
Doctors list shows only users with **doctor role**, and staff are managed via a dedicated **Staff module**.

### Doctor Profile Fields

* Phone, specialization, department
* License number, qualifications
* Years of experience, bio
* Address, date of birth, gender
* Doctor edit uses a dedicated page (not a modal)

### Permissions & Safety

* Role-based access control (admin/doctor/staff/patient)
* Role protected during edit to prevent accidental changes
* Passwords stored as bcrypt hashes (no plaintext fallback)

---

## Inpatient Management

Manage wards, beds, and admissions. Editing is handled via dedicated pages for a reliable full-page experience.

* **Wards**: list / create / edit
* **Beds**: list / edit (ward assignment, type/status, notes/features)
* **Admissions**: create / edit and patient assignment

---

## Pharmacy

Manage medicines and pharmacy inventory. Medicine view/edit pages provide a full details screen (including stock and expiry info).

---

## Inventory

Manage suppliers, items, and purchase orders. Supplier view/edit and purchase-order view screens are available as dedicated pages.

* Suppliers: view and edit
* Items: create and manage medical supplies/equipment
* Purchase Orders: view details, items, totals, and status

---

## Billing & Invoices

Create and manage invoices and payments. Invoice edit uses a dedicated edit page for a stable, full-form workflow.

---

## Analytical Reports

Analytical Reports pull real data from your database (not static demo values). Charts are rendered using **Recharts**, with CSV export available on each report screen.

### Available Dashboards

* Financial
* Clinical
* Operational
* Performance
* Patient Analytics
* Appointment Analytics

### Filters & Export

* Date range selector (today / week / month / quarter / year)
* Filter toggles (status/type views depending on report)
* Export button downloads CSV for current view

---

## Language (i18n)

The UI supports multiple languages:

* English
* Spanish
* French

Translations are stored in JSON under `messages/`.

* Change language from Settings
* If text looks stale after switching, reload the page

---

## AI-Powered Features

AI Doctor includes a suite of AI-powered tools designed to enhance clinical workflows (diagnosis, treatment planning, risk assessment, etc.).

All AI features are powered by **GPT-4.1**:

* GPT-4.1 for text-based features
* GPT-4.1 Vision for image analysis

---

## AI Assistant

An intelligent medical assistant for medical queries, patient info, and clinical decision support.

### Key Features

* Medical Queries (symptoms, treatments, conditions)
* Patient Information (history, prescriptions)
* Treatment Suggestions
* Drug Information (interactions)
* Clinical Guidelines

### Example Queries

* “What are the symptoms of diabetes?”
* “Show me patient John Smith’s medical history”
* “What medications is patient Jane Doe currently taking?”
* “Recommend treatment for hypertension”

---

## AI Treatment Plans

Generate evidence-based treatment plans tailored to patient conditions.

### Features

* Personalized recommendations based on patient data
* Evidence-based medicine integration
* Medication suggestions with dosages
* Follow-up care plans
* Lifestyle recommendations

---

## AI Drug Interaction Checker

Check potential interactions before prescribing.

### Features

* Check interactions between multiple medications
* Patient-specific analysis
* Severity ratings (mild, moderate, severe)
* Alternative medication suggestions
* Food/supplement interaction warnings

---

## AI Medical Image Analysis

Analyze medical images with GPT-4.1 Vision.

### Supported Image Types

* X-rays and radiographs
* CT scans and MRIs
* Ultrasound images
* Dermatology photos
* Pathology slides

> **Note:** AI analysis is assistance only and should not replace professional medical judgment.

---

## AI Voice Input

Use voice commands for hands-free workflows.

### Features

* Voice-to-text transcription
* Hands-free patient data entry
* Voice commands for navigation
* Real-time transcription
* Multi-language support

---

## AI Appointment Optimizer

Optimize schedules to maximize efficiency and satisfaction.

### Features

* Optimal time slot suggestions
* Patient preference learning
* Resource allocation optimization
* Reduced wait times
* Conflict prevention

---

## AI Risk Assessment

Assess risk factors and complications.

### Features

* Risk factor analysis
* Disease progression prediction
* Complication risk scoring
* Preventive care recommendations
* Risk stratification

---

## AI Health Trends

Track and analyze population health trends.

### Features

* Population health analytics
* Disease trend identification
* Seasonal pattern recognition
* Comparative analysis
* Predictive insights

---

## AI Health Analytics

Advanced AI-powered practice analytics.

### Features

* Practice performance metrics
* Patient outcome analysis
* Treatment effectiveness tracking
* Resource utilization insights
* Customizable reports and dashboards

---

## AI Symptom Analyzer

Analyze symptoms to assist diagnosis and planning.

### Features

* Symptom pattern recognition
* Differential diagnosis suggestions
* Severity assessment
* Recommended tests/examinations
* Treatment pathway suggestions

---

## AI Report Generator

Generate structured medical reports with AI assistance.

### Features

* Automated report generation from patient data
* Structured medical documentation
* Customizable templates
* Multi-format export (PDF, DOCX)
* Quality assurance checks

---

## Settings & Profile

### Profile Management

* Update personal information
* Change password
* Manage contact details
* Profile picture upload

### System Settings

* GPT-4.1 configuration
* Notification settings
* Language preferences
* Display preferences
* Data export options

### AI Settings

* Configure GPT-4.1 API key
* Test API connection
* Adjust response parameters
* Manage AI feature preferences

---

## Tips & Best Practices

### General Tips

* Keep patient information up-to-date for accurate AI recommendations
* Use search to quickly find patients/appointments/reports
* Regularly review and update appointment statuses
* Export important reports for backups
* Use AI as decision support, not replacement for clinical judgment

### AI Features Best Practices

* Verify AI recommendations with medical expertise
* Use interaction checker before prescribing new meds
* Review AI-generated reports before finalizing
* Ensure API key is valid with sufficient credits
* Use voice input in quiet environments

### Security & Privacy

* Always log out (especially on shared computers)
* Use strong passwords and change regularly
* Protect patient privacy and follow applicable regulations
* Review patient data access logs regularly
* Use secure network connections

### Efficiency Tips

* Use keyboard shortcuts
* Set up quick actions for common tasks
* Use filters and search
* Take advantage of bulk actions
* Customize dashboard for your workflow

```
```
