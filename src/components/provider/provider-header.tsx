export default function ProviderHeader({
  provider,
}: {
  provider: {
    businessName: string;
    user?: { name: string | null; email: string | null };
  };
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-secondary">
              {provider.businessName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {provider.businessName}
            </h1>
            <p className="text-sm text-gray-600">{provider.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
