const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

const MemberCardSkeleton = ({ size = "normal" }: { size?: "normal" | "small" }) => {
  const dim = size === "small" ? "w-20 h-20 md:w-28 md:h-28" : "w-24 h-24 md:w-36 md:h-36";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`animate-pulse rounded-full bg-white/20 ${dim}`} />
      <Pulse className="h-5 w-24" />
      <Pulse className="h-4 w-16" />
    </div>
  );
};

export default function AboutUsLoading() {
  return (
    <div className="w-full flex flex-col bg-black">
      {/* Our Story */}
      <section className="flex flex-col p-[4vw] pb-0 md:p-[8vw] pt-[20vh] md:pt-[25vh] gap-6 md:gap-8 items-center">
        <Pulse className="h-16 md:h-20 w-72 md:w-[28rem]" />
        <Pulse className="h-4 w-full max-w-4xl" />
        <Pulse className="h-4 w-5/6 max-w-4xl" />
        <Pulse className="h-4 w-4/6 max-w-4xl" />
        <div className="w-full flex flex-col md:flex-row gap-6 items-stretch max-w-6xl mt-4 p-4">
          <Pulse className="flex-1 aspect-video rounded-3xl" />
          <div className="flex-1 max-w-xs flex flex-col gap-4">
            <Pulse className="flex-1 rounded-3xl min-h-32" />
            <Pulse className="flex-1 rounded-3xl min-h-32" />
          </div>
        </div>
      </section>

      {/* Our Values placeholder */}
      <div className="w-full mt-12 px-8 md:px-16 py-12">
        <Pulse className="h-16 w-56 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <Pulse key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Meet the Team heading */}
      <div className="px-8 md:px-16 py-8 md:py-16 text-center">
        <Pulse className="h-16 md:h-20 w-80 md:w-[28rem] mx-auto" />
      </div>

      {/* Academic Advisors - dark gray bg */}
      <div className="w-full bg-[#2D2D2D] px-8 md:px-16 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 mb-10 max-w-7xl mx-auto">
          <div className="flex-1 flex flex-col gap-3">
            <Pulse className="h-12 w-64" />
            <Pulse className="h-5 w-72" />
          </div>
          <Pulse className="w-full md:w-80 aspect-4/3 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[...Array(3)].map((_, i) => <MemberCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Leads - blue bg */}
      <div className="w-full bg-[#030CAB]/80 px-8 md:px-16 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 mb-10 max-w-7xl mx-auto">
          <div className="flex-1 flex flex-col gap-3">
            <Pulse className="h-12 w-32" />
            <Pulse className="h-5 w-48" />
          </div>
          <Pulse className="w-full md:w-80 aspect-4/3 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[...Array(8)].map((_, i) => <MemberCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Team Structure */}
      <div className="px-4 md:px-16 py-12 md:py-16 max-w-7xl mx-auto w-full">
        <Pulse className="h-14 w-72 mx-auto mb-10" />
        <div className="flex flex-col gap-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-6 flex flex-col gap-3">
              <Pulse className="h-8 w-40 mx-auto" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[...Array(5)].map((_, j) => <Pulse key={j} className="h-5" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
