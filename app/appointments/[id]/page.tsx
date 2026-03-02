'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Pill
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function AppointmentViewPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
  const [planStage, setPlanStage] = useState<any>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setAppointment(data);

          // Fetch Treatment Plan if linked
          if (data.planId) {
            const planRes = await fetch(`/api/treatment-plans/${data.planId}`);
            if (planRes.ok) {
              const planData = await planRes.json();
              setTreatmentPlan(planData.plan);
              if (data.planStageId && planData.stages) {
                setPlanStage(planData.stages.find((s: any) => s._id === data.planStageId));
              }
            }
          }
        } else {
          setError('Appointment not found');
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to fetch appointment data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout
          title="Appointment Details"
          description="View appointment information"
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !appointment) {
    return (
      <ProtectedRoute>
        <SidebarLayout
          title="Appointment Not Found"
          description="The requested appointment could not be found"
        >
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Appointment not found</h3>
            <p className="mt-1 text-sm text-gray-700">
              The appointment you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <Link
                href="/appointments"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Appointments</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout
        title="Appointment Details"
        description="View and manage appointment information"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/appointments"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Appointment: {appointment.patientName}
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/appointments/${appointment._id}/start-encounter`, {
                        method: 'POST',
                      });
                      if (response.ok) {
                        const encounter = await response.json();
                        router.push(`/encounters/${encounter._id}`);
                      } else {
                        const errorData = await response.json();
                        console.error('Failed to start encounter:', errorData);
                        alert(`Failed to start encounter: ${errorData.error || 'Unknown error'}`);
                      }
                    } catch (error) {
                      console.error('Error starting encounter:', error);
                    }
                  }}
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>{appointment.encounterId ? 'View Encounter' : 'Start Encounter'}</span>
                </button>
                <Link
                  href={`/appointments/${appointment._id}/edit`}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <Link
                  href={`/appointments/${appointment._id}/reschedule`}
                  className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  <span>Reschedule</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Patient Name</p>
                      <p className="text-sm text-gray-900">{appointment.patientName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Patient ID</p>
                      <p className="text-sm text-gray-900 font-mono">{appointment.patientId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Doctor</p>
                      <p className="text-sm text-gray-900">{appointment.doctorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time</p>
                      <p className="text-sm text-gray-900">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-sm text-gray-900 capitalize">{appointment.appointmentType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{appointment.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{appointment.patientEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{appointment.patientPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms and Diagnosis */}
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Symptoms</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {appointment.symptoms.map((symptom: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis and Treatment */}
          {appointment.diagnosis && (
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Diagnosis & Treatment</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                  <p className="text-sm text-gray-900">{appointment.diagnosis}</p>
                </div>
                {appointment.treatment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Treatment</p>
                    <p className="text-sm text-gray-900">{appointment.treatment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Treatment Plan Context */}
          {treatmentPlan && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-200 bg-blue-100/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-blue-900">Linked clinical Plan</h2>
                </div>
                <Link
                  href={`/patients/${appointment.patientId}?tab=treatment-plan`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View Plan <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                </Link>
              </div>
              <div className="p-6 bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-md font-bold text-gray-900">{treatmentPlan.title}</h3>
                    {treatmentPlan.toothNumber && (
                      <p className="text-xs text-gray-500 mt-0.5">Tooth #{treatmentPlan.toothNumber}</p>
                    )}
                    {planStage && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Current Stage:</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                          {planStage.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-400 uppercase">Plan Status</div>
                      <div className={`text-sm font-bold ${treatmentPlan.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                        {treatmentPlan.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-900">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
