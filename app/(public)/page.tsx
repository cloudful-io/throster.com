import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, Heart, Award, Shield, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/classroom_hero.png"
            alt="Multi-ethnic classroom"
            fill
            className="object-cover"
            priority
          />
          {/* Muted Overlay - Increased opacity and blur for better focus on text */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[5px]" />
        </div>

        <div className="container relative mx-auto px-4 z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-5 py-2 text-sm font-semibold text-primary-foreground animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <Sparkles className="h-4 w-4" />
              <span>The Modern Standard for School Management</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.05]">
              Your school,<br />
              <span className="text-primary">elevated.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
              Registration, tuition payments, class and student management — all in one place.
              Experience a platform designed specifically for the unique needs of heritage and language communities.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
              <Link href="/signup">
                <Button size="lg"
                  className="text-xl px-12 py-8 rounded-full shadow-2xl shadow-primary/40 transition-all hover:scale-105 hover:brightness-110"
                >
                  Get started for free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 rounded-full text-white border-white/40 transition-all backdrop-blur-md bg-white/5 hover:scale-105 hover:brightness-110"
                >
                  View pricing
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-300 font-medium">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <span>No credit card required to start</span>
              <div className="h-1 w-1 rounded-full bg-primary ml-2" />
              <span>Free plan or 3-month trial for any paid plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t bg-card py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Everything your school needs and more...</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                color: 'text-blue-500',
                title: 'Student Registration',
                desc: 'Online registration with secure credit card payments. Parents self-enroll their children.',
              },
              {
                icon: BookOpen,
                color: "text-purple-500",
                title: 'Class Management',
                desc: 'Create classes, assign teachers, track enrollment, and manage waitlists.',
              },
              {
                icon: Calendar,
                color: "text-orange-500",
                title: 'Extra-curricular Activities',
                desc: 'Set up clubs, workshops, and activities with optional fees and signup limits.',
              },
              {
                icon: Heart,
                color: "text-indigo-500",
                title: 'Fundraising',
                desc: 'Launch fundraising campaigns with goals, progress tracking, and online donations.',
              },
              {
                icon: Award,
                color: "text-rose-500",
                title: 'Service Points',
                desc: 'Define volunteer activities, track points, and apply tuition deductions automatically.',
              },
              {
                icon: Shield,
                color: "text-emerald-500",
                title: 'Multi-Tenant',
                desc: 'Each school gets its own subdomain, data isolation, and branded experience.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border p-6">
                <feature.icon className={`h-8 w-8 mb-3 ${feature.color}`} />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Create your school in under 2 minutes.
        </p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Get started for free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
