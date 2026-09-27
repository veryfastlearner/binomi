import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { entryApi } from '@/lib/api';

type User = {
  user_id: string;
  name: string;
  questionnaire: Record<string, any>;
  photos?: string[];
  profile_picture_url?: string;
  created_at?: string;
  updated_at?: string;
};

type EntryContextType = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  createEntry: (name: string, questionnaire?: Record<string, any>) => Promise<User>;
  fetchEntry: (userId: string) => Promise<User | null>;
  updateEntry: (userId: string, data: { name?: string; questionnaire?: Record<string, any> }) => Promise<User>;
  hasQuestionnaire: boolean;
};

const EntryContext = createContext<EntryContextType | null>(null);

export function EntryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore user from localStorage
    const savedUserId = localStorage.getItem('binomi_user_id');
    if (savedUserId) {
      entryApi.get(savedUserId).then(({ user }) => setUser(user)).catch(() => setUser(null)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (name: string, questionnaire?: Record<string, any>) => {
    const { user: newUser } = await entryApi.create({ name, questionnaire: questionnaire || {} });
    localStorage.setItem('binomi_user_id', newUser.user_id);
    setUser(newUser);
    return newUser;
  }, []);

  const fetchEntry = useCallback(async (userId: string) => {
    try {
      const { user: fetchedUser } = await entryApi.get(userId);
      setUser(fetchedUser);
      localStorage.setItem('binomi_user_id', fetchedUser.user_id);
      return fetchedUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const updateEntry = useCallback(async (userId: string, data: { name?: string; questionnaire?: Record<string, any> }) => {
    const { user: updatedUser } = await entryApi.update(userId, data);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const hasQuestionnaire = !!user?.questionnaire && Object.keys(user.questionnaire).length > 0;

  return (
    <EntryContext.Provider value={{ user, loading, setUser, createEntry, fetchEntry, updateEntry, hasQuestionnaire }}>
      {children}
    </EntryContext.Provider>
  );
}

export const useEntry = () => {
  const ctx = useContext(EntryContext);
  if (!ctx) throw new Error('useEntry must be inside EntryProvider');
  return ctx;
};