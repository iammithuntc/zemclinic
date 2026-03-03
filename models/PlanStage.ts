import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanStage extends Document {
    planId: mongoose.Schema.Types.ObjectId;
    name: string;
    sequenceNumber: number;
    shortDescription?: string;
    tentativeDate?: Date;
    status: 'NOT_STARTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
    appointmentId?: mongoose.Schema.Types.ObjectId;
    appointments?: mongoose.Schema.Types.ObjectId[];
    encounterId?: mongoose.Schema.Types.ObjectId;
    encounters?: mongoose.Schema.Types.ObjectId[];
    doctorId?: mongoose.Schema.Types.ObjectId;
    doctorName?: string;
    stageType?: string;
    budget?: number;
    notes?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PlanStageSchema: Schema = new Schema(
    {
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TreatmentPlan',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sequenceNumber: {
            type: Number,
            required: true,
        },
        shortDescription: {
            type: String,
            trim: true,
        },
        tentativeDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['NOT_STARTED', 'SCHEDULED', 'IN_PROGRESS', 'DONE', 'SKIPPED'],
            default: 'NOT_STARTED',
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        encounterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Encounter',
        },
        appointments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        }],
        encounters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Encounter',
        }],
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        doctorName: {
            type: String,
            trim: true,
        },
        stageType: {
            type: String,
            trim: true,
        },
        budget: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            trim: true,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for getting stages of a plan in order
PlanStageSchema.index({ planId: 1, sequenceNumber: 1 });

// Prevent multiple model initialization in development, and force schema updates
if (process.env.NODE_ENV === 'development' && mongoose.models.PlanStage) {
    delete mongoose.models.PlanStage;
}
export default mongoose.models.PlanStage || mongoose.model<IPlanStage>('PlanStage', PlanStageSchema);
