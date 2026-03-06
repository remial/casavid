import { create } from "zustand";

type NewStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewDoc = create<NewStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
