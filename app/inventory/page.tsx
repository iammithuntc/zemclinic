import { Metadata } from 'next';
import InventoryClient from './InventoryClient';

export const metadata: Metadata = {
  title: 'Inventory Management',
};

export default function InventoryPage() {
  return <InventoryClient />;
}
