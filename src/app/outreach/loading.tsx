const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

const EventCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl p-4 bg-white/5 border border-white/10 h-64">
    <Pulse className="w-full aspect-video rounded-xl flex-shrink-0" />
    <Pulse className="h-6 w-3/4" />
    <Pulse className="h-4 w-full" />
    <Pulse className="h-4 w-2/3" />
  </div>
);

export default function OutreachLoading() {
  return (
    <div className="mb-25">
      {/* Hero */}
      <div className="bg-[url(/img/events-background.png)] bg-cover bg-bottom w-full h-[30vh] md:h-[40vh] flex items-end">
        <div className="px-6 md:px-12 pb-6 m-auto pt-32">
          <h1 className="text-[4rem] md:text-[6rem] text-center font-offbit-dot font-bold">OUTREACH</h1>
        </div>
      </div>

      {/* Upcoming */}
      <div className="pt-6 md:pt-8 pr-6 pl-6 md:pr-24 md:pl-12 flex flex-col mb-2 md:mb-4">
        <Pulse className="h-12 md:h-20 w-72 md:w-[28rem]" />
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8">
        {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
      </div>

      {/* Past */}
      <div className="pt-6 md:pt-8 pr-6 pl-6 md:pr-24 md:pl-12 flex flex-col mb-2 md:mb-4">
        <Pulse className="h-12 md:h-20 w-56 md:w-80" />
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8">
        {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
