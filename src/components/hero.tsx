const Hero: React.FC = () => {
  const latestEvent = {
    title: "MNET x MDN Tech Futures Industries",
    timestamp: new Date(),
  };
  return (
    <div className="absolute top-0 bg-[url(/img/spacefabric.png)] bg-center bg-cover w-full h-full flex justify-center items-center">
      <div className="md:w-3/5 w-4/5">
        <p className="font-offbit font-bold md:text-2xl text-sm">
          {latestEvent.title}: {latestEvent.timestamp.getDay()}d{" "}
          {latestEvent.timestamp.getHours()}h{" "}
          {latestEvent.timestamp.getMinutes()}m{" "}
          {latestEvent.timestamp.getSeconds()}s
        </p>
        <h1 className="font-offbit-dot font-bold md:text-7xl text-5xl">
          MONASH NEXUS FOR EMERGING TECHNOLOGIES
        </h1>
        <h2 className="font-offbit font-bold md:text-2xl text-sm">
          A Monash University student team pushing the boundaries of XR.
        </h2>
        <br />
        <br />
        <div className="w-full flex justify-center">
          <button className="hover:cursor-pointer text-sm md:text-[1rem] font-offbit font-bold h-fit px-8 py-3 bg-primary rounded-md">
            OUR WORK -{">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
