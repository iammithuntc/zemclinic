import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatmentPlanTemplate extends Document {
    name: string;
    description?: string;
    treatmentArea?: string;
    stages: {
        name: string;
        approxDuration?: number;
        budget?: number;
        shortDescription?: string;
    }[];
    createdBy: mongoose.Schema.Types.ObjectId;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TreatmentPlanTemplateSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        treatmentArea: {
            type: String,
            trim: true,
        },
        stages: [{
            name: { type: String, required: true },
            approxDuration: { type: Number, default: 0 },
            budget: { type: Number, default: 0 },
            shortDescription: { type: String },
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.TreatmentPlanTemplate || mongoose.model<ITreatmentPlanTemplate>('TreatmentPlanTemplate', TreatmentPlanTemplateSchema);
