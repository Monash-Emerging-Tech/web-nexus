"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full h-full">
      {open ? (
        <div className="absolute z-10 top-0 left-0 w-full h-full bg-black opacity-80">
          <div className="absolute right-4 top-40 bg-gradient-to-b from-[#030CAB] to-[#DC003B] p-0.5 rounded-3xl">
            <div className="flex flex-col bg-black rounded-3xl py-4 px-8 gap-4 font-offbit font-bold text-2xl items-center border-2 border-[#2C2C2D]">
              <Link className="hover:opacity-100 opacity-75" href={"/"}>
                Home
              </Link>
              <Link className="hover:opacity-100 opacity-75" href={"/projects"}>
                Projects
              </Link>
              <Link className="hover:opacity-100 opacity-75" href={"/events"}>
                Events
              </Link>
              <Link className="hover:opacity-100 opacity-75" href={"/about-us"}>
                About Us
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <div className="m-4 md:p-7 p-3 z-10 bg-[#00050] rounded-3xl flex flex-row justify-between items-center gap-5 border-2 border-[#2C2C2D] backdrop-blur-md sticky top-0">
        <div className="flex flex-row gap-6 items-center z-20">
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
        <div className="flex flex-row gap-6 items-center z-20">
          <button className="hover:cursor-pointer md:flex font-offbit font-bold hidden h-fit px-8 py-3 bg-primary rounded-md">
            CONTACT
          </button>
          <Image
            onClick={() => {
              setOpen((prev) => !prev);
            }}
            className="hover:cursor-pointer"
            src="/img/menu.svg"
            width={40}
            height={40}
            alt="hamburger icon"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
