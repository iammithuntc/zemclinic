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
    X as LucideX
} from 'lucide-react';
import Link from 'next/link';
import SearchableDoctorSelect from '../SearchableDoctorSelect';



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
    approxEndDate?: string;
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
    const [plans, setPlans] = useState<TreatmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
    const [selectedPlanForView, setSelectedPlanForView] = useState<TreatmentPlan | null>(null);
    const [selectedStageForView, setSelectedStageForView] = useState<PlanStage | null>(null);
    const [showStageMenu, setShowStageMenu] = useState<string | null>(null);

    // Form states for Create/Edit
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        treatmentArea: '',
        primaryDoctorId: '',
        primaryDoctorName: '',
        startDate: new Date().toISOString().split('T')[0],
        approxEndDate: '',
        documents: [] as { name: string; url: string; stageId?: string }[],
        stages: [{ name: 'Initial Consultation', shortDescription: '', doctorId: '', doctorName: '' }]
    });

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
        setFormData({
            title: '',
            description: '',
            treatmentArea: '',
            primaryDoctorId: '',
            primaryDoctorName: '',
            startDate: new Date().toISOString().split('T')[0],
            approxEndDate: '',
            documents: [],
            stages: [{ name: 'Initial Consultation', shortDescription: '', doctorId: '', doctorName: '' }]
        });
        setShowCreateModal(true);
    };

    const handleEditOpen = (plan: TreatmentPlan) => {
        const primDoc = plan.primaryDoctorId;
        const primDocId = typeof primDoc === 'object' && primDoc ? primDoc._id : (primDoc || '');
        const primDocName = typeof primDoc === 'object' && primDoc ? primDoc.name : '';

        setFormData({
            title: plan.title,
            description: plan.description || '',
            treatmentArea: plan.treatmentArea || '',
            primaryDoctorId: primDocId,
            primaryDoctorName: primDocName,
            startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            approxEndDate: plan.approxEndDate ? new Date(plan.approxEndDate).toISOString().split('T')[0] : '',
            documents: plan.documents?.map(doc => ({ name: doc.name, url: doc.url, stageId: doc.stageId })) || [],
            stages: (plan.stages || []).map(s => {
                const doc = s.doctorId;
                return {
                    name: s.name,
                    shortDescription: s.shortDescription || '',
                    doctorId: typeof doc === 'object' && doc ? doc._id : (doc || ''),
                    doctorName: typeof doc === 'object' && doc ? doc.name : (s.doctorName || '')
                };
            })
        });
        setEditingPlan(plan);
        setShowCreateModal(true);
    };

    const deleteStage = async (plan: TreatmentPlan, stageId: string) => {
        if (!confirm('Are you sure you want to delete this clinical stage?')) return;

        try {
            const updatedStages = plan.stages?.filter(s => s._id !== stageId) || [];

            const historyEntry = {
                action: 'STAGE_DELETED',
                userName: 'Medical Staff',
                timestamp: new Date().toISOString(),
                details: `Deleted stage: ${plan.stages?.find(s => s._id === stageId)?.name}`
            };

            const response = await fetch(`/api/treatment-plans/${plan._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stages: updatedStages,
                    history: [...(plan.history || []), historyEntry]
                })
            });

            if (response.ok) {
                fetchPlans();
                setShowStageMenu(null);
            }
        } catch (error) {
            console.error('Error deleting stage:', error);
            alert('Failed to delete stage');
        }
    };

    const savePlan = async (isEdit: boolean) => {
        const url = isEdit ? `/api/treatment-plans/${editingPlan?._id}` : '/api/treatment-plans';
        const method = isEdit ? 'PUT' : 'POST';

        if (!formData.title) {
            alert('Please enter a plan title');
            return;
        }

        const payload = {
            ...formData,
            patientId,
            status: editingPlan ? editingPlan.status : 'ACTIVE',
            history: editingPlan ? [
                ...(editingPlan.history || []),
                {
                    action: 'PLAN_UPDATED',
                    userName: 'Medical Staff',
                    timestamp: new Date().toISOString(),
                    details: 'Treatment plan details updated'
                }
            ] : [
                {
                    action: 'PLAN_CREATED',
                    userName: 'Medical Staff',
                    timestamp: new Date().toISOString(),
                    details: 'New treatment plan initiated'
                }
            ]
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowCreateModal(false);
                setEditingPlan(null);
                fetchPlans();
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to save plan'}`);
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save treatment plan');
        }
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
                <button
                    onClick={handleCreateOpen}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    New clinical Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Pill className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No clinical plans found</h3>
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
                                                onClick={() => setSelectedPlanForView(plan)}
                                                className="text-left font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                {plan.title}
                                            </button>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {plan.primaryDoctorId && (
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        {(plan.primaryDoctorId as PopulatedDoctor).name}
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
                                                            {stage.encounterId && (
                                                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center mr-2">
                                                                    <FileText className="h-3 w-3 mr-0.5" />
                                                                    ENC-{stage.encounterId.toString().slice(-4).toUpperCase()}
                                                                </span>
                                                            )}
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
                                                                <button
                                                                    onClick={() => deleteStage(plan, stage._id)}
                                                                    className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center border-t border-gray-50 mt-1"
                                                                >
                                                                    <LucideX className="h-3 w-3 mr-2" /> Delete
                                                                </button>
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

            {/* Combined Modal for Create/Edit */}
            {(showCreateModal || editingPlan) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{editingPlan ? 'Edit clinical Plan' : 'Create clinical Plan'}</h3>
                                <p className="text-xs text-gray-500 mt-1">Define procedures, assign doctors, and attach documents</p>
                            </div>
                            <button onClick={() => { setShowCreateModal(false); setEditingPlan(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                                <LucideX className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plan Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Root Canal Treatment"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Treatment Area (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Upper Left Molar"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                            value={formData.treatmentArea}
                                            onChange={(e) => setFormData({ ...formData, treatmentArea: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Doctor (In-Charge)</label>
                                        <SearchableDoctorSelect
                                            value={formData.primaryDoctorName}
                                            onChange={(doc) => setFormData({
                                                ...formData,
                                                primaryDoctorId: doc?._id || '',
                                                primaryDoctorName: doc?.name || ''
                                            })}
                                            placeholder="Assign In-Charge Doctor"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Date *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Approx. End Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                    value={formData.approxEndDate}
                                                    onChange={(e) => setFormData({ ...formData, approxEndDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Clinical Documents (Tagged by Stage)</label>
                                    <div
                                        onClick={() => {
                                            const name = prompt('Enter document name:');
                                            if (name) {
                                                const stageId = prompt('Optional: Enter Stage Index (1, 2, ...) to tag this document:') || undefined;
                                                setFormData({
                                                    ...formData,
                                                    documents: [...formData.documents, { name, url: '#', stageId: stageId ? formData.stages[parseInt(stageId) - 1]?.name : undefined }]
                                                });
                                            }
                                        }}
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-xs font-medium text-gray-500">Click to upload clinical files</span>
                                        <span className="text-[10px] text-gray-400 mt-1">X-rays, Scans, or Reports</span>
                                    </div>
                                    {formData.documents.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {formData.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium border border-blue-100">
                                                    <div className="flex items-center">
                                                        <FileText className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                                        <span>{doc.name}</span>
                                                        {doc.stageId && (
                                                            <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                                                                {doc.stageId}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const nd = [...formData.documents];
                                                            nd.splice(i, 1);
                                                            setFormData({ ...formData, documents: nd });
                                                        }}
                                                        className="text-blue-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <LucideX className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                <textarea
                                    placeholder="Enter the full goal and clinical notes for this treatment plan..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Treatment Stages & Doctor Assignments</label>
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                stages: [...formData.stages, { name: '', shortDescription: '', doctorId: '', doctorName: '' }]
                                            });
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Stage
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.stages.map((stage, idx) => (
                                        <div key={idx} className="flex flex-col space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-1 flex items-center justify-center font-bold text-gray-400">
                                                    {idx + 1}
                                                </div>
                                                <div className="col-span-10 grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Stage name (e.g. Access & Cleaning)"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        value={stage.name}
                                                        onChange={(e) => {
                                                            const newStages = [...formData.stages];
                                                            newStages[idx].name = e.target.value;
                                                            setFormData({ ...formData, stages: newStages });
                                                        }}
                                                    />
                                                    <SearchableDoctorSelect
                                                        value={stage.doctorName}
                                                        onChange={(doc) => {
                                                            const newStages = [...formData.stages];
                                                            newStages[idx].doctorId = doc?._id || '';
                                                            newStages[idx].doctorName = doc?.name || '';
                                                            setFormData({ ...formData, stages: newStages });
                                                        }}
                                                        placeholder="Assign Doctor (Optional)"
                                                        className="w-full text-xs"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            const newStages = formData.stages.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, stages: newStages });
                                                        }}
                                                        className="p-2 text-red-500 hover:text-red-600"
                                                    >
                                                        <LucideX className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="pl-10">
                                                <input
                                                    type="text"
                                                    placeholder="Short instruction for this stage (Optional)"
                                                    className="w-full px-3 py-1.5 bg-white/50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-[11px]"
                                                    value={stage.shortDescription}
                                                    onChange={(e) => {
                                                        const newStages = [...formData.stages];
                                                        newStages[idx].shortDescription = e.target.value;
                                                        setFormData({ ...formData, stages: newStages });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            {editingPlan && (
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this plan? This will also remove all its stages.')) {
                                            const res = await fetch(`/api/treatment-plans/${editingPlan._id}`, { method: 'DELETE' });
                                            if (res.ok) {
                                                setEditingPlan(null);
                                                fetchPlans();
                                            }
                                        }
                                    }}
                                    className="text-xs font-bold text-red-500 hover:underline"
                                >
                                    Delete clinical Plan
                                </button>
                            ) || <div></div>}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => { setShowCreateModal(false); setEditingPlan(null); }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => savePlan(!!editingPlan)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Treatment Plan Detail View Modal */}
            {selectedPlanForView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-600 rounded-xl">
                                    <Pill className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedPlanForView.title}</h3>
                                    <p className="text-sm text-gray-500">Plan initiated on {new Date(selectedPlanForView.startDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <button onClick={() => { setSelectedPlanForView(null); handleEditOpen(selectedPlanForView); }} className="text-xs font-bold text-blue-600 hover:underline">
                                    Edit Plan
                                </button>
                                <button onClick={() => setSelectedPlanForView(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm">
                                    <LucideX className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Left Column: Info & Stages */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-wider">Plan Description & Timeline</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {selectedPlanForView.description || "No description provided for this clinical plan."}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-4 py-3 border-t border-blue-100">
                                            <div className="flex items-center text-xs text-gray-600 font-bold">
                                                <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                                                Start: {new Date(selectedPlanForView.startDate).toLocaleDateString()}
                                            </div>
                                            {selectedPlanForView.approxEndDate && (
                                                <div className="flex items-center text-xs text-blue-600 font-bold">
                                                    <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
                                                    Target Finish: {new Date(selectedPlanForView.approxEndDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <ChevronRight className="h-5 w-5 mr-1 text-blue-600" />
                                            Clinical Stages
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedPlanForView.stages?.map((stage, idx) => (
                                                <div
                                                    key={stage._id}
                                                    onClick={() => setSelectedStageForView(stage)}
                                                    className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-gray-900">{stage.name}</h5>
                                                        <p className="text-xs text-gray-500">{stage.shortDescription || "No notes"}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.status === 'DONE' ? 'bg-green-100 text-green-700' :
                                                                stage.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {stage.status}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 mt-1">{getDoctorName(stage)}</span>
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: History & Stats */}
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                            Clinical Documents
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedPlanForView.documents?.length ? (
                                                selectedPlanForView.documents.map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-all">
                                                        <div className="flex items-center min-w-0">
                                                            <div className="p-1.5 bg-white rounded border border-gray-200 mr-3">
                                                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-bold text-gray-900 truncate">{doc.name}</span>
                                                                {doc.stageId && (
                                                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-0.5">
                                                                        Stage: {doc.stageId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                                    <p className="text-[10px] text-gray-400 italic">No documents attached.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            Audit History
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedPlanForView.history?.length ? (
                                                selectedPlanForView.history.map((entry, i) => (
                                                    <div key={i} className="relative pl-6 pb-4 last:pb-0">
                                                        {i < selectedPlanForView.history!.length - 1 && (
                                                            <div className="absolute left-1.5 top-1.5 bottom-0 w-0.5 bg-gray-200"></div>
                                                        )}
                                                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                                        <p className="text-xs font-bold text-gray-900">{entry.action.replace(/_/g, ' ')}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">By {entry.userName} • {new Date(entry.timestamp).toLocaleString()}</p>
                                                        {entry.details && <p className="text-[10px] text-gray-600 mt-1 italic">{entry.details}</p>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500 text-center italic">No history recorded.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Patient Info</h4>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Patient ID</p>
                                                <p className="text-xs text-gray-500">{patientId}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">In-Charge Doctor</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                {selectedPlanForView.primaryDoctorId ? (selectedPlanForView.primaryDoctorId as PopulatedDoctor).name : 'Unassigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage Detail View Modal */}
            {selectedStageForView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Stage: {selectedStageForView.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">Detailed activity and scheduling</p>
                            </div>
                            <button onClick={() => setSelectedStageForView(null)} className="text-gray-400 hover:text-gray-600">
                                <LucideX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                    <p className="text-sm font-bold text-gray-900 mt-1 lowercase first-letter:uppercase">{selectedStageForView.status.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Assigned Doctor</label>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{getDoctorName(selectedStageForView)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                    Linked Appointments & Encounters
                                </h4>
                                <div className="space-y-2">
                                    {selectedStageForView.appointments?.length || selectedStageForView.appointmentId ? (
                                        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                                            {/* Support both legacy single ID and new array */}
                                            {(selectedStageForView.appointments || (selectedStageForView.appointmentId ? [selectedStageForView.appointmentId] : [])).map((appId: string, i: number) => (
                                                <li key={i} className="p-3 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-700">Appointment ID: {appId.toString().slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <Link
                                                        href={`/appointments/${appId}`}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline"
                                                    >
                                                        Details
                                                    </Link>
                                                </li>
                                            ))}
                                            {(selectedStageForView.encounters || (selectedStageForView.encounterId ? [selectedStageForView.encounterId] : [])).map((encId: string, i: number) => (
                                                <li key={i + 100} className="p-3 bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="h-4 w-4 text-indigo-400" />
                                                        <span className="text-xs font-semibold text-indigo-700">Encounter (Notes): {encId.toString().slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <Link
                                                        href={`/encounters/${encId}`}
                                                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                                                    >
                                                        Read Notes
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-xs text-gray-400 font-medium">No appointments scheduled for this stage yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedStageForView(null)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
