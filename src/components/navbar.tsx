import Image from "next/image";

const NavBar: React.FC = () => {
  return (
    <div className="p-9 bg-black rounded-3xl flex flex-row justify-between items-center w-full  gap-5 border-2 border-[#2C2C2D]">
      <div className="flex flex-row gap-6 items-center">
        <Image
          width={128}
          height={128}
          className="w-14 h-14"
          src="/assets/logo.png"
          alt="3d cube that has an illusion of having overlapping sides"
        />
        <div className="flex flex-col">
          <h1 className="text-3xl">MNET</h1>
          <h2 className="">MONASH NEXUS FOR EMERGING TECHNOLOGIES</h2>
        </div>
      </div>
      <div className="flex flex-row gap-6 items-center">
        <button className="hover:cursor-pointer h-fit px-8 py-2 bg-[#DC003B] rounded-md">
          CONTACT
        </button>
        <Image
          src="/assets/menu.svg"
          width={64}
          height={64}
          alt="hamberguer icon"
        ></Image>
      </div>
    </div>
  );
};

export default NavBar;
