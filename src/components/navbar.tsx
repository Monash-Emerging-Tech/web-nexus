import Image from "next/image";

const NavBar: React.FC = () => {
  return (
    <div className="md:p-9 p-3 bg-[#0000004B] rounded-3xl flex flex-row justify-between items-center w-full  gap-5 border-2 border-[#2C2C2D]">
      <div className="flex flex-row gap-6 items-center">
        <Image
          width={128}
          height={128}
          className="md:w-16 md:h-16 w-12 h-12"
          src="/assets/logo.png"
          alt="3d cube that has an illusion of having overlapping sides"
        />
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold font-offbit">MNET</h1>
          <h2 className="md:flex hidden font-bold font-offbit">
            MONASH NEXUS FOR EMERGING TECHNOLOGIES
          </h2>
        </div>
      </div>
      <div className="flex flex-row gap-6 items-center">
        <button className="hover:cursor-pointer md:flex font-offbit font-bold hidden h-fit px-8 py-3 bg-[#DC003B] rounded-md">
          CONTACT
        </button>
        <Image
          src="/assets/menu.svg"
          width={40}
          height={40}
          alt="hamberguer icon"
        ></Image>
      </div>
    </div>
  );
};

export default NavBar;
