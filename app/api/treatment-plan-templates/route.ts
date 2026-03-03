import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TreatmentPlanTemplate from '@/models/TreatmentPlanTemplate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const templates = await TreatmentPlanTemplate.find({
            $or: [
                { isPublic: true },
                { createdBy: (session.user as any).id }
            ]
        }).populate('createdBy', 'name').sort({ createdAt: -1 });

        return NextResponse.json({ templates });
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const template = await TreatmentPlanTemplate.create({
            ...body,
            createdBy: (session.user as any).id
        });

        return NextResponse.json(template);
    } catch (error: any) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: error.message || 'Failed to create template' }, { status: 500 });
    }
}
