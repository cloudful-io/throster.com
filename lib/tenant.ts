import { createClient } from "@/utils/supabase/server";

export type TenantContext = {
    id: string;
    name: string;
    subdomain: string;
    planKey: string;
    planFeatures: Record<string, boolean> | null;
    trialEndsAt: string | null;
    isActive: boolean;
    settings: Record<string, any> | null;
};

export type AcademicYearContext = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

export type EnrollmentReportItem = {
    id: string;
    studentName: string;
    className: string;
    status: string;
    enrolledAt: string;
};

export type FinancialReportItem = {
    id: string;
    type: 'registration' | 'activity' | 'donation';
    amountCents: number;
    status: string;
    date: string;
    description: string;
};

export type ServicePointReportItem = {
    id: string;
    participantName: string;
    role: string;
    pointsEarned: number;
    pointsApplied: number;
    netBalance: number;
};

export type TenantKPIs = {
    totalStudents: number;
    activeEnrollments: number;
    pendingPayments: number;
    totalRevenueCents: number;
    activityParticipation: number;
    servicePointEngagement: number; // % of parents participating
};

export type SchoolClassContext = {
    id: string;
    name: string;
    description: string | null;
    teacherId: string | null;
    teacherName?: string;
    maxStudents: number | null;
    schedule: any | null;
    feeCents: number;
    enrollmentCount?: number;
};

export type UserContext = {
    id: string;          // UserProfile.id
    authUserId: string;
    tenantId: string;
    role: string;
    firstName: string;
    lastName: string;
};

/**
 * Resolve a tenant from its subdomain.
 * This is used by middleware and server components to load tenant context.
 * Does NOT require authentication — used for public tenant pages too.
 */
export async function getTenantBySubdomain(
    subdomain: string
): Promise<TenantContext | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tenants")
        .select(`
      id,
      name,
      subdomain,
      trial_ends_at,
      is_active,
      settings,
      plan:plans ( key, features )
    `)
        .eq("subdomain", subdomain.toLowerCase())
        .maybeSingle();

    if (error) {
        console.error(`Error resolving tenant for subdomain "${subdomain}":`, error);
        return null;
    }

    if (!data) {
        console.warn(`No tenant found for subdomain "${subdomain}" (or visibility blocked by RLS)`);
        return null;
    }

    console.log(`Successfully resolved tenant for subdomain "${subdomain}":`, data.id);

    const plan = (data as any).plan;

    return {
        id: data.id,
        name: data.name,
        subdomain: data.subdomain,
        planKey: plan?.key ?? "seed",
        planFeatures: plan?.features ?? null,
        trialEndsAt: data.trial_ends_at,
        isActive: data.is_active,
        settings: data.settings,
    };
}

/**
 * Get the current user's profile within a specific tenant.
 * Requires authentication.
 */
export async function getUserProfile(
    tenantId: string
): Promise<UserContext | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("user_profiles")
        .select("id, auth_user_id, tenant_id, role, first_name, last_name")
        .eq("auth_user_id", user.id)
        .eq("tenant_id", tenantId)
        .maybeSingle();

    if (error || !data) return null;

    return {
        id: data.id,
        authUserId: data.auth_user_id,
        tenantId: data.tenant_id,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
    };
}

/**
 * Check if the tenant's trial is still active.
 */
export function isTrialActive(tenant: TenantContext): boolean {
    if (!tenant.trialEndsAt) return false;
    return new Date(tenant.trialEndsAt) > new Date();
}

/**
 * Check if the tenant has an active subscription or trial.
 */
export function isTenantSubscribed(tenant: TenantContext): boolean {
    // During trial, the tenant is considered subscribed
    if (isTrialActive(tenant)) return true;
    // After trial, check if they have a subscription (non-Seed plans)
    return tenant.planKey !== "seed";
}

/**
 * Fetch all classes for a given tenant.
 */
export async function getSchoolClasses(tenantId: string): Promise<SchoolClassContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("school_classes")
        .select(`
            *,
            teacher:user_profiles ( first_name, last_name ),
            enrollments!left ( count )
        `)
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching school classes:", error);
        return [];
    }

    return (data as any[]).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        teacherId: c.teacher_id,
        teacherName: c.teacher ? `${c.teacher.first_name} ${c.teacher.last_name}` : "No teacher assigned",
        maxStudents: c.max_students,
        schedule: c.schedule,
        feeCents: c.fee_cents,
        enrollmentCount: c.enrollments?.[0]?.count ?? 0
    }));
}

