import mongoose, { Schema, Document } from 'mongoose';

export interface IStageType extends Document {
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StageTypeSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent multiple model initialization in development
export default mongoose.models.StageType || mongoose.model<IStageType>('StageType', StageTypeSchema);
