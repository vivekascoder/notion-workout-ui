import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Store = {
  notionToken: string;
  databaseId: string;
  hasHydrated: boolean;
  setup(token: string, id: string): void;
  setHasHydrated(state: boolean): void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      notionToken: "",
      databaseId: "",
      hasHydrated: false,
      setup: (token, id) => {
        set({ notionToken: token, databaseId: id });
      },
      setHasHydrated: (state) => {
        set({
          hasHydrated: state,
        });
      },
    }),
    {
      name: "track-store", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
