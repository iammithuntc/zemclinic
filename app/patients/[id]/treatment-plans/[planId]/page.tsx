'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Pill,
    Calendar,
    Clock,
    X as LucideX,
    TrendingUp,
    DollarSign,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Heart,
    User,
    Brain,
    ExternalLink,
    FileText,
    ClipboardList
} from 'lucide-react';
import { useSettings } from '@/app/contexts/SettingsContext';

interface PopulatedDoctor {
    _id: string;
    name: string;
    email?: string;
    specialization?: string;
}

interface PlanStage {
    _id: string;
    name: string;
    sequenceNumber: number;
    shortDescription?: string;
    status: 'NOT_STARTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
    tentativeDate?: string;
    appointmentId?: string;
    appointments?: string[];
    encounterId?: string;
    doctorId?: string | PopulatedDoctor;
    doctorName?: string;
    stageType?: string;
    budget?: number;
}

interface TreatmentPlan {
    _id: string;
    title: string;
    description?: string;
    documents?: {
        name: string;
        url: string;
        stageId?: string;
        uploadedAt: string;
    }[];
    treatmentArea?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    approxDuration?: number;
    approxEndDate?: string;
    totalBudget?: number;
    progress?: number;
    primaryDoctorId?: string | PopulatedDoctor;
    notes?: string;
    history?: {
        action: string;
        user: string;
        userName: string;
        timestamp: string;
        details?: string;
    }[];
    stages?: PlanStage[];
}

