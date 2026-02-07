import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf, Sprout, Sun, Flower2 } from 'lucide-react'

const tiers = [
  {
    id: 'seed',
    name: 'Seed',
    icon: Leaf,
    price: '$0',
    period: 'free',
    students: 'Up to 10 students',
    desc: 'Get started with a single subdomain and basic features.',
    cta: '/signup',
    popular: false,
  },
  {
    id: 'grow',
    name: 'Grow',
    icon: Sprout,
    price: '$100',
    period: 'per year',
    students: 'Up to 100 students',
    desc: 'For small schools getting organized.',
    cta: '/signup',
    popular: false,
  },
  {
    id: 'flourish',
    name: 'Flourish',
    icon: Sun,
    price: '$250',
    period: 'per year',
    students: 'Up to 250 students',
    desc: 'Our recommended plan for growing classrooms.',
    cta: '/signup',
    popular: true,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    icon: Flower2,
    price: '$500',
    period: 'per year',
    students: 'Up to 500 students',
    desc: 'For established institutions and large programs.',
    cta: '/signup',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">Plans for every classroom</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible pricing for single-teacher classrooms up to district-wide deployments. Pay annually and save.
          </p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between p-6 rounded-lg border border-border bg-card shadow-sm ${tier.popular ? 'ring-2 ring-primary/30 scale-102' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">Recommended</div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span aria-hidden>
                    {tier.icon && <tier.icon className="w-8 h-8 text-primary" />}
                  </span>
                  <span>{tier.name}</span>
                </h3>
                <p className="mt-2 text-muted-foreground">{tier.desc}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>{tier.students}</li>
                  <li>Custom subdomain</li>
                  <li>Basic analytics</li>
                </ul>
              </div>

              <div className="mt-6">
                <Link href={tier.cta}>
                  <Button variant={tier.id === 'seed' ? 'default' : 'default'} className="w-full">
                    {tier.price === '$0' ? 'Get started — free' : `Buy ${tier.name}`}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
