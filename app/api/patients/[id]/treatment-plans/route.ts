import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TreatmentPlan from '@/models/TreatmentPlan';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userRole = session.user.role;
        const userId = (session.user as any).id;

        let query: any = { patientId: id };

        if (userRole === 'doctor') {
            // Doctors see plans where they are the primary doctor OR assigned to a stage
            const PlanStage = (await import('@/models/PlanStage')).default;
            const stagesForDoctor = await PlanStage.find({ doctorId: userId }, 'planId');
            const planIdsFromStages = stagesForDoctor.map(s => s.planId);

            query = {
                patientId: id,
                $or: [
                    { primaryDoctorId: userId },
                    { _id: { $in: planIdsFromStages } }
                ]
            };
        } else if (userRole === 'patient') {
            // Patients only see their own plans
            // In this route, since we have id in params, we should verify it matches session user id if it's a patient
            if ((session.user as any).role === 'patient' && (session.user as any).patientId !== id && (session.user as any).id !== id) {
                // Double check if id is patientId or userId
                const Patient = (await import('@/models/Patient')).default;
                const patient = await Patient.findOne({ $or: [{ _id: id }, { patientId: id }] });
                if (!patient || (patient.email !== session.user.email)) {
                    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
                }
            }
        } else if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const plans = await TreatmentPlan.find(query)
            .populate('primaryDoctorId', 'name email specialization')
            .sort({ createdAt: -1 });

        return NextResponse.json({ plans });
    } catch (error: any) {
        console.error('Error fetching patient treatment plans:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch patient treatment plans' }, { status: 500 });
    }
}
