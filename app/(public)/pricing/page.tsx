import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf, Sprout, Sun, Flower2, TreePine, Check, X } from 'lucide-react'

const tiers = [
  {
    id: 'seed',
    name: 'Seed',
    icon: Leaf,
    price: '$0',
    period: 'free forever',
    students: 'Up to 25 students',
    desc: 'Perfect for getting started. Free forever for small communities.',
    cta: '/signup?plan=seed',
    popular: false,
    features: {
      registration: true,
      classes: true,
      stripe_payments: false,
      activities: false,
      fundraising: false,
      service_points: false,
      basic_reports: false,
      advanced_reports: false,
      custom_branding: false,
      priority_support: false,
    },
  },
  {
    id: 'grow',
    name: 'Grow',
    icon: Sprout,
    price: '$100',
    period: 'per year',
    students: 'Up to 100 students',
    desc: 'For small schools getting organized with online payments.',
    cta: '/signup?plan=grow',
    popular: false,
    features: {
      registration: true,
      classes: true,
      stripe_payments: true,
      activities: false,
      fundraising: false,
      service_points: false,
      basic_reports: true,
      advanced_reports: false,
      custom_branding: false,
      priority_support: false,
    },
  },
  {
    id: 'flourish',
    name: 'Flourish',
    icon: Sun,
    price: '$250',
    period: 'per year',
    students: 'Up to 250 students',
    desc: 'Our recommended plan for growing classrooms.',
    cta: '/signup?plan=flourish',
    popular: true,
    features: {
      registration: true,
      classes: true,
      stripe_payments: true,
      activities: true,
      fundraising: false,
      service_points: false,
      basic_reports: true,
      advanced_reports: true,
      custom_branding: false,
      priority_support: false,
    },
  },
  {
    id: 'bloom',
    name: 'Bloom',
    icon: Flower2,
    price: '$500',
    period: 'per year',
    students: 'Up to 500 students',
    desc: 'Full-featured for established schools and programs.',
    cta: '/signup?plan=bloom',
    popular: false,
    features: {
      registration: true,
      classes: true,
      stripe_payments: true,
      activities: true,
      fundraising: true,
      service_points: true,
      basic_reports: true,
      advanced_reports: true,
      custom_branding: true,
      priority_support: false,
    },
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    icon: TreePine,
    price: '$1,000',
    period: 'per year',
    students: 'Unlimited students',
    desc: 'Enterprise-grade for large institutions. Priority support included.',
    cta: '/signup?plan=evergreen',
    popular: false,
    features: {
      registration: true,
      classes: true,
      stripe_payments: true,
      activities: true,
      fundraising: true,
      service_points: true,
      basic_reports: true,
      advanced_reports: true,
      custom_branding: true,
      priority_support: true,
    },
  },
]

const featureLabels: Record<string, string> = {
  registration: 'Student Registration',
  classes: 'Class Management',
  stripe_payments: 'Credit Card Payments',
  activities: 'Extra-curricular Activities',
  fundraising: 'Fundraising Management',
  service_points: 'Service Points & Tuition Deduction',
  basic_reports: 'Basic Reports',
  advanced_reports: 'Advanced Analytics',
  custom_branding: 'Custom Branding',
  priority_support: 'Priority Support',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">Plans for every classroom</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible pricing for single-teacher classrooms up to district-wide deployments.
            Paid plans include a <span className="font-semibold text-primary">3-month free trial</span>.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between p-6 rounded-lg border border-border bg-card shadow-sm ${tier.popular ? 'ring-2 ring-primary/30 scale-[1.02]' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    Recommended
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span aria-hidden>
                    {tier.icon && <tier.icon className="w-8 h-8 text-primary" />}
                  </span>
                  <span>{tier.name}</span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>

                <div className="mt-2 h-6">
                  {tier.price !== '$0' && (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      3-month free trial
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="font-medium text-foreground">{tier.students}</li>
                  <li>Custom subdomain</li>
                </ul>
              </div>

              <div className="mt-6">
                <Link href={tier.cta}>
                  <Button
                    variant={tier.popular ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {tier.price === '$0' ? 'Get started — free' : `Start trial`}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20 mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center mb-8">Compare all features</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-3 px-2 font-semibold">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium">Student Capacity</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-2 text-muted-foreground">
                      {tier.students.replace('Up to ', '')}
                    </td>
                  ))}
                </tr>
                {Object.entries(featureLabels).map(([key, label]) => (
                  <tr key={key} className="border-b">
                    <td className="py-3 pr-4">{label}</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="text-center py-3 px-2">
                        {tier.features[key as keyof typeof tier.features] ? (
                          <Check className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
