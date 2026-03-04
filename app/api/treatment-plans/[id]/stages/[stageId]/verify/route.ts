import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlanStage from '@/models/PlanStage';
import TreatmentPlan from '@/models/TreatmentPlan';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(
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

        // 1. Get Settings to check if verification is enabled
        const settings = await Settings.findOne();
        if (!settings?.enableStageVerification) {
            return NextResponse.json({ error: 'Stage verification is not enabled in settings' }, { status: 400 });
        }

        // 2. Get Treatment Plan to check authorization
        const plan = await TreatmentPlan.findById(id);
        if (!plan) {
            return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
        }

        const isAdmin = session.user.role === 'admin';
        const isInChargeDoctor = plan.primaryDoctorId?.toString() === session.user.id;

        if (!isAdmin && !isInChargeDoctor) {
            return NextResponse.json({ error: 'Only admins or the in-charge doctor can verify stages' }, { status: 403 });
        }

        // 3. Get the Stage
        const stage = await PlanStage.findById(stageId);
        if (!stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        if (stage.status !== 'COMPLETED' && stage.status !== 'DONE') {
            return NextResponse.json({ error: 'Only completed stages can be verified' }, { status: 400 });
        }

        if (stage.verifiedAt) {
            return NextResponse.json({ error: 'Stage is already verified' }, { status: 400 });
        }

        // 4. Update Stage with verification info
        stage.verifiedBy = new mongoose.Types.ObjectId(session.user.id) as any;
        stage.verifiedByName = session.user.name || 'Unknown';
        stage.verifiedAt = new Date();
        await stage.save();

        // 5. Log the action in Treatment Plan history
        const historyEntry = {
            action: `Verified Stage: ${stage.name}`,
            userId: session.user.id,
            userName: session.user.name || 'System',
            timestamp: new Date(),
            details: `Stage verified by ${session.user.name} (${session.user.role})`
        };

        const updatedPlan = await TreatmentPlan.findByIdAndUpdate(
            id,
            { $push: { history: historyEntry } },
            { new: true }
        );

        return NextResponse.json({
            message: 'Stage verified successfully',
            stage,
            updatedHistory: updatedPlan?.history
        });
    } catch (error: any) {
        console.error('Error verifying stage:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify stage' }, { status: 500 });
    }
}
