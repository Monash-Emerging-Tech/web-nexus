"use client";

import React, { useState, createContext, useContext, ReactNode } from 'react';

interface NavBarContextType {
  open: boolean;
  toggleOpen: () => void;
}

const NavBarContext = createContext<NavBarContextType>({
  open: false,
  toggleOpen: () => {},
});

export const useNavBar = () => {
  const context = useContext(NavBarContext);
  if (!context) {
    throw new Error('useNavBar must be used within a NavBarProvider');
  }
  return context;
};

export const NavBarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  }

  return (
    <NavBarContext.Provider value={{ open, toggleOpen }}>
      {children}
    </NavBarContext.Provider>
  )
}