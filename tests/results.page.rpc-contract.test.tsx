// IMPORTANT: DOM setup before component imports
import "./setup/dom";

import test, { after, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const StubResultsView = ({ profile }: any) => (
  <div data-testid="results-loaded">profile:{profile?.type_code ?? "none"}</div>
);

(globalThis as any).window.__APP_CONFIG__ = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon",
};

const originalFetch = globalThis.fetch;

type FetchCall = { url: string; init?: RequestInit };

function createFetchStub(responseFactory: (call: FetchCall) => Response | Promise<Response>) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    return responseFactory({ url, init });
  }) as typeof fetch;
}

function successPayload(sessionId: string, typeCode = "LII") {
  return {
    ok: true,
    result_id: sessionId,
    scoring_version: "v2.0.0",
    results_version: "v2",
    profile: { type_code: typeCode, top_3_fits: [{ code: typeCode, fit: 72.1 }] },
    session: { id: sessionId, status: "completed" },
    types: Array.from({ length: 16 }, (_, index) => ({ type_code: `${typeCode}-${index}` })),
    functions: Array.from({ length: 8 }, (_, index) => ({ func: `F${index}` })),
    state: [{ overlay_band: "A" }],
  };
}

const { default: Results } = await import("@/pages/Results");
const { supabase, SUPABASE_ANON_KEY } = await import("@/lib/supabaseClient");

const originalChannel = supabase.channel.bind(supabase);
const originalRemoveChannel = supabase.removeChannel.bind(supabase);

function stubRealtime() {
  supabase.channel = ((name: string) => {
    const channel: any = {
      on: () => channel,
      subscribe: () => channel,
    };
    return channel;
  }) as typeof supabase.channel;

  supabase.removeChannel = (async () => ({ data: null, error: null })) as typeof supabase.removeChannel;
}

function restoreRealtime() {
  supabase.channel = originalChannel;
  supabase.removeChannel = originalRemoveChannel;
}

function renderResultsRoute(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/results/:sessionId"
            element={<Results components={{ ResultsView: StubResultsView }} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return queryClient;
}

beforeEach(() => {
  globalThis.fetch = originalFetch;
  stubRealtime();
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  restoreRealtime();
});

after(() => {
  globalThis.fetch = originalFetch;
  restoreRealtime();
});

test(
  "Results page → RPC contract + render: calls function with session + token and renders",
  async () => {
    const calls: Array<{ url: string; body: any; headers: Record<string, string> }> = [];
    createFetchStub(({ url, init }) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      const headers = new Headers(init?.headers ?? {});
      calls.push({ url, body, headers: Object.fromEntries(headers.entries()) });
      if (url.endsWith("/link_session_to_account")) {
        return new Response("{}", { status: 200 });
      }
      return new Response(JSON.stringify(successPayload(body.session_id)), { status: 200 });
    });

    const queryClient = renderResultsRoute(["/results/sess-123?t=tok-abc"]);

    await waitFor(() => {
      assert.ok(screen.getByTestId("results-loaded"));
    });

    queryClient.clear();

    const getResultsCall = calls.find((c) => c.url.endsWith("/get-results-by-session"));
    assert.ok(getResultsCall);
    assert.deepEqual(getResultsCall!.body, { session_id: "sess-123", share_token: "tok-abc" });
    assert.equal(getResultsCall!.headers.apikey, SUPABASE_ANON_KEY);
    assert.equal(getResultsCall!.headers.authorization, undefined);
  }
);

test(
  "Results page → RPC contract + render: surfaces error state when backend throws",
  async () => {
    createFetchStub(({ url }) => {
      if (url.endsWith("/link_session_to_account")) {
        return new Response("{}", { status: 200 });
      }
      return new Response("{\"error\":\"failure\"}", { status: 500 });
    });

    const queryClient = renderResultsRoute(["/results/sess-bad?t=tok"]);

    const error = await screen.findByText(/Unable to load results/i);
    assert.ok(error);

    queryClient.clear();
  }
);

test("Results page → invalid token surfaces explicit error UI", async () => {
  createFetchStub(({ url }) => {
    if (url.endsWith("/link_session_to_account")) {
      return new Response("{}", { status: 200 });
    }
    return new Response("{\"error\":\"invalid token\"}", { status: 401 });
  });

  const queryClient = renderResultsRoute(["/results/sess-auth?t=bad-token"]);

  await waitFor(() => {
    assert.ok(screen.getByText(/This results link has expired or was rotated/i));
  });
  assert.ok(screen.getByText(/Ask the owner for a fresh link/i));
  assert.equal(screen.queryByTestId("results-loaded"), null);

  queryClient.clear();
});

test("Results page → missing token renders expired state without RPC", async () => {
  const calls: Array<{ url: string; body: any }> = [];
  createFetchStub(({ url, init }) => {
    if (url.endsWith("/link_session_to_account")) {
      return new Response("{}", { status: 200 });
    }
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body });
    return new Response("{}", { status: 200 });
  });

  const queryClient = renderResultsRoute(["/results/sess-missing"]);

  await waitFor(() => {
    assert.ok(screen.getByText(/This results link has expired or was rotated/i));
  });
  const edgeCalls = calls.filter((call) => call.url.endsWith("/get-results-by-session"));
  assert.equal(edgeCalls.length, 0);

  queryClient.clear();
});
