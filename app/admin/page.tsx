import type { Metadata } from 'next';
import { AdminDashboard } from './dashboard';

export const metadata: Metadata = {
  title: 'Platform Admin | Throster',
  description: 'Throster platform administration',
};

export default async function AdminPage() {
  // TODO: Add platform admin auth check (super-admin role)
  // TODO: Query actual stats from the database

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  );
}
