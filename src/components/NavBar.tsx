import Image from "next/image";

const NavBar: React.FC = () => {
  return (
    <div className="md:p-7 p-3 bg-black bg-opacity-75 rounded-3xl flex flex-row justify-between items-center w-full gap-5 border-2 border-[#2C2C2D] backdrop-blur-md">
      <div className="flex flex-row gap-6 items-center">
        <Image
          width={128}
          height={128}
          className="md:w-16 md:h-16 w-12 h-12"
          src="/img/logo.png"
          alt="MNET logo"
        />
        <div className="flex flex-col">
          <h1 className="md:text-3xl text-4xl font-offbit-dot font-bold">
            MNET
          </h1>
          <h2 className="md:flex hidden font-offbit font-bold">
            MONASH NEXUS FOR EMERGING TECHNOLOGIES
          </h2>
        </div>
      </div>
      <div className="flex flex-row gap-6 items-center">
        <button className="hover:cursor-pointer md:flex font-offbit font-bold hidden h-fit px-8 py-3 bg-primary rounded-md">
          CONTACT
        </button>
        <Image
          className="hover:cursor-pointer"
          src="/img/menu.svg"
          width={40}
          height={40}
          alt="hamburger icon"
        ></Image>
      </div>
    </div>
  );
};

export default NavBar;
