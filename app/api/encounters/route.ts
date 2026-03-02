import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Encounter from '@/models/Encounter';
import Appointment from '@/models/Appointment';
import Admission from '@/models/Admission';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const doctorId = searchParams.get('doctorId');
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const query: any = {};
        if (patientId) query.patientId = patientId; // Assumes querying by string ID
        if (doctorId) query.doctorId = doctorId;
        if (type) query.type = type;
        if (status) query.status = status;

        const encounters = await Encounter.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('patient', 'name email phone') // Populate references if needed
            .populate('doctorId', 'name email');

        const total = await Encounter.countDocuments(query);

        return NextResponse.json({
            encounters,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching encounters:', error);
        return NextResponse.json(
            { error: 'Failed to fetch encounters' },
            { status: 500 }
        );
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

        // Basic validation
        if (!body.patientId || !body.patient || !body.doctorId || !body.type) {
            return NextResponse.json(
                { error: 'Missing required fields: patientId, patient, doctorId, type' },
                { status: 400 }
            );
        }

        // Create encounter
        const encounter = await Encounter.create({
            ...body,
            createdBy: session.user.id, // Assumes session.user has id
            status: body.status || 'IN_PROGRESS'
        });

        // If linked to Appointment, update Appointment
        if (body.appointmentId) {
            await Appointment.findByIdAndUpdate(body.appointmentId, {
                encounterId: encounter._id,
                status: 'in-progress' // Update status to in-progress
            });
        }

        // If linked to Admission, update Admission (if primary)
        if (body.admissionId && body.type === 'INPATIENT') {
            // Check if admission already has primary encounter
            const admission = await Admission.findById(body.admissionId);
            if (admission && !admission.primaryEncounterId) {
                admission.primaryEncounterId = encounter._id;
                await admission.save();
            }
        }

        return NextResponse.json(encounter, { status: 201 });
    } catch (error) {
        console.error('Error creating encounter:', error);
        return NextResponse.json(
            { error: 'Failed to create encounter' },
            { status: 500 }
        );
    }
}
