'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Plus,
    Search,
    Filter,
    Stethoscope,
    User,
    Clock,
    ChevronRight,
    FileText
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

export default function EncountersPage() {
    const { t } = useTranslations();
    const router = useRouter();
    const [encounters, setEncounters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchEncounters = async () => {
            try {
                // Determine API endpoint based on role or fetch all
                // For now, fetching all encounters. You might want to filter by doctor later.
                const response = await fetch('/api/encounters');
                if (response.ok) {
                    const data = await response.json();
                    setEncounters(data.encounters);
                }
            } catch (error) {
                console.error('Error fetching encounters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEncounters();
    }, []);

    const filteredEncounters = encounters.filter(encounter => {
        const matchesSearch =
            encounter.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            encounter.encounterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            encounter.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || encounter.type === filterType;
        return matchesSearch && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'PLANNED': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ProtectedRoute>
            <SidebarLayout
                title="Clinical Encounters"
                description="Manage patient encounters and clinical records"
            >
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            {filteredEncounters.length} Encounters
                        </span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient, ID, or complaint..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="OPD">OPD</option>
                                    <option value="INPATIENT">Inpatient</option>
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="FOLLOW_UP">Follow Up</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Encounters List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading encounters...</p>
                        </div>
                    ) : filteredEncounters.length === 0 ? (
                        <div className="text-center py-12">
                            <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No encounters found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encounter ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEncounters.map((encounter) => (
                                        <tr key={encounter._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                <Link href={`/encounters/${encounter._id}`} className="hover:underline">
                                                    {encounter.encounterId || 'No ID'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{encounter.patientName}</div>
                                                        <div className="text-xs text-gray-500">{encounter.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{new Date(encounter.createdAt).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(encounter.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {encounter.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {encounter.doctorName || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(encounter.status)}`}>
                                                    {encounter.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/encounters/${encounter._id}`}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                >
                                                    View <ChevronRight className="h-4 w-4 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </SidebarLayout>
        </ProtectedRoute>
    );
}
