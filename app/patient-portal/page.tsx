'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from '../hooks/useTranslations';
import { 
  Calendar,
  FileText,
  Pill,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  Heart,
  Stethoscope,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  upcomingAppointments: number;
  totalReports: number;
  activePrescriptions: number;
  pendingResults: number;
}

interface Appointment {
  _id: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: string;
}

interface Report {
  _id: string;
  reportType: string;
  reportDate: string;
  status: string;
  doctorName: string;
}

export default function PatientPortalDashboard() {
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalReports: 0,
    activePrescriptions: 0,
    pendingResults: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.email) return;
      
      try {
        // Fetch appointments
        const appointmentsRes = await fetch(`/api/patient-portal/appointments`);
        const appointmentsData = await appointmentsRes.json();
        
        // Fetch reports
        const reportsRes = await fetch(`/api/patient-portal/reports`);
        const reportsData = await reportsRes.json();

        const appointments = appointmentsData.appointments || [];
        const reports = reportsData.reports || [];

        // Calculate stats
        const now = new Date();
        const upcomingAppointments = appointments.filter((apt: Appointment) => 
          new Date(apt.appointmentDate) >= now && apt.status !== 'cancelled'
        ).length;

        const pendingResults = reports.filter((r: Report) => 
          r.status === 'pending' || r.status === 'in-progress'
        ).length;

        setStats({
          upcomingAppointments,
          totalReports: reports.length,
          activePrescriptions: reports.filter((r: Report) => r.reportType === 'treatment').length,
          pendingResults
        });

        // Get recent items
        setRecentAppointments(appointments.slice(0, 3));
        setRecentReports(reports.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'reviewed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-500';
      case 'follow-up': case 'followUp': return 'bg-purple-500';
      case 'checkup': return 'bg-green-500';
      case 'emergency': return 'bg-red-500';
      case 'surgery': return 'bg-orange-500';
      case 'therapy': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {t('patientPortal.dashboard.welcome')}, {session?.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-teal-100">
              {t('patientPortal.dashboard.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <Heart className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/patient-portal/appointments" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('patientPortal.dashboard.upcomingAppointments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link href="/patient-portal/reports" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('patientPortal.dashboard.medicalReports')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReports}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Link>

        <Link href="/patient-portal/prescriptions" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('patientPortal.dashboard.prescriptions')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activePrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('patientPortal.dashboard.pendingResults')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingResults}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              {t('patientPortal.dashboard.recentAppointments')}
            </h2>
            <Link href="/patient-portal/appointments" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              {t('patientPortal.dashboard.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-4">
            {recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div key={apt._id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-2 h-12 rounded-full ${getAppointmentTypeColor(apt.appointmentType)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{apt.doctorName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(apt.appointmentDate)} at {apt.appointmentTime}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>{t('patientPortal.dashboard.noAppointments')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              {t('patientPortal.dashboard.recentReports')}
            </h2>
            <Link href="/patient-portal/reports" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              {t('patientPortal.dashboard.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-4">
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link 
                    key={report._id} 
                    href={`/patient-portal/reports/${report._id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 capitalize truncate">{report.reportType} Report</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(report.reportDate)} • {report.doctorName}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>{t('patientPortal.dashboard.noReports')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
        <h3 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('patientPortal.dashboard.healthTip')}
        </h3>
        <p className="text-teal-700">
          {t('patientPortal.dashboard.healthTipContent')}
        </p>
      </div>
    </div>
  );
}
