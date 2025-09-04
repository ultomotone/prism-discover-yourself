// Minimal, fetch-based client for Supabase Edge Functions (Deno). No external imports.

type Result<T> = { data: T | null; error: { message: string; status?: number } | null };

type CreateClientOptions = {
  /** Pass the incoming Request when you want user-context (RLS) */
  req?: Request;
  /** Force service role for elevated operations */
  serviceRole?: boolean;
  /** Optional: override URL/keys if you need */
  supabaseUrl?: string;
  anonKey?: string;
  serviceRoleKey?: string;
};

const env = (k: string) => {
  const v = Deno.env.get(k);
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

function bearerFromReq(req?: Request) {
  const h = req?.headers?.get("authorization") || req?.headers?.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export function createClient(opts: CreateClientOptions = {}) {
  const supabaseUrl = opts.supabaseUrl ?? env("SUPABASE_URL");
  const anonKey = opts.anonKey ?? env("SUPABASE_ANON_KEY");
  const serviceKey = opts.serviceRoleKey ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const userJwt = bearerFromReq(opts.req);
  const useService = opts.serviceRole === true;

  function headers(json = true) {
    const h: Record<string, string> = {
      apikey: useService ? serviceKey : anonKey,
    };
    const token = useService ? serviceKey : userJwt;
    if (token) h.Authorization = `Bearer ${token}`;
    if (json) h["Content-Type"] = "application/json";
    return h;
  }

  return {
    // -------- auth --------
    auth: {
      async getUser(): Promise<Result<any>> {
        if (!userJwt) return { data: null, error: { message: "Missing Bearer token" } };
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: { apikey: anonKey, Authorization: `Bearer ${userJwt}` },
        });
        if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
        const data = await res.json();
        return { data, error: null };
      },
    },

    // -------- postgrest --------
    from(table: string) {
      const base = `${supabaseUrl}/rest/v1/${encodeURIComponent(table)}`;

      const q = (params: Record<string, string>) =>
        base + "?" + new URLSearchParams(params).toString();

      return {
        async select(columns = "*", params: Record<string, string> = {}): Promise<Result<any>> {
          const url = q({ select: columns, ...params });
          const res = await fetch(url, { headers: headers(false) });
          if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
          const data = await res.json();
          return { data, error: null };
        },

        async insert(rows: unknown, { returning = "representation" as "representation" | "minimal" } = {}): Promise<Result<any>> {
          const res = await fetch(base, {
            method: "POST",
            headers: { ...headers(), Prefer: `return=${returning}` },
            body: JSON.stringify(rows),
          });
          if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
          const data = returning === "minimal" ? null : await res.json();
          return { data, error: null };
        },

        async upsert(
          rows: unknown,
          { onConflict, ignoreDuplicates = false, returning = "representation" as "representation" | "minimal" }: { onConflict?: string; ignoreDuplicates?: boolean; returning?: "representation" | "minimal" } = {}
        ): Promise<Result<any>> {
          const h = {
            ...headers(),
            Prefer: `resolution=${ignoreDuplicates ? "ignore-duplicates" : "merge-duplicates"},return=${returning}`,
          } as Record<string, string>;
          if (onConflict) h["On-Conflict"] = onConflict;
          const res = await fetch(base, { method: "POST", headers: h, body: JSON.stringify(rows) });
          if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
          const data = returning === "minimal" ? null : await res.json();
          return { data, error: null };
        },

        async update(patch: unknown, filters: Record<string, string | number | boolean>): Promise<Result<any>> {
          const url = q(Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, `eq.${v}`])));
          const res = await fetch(url, {
            method: "PATCH",
            headers: { ...headers(), Prefer: "return=representation" },
            body: JSON.stringify(patch),
          });
          if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
          const data = await res.json();
          return { data, error: null };
        },

        async delete(filters: Record<string, string | number | boolean>): Promise<Result<any>> {
          const url = q(Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, `eq.${v}`])));
          const res = await fetch(url, { method: "DELETE", headers: { ...headers(), Prefer: "return=representation" } });
          if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
          const data = await res.json();
          return { data, error: null };
        },
      };
    },

    async rpc(fn: string, args?: Record<string, unknown>): Promise<Result<any>> {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${encodeURIComponent(fn)}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(args ?? {}),
      });
      if (!res.ok) return { data: null, error: { message: await res.text(), status: res.status } };
      const data = await res.json();
      return { data, error: null };
    },
  };
}

export type SupabaseClient = ReturnType<typeof createClient>;

// Optional helpers for clarity:
export const createUserClient = (req: Request) => createClient({ req });
export const createServiceClient = () => createClient({ serviceRole: true });

