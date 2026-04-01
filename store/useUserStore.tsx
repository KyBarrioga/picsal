import { create } from "zustand";

type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  profile_picture: string | null;
  can_access: boolean;
};

type UserStore = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));