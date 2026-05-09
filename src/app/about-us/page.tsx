import Image from "next/image"

export default function AboutUs() {

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col p-[4vw] pb-0 md:p-[8vw] pt-[25vh] md:pt-[30vh] gap-2 md:gap-4 items-center justify-center">
        <h1 className="text-white text-4xl md:text-5xl font-offbit-dot font-bold text-center">Our Story</h1>
        <p className="text-white text-lg md:text-lg font-offbit text-center md:max-w-2/3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
           Mauris tempus sem vel nisi porttitor blandit.
            Ut vel felis eu dolor fringilla vestibulum.
             Vivamus a porttitor lectus. Mauris placerat,
              justo sit amet accumsan accumsan,
               dui orci dapibus ligula,
                sit amet porttitor nibh ante eu diam.
        </p>
        <div className="w-full flex flex-row gap-4 items-stretch justify-center p-4">
          <div className="flex-1 min-w-0">
            <Image
              src={"/img/About-Team.jpg"}
              alt="About Team"
              width={1000}
              height={800}
              className="w-full h-full aspect-video rounded-3xl object-cover object-[10%_20%] border-[#DC003B] border-4"
            />
          </div>
          <div className="flex-1 max-w-xs flex flex-col gap-4 items-center justify-center">
            <Image
              src={"/img/About-Showcase-Temp.jpg"}
              alt="Showcase"
              width={1000}
              height={800}
              className="w-full h-1/2 rounded-3xl object-cover border-[#DC003B] border-4"
            />
            <Image
              src={"/img/About-Focus-Temp.jpg"}
              alt="Team Focus"
              width={1000}
              height={800}
              className="w-full h-1/2 rounded-3xl object-cover border-[#DC003B] border-4"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse md:flex-row p-[8vw] pt-0 gap-8 md:gap-20">
        <div className="flex-1 flex flex-col gap-2 md:gap-4 items-baseline justify-start">
          <h1 className="text-white text-4xl md:text-5xl font-offbit-101 font-bold text-left">
            Meet our team
          </h1>
          <p className="text-white text-lg md:text-lg font-offbit text-left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris tempus sem vel nisi porttitor blandit.
              Ut vel felis eu dolor fringilla vestibulum.
              Vivamus a porttitor lectus. Mauris placerat,
                justo sit amet accumsan accumsan,
                dui orci dapibus ligula,
                  sit amet porttitor nibh ante eu diam.
          </p>
          <a href="/team" 
            className="text-white text-md font-semibold bg-[#DC003B] my-4 md:my-8 px-6 py-2 rounded-lg font-offbit cursor-pointer"
          >
            LEARN MORE &rarr;
          </a>
        </div>
        <Image
          src={"/img/About-Meet-Team-Temp.jpg"}
          alt="Meet the Team"
          width={1000}
          height={800}
          className="md:max-w-1/2 flex-1 rounded-3xl object-cover border-[#DC003B] border-4"
        />
      </div>
    </div>
  );
}
