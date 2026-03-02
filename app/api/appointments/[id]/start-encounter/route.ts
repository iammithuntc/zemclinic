import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Encounter from '@/models/Encounter';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust import based on verification

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
        const appointmentId = id;

        // 1. Check if appointment exists
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        // 2. Check if encounter already exists for this appointment
        if (appointment.encounterId) {
            const existingEncounter = await Encounter.findById(appointment.encounterId);
            if (existingEncounter) {
                return NextResponse.json(existingEncounter);
            }
        }

        // 3. Create new encounter
        // Use doctorId from session if available, or from appointment if matching logic exists
        // Ideally, the doctor starting the encounter becomes the 'doctorId' or 'createdBy'
        // But appointment has 'doctorName', not necessarily 'doctorId' linked to User model directly in schema?
        // Let's assume session.user.id is the doctor.

        // We need to resolve patientId (Object ID) from appointment.patientId (String?)
        // Appointment model has patientId as String?
        // Encounter model requires patient (ObjectId) AND patientId (String)

        // 4. Find Patient
        // 4. Find Patient
        const Patient = (await import('@/models/Patient')).default;
        let patientDesc = null;

        // Helper to normalize phone numbers for comparison
        const normalizePhone = (phone: string) => phone.replace(/[\s\-\(\)\+]/g, '');

        // Strategy A: By Custom Patient ID (if exists)
        if (appointment.patientId) {
            console.log(`[StartEncounter] Lookup by patientId: "${appointment.patientId}"`);
            patientDesc = await Patient.findOne({ patientId: appointment.patientId });
        }

        // Strategy B: By Email (Unique)
        if (!patientDesc && appointment.patientEmail) {
            console.log(`[StartEncounter] Lookup by email: "${appointment.patientEmail}"`);
            patientDesc = await Patient.findOne({ email: appointment.patientEmail.toLowerCase() });
        }

        // Strategy C: By Name and Phone (Backup with normalization)
        if (!patientDesc && appointment.patientName && appointment.patientPhone) {
            const normalizedApptPhone = normalizePhone(appointment.patientPhone);
            console.log(`[StartEncounter] Lookup by name/phone: "${appointment.patientName}" / "${normalizedApptPhone}"`);

            // We need to find patients with matching name, then compare normalized phones
            const potentialMatches = await Patient.find({ name: appointment.patientName });
            patientDesc = potentialMatches.find(p => normalizePhone(p.phone) === normalizedApptPhone);
        }

        // Strategy D: Auto-create Patient if still not found
        if (!patientDesc) {
            console.log(`[StartEncounter] Patient not found. Auto-creating new patient for:`, {
                name: appointment.patientName,
                email: appointment.patientEmail,
            });

            try {
                // Generate a temporary password or handle it as specific requirement
                patientDesc = await Patient.create({
                    name: appointment.patientName,
                    email: appointment.patientEmail,
                    phone: appointment.patientPhone,
                    dateOfBirth: new Date(), // Placeholder
                    gender: 'prefer-not-to-say', // Placeholder
                    address: 'Updated from Appointment',
                    password: 'password123'
                });
            } catch (createError: any) {
                console.error('Failed to auto-create patient:', createError);
                return NextResponse.json({
                    error: `Patient not found and failed to auto-create. Error: ${createError.message}`
                }, { status: 500 });
            }
        }

        // Generate encounterId manually to ensure it exists even if model schema cache is stale
        const today = new Date();
        const year = today.getFullYear();
        // Dynamic import to avoid circular dependency issues if any, though likely safe here
        const EncounterModel = (await import('@/models/Encounter')).default;

        const count = await EncounterModel.countDocuments({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });

        const sequence = String(count + 1).padStart(5, '0');
        const encounterId = `ENC-${year}-${sequence}`;

        const encounter = await Encounter.create({
            encounterId: encounterId, // Manually set ID
            patientId: patientDesc.patientId,
            patient: patientDesc._id,
            doctorId: session.user.id,
            doctorName: session.user.name,
            appointmentId: appointment._id,
            planId: appointment.planId, // Link to plan from appointment
            planStageId: appointment.planStageId, // Link to stage from appointment
            type: 'OPD',
            status: 'IN_PROGRESS',
            chiefComplaint: appointment.reason || '',
            createdBy: session.user.id
        });

        // 4. Update appointment
        appointment.encounterId = encounter._id;
        appointment.status = 'in-progress';
        await appointment.save();

        // 5. Update PlanStage status if linked
        if (appointment.planStageId) {
            const PlanStage = (await import('@/models/PlanStage')).default;
            await PlanStage.findByIdAndUpdate(appointment.planStageId, {
                status: 'IN_PROGRESS',
                encounterId: encounter._id
            });
        }

        return NextResponse.json(encounter, { status: 201 });
    } catch (error: any) {
        console.error('Error starting encounter:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to start encounter' },
            { status: 500 }
        );
    }
}
