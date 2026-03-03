'use client';

import { useParams } from 'next/navigation';
import SidebarLayout from '../../../../components/sidebar-layout';
import ProtectedRoute from '../../../../protected-route';
import TreatmentPlanForm from '../../../../components/treatment-plans/TreatmentPlanForm';

export default function NewTreatmentPlanPage() {
    const params = useParams();
    const patientId = params.id as string;

    return (
        <ProtectedRoute>
            <SidebarLayout
                title="New Treatment Plan"
                description="Initiate a new clinical treatment plan for this patient"
            >
                <div className="max-w-5xl mx-auto py-6">
                    <TreatmentPlanForm patientId={patientId} />
                </div>
            </SidebarLayout>
        </ProtectedRoute>
    );
}
