import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Patient from '../../../models/Patient';
import Appointment from '../../../models/Appointment';
import Report from '../../../models/Report';
import dbConnect from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get last month's date range for percentage calculations
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), lastMonth.getDate());
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch all stats in parallel
    const [
      totalPatients,
      patientsLastMonth,
      appointmentsToday,
      appointmentsLastMonth,
      totalReports,
      reportsLastMonth,
      recentAppointments,
      recentPatients,
      recentReports
    ] = await Promise.all([
      // Total patients
      Patient.countDocuments(),

      // Patients from last month
      Patient.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      }),

      // Appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lt: endOfToday },
        status: { $ne: 'cancelled' }
      }),

      // Appointments last month
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        status: { $ne: 'cancelled' }
      }),

      // Total reports
      Report.countDocuments(),

      // Reports from last month
      Report.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      }),

      // Recent appointments (get more to ensure we have enough for top 10)
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id patientName doctorName appointmentDate appointmentTime status createdAt'),

      // Recent patients (get more to ensure we have enough for top 10)
      Patient.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('name createdAt'),

      // Recent reports (get more to ensure we have enough for top 10)
      Report.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id patientName doctorName reportType status createdAt')
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${Math.round(change)}%`;
    };

    // Build stats array
    const stats = [
      {
        name: 'totalPatients',
        value: totalPatients.toString(),
        change: calculateChange(totalPatients, patientsLastMonth),
        changeType: totalPatients >= patientsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'appointmentsToday',
        value: appointmentsToday.toString(),
        change: calculateChange(appointmentsToday, appointmentsLastMonth),
        changeType: appointmentsToday >= appointmentsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'reportsGenerated',
        value: totalReports.toString(),
        change: calculateChange(totalReports, reportsLastMonth),
        changeType: totalReports >= reportsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'aiInsights',
        value: '0', // TODO: Implement AI insights tracking
        change: '+0%',
        changeType: 'neutral'
      }
    ];

    // Build recent activities
    const recentActivities = [];

    // Add recent appointments
    recentAppointments.forEach(appointment => {
      recentActivities.push({
        id: appointment._id.toString(),
        type: 'appointment',
        title: `Appointment scheduled: ${appointment.patientName}`,
        description: `${appointment.doctorName} - ${appointment.appointmentTime}`,
        time: formatTimeAgo(appointment.createdAt),
        createdAt: appointment.createdAt,
        status: appointment.status
      });
    });

    // Add recent patients
    recentPatients.forEach(patient => {
      recentActivities.push({
        id: `patient-${patient._id}`,
        type: 'patient',
        title: 'New patient registered',
        description: patient.name,
        time: formatTimeAgo(patient.createdAt),
        createdAt: patient.createdAt,
        status: 'completed'
      });
    });

    // Add recent reports
    recentReports.forEach(report => {
      recentActivities.push({
        id: report._id.toString(),
        type: 'report',
        title: 'Report generated',
        description: `${report.patientName} - ${report.reportType}`,
        time: formatTimeAgo(report.createdAt),
        createdAt: report.createdAt,
        status: report.status
      });
    });

    // Sort activities by createdAt date (most recent first) and limit to 5
    recentActivities.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    }).slice(0, 5);

    // Get upcoming appointments (today and future dates)
    // Reuse startOfToday that was already defined above
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfToday },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(4)
    .select('_id patientName appointmentTime appointmentType status appointmentDate');
    
    console.log('Upcoming appointments found:', upcomingAppointments.length);

    const formattedUpcomingAppointments = upcomingAppointments.map(appointment => ({
      id: appointment._id.toString(),
      patient: appointment.patientName || 'Unknown Patient',
      time: appointment.appointmentTime || 'N/A',
      type: appointment.appointmentType || 'consultation',
      status: appointment.status === 'confirmed' ? 'confirmed' : 'pending'
    }));
    
    console.log('Formatted upcoming appointments:', formattedUpcomingAppointments);

    return NextResponse.json({
      stats,
      recentActivities,
      upcomingAppointments: formattedUpcomingAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInHours > 0) {
    return `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}
