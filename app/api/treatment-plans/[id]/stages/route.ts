import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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
        const stages = await PlanStage.find({ planId: id })
            .populate('doctorId', 'name email specialization')
            .sort({ sequenceNumber: 1 });
        return NextResponse.json({ stages });
    } catch (error: any) {
        console.error('Error fetching plan stages:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch plan stages' }, { status: 500 });
    }
}

export async function POST(
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
        body.planId = id;

        const stage = await PlanStage.create(body);
        return NextResponse.json(stage, { status: 201 });
    } catch (error: any) {
        console.error('Error creating plan stage:', error);
        return NextResponse.json({ error: error.message || 'Failed to create plan stage' }, { status: 500 });
    }
}
