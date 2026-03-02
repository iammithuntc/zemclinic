import { Metadata } from 'next';
import AppointmentsClient from './AppointmentsClient';

export const metadata: Metadata = {
  title: 'Appointment Management',
};

export default function AppointmentsPage() {
  return <AppointmentsClient />;
}
