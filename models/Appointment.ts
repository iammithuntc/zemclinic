import mongoose from 'mongoose';

export interface IAppointment {
  _id: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  doctorEmail?: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow-up' | 'followUp' | 'checkup' | 'emergency' | 'surgery' | 'therapy';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'inProgress' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  encounterId?: string; // Reference to Encounter
  relatedEncounterId?: string; // For follow-up linking
  planId?: string;
  planStageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
    patientId: {
      type: String,
      required: false,
      trim: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow-up', 'followUp', 'checkup', 'emergency', 'surgery', 'therapy'],
      default: 'consultation',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'inProgress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    symptoms: [{
      type: String,
      trim: true,
    }],
    diagnosis: {
      type: String,
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encounter',
    },
    relatedEncounterId: {
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
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
