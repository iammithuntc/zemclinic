'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check, X, Printer, Loader2 } from 'lucide-react';

interface EncounterData {
    _id: string;
    encounterId: string;
    patientId: string;
    patient: {
        name: string;
        gender: string;
        dateOfBirth: string;
    };
    type: string;
    status: string;
    chiefComplaint: string;
    history: string;
    examination: string;
    diagnosis: string;
    treatmentPlan: string;
    notes: string;
}

interface EncounterFormProps {
    initialData: EncounterData;
}

export default function EncounterForm({ initialData }: EncounterFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear success/error messages on change
        if (success) setSuccess('');
        if (error) setError('');
    };

    const handleSave = async (complete: boolean = false) => {
        if (complete) setCompleting(true);
        else setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...formData,
                status: complete ? 'COMPLETED' : formData.status
            };

            const response = await fetch(`/api/encounters/${initialData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update encounter');
            }

            setSuccess(complete ? 'Encounter completed successfully!' : 'Changes saved successfully.');

            if (complete) {
                // Update local state to show completed status immediately
                setFormData(prev => ({ ...prev, status: 'COMPLETED' }));
            }

            router.refresh();
        } catch (err: any) {
            console.error('Error saving encounter:', err);
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setSaving(false);
            setCompleting(false);
        }
    };

    const isReadOnly = formData.status === 'COMPLETED' || formData.status === 'CLOSED';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Toolbar */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${formData.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            formData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {formData.status.replace('_', ' ')}
                    </span>
                    {success && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="h-4 w-4" /> {success}</span>}
                    {error && <span className="text-sm text-red-600 flex items-center gap-1"><X className="h-4 w-4" /> {error}</span>}
                </div>
                <div className="flex items-center gap-2">
                    {!isReadOnly && (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving || completing}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving || completing}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {completing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                                Finalize Encounter
                            </button>
                        </>
                    )}
                    <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chief Complaint <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="chiefComplaint"
                            value={formData.chiefComplaint || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 text-lg"
                            placeholder="e.g. Fever and headache for 3 days"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            History of Present Illness
                        </label>
                        <textarea
                            name="history"
                            rows={4}
                            value={formData.history || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Patient history details..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Physical Examination
                        </label>
                        <textarea
                            name="examination"
                            rows={4}
                            value={formData.examination || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Examination findings..."
                        />
                    </div>

                    <div className="col-span-2 border-t border-gray-100 pt-6"></div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diagnosis
                        </label>
                        <textarea
                            name="diagnosis"
                            rows={3}
                            value={formData.diagnosis || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Provisional or final diagnosis..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Treatment Plan
                        </label>
                        <textarea
                            name="treatmentPlan"
                            rows={3}
                            value={formData.treatmentPlan || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Plan of care..."
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Clinical Notes
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Any other relevant observations..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
