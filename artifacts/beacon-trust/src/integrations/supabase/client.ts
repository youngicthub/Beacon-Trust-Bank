// Supabase has been removed. This file is a stub to catch any missed imports.
export const supabase = new Proxy({} as any, {
  get() {
    throw new Error('Supabase has been removed. Use apiFetch() from @/lib/api instead.');
  },
});
