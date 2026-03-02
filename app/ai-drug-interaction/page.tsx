import { Metadata } from 'next';
import AIDrugInteractionClient from './AIDrugInteractionClient';

export const metadata: Metadata = {
  title: 'AI Drug Interaction Checker',
};

export default function AIDrugInteractionPage() {
  return <AIDrugInteractionClient />;
}
