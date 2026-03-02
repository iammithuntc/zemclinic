import { Metadata } from 'next';
import StaffClient from './StaffClient';

export const metadata: Metadata = {
  title: 'Staff Management',
};

export default function StaffPage() {
  return <StaffClient />;
}
