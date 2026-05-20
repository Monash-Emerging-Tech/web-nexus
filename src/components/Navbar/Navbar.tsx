// "use client";

// import NavbarContent from "./NavbarContent";

// const Navbar = () => {

//   return (
//     <>
//       <NavbarContent />
//     </>
//   )
// }

// export default Navbar;

"use client";

import { Navbar as OldNavbar } from "./OldNavbar";

const Navbar = () => {
  return <OldNavbar disableContextCursor={true} />;
};

export default Navbar;