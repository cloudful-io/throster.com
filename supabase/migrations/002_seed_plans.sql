-- ============================================================================
-- Seed data for subscription plans
-- Run after migrations to populate the plans table.
-- ============================================================================

INSERT INTO plans (key, name, price_cents, billing_period_days, max_students, max_classes, features, is_active, updated_at)
VALUES
  (
    'seed',
    'Seed',
    0,
    365,
    25,
    5,
    '{"registration": true, "classes": true, "student_list": true, "stripe_payments": false, "activities": false, "fundraising": false, "service_points": false, "basic_reports": false, "advanced_reports": false, "custom_branding": false, "priority_support": false}',
    true,
    now()
  ),
  (
    'grow',
    'Grow',
    10000,
    365,
    100,
    20,
    '{"registration": true, "classes": true, "student_list": true, "stripe_payments": true, "activities": false, "fundraising": false, "service_points": false, "basic_reports": true, "advanced_reports": false, "custom_branding": false, "priority_support": false}',
    true,
    now()
  ),
  (
    'flourish',
    'Flourish',
    25000,
    365,
    250,
    50,
    '{"registration": true, "classes": true, "student_list": true, "stripe_payments": true, "activities": true, "fundraising": false, "service_points": false, "basic_reports": true, "advanced_reports": true, "custom_branding": false, "priority_support": false}',
    true,
    now()
  ),
  (
    'bloom',
    'Bloom',
    50000,
    365,
    500,
    null,
    '{"registration": true, "classes": true, "student_list": true, "stripe_payments": true, "activities": true, "fundraising": true, "service_points": true, "basic_reports": true, "advanced_reports": true, "custom_branding": true, "priority_support": false}',
    true,
    now()
  ),
  (
    'evergreen',
    'Evergreen',
    100000,
    365,
    null,
    null,
    '{"registration": true, "classes": true, "student_list": true, "stripe_payments": true, "activities": true, "fundraising": true, "service_points": true, "basic_reports": true, "advanced_reports": true, "custom_branding": true, "priority_support": true}',
    true,
    now()
  )
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  billing_period_days = EXCLUDED.billing_period_days,
  max_students = EXCLUDED.max_students,
  max_classes = EXCLUDED.max_classes,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();
