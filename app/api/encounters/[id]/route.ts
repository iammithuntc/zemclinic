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
        const encounter = await Encounter.findById(id)
            .populate('patient', 'name dateOfBirth gender phone email')
            .populate('doctorId', 'name email specialization')
            .populate('appointmentId')
            .populate('admissionId');

        if (!encounter) {
            return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }

        return NextResponse.json(encounter);
    } catch (error) {
        console.error('Error fetching encounter:', error);
        return NextResponse.json(
            { error: 'Failed to fetch encounter' },
            { status: 500 }
        );
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

        // Prevent updating immutable fields if necessary, or valid specific transitions
        const encounter = await Encounter.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!encounter) {
            return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }

        return NextResponse.json(encounter);
    } catch (error) {
        console.error('Error updating encounter:', error);
        return NextResponse.json(
            { error: 'Failed to update encounter' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        // Add role check if needed (e.g., only admin can delete)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Soft delete or status update preferred usually
        const encounter = await Encounter.findByIdAndUpdate(
            id,
            { status: 'CANCELLED' },
            { new: true }
        );

        if (!encounter) {
            return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Encounter cancelled successfully', encounter });
    } catch (error) {
        console.error('Error deleting encounter:', error);
        return NextResponse.json(
            { error: 'Failed to delete encounter' },
            { status: 500 }
        );
    }
}
