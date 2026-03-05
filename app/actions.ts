'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { protocol, rootDomain } from '@/lib/utils';

// ─── School Signup (Root Domain) ────────────────────────────────────────

export async function signupSchoolAction(
  prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const schoolName = formData.get('schoolName') as string;
  const subdomain = formData.get('subdomain') as string;
  const planKey = (formData.get('planKey') as string) || 'seed';

  if (!email || !password || !firstName || !lastName || !schoolName || !subdomain) {
    return { success: false, error: 'All fields are required.' };
  }

  // Validate subdomain format
  const sanitized = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (sanitized !== subdomain || sanitized.length < 3) {
    return {
      success: false,
      error: 'Subdomain must be at least 3 characters and contain only lowercase letters, numbers, and hyphens.',
    };
  }

  // Check if subdomain is taken
  const { data: existing } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('subdomain', sanitized)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'This subdomain is already taken.' };
  }

  // 1. Create Supabase Auth user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (authError || !authData.user) {
    console.error('Auth signup error:', authError);
    return { success: false, error: authError?.message || 'Failed to create account.' };
  }

  // 2. Get the plan ID for the selected plan
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('key', planKey)
    .single();

  if (!plan) {
    console.error(`Plan not found for key: ${planKey}`);
    return { success: false, error: 'Invalid plan selected.' };
  }

  // 3. Create the tenant. Paid plans get a 3-month trial. Seed is free forever.
  let trialEndsAt: string | null = null;

  if (planKey !== 'seed') {
    const trialDate = new Date();
    trialDate.setMonth(trialDate.setMonth(trialDate.getMonth() + 3));
    trialEndsAt = trialDate.toISOString();
  }

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: schoolName,
      subdomain: sanitized,
      plan_id: plan.id,
      trial_ends_at: trialEndsAt,
      is_active: true,
      settings: {
        points_to_cents: 100, // 1 service point = $1.00 deduction (default)
      },
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (tenantError || !tenant) {
    console.error('Tenant creation error:', tenantError);
    return { success: false, error: `Failed to create school: ${tenantError?.message || 'Unknown error'}` };
  }

  // 3b. Initialize tenant billing record
  const { error: billingError } = await supabaseAdmin
    .from('tenant_billing')
    .insert({
      tenant_id: tenant.id,
      updated_at: new Date().toISOString(),
    });

  if (billingError) {
    console.error('Billing creation error:', billingError);
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
    return { success: false, error: 'Failed to initialize billing record.' };
  }

  // 4. Create the user profile with owner role
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      auth_user_id: authData.user.id,
      tenant_id: tenant.id,
      role: 'owner',
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Cleanup: delete the tenant if profile creation fails
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
    return { success: false, error: 'Failed to create user profile.' };
  }

  // Redirect to the new school's subdomain
  redirect(`${protocol}://${sanitized}.${rootDomain}`);
}

// ─── Tenant Auth Actions (Subdomain) ───────────────────────────────────

