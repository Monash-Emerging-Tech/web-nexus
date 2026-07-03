const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

export default function PortfolioSlugLoading() {
  return (
    <main className="flex min-h-screen flex-col bg-black px-4 sm:px-8 py-12 text-white items-center pt-32 pb-24">
      <div className="mx-auto flex max-w-7xl w-full flex-col gap-12">
        {/* Hero */}
        <div className="flex flex-col gap-6">
          <Pulse className="h-16 md:h-24 w-3/4" />
          <Pulse className="h-6 w-1/2" />
          <Pulse className="w-full aspect-video rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Pulse className="h-5 w-24" />
                <Pulse className="h-4 w-32" />
                <Pulse className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
        {/* Content blocks */}
        <div className="flex flex-col gap-4 max-w-3xl">
          {[...Array(8)].map((_, i) => (
            <Pulse key={i} className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
