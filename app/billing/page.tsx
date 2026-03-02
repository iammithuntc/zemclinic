import { Metadata } from 'next';
import BillingClient from './BillingClient';

export const metadata: Metadata = {
  title: 'Billing & Invoices',
};

export default function BillingPage() {
  return <BillingClient />;
}
