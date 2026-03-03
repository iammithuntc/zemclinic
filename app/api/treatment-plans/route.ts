import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TreatmentPlan from '@/models/TreatmentPlan';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        let query = {};
        if (patientId) {
            query = { patientId };
        }

        const plans = await TreatmentPlan.find(query).sort({ createdAt: -1 });

        // Mask budget for unauthorized users
        const sanitizedPlans = plans.map(plan => {
            const planObj = plan.toObject();
            const primDocId = typeof planObj.primaryDoctorId === 'object' ? planObj.primaryDoctorId?._id.toString() : planObj.primaryDoctorId?.toString();
            const isAuthorized = session.user.role === 'admin' || primDocId === (session.user as any).id;

            if (!isAuthorized) {
                delete planObj.totalBudget;
            }
            return planObj;
        });

        return NextResponse.json({ plans: sanitizedPlans });
    } catch (error: any) {
        console.error('Error fetching treatment plans:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch treatment plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { stages, ...planData } = body;

        // Security: Only Admin or In-Charge Doctor can set budget
        const isAuthorized = session.user.role === 'admin' || planData.primaryDoctorId === (session.user as any).id;

        if (!isAuthorized) {
            if (planData.totalBudget !== undefined) delete planData.totalBudget;
            if (stages && Array.isArray(stages)) {
                stages.forEach((s: any) => { if (s.budget !== undefined) delete s.budget; });
            }
        }

        // Add initial history entry
        const plan = await TreatmentPlan.create({
            ...planData,
            history: [{
                action: 'PLAN_CREATED',
                user: (session.user as any).id,
                userName: session.user.name || 'System',
                timestamp: new Date(),
                details: `Plan "${planData.title}" created`
            }]
        });

        const planId = (plan as any)._id;

        // If stages are provided, create them
        if (stages && Array.isArray(stages)) {
            const PlanStage = (await import('@/models/PlanStage')).default;
            const stagesWithPlanId = stages.map((stage: any, index: number) => ({
                ...stage,
                planId: planId,
                sequenceNumber: index + 1,
                status: 'NOT_STARTED'
            }));
            await PlanStage.insertMany(stagesWithPlanId);
        }

        return NextResponse.json(plan, { status: 201 });
    } catch (error: any) {
        console.error('Error creating treatment plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to create treatment plan' }, { status: 500 });
    }
}
