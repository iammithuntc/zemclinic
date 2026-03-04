'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Save,
    Plus,
    X,
    Upload,
    DollarSign,
    Clock,
    Calendar,
    ArrowLeft,
    Loader2,
    FileText
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    _id?: string;
    name: string;
    shortDescription?: string;
    doctorId?: string | PopulatedDoctor;
    doctorName?: string;
    stageType?: string;
    budget?: number;
    status?: string;
}

interface TreatmentPlanFormProps {
    patientId: string;
    initialData?: any;
    isEdit?: boolean;
}

export default function TreatmentPlanForm({ patientId, initialData, isEdit = false }: TreatmentPlanFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const { data: session } = useSession();
    const { settings } = useSettings();
    const currencySymbol = settings?.currency === 'INR' ? '₹' : (settings?.currency === 'USD' ? '$' : settings?.currency || '$');

    const [loading, setLoading] = useState(false);
    const [fetchingTemplate, setFetchingTemplate] = useState(false);
    const [stageTypes, setStageTypes] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        treatmentArea: initialData?.treatmentArea || '',
        primaryDoctorId: typeof initialData?.primaryDoctorId === 'object' ? initialData.primaryDoctorId._id : (initialData?.primaryDoctorId || ''),
        primaryDoctorName: typeof initialData?.primaryDoctorId === 'object' ? initialData.primaryDoctorId.name : '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        approxDuration: initialData?.approxDuration || 0,
        approxEndDate: initialData?.approxEndDate ? new Date(initialData.approxEndDate).toISOString().split('T')[0] : '',
        totalBudget: initialData?.totalBudget || 0,
        notes: initialData?.notes || '',
        documents: initialData?.documents?.map((doc: any) => ({ name: doc.name, url: doc.url, stageId: doc.stageId })) || [] as { name: string; url: string; stageId?: string }[],
        stages: initialData?.stages?.map((s: any) => ({
            _id: s._id,
            name: s.name,
            shortDescription: s.shortDescription || '',
            doctorId: s.doctorId ? (typeof s.doctorId === 'object' ? s.doctorId._id : s.doctorId) : '',
            doctorName: s.doctorId ? (typeof s.doctorId === 'object' ? s.doctorId.name : s.doctorName) : '',
            stageType: s.stageType || '',
            budget: s.budget || 0,
            status: s.status || 'NOT_STARTED'
        })) || [{ name: 'Initial Consultation', shortDescription: '', doctorId: '', doctorName: '', stageType: '', budget: 0, status: 'NOT_STARTED' }]
    });

    // Load template if templateId is provided
    useEffect(() => {
        const loadTemplate = async () => {
            if (!templateId || isEdit) return;

            setFetchingTemplate(true);
            try {
                const res = await fetch('/api/treatment-plan-templates');
                if (res.ok) {
                    const data = await res.json();
                    const template = data.templates.find((t: any) => t._id === templateId);
                    if (template) {
                        setFormData(prev => ({
                            ...prev,
                            title: template.name,
                            description: template.description || '',
                            treatmentArea: template.treatmentArea || '',
                            startDate: new Date().toISOString().split('T')[0], // Always today for templates
                            stages: template.stages.map((s: { name: string; shortDescription?: string; budget?: number; approxDuration?: number }) => ({
                                name: s.name,
                                shortDescription: s.shortDescription || '',
                                budget: s.budget || 0,
                                approxDuration: s.approxDuration || 0,
                                doctorId: '',
                                doctorName: '',
                                status: 'NOT_STARTED'
                            }))
                        }));
                    }
                }
            } catch (error) {
                console.error('Error loading template:', error);
            } finally {
                setFetchingTemplate(false);
            }
        };

        loadTemplate();
    }, [templateId, isEdit]);

    // Fetch Stage Types for dropdown
    useEffect(() => {
        const fetchStageTypes = async () => {
            try {
                const res = await fetch('/api/stage-types');
                if (res.ok) {
                    const data = await res.json();
                    setStageTypes(data);
                }
            } catch (error) {
                console.error('Error fetching stage types:', error);
            }
        };
        fetchStageTypes();
    }, []);

    // Automated calculations
    useEffect(() => {
        if (formData.startDate && formData.approxDuration >= 0) {
            const start = new Date(formData.startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + formData.approxDuration);
            const endStr = end.toISOString().split('T')[0];
            if (endStr !== formData.approxEndDate) {
                setFormData(prev => ({ ...prev, approxEndDate: endStr }));
            }
        }

        const total = formData.stages.reduce((sum: number, stage: { budget?: number }) => sum + (Number(stage.budget) || 0), 0);
        if (total !== formData.totalBudget) {
            setFormData(prev => ({ ...prev, totalBudget: total }));
        }
    }, [formData.startDate, formData.approxDuration, formData.stages]);

    const handleSaveTemplate = async () => {
        if (!formData.title) return alert('Enter a template name (Plan Title)');
        if (!confirm('Save this workflow as a template for future use?')) return;

        setLoading(true);
        try {
            const payload = {
                name: formData.title,
                description: formData.description,
                treatmentArea: formData.treatmentArea,
                stages: formData.stages.map((s: { name: string; shortDescription?: string; budget?: number }) => ({
                    name: s.name,
                    shortDescription: s.shortDescription,
                    budget: s.budget,
                    approxDuration: 0 // Default
                }))
            };

            const res = await fetch('/api/treatment-plan-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Template saved successfully!');
            } else {
                alert('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('Please enter a plan title');
            return;
        }

        setLoading(true);
        const url = isEdit ? `/api/treatment-plans/${initialData._id}` : '/api/treatment-plans';
        const method = isEdit ? 'PUT' : 'POST';

        // Prepare payload - DO NOT send history array to avoid Mongoose conflict
        // Instead, send a single historyEntry that the backend will push
        const payload = {
            ...formData,
            patientId,
            primaryDoctorId: formData.primaryDoctorId || null,
            notes: formData.notes,
            stages: formData.stages.map((s: any) => ({
                ...s,
                doctorId: s.doctorId || null
            })),
            status: initialData?.status || 'ACTIVE',
            historyEntry: {
                action: isEdit ? 'PLAN_UPDATED_V12' : 'PLAN_CREATED',
                details: isEdit ? 'Plan details updated via dedicated page' : `New treatment plan "${formData.title}" initiated`
            }
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                router.push(`/patients/${patientId}?tab=treatment-plan`);
                router.refresh();
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to save plan'}`);
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save treatment plan');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newDocs = Array.from(files).map(file => ({
            name: file.name,
            url: URL.createObjectURL(file), // Mock URL for demo
            uploadedAt: new Date().toISOString(),
            stageId: ''
        }));

        setFormData({ ...formData, documents: [...formData.documents, ...newDocs] });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isAuthorizedForBudget = () => {
        if (!session?.user) return false;
        if (session.user.role === 'admin') return true;
        return formData.primaryDoctorId === session.user.id;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Treatment Plan' : 'Create Treatment Plan'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Define procedures, assign doctors, and attach documents</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </button>
            </div>

            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plan Title *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Full Mouth Rehabilitation"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Treatment Area (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Upper Left Quadrant"
                                    value={formData.treatmentArea}
                                    onChange={(e) => setFormData({ ...formData, treatmentArea: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">In-Charge Doctor</label>
                                <SearchableDoctorSelect
                                    value={formData.primaryDoctorName}
                                    onChange={(doc) => setFormData({
                                        ...formData,
                                        primaryDoctorId: doc?._id || '',
                                        primaryDoctorName: doc?.name || ''
                                    })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" /> Start Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.approxDuration}
                                    onChange={(e) => setFormData({ ...formData, approxDuration: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" /> Approx. End
                                </label>
                                <input
                                    type="date"
                                    readOnly
                                    className="w-full px-3 py-2 bg-blue-100/50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium cursor-not-allowed"
                                    value={formData.approxEndDate}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plan Description (Patient-Facing)</label>
                            <textarea
                                placeholder="General description of the treatment goal..."
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                                <FileText className="h-3 w-3 mr-1.5 text-blue-500" />
                                Internal Clinical Notes
                            </label>
                            <textarea
                                placeholder="Confidential clinical considerations and technical details..."
                                rows={4}
                                className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Right Column: Financials & Documents */}
                    <div className="space-y-6">
                        {isAuthorizedForBudget() && (
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform font-black text-6xl text-emerald-600 select-none">
                                    {currencySymbol}
                                </div>
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Estimated Total Budget</span>
                                <div className="text-4xl font-black text-emerald-800 mt-2 flex items-baseline">
                                    <span className="text-2xl mr-1">{currencySymbol}</span>
                                    {formData.totalBudget.toLocaleString()}
                                </div>
                                <p className="text-[10px] text-emerald-600 mt-2 font-medium italic">* Auto-calculated from stage budgets</p>
                            </div>
                        )}

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase flex items-center">
                                <Upload className="h-3 w-3 mr-1.5" /> Documents
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all"
                            >
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-600">Choose Files</span>
                                <span className="text-[10px] text-gray-400 mt-1 text-center">Click to browse explorer</span>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {formData.documents.map((doc: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center min-w-0">
                                                <FileText className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
                                                <span className="text-[11px] font-bold text-gray-700 truncate">{doc.name}</span>
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, documents: formData.documents.filter((_: any, i: number) => i !== idx) })}
                                                className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex-shrink-0">Tag To:</span>
                                            <select
                                                className="flex-1 bg-gray-50 border-none text-[10px] font-bold text-blue-600 rounded-lg py-1 px-2 outline-none focus:ring-1 focus:ring-blue-200"
                                                value={doc.stageId || ''}
                                                onChange={(e) => {
                                                    const ns = [...formData.documents];
                                                    ns[idx].stageId = e.target.value;
                                                    setFormData({ ...formData, documents: ns });
                                                }}
                                            >
                                                <option value="">No Specific Stage</option>
                                                <optgroup label="Treatment Stages">
                                                    {formData.stages.filter((s: any) => s.name).map((s: any, i: number) => (
                                                        <option key={i} value={s._id || i}>{s.name || `Stage ${i + 1}`}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Stage Types">
                                                    {stageTypes.map((st, i) => (
                                                        <option key={i} value={st.name}>{st.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {formData.documents.length > 1 && (
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Bulk Tagging</p>
                                    <select
                                        className="w-full bg-indigo-50 border-none text-[10px] font-black text-indigo-600 rounded-lg py-1.5 px-3 outline-none focus:ring-1 focus:ring-indigo-200"
                                        onChange={(e) => {
                                            if (!e.target.value) return;
                                            const ns = formData.documents.map((d: any) => ({ ...d, stageId: e.target.value }));
                                            setFormData({ ...formData, documents: ns });
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">Apply selection to all...</option>
                                        <optgroup label="Apply Stage Tag">
                                            {formData.stages.filter((s: any) => s.name).map((s: any, i: number) => (
                                                <option key={i} value={s._id || i}>{s.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Treatment Stages Section */}
                <div className="pt-8 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-bold text-gray-900">Treatment Stages</h2>
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {formData.stages.length} Steps
                            </span>
                        </div>
                        <button
                            onClick={() => setFormData({ ...formData, stages: [...formData.stages, { name: '', shortDescription: '', doctorId: '', doctorName: '', stageType: '', budget: 0, status: 'NOT_STARTED' }] })}
                            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Stage
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.stages.map((stage: PlanStage, idx: number) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                                <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex items-center space-x-3 flex-1 w-full">
                                        <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center font-black text-gray-400 text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-blue-200 outline-none transition-all"
                                                placeholder="Enter stage procedure name..."
                                                value={stage.name}
                                                onChange={(e) => { const ns = [...formData.stages]; ns[idx].name = e.target.value; setFormData({ ...formData, stages: ns }); }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 w-full md:w-auto">
                                        {isAuthorizedForBudget() && (
                                            <div className="relative w-full md:w-32">
                                                <div className="absolute left-2.5 top-2.5 text-emerald-500 font-bold text-sm">{currencySymbol}</div>
                                                <input
                                                    type="number"
                                                    className="w-full pl-7 pr-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                                    value={stage.budget}
                                                    onChange={(e) => { const ns = [...formData.stages]; ns[idx].budget = parseInt(e.target.value) || 0; setFormData({ ...formData, stages: ns }); }}
                                                />
                                            </div>
                                        )}
                                        <div className="w-full md:w-32">
                                            <select
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black focus:bg-white focus:border-blue-200 outline-none transition-all"
                                                value={stage.status || 'NOT_STARTED'}
                                                onChange={(e) => {
                                                    const ns = [...formData.stages];
                                                    ns[idx].status = e.target.value;
                                                    setFormData({ ...formData, stages: ns });
                                                }}
                                            >
                                                <optgroup label="Default">
                                                    <option value="NOT_STARTED">NOT STARTED</option>
                                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                                    <option value="COMPLETED">COMPLETED</option>
                                                </optgroup>
                                                {settings?.customStageStatuses && settings.customStageStatuses.length > 0 && (
                                                    <optgroup label="Custom">
                                                        {settings.customStageStatuses.map((s, i) => (
                                                            <option key={i} value={s}>{s}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        </div>
                                        <div className="w-full md:w-32">
                                            <select
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black focus:bg-white focus:border-blue-200 outline-none transition-all"
                                                value={stage.stageType || ''}
                                                onChange={(e) => {
                                                    const ns = [...formData.stages];
                                                    ns[idx].stageType = e.target.value;
                                                    setFormData({ ...formData, stages: ns });
                                                }}
                                            >
                                                <option value="">Stage Type</option>
                                                {stageTypes.map((st) => (
                                                    <option key={st._id} value={st.name}>{st.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full md:w-56">
                                            <SearchableDoctorSelect
                                                value={stage.doctorName || ''}
                                                onChange={(doc) => {
                                                    const ns = [...formData.stages];
                                                    ns[idx].doctorId = doc?._id || '';
                                                    ns[idx].doctorName = doc?.name || '';
                                                    setFormData({ ...formData, stages: ns });
                                                }}
                                                className="text-xs"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, stages: formData.stages.filter((_: any, i: number) => i !== idx) })}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="px-14 pb-4">
                                    <input
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs italic text-gray-500 outline-none focus:bg-white transition-all"
                                        placeholder="Add short instructions or details for this stage (Optional)"
                                        value={stage.shortDescription}
                                        onChange={(e) => { const ns = [...formData.stages]; ns[idx].shortDescription = e.target.value; setFormData({ ...formData, stages: ns }); }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 border-t border-gray-100 flex justify-end items-center space-x-4">
                    <button
                        disabled={loading}
                        onClick={() => router.back()}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    {session?.user.role === 'admin' && !isEdit && (
                        <button
                            type="button"
                            disabled={loading || !formData.title}
                            onClick={handleSaveTemplate}
                            className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            Save as Template
                        </button>
                    )}
                    <button
                        disabled={loading}
                        onClick={handleSave}
                        className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isEdit ? 'Update Treatment Plan' : 'Initiate Treatment Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
