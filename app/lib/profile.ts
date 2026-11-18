import { create } from "zustand";
import { usePuterStore } from "./puter";

// The user's GloUp profile, kept in their Puter KV store. Puter can assign
// random usernames (temporary accounts), so we ask people what to call them
// and show that instead.
const PROFILE_KEY = "profile";
export const MAX_NAME_LENGTH = 30;

interface StoredProfile {
  displayName: string;
  updatedAt: number;
}

interface ProfileState {
  displayName: string | null;
  /** true once we've checked KV for this user (so "no name yet" is known, not just "still loading") */
  loaded: boolean;
  /** the name editor opened from the account menu */
  editing: boolean;
  load: () => Promise<void>;
  save: (name: string) => Promise<void>;
  reset: () => void;
  openEditor: () => void;
  closeEditor: () => void;
}

export const useProfile = create<ProfileState>((set) => ({
  displayName: null,
  loaded: false,
  editing: false,

  load: async () => {
    try {
      const raw = await usePuterStore.getState().kv.get(PROFILE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<StoredProfile>) : null;
      const name = typeof parsed?.displayName === "string" ? parsed.displayName.trim() : "";
      set({ displayName: name || null, loaded: true });
    } catch {
      // unreadable profile: treat as "no name yet" so the user can set one again
      set({ displayName: null, loaded: true });
    }
  },

  save: async (name) => {
    const displayName = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!displayName) throw new Error("Please enter a name.");
    const ok = await usePuterStore
      .getState()
      .kv.set(PROFILE_KEY, JSON.stringify({ displayName, updatedAt: Date.now() } satisfies StoredProfile));
    if (ok === undefined || ok === false) throw new Error("Couldn't save your name. Try again.");
    set({ displayName, editing: false });
  },

  reset: () => set({ displayName: null, loaded: false, editing: false }),
  openEditor: () => set({ editing: true }),
  closeEditor: () => set({ editing: false }),
}));

/**
 * The name to show for the signed-in user: their chosen name, else their
 * Puter username if it's a real (non-temporary) account. Null while unknown,
 * so we never flash a random temporary username.
 */
export function useDisplayName(): string | null {
  const user = usePuterStore((s) => s.auth.user);
  const { displayName, loaded } = useProfile();
  if (displayName) return displayName;
  if (loaded && user && !user.is_temp) return user.username;
  return null;
}
