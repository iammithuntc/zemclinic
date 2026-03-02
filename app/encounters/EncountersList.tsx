'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Calendar,
    User,
    ArrowRight,
    Clock,
    Activity
} from 'lucide-react';

interface Encounter {
    _id: string;
    encounterId: string;
    patientId: string;
    type: string;
    status: string;
    createdAt: string;
    doctorName?: string;
    doctorId?: {
        _id: string;
        name: string;
        specialization?: string;
    };
    appointmentId?: {
        appointmentDate: string;
    };
    chiefComplaint?: string;
}

interface EncountersListProps {
    patientId: string; // This is the string ID (e.g., PAT-123)
}

export default function EncountersList({ patientId }: EncountersListProps) {
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEncounters = async () => {
            try {
                const response = await fetch(`/api/patients/${patientId}/encounters`);
                if (response.ok) {
                    const data = await response.json();
                    setEncounters(data);
                } else {
                    setError('Failed to load encounters');
                }
            } catch (err) {
                console.error('Error fetching encounters:', err);
                setError('An error occurred while loading encounters');
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchEncounters();
        }
    }, [patientId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    if (encounters.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No encounters found</h3>
                <p className="text-gray-500 mt-1">This patient hasn't had any clinical encounters yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {encounters.map((encounter) => (
                <div
                    key={encounter._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${encounter.type === 'OPD' ? 'bg-blue-100 text-blue-800' :
                                        encounter.type === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {encounter.type}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border
                  ${encounter.status === 'COMPLETED' ? 'border-green-200 text-green-700 bg-green-50' :
                                        encounter.status === 'IN_PROGRESS' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                            'border-gray-200 text-gray-600'}`}>
                                    {encounter.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-400">#{encounter.encounterId}</span>
                            </div>

                            <h4 className="font-medium text-gray-900 mb-1">
                                {encounter.chiefComplaint || 'No chief complaint recorded'}
                            </h4>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(encounter.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(encounter.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {encounter.doctorId?.name || encounter.doctorName || 'Dr. Unknown'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Link
                                href={`/encounters/${encounter._id}`}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            >
                                View Details
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
