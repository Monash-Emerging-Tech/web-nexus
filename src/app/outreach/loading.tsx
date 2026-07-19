const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

const EventCardSkeleton = () => (
  <div className="flex flex-col rounded-3xl p-4 bg-white/5 border border-white/10 h-full min-h-[380px]">
    {/* Title */}
    <Pulse className="h-8 w-3/4 mb-2" />
    {/* Description */}
    <Pulse className="h-6 w-1/2 mb-4" />
    {/* Image */}
    <Pulse className="w-full aspect-video rounded-xl mb-4" />
    {/* Date */}
    <Pulse className="h-5 w-24 ml-auto mt-auto" />
  </div>
);

export default function OutreachLoading() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        {/* Main page heading */}
        <h1 className="text-5xl sm:text-6xl md:text-header font-bold text-neutral-100 text-left font-offbit-dot mb-12 md:mb-16 h-auto md:h-[160px]">
          Outreach
        </h1>

        {/* Upcoming Outreach Section */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Upcoming Outreach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch">
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Past Outreach Section */}
        <div>
          <h2 className="text-3xl sm:text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Past Outreach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch">
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

