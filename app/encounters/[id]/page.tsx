import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Encounter from '@/models/Encounter';
import dbConnect from '@/lib/mongodb';
import EncounterForm from '../EncounterForm';
import SidebarLayout from '@/app/components/sidebar-layout';
import ProtectedRoute from '@/app/protected-route';
import { ArrowLeft, Pill } from 'lucide-react';
import Link from 'next/link';
import TreatmentPlan from '@/models/TreatmentPlan';
import PlanStage from '@/models/PlanStage';

interface PageProps {
    params: {
        id: string;
    };
}

// Reuse the verify_dynamic_titles strategy for metadata if needed, 
// but for dynamic routes we fetch data.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    await dbConnect();
    const encounter = await Encounter.findById(params.id).select('encounterId patientName');

    if (!encounter) {
        return {
            title: 'Encounter Not Found',
        };
    }

    return {
        title: `Encounter ${encounter.encounterId} | AI Doctor`,
    };
}

async function getEncounter(id: string) {
    await dbConnect();
    const encounter = await Encounter.findById(id)
        .populate('patient', 'name gender dateOfBirth')
        .lean();

    if (!encounter) return null;

    let planInfo = null;
    if (encounter.planId) {
        const plan = await TreatmentPlan.findById(encounter.planId).lean();
        let stage = null;
        if (encounter.planStageId) {
            stage = await PlanStage.findById(encounter.planStageId).lean();
        }
        planInfo = { plan, stage };
    }

    // Convert ObjectId and Dates to string for serialization
    return JSON.parse(JSON.stringify({ encounter, planInfo }));
}

export default async function EncounterPage({ params }: PageProps) {
    const data = await getEncounter(params.id);

    if (!data) {
        notFound();
    }

    const { encounter, planInfo } = data;

    return (
        <ProtectedRoute>
            <SidebarLayout
                title={`Encounter: ${encounter.encounterId}`}
                description={`Patient: ${encounter.patient?.name} | Date: ${new Date(encounter.createdAt).toLocaleDateString()}`}
            >
                <div className="mb-6">
                    <Link
                        href="/appointments" // Or back to patient profile if we track origin
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Clinical Form */}
                    <div className="lg:col-span-2">
                        <EncounterForm initialData={encounter} />
                    </div>

                    {/* Sidebar - Vitals & Info (Placeholder for now) */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Patient Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-medium">{encounter.patient?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="font-medium capitalize">{encounter.patient?.gender}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Age</span>
                                    <span className="font-medium">
                                        {encounter.patient?.dateOfBirth ?
                                            Math.floor((new Date().getTime() - new Date(encounter.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                                            : 'N/A'} yrs
                                    </span>
                                </div>
                            </div>
                        </div>

                        {planInfo && (
                            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
                                <div className="flex items-center space-x-2 text-blue-900 mb-3">
                                    <Pill className="h-4 w-4" />
                                    <h3 className="font-semibold">Linked Plan</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Title</p>
                                        <p className="text-sm font-semibold text-gray-900">{planInfo.plan.title}</p>
                                        {planInfo.plan.toothNumber && (
                                            <p className="text-[10px] text-gray-500 font-medium">Tooth #{planInfo.plan.toothNumber}</p>
                                        )}
                                    </div>
                                    {planInfo.stage && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Stage</p>
                                            <div className="mt-1">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                    {planInfo.stage.name}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <Link
                                        href={`/patients/${encounter.patientId}?tab=treatment-plan`}
                                        className="inline-block text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        View Full Plan &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-900">Vitals</h3>
                                <button className="text-xs text-blue-600 hover:underline">+ Add Vitals</button>
                            </div>

                            <div className="text-sm text-gray-500 italic text-center py-4">
                                No vitals recorded for this encounter yet.
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarLayout>
        </ProtectedRoute>
    );
}