/**
 * Fetch all user profiles with role 'teacher' or 'admin/owner' for a given tenant.
 */
export async function getTenantTeachers(tenantId: string): Promise<UserContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_profiles")
        .select("id, auth_user_id, tenant_id, role, first_name, last_name")
        .eq("tenant_id", tenantId)
        .in("role", ["teacher", "admin", "owner"])
        .order("first_name", { ascending: true });

    if (error) {
        console.error("Error fetching tenant teachers:", error);
        return [];
    }

    return data.map(d => ({
        id: d.id,
        authUserId: d.auth_user_id,
        tenantId: d.tenant_id,
        role: d.role,
        firstName: d.first_name,
        lastName: d.last_name
    }));
}

export type StudentContext = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    grade: string | null;
    parentId: string;
    parentName?: string;
    createdAt: string;
    enrollments?: {
        classId: string;
        className: string;
        status: string;
    }[];
};

/**
 * Fetch all students for a given tenant.
 */
export async function getTenantStudents(tenantId: string): Promise<StudentContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("students")
        .select(`
            *,
            parent:user_profiles ( first_name, last_name ),
            enrollments (
                class_id,
                status,
                school_class:school_classes ( name )
            )
        `)
        .eq("tenant_id", tenantId)
        .order("last_name", { ascending: true });

    if (error) {
        console.error("Error fetching students:", error);
        return [];
    }

    return (data as any[]).map(s => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        dateOfBirth: s.date_of_birth,
        grade: s.grade,
        parentId: s.parent_id,
        parentName: s.parent ? `${s.parent.first_name} ${s.parent.last_name}` : "Unknown",
        createdAt: s.created_at,
        enrollments: s.enrollments?.map((e: any) => ({
            classId: e.class_id,
            className: e.school_class?.name || "Unknown Class",
            status: e.status
        }))
    }));
}

/**
 * Fetch all students for a specific parent within a tenant.
 */
export async function getParentStudents(tenantId: string, parentId: string): Promise<StudentContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            date_of_birth,
            grade
        `)
        .eq("tenant_id", tenantId)
        .eq("parent_id", parentId)
        .order("first_name", { ascending: true });

    if (error) {
        console.error("Error fetching parent students:", error);
        return [];
    }

    return (data as any[]).map(s => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        dateOfBirth: s.date_of_birth,
        grade: s.grade,
        parentId: parentId,
        createdAt: "" // Not needed for selection
    }));
}

export type ActivityContext = {
    id: string;
    name: string;
    description: string | null;
    date: string | null;
    time: string | null;
    location: string | null;
    feeCents: number;
    maxParticipants: number | null;
    signupCount: number;
};

/**
 * Fetch all extra-curricular activities for a given tenant.
 */
export async function getTenantActivities(tenantId: string): Promise<ActivityContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("activities")
        .select(`
            id,
            name,
            description,
            date,
            time,
            location,
            fee_cents,
            max_participants,
            activity_signups(count)
        `)
        .eq("tenant_id", tenantId)
        .order("date", { ascending: true });

    if (error) {
        console.error("Error fetching activities:", error);
        return [];
    }

    return (data as any[]).map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        date: a.date,
        time: a.time,
        location: a.location,
        feeCents: a.fee_cents,
        maxParticipants: a.max_participants,
        signupCount: a.activity_signups?.[0]?.count || 0
    }));
}

/**
 * Fetch a single activity by ID.
 */
export async function getActivityById(tenantId: string, activityId: string): Promise<ActivityContext | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("activities")
        .select(`
            id,
            name,
            description,
            date,
            time,
            location,
            fee_cents,
            max_participants,
            activity_signups(count)
        `)
        .eq("tenant_id", tenantId)
        .eq("id", activityId)
        .single();

    if (error || !data) {
        console.error("Error fetching activity:", error);
        return null;
    }

    const a = data as any;
    return {
        id: a.id,
        name: a.name,
        description: a.description,
        date: a.date,
        time: a.time,
        location: a.location,
        feeCents: a.fee_cents,
        maxParticipants: a.max_participants,
        signupCount: a.activity_signups?.[0]?.count || 0
    };
}

export type FundraisingContext = {
    id: string;
    title: string;
    description: string | null;
    goalCents: number;
    amountRaisedCents: number;
    startDate: string | null;
    endDate: string | null;
};

/**
 * Fetch all fundraising campaigns for a given tenant.
 */
export async function getTenantFundraising(tenantId: string): Promise<FundraisingContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("fundraisers")
        .select(`
            *,
            donations(amount_cents)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
    }

    return (data as any[]).map(c => ({
        id: c.id,
        title: c.name,
        description: c.description,
        goalCents: c.goal_cents,
        startDate: c.start_date,
        endDate: c.end_date,
        amountRaisedCents: c.donations?.reduce((acc: number, d: any) => acc + d.amount_cents, 0) || 0
    }));
}

