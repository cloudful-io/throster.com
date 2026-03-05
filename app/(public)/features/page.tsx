import Link from 'next/link';
import {
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  Award,
  BarChart3,
  ShieldCheck,
  Zap
} from 'lucide-react';

const features = [
  {
    title: 'Student Registration',
    description: 'Seamless online registration for families. Collect student details, emergency contacts, and medical info in one flow.',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: 'Automated Billing',
    description: 'Integrated credit card payments through Stripe for tuition and fees. Set up recurring plans or one-time deposits with flexible free or trial options.',
    icon: CreditCard,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    title: 'Classroom Management',
    description: 'Manage class rosters and schedules. Give teachers access to student lists and parent contact information.',
    icon: BookOpen,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    title: 'Extra-Curricular Signup',
    description: 'Enable signups for after-school activities, sports, and clubs. Handle limited capacity and separate activity fees.',
    icon: Calendar,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    title: 'Service Points System',
    description: 'Track volunteer hours and parent participation. Points earned can be automatically applied as tuition credits.',
    icon: Award,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    title: 'Advanced Reporting',
    description: 'Comprehensive dashboards for administrators. Track enrollment trends, donation goals, and financial health.',
    icon: BarChart3,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Zap className="h-4 w-4" />
            <span>Built for Modern Education</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground mb-6">
            The complete toolkit for <span className="text-primary">weekend schools</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Throster replaces fragmented spreadsheets or adhoc web services with a <span className="text-primary font-semibold">unified platform</span> for registration, tuition, billing, and community engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg}`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-500 mb-6">
                <ShieldCheck className="h-4 w-4" />
                <span>Enterprise-Grade Security</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-6">
                Your data is isolated. <br />Your community is safe.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every school on Throster runs in its own secure tenant. We use PostgreSQL Row-Level Security (RLS) and bank-level encryption via Stripe to ensure student data and financial transactions are never compromised.
              </p>
              <ul className="space-y-4">
                {[
                  'Strict data segregation between schools',
                  'GDPR & CCPA ready data handling',
                  'Secure Stripe-powered payments',
                  'Role-based access controls for staff'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-1">
                <div className="h-full w-full rounded-[inherit] bg-card border border-border flex items-center justify-center relative overflow-hidden">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <ShieldCheck className="h-32 w-32 text-primary/40 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary-foreground mb-6">
            Ready to transform your school?
          </h2>
          <p className="mx-auto max-w-xl text-lg text-primary-foreground/80 mb-10">
            Join this revolution using Throster to manage their weekend programs more efficiently.
          </p>
          <Link
            href="/signup"
            className="rounded-full bg-background px-10 py-4 text-lg font-bold text-primary transition-all hover:bg-slate-50 hover:scale-105"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
