'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SidebarLayout from '../../../../../components/sidebar-layout';
import ProtectedRoute from '../../../../../protected-route';
import TreatmentPlanForm from '../../../../../components/treatment-plans/TreatmentPlanForm';

export default function EditTreatmentPlanPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;
    const planId = params.planId as string;

    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch(`/api/treatment-plans/${planId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPlan({ ...data.plan, stages: data.stages });
                } else {
                    setError('Treatment plan not found');
                }
            } catch (error) {
                console.error('Error fetching plan:', error);
                setError('Failed to load treatment plan');
            } finally {
                setLoading(false);
            }
        };

        if (planId) {
            fetchPlan();
        }
    }, [planId]);

    if (loading) {
        return (
            <ProtectedRoute>
                <SidebarLayout title="Edit Treatment Plan" description="Loading plan details...">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </SidebarLayout>
            </ProtectedRoute>
        );
    }

    if (error || !plan) {
        return (
            <ProtectedRoute>
                <SidebarLayout title="Error" description="Plan not found">
                    <div className="text-center py-12">
                        <p className="text-red-500 font-bold">{error || 'Something went wrong'}</p>
                        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold">Go Back</button>
                    </div>
                </SidebarLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <SidebarLayout
                title={`Edit: ${plan.title}`}
                description="Modify treatment stages, assignments, and clinical details"
            >
                <div className="max-w-5xl mx-auto py-6">
                    <TreatmentPlanForm patientId={patientId} initialData={plan} isEdit={true} />
                </div>
            </SidebarLayout>
        </ProtectedRoute>
    );
}
