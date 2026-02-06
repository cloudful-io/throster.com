export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="subdomain-layout">
      {/* Multi-tenant subdomain-specific components will go here */}
      {children}
    </div>
  );
}
