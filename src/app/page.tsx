"use server"

import Hero from "@/components/Hero";

const Home = async () => {
  return (
    <div className="relative">
      <Hero />
      {/* Projects and Events sections — uncomment when ready */}
      {/* <div className="bg-[url(/img/wireframe_1.png)] bg-[length:120%] bg-no-repeat bg-[position:-100px_50px]">
        <Projects data={projectData} />
        <EventsHolder data={eventData} />
      </div> */}
    </div>
  );
}

export default Home;
