'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Leaf, Heart } from 'lucide-react';

/**
 * Placeholder admin dashboard.
 * This will be replaced with a full tenant management dashboard
 * in Phase 4 (admin experience), showing:
 * - Total tenants, active subscriptions, trial status
 * - Recent signups
 * - Revenue overview
 */

type DashboardStats = {
  totalTenants: number;
  activeTrials: number;
  activeSubscriptions: number;
};

export function AdminDashboard({ stats }: { stats?: DashboardStats }) {
  const displayStats = stats || {
    totalTenants: 0,
    activeTrials: 0,
    activeSubscriptions: 0,
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Platform Admin</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Schools
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalTenants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trials
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.activeTrials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Full admin dashboard with tenant management, revenue reports, and
            system health monitoring coming in Phase 4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
