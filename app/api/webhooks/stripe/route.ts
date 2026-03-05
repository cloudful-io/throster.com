import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;
    try {
        event = constructWebhookEvent(body, signature);
    } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const tenantId = session.metadata?.tenant_id;
                const planKey = session.metadata?.plan_key;
                const paymentType = session.metadata?.payment_type;

                if (tenantId && planKey && session.subscription) {
                    // Subscription checkout — update tenant billing
                    await supabaseAdmin
                        .from('tenant_billing')
                        .update({
                            subscription_id: session.subscription as string,
                            stripe_customer_id: session.customer as string,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('tenant_id', tenantId);
                }

                if (paymentType === 'enrollment' && session.metadata?.enrollment_id) {
                    // Registration payment
                    await supabaseAdmin
                        .from('enrollments')
                        .update({
                            status: 'active',
                            payment_id: session.payment_intent as string,
                            amount_paid: session.amount_total,
                        })
                        .eq('id', session.metadata.enrollment_id);
                }

                if (paymentType === 'activity' && session.metadata?.signup_id) {
                    // Activity signup payment
                    await supabaseAdmin
                        .from('activity_signups')
                        .update({
                            payment_id: session.payment_intent as string,
                            amount_paid: session.amount_total,
                        })
                        .eq('id', session.metadata.signup_id);
                }

                if (paymentType === 'donation' && session.metadata?.donation_id) {
                    // Donation payment
                    await supabaseAdmin
                        .from('donations')
                        .update({
                            payment_id: session.payment_intent as string,
                        })
                        .eq('id', session.metadata.donation_id);
                }

                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const tenantId = subscription.metadata?.tenant_id;

                if (tenantId) {
                    const planKey = subscription.metadata?.plan_key;
                    if (planKey) {
                        const { data: plan } = await supabaseAdmin
                            .from('plans')
                            .select('id')
                            .eq('key', planKey)
                            .single();

                        if (plan) {
                            await supabaseAdmin
                                .from('tenants')
                                .update({ plan_id: plan.id })
                                .eq('id', tenantId);
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const tenantId = subscription.metadata?.tenant_id;

                if (tenantId) {
                    // Clear subscription in billing table
                    await supabaseAdmin
                        .from('tenant_billing')
                        .update({
                            subscription_id: null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('tenant_id', tenantId);

                    // Downgrade to Seed plan in tenants table
                    const { data: seedPlan } = await supabaseAdmin
                        .from('plans')
                        .select('id')
                        .eq('key', 'seed')
                        .single();

                    if (seedPlan) {
                        await supabaseAdmin
                            .from('tenants')
                            .update({
                                plan_id: seedPlan.id,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', tenantId);
                    }
                }
                break;
            }

            case 'invoice.paid': {
                // Optional: log payment history, send notifications, etc.
                console.log('Invoice paid:', event.data.object.id);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Stripe webhook handler error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
