import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalSign {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    notes?: string;
    recordedAt: Date;
    recordedBy?: String;
}

export interface IEncounter extends Document {
    encounterId: string;
    patientId: string; // link to Patient.patientId (string)
    patient: mongoose.Schema.Types.ObjectId; // link to Patient._id (ObjectId)
    doctorId: mongoose.Schema.Types.ObjectId;
    doctorName?: string;
    appointmentId?: mongoose.Schema.Types.ObjectId;
    admissionId?: mongoose.Schema.Types.ObjectId;

    type: 'OPD' | 'FOLLOW_UP' | 'EMERGENCY' | 'INPATIENT' | 'ROUND' | 'POST_DISCHARGE';
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';

    chiefComplaint?: string;
    history?: string;
    examination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    notes?: string;

    vitals?: IVitalSign[];

    relatedEncounterId?: mongoose.Schema.Types.ObjectId; // For follow-up chains
    parentEncounterId?: mongoose.Schema.Types.ObjectId; // For primary consult encounter link

    planId?: mongoose.Schema.Types.ObjectId;
    planStageId?: mongoose.Schema.Types.ObjectId;

    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

const VitalSignSchema = new Schema({
    bloodPressure: { type: String, trim: true },
    pulse: { type: Number },
    temperature: { type: Number },
    respiratoryRate: { type: Number },
    oxygenSaturation: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    notes: { type: String, trim: true },
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: String },
});

const EncounterSchema: Schema = new Schema(
    {
        encounterId: {
            type: String,
            unique: true,
            required: false, // Auto-generated in pre-save hook
            trim: true,
        },
        patientId: {
            type: String,
            required: true,
            trim: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorName: {
            type: String, // Cached for easier display
            trim: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        admissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admission',
        },
        type: {
            type: String,
            enum: ['OPD', 'FOLLOW_UP', 'EMERGENCY', 'INPATIENT', 'ROUND', 'POST_DISCHARGE'],
            required: true,
            default: 'OPD',
        },
        status: {
            type: String,
            enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED'],
            default: 'IN_PROGRESS',
        },
        chiefComplaint: { type: String, trim: true },
        history: { type: String, trim: true },
        examination: { type: String, trim: true },
        diagnosis: { type: String, trim: true },
        treatmentPlan: { type: String, trim: true },
        notes: { type: String, trim: true },

        vitals: [VitalSignSchema],

        relatedEncounterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Encounter',
        },
        parentEncounterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Encounter',
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TreatmentPlan',
        },
        planStageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PlanStage',
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        completedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Indexes
EncounterSchema.index({ patientId: 1, createdAt: -1 });
EncounterSchema.index({ doctorId: 1, createdAt: -1 });
EncounterSchema.index({ appointmentId: 1 }, { unique: true, partialFilterExpression: { appointmentId: { $exists: true } } });
EncounterSchema.index({ admissionId: 1 });

// Pre-save hook to generate encounter ID
EncounterSchema.pre('save', async function () {
    if (this.isNew && !this.encounterId) {
        const today = new Date();
        const year = today.getFullYear();
        const count = await mongoose.models.Encounter.countDocuments({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });

        const sequence = String(count + 1).padStart(5, '0');
        this.encounterId = `ENC-${year}-${sequence}`;
    }
});

// Avoid model recompilation error in dev
// Force recompilation in dev to ensure hooks are updated
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Encounter;
}
const Encounter = mongoose.models.Encounter || mongoose.model<IEncounter>('Encounter', EncounterSchema);

export default Encounter;
