import Link from 'next/link';
import RotatingQuote from '@/app/(public)/components/RotatingQuote';
import {
  Heart,
  Globe,
  Shield,
  DollarSign,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground mb-8">
              Built by educators, <br />
              <span className="text-primary">for communities.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Throster was born out of a simple observation: weekend language schools are the heart of cultural preservation, yet they are often underserved by modern technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that managing a school shouldn&apos;t be a burden for volunteers and community leaders. Our mission is to provide professional-grade tools that are simple enough for anyone to use, ensuring that the next generation remains connected to their heritage.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <Heart className="h-8 w-8 text-rose-500 mb-4" />
                  <h4 className="font-bold mb-2">Community First</h4>
                  <p className="text-sm text-muted-foreground">Every feature is designed to strengthen ties among parents, teachers, and students.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <Globe className="h-8 w-8 text-blue-500 mb-4" />
                  <h4 className="font-bold mb-2">Heritage Focused</h4>
                  <p className="text-sm text-muted-foreground">Customizable modules for class registration, cultural activities, fundraising, and service points.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden border border-border">
                <div className="p-8 md:p-12 w-full">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-8" />
                  <RotatingQuote />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Throster */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Why choose Throster?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We bridge the gap between volunteer-led passion and professional administration.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'No Tech Setup',
                desc: "Sign up, choose your subdomain, and you're live in minutes. No hosting or maintenance required.",
                icon: Shield
              },
              {
                title: 'Pricing based on Needs',
                desc: 'From free tiers for seed schools to unlimited plans for large academies. Scale as you grow.  Cheapest plan starts at $100 a year.',
                icon: DollarSign
              },
              {
                title: 'Modern Experience',
                desc: 'A beautiful, mobile-first interface that parents actually enjoy using for registration.',
                icon: Sparkles
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 transition-colors hover:bg-muted/50 rounded-2xl">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-slate-900 dark:bg-slate-800 p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                Ready to empower your school?
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Start for free or try a 3-month trial today. No credit card required.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground hover:scale-105 transition-all"
              >
                Create My School
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32" />
          </div>
        </div>
      </section>
    </div>
  );
}
