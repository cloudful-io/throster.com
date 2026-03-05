import { getTenantBySubdomain, getUserProfile } from '@/lib/tenant';
import { signOutAction } from '@/app/actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { rootDomain } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return { title: rootDomain };
  }

  return {
    title: `${tenant.name} | Throster`,
    description: `Welcome to ${tenant.name} — powered by Throster`,
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    notFound();
  }

  // Check for authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await getUserProfile(tenant.id) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Public school landing page */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{tenant.name}</h1>
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Hello, {profile.firstName}
                </span>
                <a
                  href="/dashboard"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </a>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome to {tenant.name}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your weekend language school community. Register for classes,
            sign up for activities, and stay connected.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {profile ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center rounded-md border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Register for Classes
                </a>
              </div>
            ) : (
              <>
                <a
                  href="/register"
                  className="inline-flex items-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Register Now
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center rounded-md border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Log in
                </a>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by <a href={`https://${rootDomain}`} className="text-primary hover:underline">Throster</a>
        </div>
      </footer>
    </div>
  );
}
