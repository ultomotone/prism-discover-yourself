// Minimal, fetch-based client for Supabase Edge Functions (Deno). No external imports.

type Result<T> = { data: T | null; error: { message: string; status?: number } | null; count?: number };

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

      type FilterOp = { key: string; op: string; value: string };
      function buildUrl(params: Record<string, string>) {
        return base + "?" + new URLSearchParams(params).toString();
      }

      class Builder implements PromiseLike<Result<any>> {
        private method = "GET";
        private selectCols = "*";
        private filters: FilterOp[] = [];
        private orders: { key: string; asc: boolean }[] = [];
        private limitVal?: number;
        private head = false;
        private count?: string;
        private body: any = null;
        prefer: string[] = [];
        private wantSingle = false;
        private wantMaybe = false;
        extraHeaders: Record<string, string> = {};

        constructor(method: string, body: any = null) {
          this.method = method;
          this.body = body;
        }

        // ---- modifiers ----
        eq(key: string, value: string | number | boolean) {
          this.filters.push({ key, op: "eq", value: String(value) });
          return this;
        }

        in(key: string, values: (string | number)[]) {
          this.filters.push({ key, op: "in", value: `(${values.join(",")})` });
          return this;
        }

        order(key: string, opts: { ascending?: boolean } = {}) {
          this.orders.push({ key, asc: opts.ascending !== false });
          return this;
        }

        limit(n: number) {
          this.limitVal = n;
          return this;
        }

        select(columns: string, opts: { head?: boolean; count?: string } = {}) {
          this.selectCols = columns;
          this.head = opts.head === true;
          this.count = opts.count;
          if (opts.count) this.prefer.push(`count=${opts.count}`);
          return this;
        }

        maybeSingle() {
          this.wantMaybe = true;
          return this.execute();
        }

        single() {
          this.wantSingle = true;
          return this.execute();
        }

        then<TResult1 = Result<any>, TResult2 = never>(
          onfulfilled?: ((value: Result<any>) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
        ): PromiseLike<TResult1 | TResult2> {
          return this.execute().then(onfulfilled, onrejected);
        }

        async execute(): Promise<Result<any>> {
          const params: Record<string, string> = { select: this.selectCols };
          for (const f of this.filters) params[f.key] = `${f.op}.${f.value}`;
          if (this.orders.length)
            params.order = this.orders
              .map((o) => `${o.key}.${o.asc ? "asc" : "desc"}`)
              .join(",");
          if (this.limitVal !== undefined) params.limit = String(this.limitVal);
          const url = buildUrl(params);
          const h = { ...headers(), ...this.extraHeaders };
          if (this.prefer.length) h.Prefer = this.prefer.join(",");
          const res = await fetch(url, {
            method: this.head ? "HEAD" : this.method,
            headers: h,
            body: this.body ? JSON.stringify(this.body) : undefined,
          });
          if (!res.ok)
            return { data: null, error: { message: await res.text(), status: res.status } };
          let data: any = null;
          if (!this.head) {
            try {
              data = await res.json();
            } catch {
              data = null;
            }
          }
          if (this.wantSingle || this.wantMaybe) data = Array.isArray(data) ? data[0] ?? null : data;
          let count: number | undefined;
          if (this.count) {
            const cr = res.headers.get("content-range");
            if (cr) {
              const m = cr.match(/\/(\d+)$/);
              if (m) count = parseInt(m[1], 10);
            }
          }
          return { data, error: null, ...(count !== undefined ? { count } : {}) };
        }
      }

      return {
        select(columns = "*", opts: { head?: boolean; count?: string } = {}) {
          return new Builder("GET").select(columns, opts);
        },
        insert(rows: unknown, { returning = "representation" as "representation" | "minimal" } = {}) {
          const b = new Builder("POST", rows);
          b.prefer.push(`return=${returning}`);
          return b;
        },
        upsert(
          rows: unknown,
          { onConflict, ignoreDuplicates = false, returning = "representation" as "representation" | "minimal" }: { onConflict?: string; ignoreDuplicates?: boolean; returning?: "representation" | "minimal" } = {}
        ) {
          const b = new Builder("POST", rows);
          b.prefer.push(
            `resolution=${ignoreDuplicates ? "ignore-duplicates" : "merge-duplicates"},return=${returning}`
          );
          if (onConflict) (b as any).extraHeaders = { "On-Conflict": onConflict };
          return b;
        },
        update(patch: unknown, _opts = {}) {
          const b = new Builder("PATCH", patch);
          b.prefer.push("return=representation");
          return b;
        },
        delete(_filters?: Record<string, unknown>) {
          const b = new Builder("DELETE");
          b.prefer.push("return=representation");
          return b;
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

