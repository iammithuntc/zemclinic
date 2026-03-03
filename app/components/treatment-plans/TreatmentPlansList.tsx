'use client';

import { useState, useEffect } from 'react';
import {
    Pill,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    ChevronRight,
    ExternalLink,
    MoreVertical,
    Save,
    FileText,
    Upload,
    X as LucideX,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SearchableDoctorSelect from '../SearchableDoctorSelect';
import { useSettings } from '../../contexts/SettingsContext';

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
    encounters?: string[];
    doctorId?: string | PopulatedDoctor;
    doctorName?: string;
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
    history?: {
        action: string;
        user: string;
        userName: string;
        timestamp: string;
        details?: string;
    }[];
    stages?: PlanStage[];
}

interface TreatmentPlansListProps {
    patientId: string;
}

export default function TreatmentPlansList({ patientId }: TreatmentPlansListProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { settings } = useSettings();
    const currencySymbol = settings?.currency === 'INR' ? '₹' : (settings?.currency === 'USD' ? '$' : settings?.currency || '$');

    const [plans, setPlans] = useState<TreatmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStageForView, setSelectedStageForView] = useState<PlanStage | null>(null);
    const [showStageMenu, setShowStageMenu] = useState<string | null>(null);

    // Template states
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, [patientId]);


    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/patients/${patientId}/treatment-plans`);
            if (response.ok) {
                const data = await response.json();

                // For each plan, fetch its stages to compute progress
                const plansWithStages = await Promise.all(data.plans.map(async (plan: TreatmentPlan) => {
                    const stageRes = await fetch(`/api/treatment-plans/${plan._id}/stages`);
                    if (stageRes.ok) {
                        const stageData = await stageRes.json();
                        const stages = stageData.stages as PlanStage[];
                        const doneCount = stages.filter((s: PlanStage) => s.status === 'DONE').length;
                        const progress = stages.length > 0 ? Math.round((doneCount / stages.length) * 100) : 0;
                        return { ...plan, stages, progress };
                    }
                    return { ...plan, stages: [], progress: 0 };
                }));

                setPlans(plansWithStages);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOpen = () => {
        router.push(`/patients/${patientId}/treatment-plans/new`);
    };

    const handleEditOpen = (plan: TreatmentPlan) => {
        router.push(`/patients/${patientId}/treatment-plans/${plan._id}/edit`);
    };

    const handleCreateFromTemplate = async () => {
        setLoadingTemplates(true);
        setShowTemplateModal(true);
        try {
            const res = await fetch('/api/treatment-plan-templates');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSelectTemplate = (template: any) => {
        // Redirect to new page with template ID as query param
        router.push(`/patients/${patientId}/treatment-plans/new?templateId=${template._id}`);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'SCHEDULED': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-orange-500" />;
            case 'NOT_STARTED': return <Clock className="h-4 w-4 text-gray-400" />;
            case 'SKIPPED': return <AlertCircle className="h-4 w-4 text-red-400" />;
            default: return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getDoctorName = (stage: PlanStage) => {
        if (typeof stage.doctorId === 'object' && stage.doctorId !== null) {
            return (stage.doctorId as PopulatedDoctor).name;
        }
        return stage.doctorName || '-';
    };

    const isAuthorizedForBudget = (plan: TreatmentPlan | null) => {
        if (!session?.user || !plan) return false;
        if (session.user.role === 'admin') return true;

        const primDocId = typeof plan.primaryDoctorId === 'object' ? plan.primaryDoctorId?._id : plan.primaryDoctorId;
        return primDocId === session.user.id;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Structured Treatment Plans</h3>
                <div className="flex space-x-3">
                    <button
                        onClick={handleCreateFromTemplate}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Create from Template
                    </button>
                    <button
                        onClick={handleCreateOpen}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Treatment Plan
                    </button>
                </div>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Pill className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No treatment plans found</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a treatment plan to track multi-visit procedures.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {plans.map((plan) => (
                        <div key={plan._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Pill className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => router.push(`/patients/${patientId}/treatment-plans/${plan._id}`)}
                                                className="text-left font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                {plan.title}
                                            </button>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {plan.primaryDoctorId && (
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        {(plan.primaryDoctorId as PopulatedDoctor).name || 'Unassigned'}
                                                    </span>
                                                )}
                                                {plan.treatmentArea && (
                                                    <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                                        {plan.treatmentArea}
                                                    </span>
                                                )}
                                                {plan.startDate && (
                                                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Start: {new Date(plan.startDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {plan.approxEndDate && (
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        End: {new Date(plan.approxEndDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {isAuthorizedForBudget(plan) && plan.totalBudget ? (
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        Budget: {currencySymbol}{plan.totalBudget.toLocaleString()}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right mr-3">
                                            <div className="text-sm font-semibold text-gray-900">{plan.progress}% Complete</div>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${plan.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditOpen(plan)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            <MoreVertical className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-0 overflow-visible">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/30">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Step</th>
                                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Procedure</th>
                                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {plan.stages?.map((stage, idx) => {
                                            const docName = getDoctorName(stage);
                                            return (
                                                <tr key={stage._id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-gray-900">{stage.name}</span>
                                                            {stage.shortDescription && (
                                                                <span className="text-[10px] text-gray-500">{stage.shortDescription}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-600">
                                                        {docName !== '-' ? (
                                                            <div className="flex items-center">
                                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-[10px] text-blue-600 font-bold">
                                                                    {docName.charAt(0)}
                                                                </div>
                                                                {docName}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(stage.status)}
                                                            <span className="text-xs font-medium capitalize text-gray-700">
                                                                {stage.status.replace('_', ' ').toLowerCase()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-right text-xs font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {(stage.encounters && stage.encounters.length > 0) || stage.encounterId ? (
                                                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center mr-2">
                                                                    <FileText className="h-3 w-3 mr-0.5" />
                                                                    Notes
                                                                </span>
                                                            ) : null}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowStageMenu(showStageMenu === stage._id ? null : stage._id);
                                                                }}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                                            </button>
                                                        </div>

                                                        {showStageMenu === stage._id && (
                                                            <div className="absolute right-6 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-[60] py-1 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <button
                                                                    onClick={() => { setSelectedStageForView(stage); setShowStageMenu(null); }}
                                                                    className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                                                                >
                                                                    <ExternalLink className="h-3 w-3 mr-2" /> View Stage
                                                                </button>
                                                                <button
                                                                    onClick={() => { handleEditOpen(plan); setShowStageMenu(null); }}
                                                                    className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                                                                >
                                                                    <Save className="h-3 w-3 mr-2" /> Edit Stage
                                                                </button>
                                                                {stage.status === 'NOT_STARTED' && (
                                                                    <Link
                                                                        href={`/appointments/new?patient=${patientId}&plan=${plan._id}&stage=${stage._id}${docName !== '-' ? `&doctorName=${encodeURIComponent(docName)}` : ''}`}
                                                                        className="w-full px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center font-bold"
                                                                    >
                                                                        <Calendar className="h-3 w-3 mr-2" /> Schedule
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stage Detail Modal */}
            {selectedStageForView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold">{selectedStageForView.name}</h3>
                            <button onClick={() => setSelectedStageForView(null)}><LucideX className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Status</p><p className="text-sm font-bold">{selectedStageForView.status}</p></div>
                                <div className="p-4 bg-gray-50 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Doctor</p><p className="text-sm font-bold">{getDoctorName(selectedStageForView)}</p></div>
                            </div>
                            {selectedStageForView.shortDescription && <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded-lg italic">"{selectedStageForView.shortDescription}"</div>}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400">Linked Clinical Data</h4>
                                {selectedStageForView.appointmentId ? (
                                    <Link href={`/appointments/${selectedStageForView.appointmentId}`} className="block p-3 bg-white border rounded text-xs hover:bg-gray-50 transition-colors">Appointment: {selectedStageForView.appointmentId.slice(-6).toUpperCase()}</Link>
                                ) : <p className="text-xs text-gray-400 italic">No linked appointments.</p>}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button onClick={() => setSelectedStageForView(null)} className="px-4 py-2 text-sm font-bold bg-white border rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[130] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Select a Template</h3>
                                <p className="text-xs text-gray-500 mt-1">Quickly initiate a plan using a predefined clinical workflow</p>
                            </div>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <LucideX className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingTemplates ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-20 px-4 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <FileText className="h-8 w-8 text-blue-400 opacity-50" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold text-lg">No clinical templates found</h4>
                                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">Templates help you quickly replicate complex treatment workflows across different patients.</p>

                                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                        {session?.user?.role === 'admin' && (
                                            <button
                                                onClick={handleCreateOpen}
                                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Your First Template
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCreateOpen}
                                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Start Blank Plan
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-6 italic">Admins can save any active plan as a template directly from the creation form.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {templates.map((template) => (
                                        <div
                                            key={template._id}
                                            onClick={() => handleSelectTemplate(template)}
                                            className="p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{template.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{template.description || 'No description provided.'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded border shadow-sm uppercase px-2">{template.stages.length} Stages</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-400">
                                                {template.treatmentArea && <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" />{template.treatmentArea}</span>}
                                                <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{currencySymbol}{template.stages.reduce((sum: number, s: any) => sum + (s.budget || 0), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                            <span>Selected template will pre-fill the form</span>
                            <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 font-bold text-gray-900 hover:bg-white rounded-lg transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
