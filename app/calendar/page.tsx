import { Metadata } from 'next';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
  title: 'Appointment Calendar',
};

export default function CalendarPage() {
  return <CalendarClient />;
}
