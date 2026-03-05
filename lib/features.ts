/**
 * Feature gating for subscription tiers.
 *
 * Each plan unlocks an incremental set of features:
 *   Seed       → registration, classes (basic)
 *   Grow       → + Stripe payments, basic reports
 *   Flourish   → + activities, advanced reports
 *   Bloom      → + fundraising, service points, custom branding
 *   Evergreen  → + unlimited, priority support
 */

// Ordered list of plan keys from lowest to highest tier
const PLAN_ORDER = ["seed", "grow", "flourish", "bloom", "evergreen"] as const;
export type PlanKey = (typeof PLAN_ORDER)[number];

// Minimum plan required for each feature
const FEATURE_REQUIREMENTS: Record<string, PlanKey> = {
    // Core features (available to all)
    registration: "seed",
    classes: "seed",
    student_list: "seed",

    // Payment features
    stripe_payments: "grow",
    basic_reports: "grow",

    // Activities
    activities: "flourish",
    advanced_reports: "flourish",

    // Advanced features
    fundraising: "bloom",
    service_points: "bloom",
    custom_branding: "bloom",

    // Enterprise features
    unlimited_students: "evergreen",
    priority_support: "evergreen",
};

/**
 * Get the numeric tier index (0-4) for a plan key.
 */
function getPlanIndex(planKey: string): number {
    const index = PLAN_ORDER.indexOf(planKey as PlanKey);
    return index >= 0 ? index : 0; // Default to seed if unknown
}

/**
 * Check if a specific feature is available for the given plan.
 *
 * @param planKey - The tenant's current plan key (e.g. "grow")
 * @param feature - The feature to check (e.g. "activities")
 * @returns true if the plan includes the feature
 */
export function canAccess(planKey: string, feature: string): boolean {
    const requiredPlan = FEATURE_REQUIREMENTS[feature];
    if (!requiredPlan) return false; // Unknown feature = denied

    const currentIndex = getPlanIndex(planKey);
    const requiredIndex = getPlanIndex(requiredPlan);

    return currentIndex >= requiredIndex;
}

/**
 * Get all features available for a plan.
 */
export function getAvailableFeatures(planKey: string): string[] {
    return Object.entries(FEATURE_REQUIREMENTS)
        .filter(([, requiredPlan]) => canAccess(planKey, requiredPlan))
        .map(([feature]) => feature);
}

/**
 * Get the list of all features with their availability for a plan.
 * Useful for rendering feature comparison tables.
 */
export function getFeatureMatrix(planKey: string): Record<string, boolean> {
    const matrix: Record<string, boolean> = {};
    for (const feature of Object.keys(FEATURE_REQUIREMENTS)) {
        matrix[feature] = canAccess(planKey, feature);
    }
    return matrix;
}

/**
 * Get all plan keys in order.
 */
export function getAllPlanKeys(): readonly string[] {
    return PLAN_ORDER;
}

/**
 * Student limit per plan tier. null = unlimited.
 */
export const PLAN_STUDENT_LIMITS: Record<PlanKey, number | null> = {
    seed: 25,
    grow: 100,
    flourish: 250,
    bloom: 500,
    evergreen: null,
};

/**
 * Check if a tenant can add more students.
 */
export function canAddStudent(
    planKey: string,
    currentStudentCount: number
): boolean {
    const limit = PLAN_STUDENT_LIMITS[planKey as PlanKey];
    if (limit === null || limit === undefined) return true; // unlimited
    return currentStudentCount < limit;
}
