import "server-only";

import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-02-25.clover",
            typescript: true,
        });
    }
    return _stripe;
}

// Lazy load stripe instance to avoid build-time errors if env vars are missing
export const stripe = null; // No longer exporting a pre-initialized instance

export function getStripeInstance(): Stripe {
    return getStripe();
}

/**
 * Plan key → Stripe Price ID mapping.
 * These must be created in Stripe Dashboard (or via API) and added here.
 */
export const STRIPE_PRICE_IDS: Record<string, string> = {
    grow: process.env.STRIPE_PRICE_GROW || "",
    flourish: process.env.STRIPE_PRICE_FLOURISH || "",
    bloom: process.env.STRIPE_PRICE_BLOOM || "",
    evergreen: process.env.STRIPE_PRICE_EVERGREEN || "",
};

/**
 * Create a Stripe Checkout Session for a plan subscription.
 * Used during school signup after the 3-month trial.
 */
export async function createSubscriptionCheckout({
    tenantId,
    planKey,
    customerEmail,
    successUrl,
    cancelUrl,
}: {
    tenantId: string;
    planKey: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const priceId = STRIPE_PRICE_IDS[planKey];
    if (!priceId) {
        throw new Error(`No Stripe price configured for plan: ${planKey}`);
    }

    const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer_email: customerEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            tenant_id: tenantId,
            plan_key: planKey,
        },
        subscription_data: {
            metadata: {
                tenant_id: tenantId,
                plan_key: planKey,
            },
        },
    });

    return session;
}

/**
 * Create a Stripe Checkout Session for a one-time payment.
 * Used for registration fees, activity fees, donations.
 */
export async function createOneTimeCheckout({
    tenantId,
    description,
    amountCents,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata,
}: {
    tenantId: string;
    description: string;
    amountCents: number;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}) {
    const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: customerEmail,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: description,
                    },
                    unit_amount: amountCents,
                },
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            tenant_id: tenantId,
            ...metadata,
        },
    });

    return session;
}

/**
 * Construct a Stripe webhook event from the raw body and signature.
 */
export function constructWebhookEvent(
    body: string | Buffer,
    signature: string
): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
}
