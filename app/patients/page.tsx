import { Metadata } from 'next';
import PatientsClient from './PatientsClient';

export const metadata: Metadata = {
  title: 'Patient Management',
};

export default function PatientsPage() {
  return <PatientsClient />;
}
