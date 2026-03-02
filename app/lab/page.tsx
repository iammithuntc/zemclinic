import { Metadata } from 'next';
import LabClient from './LabClient';

export const metadata: Metadata = {
  title: 'Laboratory Management',
};

export default function LabPage() {
  return <LabClient />;
}
