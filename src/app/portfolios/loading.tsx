const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

export default function PortfoliosLoading() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        <Pulse className="h-[160px] w-72 mb-4" />
        <Pulse className="h-8 w-48 mb-8" />
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3 border-2 border-white/10 rounded-3xl p-4 bg-white/5">
              <Pulse className="h-7 w-3/4" />
              <Pulse className="h-5 w-full" />
              <Pulse className="w-full aspect-video rounded-xl" />
              <Pulse className="h-4 w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
