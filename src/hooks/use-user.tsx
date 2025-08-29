"use client";

import { createContext, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';

const UserContext = createContext<{ user: User | null }>({ user: null });

export const UserProvider = ({ user, children }: { user: User; children: ReactNode }) => {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
