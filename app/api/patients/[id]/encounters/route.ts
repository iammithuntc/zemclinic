import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Encounter from '@/models/Encounter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const patientId = id; // This is likely the custom string ID (e.g. PAT-123) or ObjectId

        // Check if it's a valid ObjectId or custom ID
        // Our Encounter model uses 'patientId' for the string ID

        const encounters = await Encounter.find({ patientId: patientId })
            .sort({ createdAt: -1 })
            .populate('doctorId', 'name specialization')
            .populate('appointmentId', 'appointmentDate');

        return NextResponse.json(encounters);
    } catch (error) {
        console.error('Error fetching patient encounters:', error);
        return NextResponse.json(
            { error: 'Failed to fetch encounters' },
            { status: 500 }
        );
    }
}
