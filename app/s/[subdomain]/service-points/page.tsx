import { getTenantBySubdomain, getTenantServicePointDefs, getParentServicePoints, getParentEnrollments, getUserProfile } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ServicePointsClient from './components/ServicePointsClient';

export default async function ServicePointsPublicPage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await getUserProfile(tenant.id);
    if (!profile) redirect('/dashboard');

    const [definitions, totalPoints, enrollments] = await Promise.all([
        getTenantServicePointDefs(tenant.id),
        getParentServicePoints(tenant.id, profile.id),
        getParentEnrollments(tenant.id, profile.id)
    ]);

    // Points to Cents conversion rate (e.g. 1 point = $5.00)
    const pointsRate = 500;

    return (
        <ServicePointsClient
            tenantId={tenant.id}
            parentId={profile.id}
            definitions={definitions}
            totalPoints={totalPoints}
            enrollments={enrollments}
            pointsRate={pointsRate}
        />
    );
}
