import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatmentPlan extends Document {
    patientId: string;
    createdFromEncounterId?: mongoose.Schema.Types.ObjectId;
    title: string;
    treatmentArea?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: Date;
    approxEndDate?: Date;
    description?: string;
    documents?: {
        name: string;
        url: string;
        stageId?: string;
        uploadedAt: Date;
    }[];
    notes?: string;
    primaryDoctorId?: mongoose.Schema.Types.ObjectId;
    history?: {
        action: string;
        user: string;
        userName: string;
        timestamp: Date;
        details?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const TreatmentPlanSchema: Schema = new Schema(
    {
        patientId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        createdFromEncounterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Encounter',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        treatmentArea: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'ACTIVE',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        approxEndDate: {
            type: Date,
        },
        description: {
            type: String,
            trim: true,
        },
        documents: [{
            name: { type: String, required: true },
            url: { type: String, required: true },
            stageId: { type: String },
            uploadedAt: { type: Date, default: Date.now },
        }],
        notes: {
            type: String,
            trim: true,
        },
        primaryDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        history: [{
            action: { type: String, required: true },
            user: { type: String, required: true },
            userName: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            details: { type: String },
        }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.TreatmentPlan || mongoose.model<ITreatmentPlan>('TreatmentPlan', TreatmentPlanSchema);
