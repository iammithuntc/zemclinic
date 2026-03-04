import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlanStage from '@/models/PlanStage';
import TreatmentPlan from '@/models/TreatmentPlan';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string, stageId: string }> }
) {
    try {
        const { id, stageId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Check authorization
        const plan = await TreatmentPlan.findById(id);
        if (!plan) {
            return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
        }

        const isAdmin = session.user.role === 'admin';
        const isInChargeDoctor = plan.primaryDoctorId?.toString() === session.user.id;

        // Find the stage to check assigned doctor
        const stage = await PlanStage.findById(stageId);
        if (!stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        const isAssignedDoctor = stage.doctorId?.toString() === session.user.id;

        if (!isAdmin && !isInChargeDoctor && !isAssignedDoctor) {
            return NextResponse.json({ error: 'Not authorized to update this stage' }, { status: 403 });
        }

        // Update the stage
        const updatedStage = await PlanStage.findByIdAndUpdate(
            stageId,
            { $set: body },
            { new: true }
        ).populate('doctorId', 'name email specialization');

        // Log status change if status was changed
        if (body.status && body.status !== stage.status) {
            const historyEntry = {
                action: `Updated Stage Status: ${stage.name}`,
                userId: session.user.id,
                userName: session.user.name || 'System',
                timestamp: new Date(),
                details: `Status changed from ${stage.status} to ${body.status}`
            };

            await TreatmentPlan.findByIdAndUpdate(
                id,
                { $push: { history: historyEntry } }
            );
        }

        return NextResponse.json({ stage: updatedStage });
    } catch (error: any) {
        console.error('Error updating plan stage:', error);
        return NextResponse.json({ error: error.message || 'Failed to update plan stage' }, { status: 500 });
    }
}