export default function TreatmentPlanViewPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { settings } = useSettings();
    const currencySymbol = settings?.currency === 'INR' ? '₹' : (settings?.currency === 'USD' ? '$' : settings?.currency || '$');

    const [plan, setPlan] = useState<TreatmentPlan | null>(null);
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStage, setSelectedStage] = useState<PlanStage | null>(null);

    const patientId = params.id as string;
    const planId = params.planId as string;

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/treatment-plans/${planId}`);
                if (!res.ok) throw new Error('Failed to fetch treatment plan');
                const data = await res.json();
                setPlan({ ...data.plan, stages: data.stages });

                // Fetch patient details for clinical info widget
                const patientRes = await fetch(`/api/patients/${patientId}`);
                if (patientRes.ok) {
                    const patientData = await patientRes.json();
                    setPatient(patientData);
                }
            } catch (error) {
                console.error('Error fetching treatment plan:', error);
            } finally {
                setLoading(false);
            }
        };

        if (planId) fetchPlan();
    }, [planId]);

    const isAuthorizedForBudget = () => {
        if (!session?.user || !plan) return false;
        if (session.user.role === 'admin') return true;

        const primDocId = typeof plan.primaryDoctorId === 'object' ? plan.primaryDoctorId?._id : plan.primaryDoctorId;
        return primDocId === session.user.id;
    };

    const getDoctorName = (stage: PlanStage) => {
        if (typeof stage.doctorId === 'object' && stage.doctorId !== null) {
            return (stage.doctorId as PopulatedDoctor).name;
        }
        return stage.doctorName || '-';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border text-center max-w-md">
                    <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Treatment Plan Not Found</h3>
                    <p className="text-gray-500 mt-2">The treatment plan you are looking for does not exist or has been removed.</p>
                    <button
                        onClick={() => router.push(`/patients/${patientId}?tab=treatment-plan`)}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                    >
                        Back to Patient Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(`/patients/${patientId}?tab=treatment-plan`)}
                            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                                <Pill className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{plan.title}</h1>
                                <p className="text-sm font-bold text-gray-500 flex items-center mt-1">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    Initiated {formatDate(plan.startDate)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/patients/${patientId}/treatment-plans/${planId}/edit`}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-black rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Edit Plan
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Stages */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8">
                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                    <div className="flex flex-col space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Plan Description</p>
                                            <p className="text-gray-700 leading-relaxed font-medium">{plan.description || 'No description provided.'}</p>
                                        </div>
                                        {plan.notes && (
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Clinical Notes</p>
                                                <p className="text-gray-700 leading-relaxed font-medium">{plan.notes}</p>
                                            </div>
                                        )}
                                        {plan.treatmentArea && (
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Treatment Area</p>
                                                <p className="text-gray-700 leading-relaxed font-medium">{plan.treatmentArea}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-4">
                                        <div className="px-4 py-2 bg-white border border-gray-100 text-sm font-bold rounded-xl flex items-center shadow-sm">
                                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                            Start: {formatDate(plan.startDate)}
                                        </div>
                                        {plan.approxDuration && (
                                            <div className="px-4 py-2 bg-white border border-gray-100 text-sm font-bold rounded-xl flex items-center shadow-sm">
                                                <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
                                                {plan.approxDuration} Days
                                            </div>
                                        )}
                                        {plan.approxEndDate && (
                                            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center shadow-md shadow-blue-100">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                End: {formatDate(plan.approxEndDate)}
                                            </div>
                                        )}
                                        {isAuthorizedForBudget() && (
                                            <div className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center shadow-md shadow-emerald-100">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Budget: {currencySymbol}{plan.totalBudget?.toLocaleString() || '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider">Treatment Stages</h3>
                                    <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-black rounded-full uppercase tracking-widest">{plan.progress}% Complete</span>
                                </div>
                                <div className="space-y-4">
                                    {plan.stages?.map((stage, idx) => (
                                        <div
                                            key={stage._id}
                                            onClick={() => setSelectedStage(stage)}
                                            className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all cursor-pointer flex justify-between items-center"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{stage.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-0.5">
                                                        <p className="text-[10px] font-black text-gray-400">{getDoctorName(stage)}</p>
                                                        {stage.stageType && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase tracking-tighter border border-blue-100">{stage.stageType}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                {isAuthorizedForBudget() && (
                                                    <span className="text-sm font-black text-emerald-600">
                                                        {stage.budget && stage.budget > 0 ? `${currencySymbol}${stage.budget.toLocaleString()}` : '-'}
                                                    </span>
                                                )}
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${stage.status === 'DONE' ? 'bg-green-100 text-green-700' :
                                                        stage.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {stage.status.replace('_', ' ')}
                                                    </span>
                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documents Repository Section */}
                            {plan.documents && plan.documents.length > 0 && (
                                <div className="px-8 pb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider">Clinical Documents</h3>
                                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full uppercase tracking-widest">{plan.documents.length} Files</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {plan.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-blue-200 transition-all group">
                                                <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{doc.name}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                        {doc.stageId && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-tighter">
                                                                    {plan.stages?.find(s => s._id === doc.stageId)?.name || doc.stageId}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: In-Charge & Audit Log */}
                    <div className="space-y-8">
                        {/* Clinical Information Widget */}
                        {patient && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="space-y-6">
                                    {/* Patient Identity */}
                                    <div className="flex items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm mr-5 ring-4 ring-white">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-lg font-black text-gray-900 leading-tight">{patient.name}</p>
                                                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-sm">
                                                    {patient.bloodType || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Patient Identity</p>
                                        </div>
                                    </div>

                                    {/* Allergies - Full Width */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Known Allergies</p>
                                        <div className="p-4 bg-red-50/50 border border-red-100/50 rounded-2xl">
                                            {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {patient.allergies[0].split(',').map((a: string, i: number) => (
                                                        <span key={i} className="px-2.5 py-1 bg-white text-red-700 text-xs font-bold rounded-lg border border-red-200 shadow-sm uppercase tracking-tight">
                                                            {a.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold text-gray-400">No known allergies reported.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Current Medications - Full Width */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Medications</p>
                                        <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl">
                                            <p className="text-xs text-blue-700 font-bold leading-relaxed">
                                                {patient.currentMedications?.[0] || 'No active medications documented.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Medical History Card */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Clinical History</p>
                                        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                            <p className="text-xs text-gray-700 font-bold leading-relaxed">
                                                {patient.medicalHistory?.[0] || 'No critical medical history recorded.'}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/patients/${patientId}?tab=medical-info`}
                                        className="w-full py-4 bg-gray-50 border border-gray-200 text-[10px] font-black text-blue-600 uppercase tracking-widest rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-center flex items-center justify-center group shadow-sm hover:shadow-md"
                                    >
                                        <span>View Detailed Medical Record</span>
                                        <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* In-Charge Section */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">In-Charge Doctor</h3>
                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-100 mr-5">
                                    {((plan.primaryDoctorId as PopulatedDoctor)?.name || 'U').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">{(plan.primaryDoctorId as PopulatedDoctor)?.name || 'Unassigned'}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">In-Charge Doctor</p>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log Section */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col max-h-[600px]">
                            <div className="p-8 border-b border-gray-50">
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">History & Audit</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {plan.history && plan.history.length > 0 ? (
                                    plan.history.slice().reverse().map((entry, idx) => (
                                        <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                                            <div className="absolute left-0 top-1 w-3 h-3 bg-blue-600 rounded-full border-[3px] border-white shadow-sm ring-4 ring-blue-50" />
                                            {idx !== (plan.history?.length || 0) - 1 && (
                                                <div className="absolute left-[5.5px] top-4 w-[1px] h-full bg-gray-100" />
                                            )}
                                            <p className="text-sm font-black text-gray-900 leading-tight">{entry.action}</p>
                                            <div className="flex items-center text-[11px] text-gray-500 font-bold mt-2 space-x-2">
                                                <span>{entry.userName}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                            </div>
                                            {entry.details && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 font-medium italic border border-gray-100">
                                                    {entry.details}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock className="h-12 w-12 text-gray-100 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-gray-400 italic">No history available for this plan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Detail Peek Modal */}
            {selectedStage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedStage.name}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Stage Details</p>
                            </div>
                            <button onClick={() => setSelectedStage(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all shadow-sm">
                                <LucideX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-black text-gray-900 mt-1">{selectedStage.status.replace('_', ' ')}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doctor</p>
                                    <p className="text-sm font-black text-blue-600 mt-1">{getDoctorName(selectedStage)}</p>
                                </div>
                            </div>

                            {selectedStage.stageType && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Stage Type</p>
                                    <span className="px-3 py-1 bg-white text-blue-700 text-xs font-black rounded-xl border border-blue-200 shadow-sm uppercase tracking-wider">
                                        {selectedStage.stageType}
                                    </span>
                                </div>
                            )}

                            {selectedStage.shortDescription && (
                                <div className="p-6 bg-blue-50 text-blue-800 text-sm font-medium rounded-2xl italic border border-blue-100 leading-relaxed">
                                    "{selectedStage.shortDescription}"
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Linked Clinical Data</h4>
                                {selectedStage.appointmentId ? (
                                    <Link
                                        href={`/appointments/${selectedStage.appointmentId}`}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                                    >
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                                            <span>Appointment Record</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                                    </Link>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center">
                                        <AlertCircle className="h-8 w-8 text-gray-200 mb-2" />
                                        <p className="text-xs text-gray-400 font-bold italic">No active appointments linked to this stage.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedStage(null)}
                                className="px-8 py-3 text-sm font-black bg-white border border-gray-200 rounded-2xl hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
