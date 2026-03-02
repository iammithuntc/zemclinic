import { Metadata } from 'next';
import DoctorsClient from './DoctorsClient';

export const metadata: Metadata = {
  title: 'Doctors Management',
};

export default function DoctorsPage() {
  return <DoctorsClient />;
}