/**
 * Fetch a single fundraising campaign by ID.
 */
export async function getCampaignById(tenantId: string, campaignId: string): Promise<FundraisingContext | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("fundraisers")
        .select(`
            *,
            donations(amount_cents)
        `)
        .eq("tenant_id", tenantId)
        .eq("id", campaignId)
        .single();

    if (error || !data) {
        console.error("Error fetching campaign:", error);
        return null;
    }

    const c = data as any;
    return {
        id: c.id,
        title: c.name,
        description: c.description,
        goalCents: c.goal_cents,
        startDate: c.start_date,
        endDate: c.end_date,
        amountRaisedCents: c.donations?.reduce((acc: number, d: any) => acc + d.amount_cents, 0) || 0
    };
}

/**
 * Fetch a single service point definition by ID.
 */
export async function getServicePointDefById(tenantId: string, defId: string): Promise<ServicePointDefContext | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("service_point_definitions")
        .select(`
            *,
            service_point_logs(id)
        `)
        .eq("tenant_id", tenantId)
        .eq("id", defId)
        .single();

    if (error || !data) {
        console.error("Error fetching service point definition:", error);
        return null;
    }

    const d = data as any;
    return {
        id: d.id,
        name: d.name,
        description: d.description,
        pointsValue: d.points_value,
        maxSignups: d.max_signups,
        eventDate: d.event_date,
        participantCount: d.service_point_logs?.length || 0
    };
}

export type ServicePointDefContext = {
    id: string;
    name: string;
    description: string | null;
    pointsValue: number;
    maxSignups: number | null;
    eventDate: string | null;
    participantCount: number;
};

/**
 * Fetch all service point definitions for a given tenant.
 */
export async function getTenantServicePointDefs(tenantId: string): Promise<ServicePointDefContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("service_point_definitions")
        .select(`
            *,
            service_point_logs(id)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching service point definitions:", error);
        return [];
    }

    return (data as any[]).map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        pointsValue: d.points_value,
        maxSignups: d.max_signups,
        eventDate: d.event_date,
        participantCount: d.service_point_logs?.length || 0
    }));
}

/**
 * Fetch total service points earned by a parent (via their students).
 */
export async function getParentServicePoints(tenantId: string, parentId: string): Promise<number> {
    const supabase = await createClient();

    const { data: students } = await supabase
        .from("students")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("parent_id", parentId);

    if (!students || students.length === 0) return 0;

    const studentIds = students.map(s => s.id);

    const { data: logs, error } = await supabase
        .from("service_point_logs")
        .select("points_earned")
        .in("student_id", studentIds);

    if (error) {
        console.error("Error fetching service points:", error);
        return 0;
    }

    // Also include points earned directly by the parent (if participant_id is used)
    const { data: parentLogs } = await supabase
        .from("service_point_logs")
        .select("points_earned")
        .eq("participant_id", parentId);

    const totalFromStudents = logs?.reduce((acc: number, l: any) => acc + l.points_earned, 0) || 0;
    const totalFromParent = parentLogs?.reduce((acc: number, l: any) => acc + l.points_earned, 0) || 0;

    return totalFromStudents + totalFromParent;
}

export type EnrollmentDetail = {
    id: string;
    studentName: string;
    className: string;
    feeCents: number;
    amountPaid: number;
    discountCents: number;
};

/**
 * Fetch all enrollments for a parent's children.
 */
export async function getParentEnrollments(tenantId: string, parentId: string): Promise<EnrollmentDetail[]> {
    const supabase = await createClient();

    const { data: students } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            enrollments(
                id,
                amount_paid,
                service_point_discount,
                school_classes(name, fee_cents)
            )
        `)
        .eq("tenant_id", tenantId)
        .eq("parent_id", parentId);

    if (!students) return [];

    const results: EnrollmentDetail[] = [];
    students.forEach((s: any) => {
        s.enrollments?.forEach((e: any) => {
            results.push({
                id: e.id,
                studentName: `${s.first_name} ${s.last_name}`,
                className: e.school_classes?.name || "Unknown Class",
                feeCents: e.school_classes?.fee_cents || 0,
                amountPaid: e.amount_paid || 0,
                discountCents: e.service_point_discount || 0
            });
        });
    });

    return results;
}

