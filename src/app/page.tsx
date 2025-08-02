export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8 text-primary">
            3W
          </h1>
          <p className="text-xl text-accent mb-12 max-w-2xl mx-auto">
            A minimal Next.js application built with Tailwind CSS v4 and the App Router.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card border border-border rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                Modern
              </h2>
              <p className="text-gray-600">
                Built with the latest Next.js App Router and Tailwind CSS v4.
              </p>
            </div>
            <div className="p-8 bg-gray-50 border border-border rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Minimal
              </h2>
              <p className="text-gray-600">
                Clean and simple design focusing on black, white, and gray tones.
              </p>
            </div>
            <div className="p-8 bg-card border border-border rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                Semantic
              </h2>
              <p className="text-gray-600">
                Using semantic color names defined in the global CSS theme.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
