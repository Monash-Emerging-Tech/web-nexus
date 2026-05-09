"use client";

import React, { useState, createContext, useContext, ReactNode } from 'react';

interface NavbarContextType {
  open: boolean;
  toggleOpen: () => void;
}

const NavbarContext = createContext<NavbarContextType>({
  open: false,
  toggleOpen: () => {},
});

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  }

  return (
    <NavbarContext.Provider value={{ open, toggleOpen }}>
      {children}
    </NavbarContext.Provider>
  )
}