/**
 * Fetch summary KPIs for a tenant.
 */
export async function getTenantKPIs(tenantId: string): Promise<TenantKPIs> {
    const supabase = await createClient();

    // 1. Students & Enrollments
    const { data: students } = await supabase
        .from("students")
        .select("id")
        .eq("tenant_id", tenantId);

    const { data: enrollments } = await supabase
        .from("enrollments")
        .select("status, amount_paid")
        .eq("student_id", {
            // Subquery workaround since Supabase client doesn't support joins in standard count easily
            // We'll just fetch small amount or use a better query
        } as any) // We'll fix this below
        .filter("student_id", "in", `(${students?.map(s => s.id).join(',') || '00000000-0000-0000-0000-000000000000'})`);

    // Actually, let's do more efficient queries for KPIs
    const [
        { count: totalStudents },
        { data: enrollmentStats },
        { data: donationStats },
        { data: activityStats },
        { count: volunteerCount },
        { count: totalParents }
    ] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("enrollments").select("status, amount_paid").filter("student_id", "in", `(select id from students where tenant_id = '${tenantId}')`),
        supabase.from("donations").select("amount_cents").filter("fundraiser_id", "in", `(select id from fundraisers where tenant_id = '${tenantId}')`),
        supabase.from("activity_signups").select("amount_paid").filter("activity_id", "in", `(select id from activities where tenant_id = '${tenantId}')`),
        supabase.from("service_point_logs").select("participant_id", { count: "exact", head: true }).not("participant_id", "is", null).filter("participant_id", "in", `(select id from user_profiles where tenant_id = '${tenantId}')`),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("role", "parent")
    ]);

    const activeEnrollments = enrollmentStats?.filter(e => e.status === "active").length || 0;
    const pendingPayments = enrollmentStats?.filter(e => e.status === "pending_payment").length || 0;

    const tuitionRevenue = enrollmentStats?.reduce((acc, e) => acc + (e.amount_paid || 0), 0) || 0;
    const donationRevenue = donationStats?.reduce((acc, d) => acc + (d.amount_cents || 0), 0) || 0;
    const activityRevenue = activityStats?.reduce((acc, a) => acc + (a.amount_paid || 0), 0) || 0;

    const totalRevenueCents = tuitionRevenue + donationRevenue + activityRevenue;
    const activityParticipation = activityStats?.length || 0;
    const servicePointEngagement = totalParents ? Math.round(((volunteerCount || 0) / totalParents) * 100) : 0;

    return {
        totalStudents: totalStudents || 0,
        activeEnrollments,
        pendingPayments,
        totalRevenueCents,
        activityParticipation,
        servicePointEngagement
    };
}

/**
 * Fetch detailed enrollment report for a tenant.
 */