export async function loginAction(
  prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signupAction(
  prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const tenantId = formData.get('tenantId') as string;

  if (!email || !password || !firstName || !lastName || !tenantId) {
    return { success: false, error: 'All fields are required.' };
  }

  const supabase = await createClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Failed to create account.' };
  }

  // Create user profile as parent role
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      auth_user_id: authData.user.id,
      tenant_id: tenantId,
      role: 'parent',
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return { success: false, error: 'Failed to create profile. The email may already be registered.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── Class Management Actions ──────────────────────────────────────────

export async function saveClassAction(
  prevState: any,
  formData: FormData
) {
  const id = formData.get('id') as string | null;
  const tenantId = formData.get('tenantId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const teacherId = formData.get('teacherId') as string || null;
  const maxStudents = parseInt(formData.get('maxStudents') as string) || 20;
  const feeCents = Math.round(parseFloat(formData.get('feeCents') as string) * 100) || 0;

  const day = formData.get('day') as string;
  const time = formData.get('time') as string;
  const room = formData.get('room') as string;

  if (!tenantId || !name) {
    return { success: false, error: 'Tenant ID and Class Name are required.' };
  }

  const schedule = { day, time, room };

  const classData = {
    tenant_id: tenantId,
    name,
    description,
    teacher_id: teacherId,
    max_students: maxStudents,
    fee_cents: feeCents,
    schedule,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (id) {
    // Update
    const { data, error } = await supabaseAdmin
      .from('school_classes')
      .update(classData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    result = { data, error };
  } else {
    // Insert
    const { data, error } = await supabaseAdmin
      .from('school_classes')
      .insert({ ...classData, created_at: new Date().toISOString() })
      .select()
      .single();
    result = { data, error };
  }

  if (result.error) {
    console.error('Save class error:', result.error);
    return { success: false, error: 'Failed to save class.' };
  }

  revalidatePath('/dashboard/classes', 'page');
  revalidatePath(`/dashboard/classes/${result.data.id}`, 'page');

  return { success: true, classId: result.data.id };
}

export async function deleteClassAction(tenantId: string, classId: string) {
  if (!tenantId || !classId) return { success: false, error: 'Ids required' };

  const { error } = await supabaseAdmin
    .from('school_classes')
    .delete()
    .eq('id', classId)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Delete class error:', error);
    return { success: false, error: 'Failed to delete class.' };
  }

  revalidatePath('/dashboard/classes', 'page');
  redirect('/dashboard/classes');
}

// ─── Student Registration Actions ─────────────────────────────────────

export async function createRegistrationAction(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  const subdomain = formData.get('subdomain') as string;
  const parentId = formData.get('parentId') as string;
  const studentFirstName = formData.get('studentFirstName') as string;
  const studentLastName = formData.get('studentLastName') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const grade = formData.get('grade') as string;
  const classId = formData.get('classId') as string;

  if (!tenantId || !parentId || !studentFirstName || !studentLastName || !classId) {
    return { success: false, error: 'Required fields are missing.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to register.' };
  }

  // 1. Create or find student
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .insert({
      tenant_id: tenantId,
      parent_id: parentId,
      first_name: studentFirstName,
      last_name: studentLastName,
      date_of_birth: dateOfBirth || null,
      grade: grade || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (studentError || !student) {
    console.error('Student creation error:', studentError);
    return { success: false, error: 'Failed to create student record.' };
  }

  // 2. Fetch class details for price
  const { data: cls, error: classError } = await supabaseAdmin
    .from('school_classes')
    .select('name, fee_cents')
    .eq('id', classId)
    .single();

  if (classError || !cls) {
    return { success: false, error: 'Class not found.' };
  }

  // 3. Create Enrollment (pending payment)
  const { data: enrollment, error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .insert({
      student_id: student.id,
      class_id: classId,
      status: 'pending_payment',
      amount_paid: 0,
    })
    .select()
    .single();

  if (enrollmentError) {
    console.error('Enrollment error:', enrollmentError);
    // If they were already enrolled (unique constraint), handle it
    if (enrollmentError.code === '23505') {
      return { success: false, error: 'Student is already enrolled or has a pending registration for this class.' };
    }
    return { success: false, error: 'Failed to create enrollment.' };
  }

  // 4. Create Stripe Checkout Session
  const { createOneTimeCheckout } = await import('@/lib/stripe');

  try {
    const session = await createOneTimeCheckout({
      tenantId,
      description: `Registration: ${cls.name} - ${studentFirstName} ${studentLastName}`,
      amountCents: cls.fee_cents,
      customerEmail: user.email!,
      successUrl: `${protocol}://${subdomain}.${rootDomain}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${protocol}://${subdomain}.${rootDomain}/register?status=cancelled`,
      metadata: {
        payment_type: 'enrollment',
        enrollment_id: enrollment.id,
        student_id: student.id,
        class_id: classId,
      },
    });

    return { success: true, checkoutUrl: session.url };
  } catch (stripeError: any) {
    console.error('Stripe error:', stripeError);
    return { success: false, error: 'Payment initialization failed. Please try again.' };
  }
}

// ─── Extra-Curricular Activity Actions ──────────────────────────────────

export async function saveActivityAction(formData: FormData) {
  const id = formData.get('id') as string | null;
  const tenantId = formData.get('tenantId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const location = formData.get('location') as string;
  const feeCents = parseInt(formData.get('feeCents') as string || '0', 10);
  const maxParticipants = parseInt(formData.get('maxParticipants') as string || '0', 10);

  if (!tenantId || !name) {
    return { success: false, error: 'Name is required.' };
  }

  const data = {
    tenant_id: tenantId,
    name,
    description: description || null,
    date: date || null,
    time: time || null,
    location: location || null,
    fee_cents: feeCents,
    max_participants: maxParticipants > 0 ? maxParticipants : null,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const { error: updateError } = await supabaseAdmin
      .from('activities')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
    error = updateError;
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('activities')
      .insert(data);
    error = insertError;
  }

  if (error) {
    console.error('Activity save error:', error);
    return { success: false, error: 'Failed to save activity.' };
  }

  revalidatePath('/dashboard/activities', 'page');
  return { success: true };
}

export async function deleteActivityAction(formData: FormData) {
  const id = formData.get('id') as string;
  const tenantId = formData.get('tenantId') as string;

  if (!id || !tenantId) {
    return { success: false, error: 'Activity ID and Tenant ID are required.' };
  }

  const { error } = await supabaseAdmin
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Activity deletion error:', error);
    return { success: false, error: 'Failed to delete activity.' };
  }

  revalidatePath('/dashboard/activities', 'page');
  return { success: true };
}

// ─── Activity Signup Actions ──────────────────────────────────────────

export async function createActivitySignupAction(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  const subdomain = formData.get('subdomain') as string;
  const parentId = formData.get('parentId') as string;
  const studentId = formData.get('studentId') as string;
  const activityId = formData.get('activityId') as string;

  if (!tenantId || !parentId || !studentId || !activityId) {
    return { success: false, error: 'Required fields are missing.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to sign up.' };
  }

  // 1. Fetch activity details
  const { data: activity, error: activityError } = await supabaseAdmin
    .from('activities')
    .select('name, fee_cents')
    .eq('id', activityId)
    .single();

  if (activityError || !activity) {
    return { success: false, error: 'Activity not found.' };
  }

  // 2. Fetch student details for description
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('first_name, last_name')
    .eq('id', studentId)
    .single();

  // 3. Create Activity Signup (pending payment)
  const { data: signup, error: signupError } = await supabaseAdmin
    .from('activity_signups')
    .insert({
      activity_id: activityId,
      student_id: studentId,
      status: 'pending',
      amount_paid: 0,
    })
    .select()
    .single();

  if (signupError) {
    console.error('Signup error:', signupError);
    if (signupError.code === '23505') {
      return { success: false, error: 'Student is already signed up for this activity.' };
    }
    return { success: false, error: 'Failed to create signup record.' };
  }

  // 4. Create Stripe Checkout Session
  const { createOneTimeCheckout } = await import('@/lib/stripe');

  try {
    const session = await createOneTimeCheckout({
      tenantId,
      description: `Activity: ${activity.name}${student ? ` — ${student.first_name} ${student.last_name}` : ""}`,
      amountCents: activity.fee_cents,
      customerEmail: user.email!,
      successUrl: `${protocol}://${subdomain}.${rootDomain}/activities/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${protocol}://${subdomain}.${rootDomain}/activities/${activityId}`,
      metadata: {
        payment_type: 'activity',
        signup_id: signup.id,
        activity_id: activityId,
        student_id: studentId,
      },
    });

    return { success: true, checkoutUrl: session.url };
  } catch (stripeError: any) {
    console.error('Stripe error:', stripeError);
    return { success: false, error: 'Payment initialization failed. Please try again.' };
  }
}

// ─── Fundraising Actions ──────────────────────────────────────────────

export async function saveFundraisingAction(formData: FormData) {
  const id = formData.get('id') as string | null;
  const tenantId = formData.get('tenantId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const goalCents = parseInt(formData.get('goalCents') as string || '0', 10);
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!tenantId || !title) {
    return { success: false, error: 'Title is required.' };
  }

  const data = {
    tenant_id: tenantId,
    title,
    description: description || null,
    goal_cents: goalCents,
    start_date: startDate || null,
    end_date: endDate || null,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const { error: updateError } = await supabaseAdmin
      .from('fundraisers')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
    error = updateError;
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('fundraisers')
      .insert(data);
    error = insertError;
  }

  if (error) {
    console.error('Fundraising save error:', error);
    return { success: false, error: 'Failed to save campaign.' };
  }

  revalidatePath('/dashboard/fundraising', 'page');
  return { success: true };
}

export async function deleteFundraisingAction(formData: FormData) {
  const id = formData.get('id') as string;
  const tenantId = formData.get('tenantId') as string;

  if (!id || !tenantId) {
    return { success: false, error: 'Campaign ID and Tenant ID are required.' };
  }

  const { error } = await supabaseAdmin
    .from('fundraisers')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Campaign deletion error:', error);
    return { success: false, error: 'Failed to delete campaign.' };
  }

  revalidatePath('/dashboard/fundraising', 'page');
  return { success: true };
}

// ─── Donation Actions ─────────────────────────────────────────────────

export async function createDonationAction(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  const subdomain = formData.get('subdomain') as string;
  const campaignId = formData.get('campaignId') as string;
  const amountCents = parseInt(formData.get('amountCents') as string, 10);

  if (!tenantId || !campaignId || isNaN(amountCents) || amountCents <= 0) {
    return { success: false, error: 'Required fields are missing or invalid.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch campaign details
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('fundraisers')
    .select('name')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return { success: false, error: 'Campaign not found.' };
  }

  // 2. Create Donation record (pending payment)
  const { data: donation, error: donationError } = await supabaseAdmin
    .from('donations')
    .insert({
      fundraiser_id: campaignId,
      donor_name: user?.user_metadata?.full_name || 'Supporter',
      donor_email: user?.email || null,
      amount_cents: amountCents,
      payment_id: null,
    })
    .select()
    .single();

  if (donationError) {
    console.error('Donation error:', donationError);
    return { success: false, error: 'Failed to create donation record.' };
  }

  // 3. Create Stripe Checkout Session
  const { createOneTimeCheckout } = await import('@/lib/stripe');

  try {
    const session = await createOneTimeCheckout({
      tenantId,
      description: `Donation: ${campaign.name}`,
      amountCents: amountCents,
      customerEmail: user?.email || undefined,
      successUrl: `${protocol}://${subdomain}.${rootDomain}/fundraising/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${protocol}://${subdomain}.${rootDomain}/fundraising/${campaignId}`,
      metadata: {
        payment_type: 'donation',
        donation_id: donation.id,
        campaign_id: campaignId,
      },
    });

    return { success: true, checkoutUrl: session.url };
  } catch (stripeError: any) {
    console.error('Stripe error:', stripeError);
    return { success: false, error: 'Payment initialization failed. Please try again.' };
  }
}

// ─── Service Point Actions ───────────────────────────────────────────

export async function saveServicePointAction(formData: FormData) {
  const id = formData.get('id') as string | null;
  const tenantId = formData.get('tenantId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const pointsValue = parseInt(formData.get('pointsValue') as string || '1', 10);
  const maxSignups = formData.get('maxSignups') ? parseInt(formData.get('maxSignups') as string, 10) : null;
  const eventDate = formData.get('eventDate') as string;

  if (!tenantId || !name) {
    return { success: false, error: 'Name is required.' };
  }

  const data = {
    tenant_id: tenantId,
    name,
    description: description || null,
    points_value: pointsValue,
    max_signups: maxSignups,
    event_date: eventDate || null,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const { error: updateError } = await supabaseAdmin
      .from('service_point_definitions')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
    error = updateError;
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('service_point_definitions')
      .insert(data);
    error = insertError;
  }

  if (error) {
    console.error('Service point save error:', error);
    return { success: false, error: 'Failed to save service point definition.' };
  }

  revalidatePath('/dashboard/service-points', 'page');
  return { success: true };
}

export async function deleteServicePointAction(formData: FormData) {
  const id = formData.get('id') as string;
  const tenantId = formData.get('tenantId') as string;

  if (!id || !tenantId) {
    return { success: false, error: 'ID and Tenant ID are required.' };
  }

  const { error } = await supabaseAdmin
    .from('service_point_definitions')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Service point deletion error:', error);
    return { success: false, error: 'Failed to delete service point definition.' };
  }

  revalidatePath('/dashboard/service-points', 'page');
  return { success: true };
}

// ─── Service Point Participation ──────────────────────────────────────

export async function logServicePointAction(formData: FormData) {
  const definitionId = formData.get('definitionId') as string;
  const participantId = formData.get('participantId') as string;
  const pointsEarned = parseInt(formData.get('points') as string || '1', 10);

  if (!definitionId || !participantId) {
    return { success: false, error: 'Activity and Participant IDs are required.' };
  }

  const { error } = await supabaseAdmin
    .from('service_point_logs')
    .insert({
      definition_id: definitionId,
      participant_id: participantId,
      points_earned: pointsEarned,
      logged_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Service point logging error:', error);
    return { success: false, error: 'Failed to join activity.' };
  }

  revalidatePath('/service-points', 'page');
  return { success: true };
}

export async function applyServicePointsAction(formData: FormData) {
  const enrollmentId = formData.get('enrollmentId') as string;
  const parentId = formData.get('parentId') as string;
  const pointsToApply = parseInt(formData.get('points') as string, 10);
  const pointsRate = 500; // 1 point = $5.00

  if (!enrollmentId || !parentId || isNaN(pointsToApply) || pointsToApply <= 0) {
    return { success: false, error: 'Invalid points or enrollment.' };
  }

  // 1. Calculate discount
  const discountCents = pointsToApply * pointsRate;

  // 2. Log a negative point entry to deduct from balance
  const { error: logError } = await supabaseAdmin
    .from('service_point_logs')
    .insert({
      definition_id: '00000000-0000-0000-0000-000000000000', // System/Redemption ID (assumed to exist or handled by RLS)
      participant_id: parentId,
      points_earned: -pointsToApply,
      logged_at: new Date().toISOString(),
    });

  if (logError) {
    console.error('Points deduction error:', logError);
    return { success: false, error: 'Failed to process point redemption.' };
  }

  // 3. Update enrollment with discount
  const { data: enrollment, error: fetchError } = await supabaseAdmin
    .from('enrollments')
    .select('service_point_discount')
    .eq('id', enrollmentId)
    .single();

  if (fetchError) {
    return { success: false, error: 'Enrollment not found.' };
  }

  const newDiscount = (enrollment.service_point_discount || 0) + discountCents;

  const { error: updateError } = await supabaseAdmin
    .from('enrollments')
    .update({
      service_point_discount: newDiscount,
    })
    .eq('id', enrollmentId);

  if (updateError) {
    console.error('Points redemption update error:', updateError);
    return { success: false, error: 'Failed to update discount.' };
  }

  revalidatePath('/service-points', 'page');
  return { success: true };
}

export async function updateTenantSettingsAction(tenantId: string, settings: Record<string, any>) {
  const { error } = await supabaseAdmin
    .from('tenants')
    .update({ settings })
    .eq('id', tenantId);

  if (error) {
    console.error('Update settings error:', error);
    return { success: false, error: 'Failed to update school settings.' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function saveAcademicYearAction(tenantId: string, data: any) {
  const { id, name, startDate, endDate } = data;

  if (id) {
    const { error } = await supabaseAdmin
      .from('academic_years')
      .update({
        name,
        start_date: startDate,
        end_date: endDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Update academic year error:', error);
      return { success: false, error: 'Failed to update academic year.' };
    }
  } else {
    const { error } = await supabaseAdmin
      .from('academic_years')
      .insert({
        tenant_id: tenantId,
        name,
        start_date: startDate,
        end_date: endDate,
        is_active: false
      });

    if (error) {
      console.error('Create academic year error:', error);
      return { success: false, error: 'Failed to create academic year.' };
    }
  }

  revalidatePath('/dashboard/academic-years', 'page');
  return { success: true };
}

export async function deleteAcademicYearAction(id: string) {
  const { error } = await supabaseAdmin
    .from('academic_years')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete academic year error:', error);
    return { success: false, error: 'Failed to delete academic year.' };
  }

  revalidatePath('/dashboard/academic-years', 'page');
  return { success: true };
}

export async function setActiveAcademicYearAction(tenantId: string, id: string) {
  // Transactional-ish: Deactivate all then activate one
  // In Supabase client we can't do multi-query transactions easily without RPC,
  // but these sequential updates are acceptable for this scale.

  const { error: deactivateError } = await supabaseAdmin
    .from('academic_years')
    .update({ is_active: false })
    .eq('tenant_id', tenantId);

  if (deactivateError) {
    console.error('Deactivate years error:', deactivateError);
    return { success: false, error: 'Failed to reset active status.' };
  }

  const { error: activateError } = await supabaseAdmin
    .from('academic_years')
    .update({ is_active: true })
    .eq('id', id);

  if (activateError) {
    console.error('Activate year error:', activateError);
    return { success: false, error: 'Failed to set active year.' };
  }

  revalidatePath('/dashboard/academic-years', 'page');
  revalidatePath('/dashboard', 'page');
  return { success: true };
}
