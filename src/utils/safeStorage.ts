// localStorage and sessionStorage that never throw (site data blocked, some private modes, a full
// quota): what can't be stored is kept in memory for this visit instead
const safe = (store: () => Storage) => {
  const memory: Record<string, string> = {};
  return {
    get: (key: string): string | null => {
      try {
        return store().getItem(key) ?? memory[key] ?? null;
      } catch {
        return memory[key] ?? null;
      }
    },
    // (true if it was really stored, so it'll still be there after a reload)
    set: (key: string, value: string): boolean => {
      memory[key] = value;
      try {
        store().setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove: (key: string) => {
      delete memory[key];
      try {
        store().removeItem(key);
      } catch {
        // (nothing stored to remove)
      }
    },
  };
};

export const local = safe(() => localStorage);
export const session = safe(() => sessionStorage);