export async function getEnrollmentReport(tenantId: string): Promise<EnrollmentReportItem[]> {
    const supabase = await createClient();

    const { data: students } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("tenant_id", tenantId);

    if (!students || students.length === 0) return [];

    const studentIds = students.map(s => s.id);

    const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
            id,
            student_id,
            status,
            enrolled_at,
            school_classes(name)
        `)
        .in("student_id", studentIds)
        .order("enrolled_at", { ascending: false });

    if (error) {
        console.error("Error fetching enrollment report:", error);
        return [];
    }

    const studentMap = new Map(students.map(s => [s.id, `${s.first_name} ${s.last_name}`]));

    return (enrollments as any[]).map(e => ({
        id: e.id,
        studentName: studentMap.get(e.student_id) || "Unknown Student",
        className: e.school_classes?.name || "Unknown Class",
        status: e.status,
        enrolledAt: e.enrolled_at
    }));
}

/**
 * Fetch financial report for a tenant.
 */
export async function getFinancialReport(tenantId: string): Promise<FinancialReportItem[]> {
    const supabase = await createClient();

    // Fetch all 3 types of transactions
    const [enrollmentRes, donationRes, activityRes] = await Promise.all([
        supabase.from("enrollments").select("id, amount_paid, enrolled_at, school_classes(name)").filter("student_id", "in", `(select id from students where tenant_id = '${tenantId}')`),
        supabase.from("donations").select("id, amount_cents, donated_at, donor_name, fundraiser_id, fundraisers(name)").filter("fundraiser_id", "in", `(select id from fundraisers where tenant_id = '${tenantId}')`),
        supabase.from("activity_signups").select("id, amount_paid, signed_up_at, student_id, activities(name)").filter("activity_id", "in", `(select id from activities where tenant_id = '${tenantId}')`)
    ]);

    const items: FinancialReportItem[] = [];

    // 1. Enrollments
    if (enrollmentRes.data) {
        enrollmentRes.data.forEach((e: any) => {
            if (e.amount_paid) {
                items.push({
                    id: e.id,
                    type: 'registration',
                    amountCents: e.amount_paid,
                    status: 'paid', // Enrollments usually only show if paid or have amount
                    date: e.enrolled_at,
                    description: `Course: ${e.school_classes?.name || 'Class Registration'}`
                });
            }
        });
    }

    // 2. Donations
    if (donationRes.data) {
        donationRes.data.forEach((d: any) => {
            items.push({
                id: d.id,
                type: 'donation',
                amountCents: d.amount_cents,
                status: 'paid',
                date: d.donated_at,
                description: `Donation: ${d.fundraisers?.name || 'School Fund'}${d.donor_name ? ` (${d.donor_name})` : ''}`
            });
        });
    }

    // 3. Activity Signups
    if (activityRes.data) {
        activityRes.data.forEach((a: any) => {
            if (a.amount_paid) {
                items.push({
                    id: a.id,
                    type: 'activity',
                    amountCents: a.amount_paid,
                    status: 'paid',
                    date: a.signed_up_at,
                    description: `Activity: ${a.activities?.name || 'Event Signup'}`
                });
            }
        });
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetch service point report for a tenant.
 */
export async function getServicePointReport(tenantId: string): Promise<ServicePointReportItem[]> {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select(`
            id,
            first_name,
            last_name,
            role,
            service_point_logs(points_earned),
            students(enrollments(service_point_discount))
        `)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error fetching service point report:", error);
        return [];
    }

    return (profiles as any[]).map(p => {
        const pointsEarned = p.service_point_logs?.reduce((acc: number, l: any) => acc + (l.points_earned || 0), 0) || 0;

        // Sum discounts from all students belonging to this parent
        let pointsApplied = 0;
        p.students?.forEach((s: any) => {
            s.enrollments?.forEach((e: any) => {
                // Assuming 1 point = 1 cent for simplicity here, 
                // but in reality should use the tenant conversion rate if defined
                pointsApplied += (e.service_point_discount || 0);
            });
        });

        return {
            id: p.id,
            participantName: `${p.first_name} ${p.last_name}`,
            role: p.role,
            pointsEarned,
            pointsApplied,
            netBalance: pointsEarned - pointsApplied
        };
    }).filter(item => item.pointsEarned > 0 || item.pointsApplied > 0);
}

/**
 * Fetch all academic years for a tenant.
 */
export async function getAcademicYears(tenantId: string): Promise<AcademicYearContext[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("start_date", { ascending: false });

    if (error) {
        console.error("Error fetching academic years:", error);
        return [];
    }

    return (data as any[]).map(ay => ({
        id: ay.id,
        name: ay.name,
        startDate: ay.start_date,
        endDate: ay.end_date,
        isActive: ay.is_active
    }));
}

/**
 * Fetch the active academic year for a tenant.
 */
export async function getActiveAcademicYear(tenantId: string): Promise<AcademicYearContext | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        console.error("Error fetching active academic year:", error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active
    };
}
