import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
    medicineId?: mongoose.Schema.Types.ObjectId; // Link to inventory
    medicineName: string; // Name at time of prescription
    dosage: string;
    frequency: string;
    duration: string;
    quantity?: number;
    instructions?: string;
}

export interface IPrescription extends Document {
    encounterId?: mongoose.Schema.Types.ObjectId;
    admissionId?: mongoose.Schema.Types.ObjectId;
    patientId: string;
    patient: mongoose.Schema.Types.ObjectId;
    doctorId: mongoose.Schema.Types.ObjectId;
    doctorName?: string;

    medications: IPrescriptionItem[];

    category: 'GENERAL' | 'ENCOUNTER' | 'INPATIENT_ADMISSION';
    status: 'DRAFT' | 'FINALIZED' | 'DISPENSED' | 'CANCELLED';

    notes?: string;

    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PrescriptionItemSchema = new Schema({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: { type: Number },
    instructions: { type: String },
});

const PrescriptionSchema: Schema = new Schema(
    {
        encounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Encounter' },
        admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },

        patientId: { type: String, required: true },
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },

        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        doctorName: { type: String },

        medications: [PrescriptionItemSchema],

        category: {
            type: String,
            enum: ['GENERAL', 'ENCOUNTER', 'INPATIENT_ADMISSION'],
            default: 'ENCOUNTER',
            required: true,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'FINALIZED', 'DISPENSED', 'CANCELLED'],
            default: 'DRAFT',
        },

        notes: { type: String },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

// Indexes
PrescriptionSchema.index({ encounterId: 1 });
PrescriptionSchema.index({ admissionId: 1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });

const Prescription = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

export default Prescription;
