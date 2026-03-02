import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TreatmentPlan from '@/models/TreatmentPlan';
import PlanStage from '@/models/PlanStage';
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
        const plan = await TreatmentPlan.findById(id).populate('primaryDoctorId', 'name email specialization');
        if (!plan) {
            return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
        }

        const stages = await PlanStage.find({ planId: plan._id })
            .populate('doctorId', 'name email specialization')
            .sort({ sequenceNumber: 1 });

        return NextResponse.json({ plan, stages });
    } catch (error: any) {
        console.error('Error fetching treatment plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch treatment plan' }, { status: 500 });
    }
}

export async function PUT(
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
        const body = await request.json();
        const { stages, historyEntry, ...planData } = body;

        const updatePayload: any = { ...planData };

        // If a history entry is provided from the frontend, add it
        if (historyEntry) {
            updatePayload.$push = {
                history: {
                    ...historyEntry,
                    user: (session.user as any).id,
                    userName: session.user.name || 'System',
                    timestamp: new Date()
                }
            };
        } else {
            // Default history entry if none provided but something changed
            updatePayload.$push = {
                history: {
                    action: 'PLAN_UPDATED',
                    user: (session.user as any).id,
                    userName: session.user.name || 'System',
                    timestamp: new Date(),
                    details: 'Plan details updated'
                }
            };
        }

        const plan = await TreatmentPlan.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!plan) {
            return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
        }

        // Handle stages synchronization if provided
        if (stages && Array.isArray(stages)) {
            const currentStages = await PlanStage.find({ planId: plan._id });
            const currentStageIds = currentStages.map(s => s._id.toString());
            const providedStageIds = stages.map(s => s._id).filter(id => id);

            // 1. Delete stages not in the provided list
            const stagesToDelete = currentStageIds.filter(id => !providedStageIds.includes(id));
            if (stagesToDelete.length > 0) {
                await PlanStage.deleteMany({ _id: { $in: stagesToDelete } });
                // Log stage deletion
                await TreatmentPlan.findByIdAndUpdate(id, {
                    $push: {
                        history: {
                            action: 'STAGES_REMOVED',
                            user: (session.user as any).id,
                            userName: session.user.name || 'System',
                            timestamp: new Date(),
                            details: `${stagesToDelete.length} stage(s) removed`
                        }
                    }
                });
            }

            // 2. Update or Create stages
            let addedCount = 0;
            let updatedCount = 0;
            for (let i = 0; i < stages.length; i++) {
                const stageData = stages[i];
                const updateData = {
                    ...stageData,
                    planId: plan._id,
                    sequenceNumber: i + 1
                };

                if (stageData._id) {
                    await PlanStage.findByIdAndUpdate(stageData._id, updateData);
                    updatedCount++;
                } else {
                    await PlanStage.create({
                        ...updateData,
                        status: stageData.status || 'NOT_STARTED'
                    });
                    addedCount++;
                }
            }

            if (addedCount > 0 || updatedCount > 0) {
                await TreatmentPlan.findByIdAndUpdate(id, {
                    $push: {
                        history: {
                            action: 'STAGES_MODIFIED',
                            user: (session.user as any).id,
                            userName: session.user.name || 'System',
                            timestamp: new Date(),
                            details: `${addedCount} added, ${updatedCount} updated`
                        }
                    }
                });
            }
        }

        return NextResponse.json(plan);
    } catch (error: any) {
        console.error('Error updating treatment plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to update treatment plan' }, { status: 500 });
    }
}

export async function DELETE(
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
        const plan = await TreatmentPlan.findById(id);
        if (!plan) {
            return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
        }

        // Optional: Also delete stages? Or just mark as cancelled?
        // For now, simple delete of plan. stages remain or could be bulk deleted.
        await PlanStage.deleteMany({ planId: plan._id });
        await TreatmentPlan.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Treatment plan deleted' });
    } catch (error: any) {
        console.error('Error deleting treatment plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete treatment plan' }, { status: 500 });
    }
}
