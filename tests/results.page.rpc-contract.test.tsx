// IMPORTANT: DOM setup before component imports
import "./setup/dom";

import test, { after, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const StubResultsView = ({ profile }: any) => (
  <div data-testid="results-loaded">profile:{profile?.type_code ?? "none"}</div>
);

(globalThis as any).window.__APP_CONFIG__ = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon",
};

const originalFetch = globalThis.fetch;

function createFetchStub(responseFactory: (url: string, body: any) => Response | Promise<Response>) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const payload = init?.body ? JSON.parse(String(init.body)) : null;
    return responseFactory(url, payload);
  }) as typeof fetch;
}

function successPayload(sessionId: string, typeCode = "LII") {
  return {
    profile: { type_code: typeCode, top_3_fits: [{ code: typeCode, fit: 72.1 }] },
    session: { id: sessionId, status: "completed" },
    results_version: "v1",
  };
}

const { default: Results } = await import("@/pages/Results");

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

after(() => {
  globalThis.fetch = originalFetch;
});

test(
  "Results page → RPC contract + render: calls function with session + token and renders",
  async () => {
    const calls: Array<{ url: string; body: any }> = [];
    createFetchStub((url, body) => {
      calls.push({ url, body });
      if (url.endsWith("/link_session_to_account")) {
        return new Response("{}", { status: 200 });
      }
      return new Response(JSON.stringify(successPayload(body.session_id)), { status: 200 });
    });

    render(
      <MemoryRouter initialEntries={["/results/sess-123?t=tok-abc"]}>
        <Routes>
          <Route
            path="/results/:sessionId"
            element={<Results components={{ ResultsView: StubResultsView }} />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      assert.ok(screen.getByTestId("results-loaded"));
    });

    const getResultsCall = calls.find((c) => c.url.endsWith("/get-results-by-session"));
    assert.ok(getResultsCall);
    assert.deepEqual(getResultsCall!.body, { session_id: "sess-123", share_token: "tok-abc" });
  }
);

test(
  "Results page → RPC contract + render: passes undefined token when query lacks t",
  async () => {
    const calls: Array<{ url: string; body: any }> = [];
    createFetchStub((url, body) => {
      calls.push({ url, body });
      if (url.endsWith("/link_session_to_account")) {
        return new Response("{}", { status: 200 });
      }
      return new Response(JSON.stringify(successPayload(body.session_id, "IEI")), { status: 200 });
    });

    render(
      <MemoryRouter initialEntries={["/results/sess-xyz"]}>
        <Routes>
          <Route
            path="/results/:sessionId"
            element={<Results components={{ ResultsView: StubResultsView }} />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      assert.ok(screen.getByTestId("results-loaded"));
    });

    const getResultsCall = calls.find((c) => c.url.endsWith("/get-results-by-session"));
    assert.ok(getResultsCall);
    assert.deepEqual(getResultsCall!.body, { session_id: "sess-xyz" });
  }
);

test(
  "Results page → RPC contract + render: surfaces error state when backend throws",
  async () => {
    createFetchStub((url) => {
      if (url.endsWith("/link_session_to_account")) {
        return new Response("{}", { status: 200 });
      }
      return new Response("{\"error\":\"failure\"}", { status: 500 });
    });

    render(
      <MemoryRouter initialEntries={["/results/sess-bad?t=tok"]}>
        <Routes>
          <Route
            path="/results/:sessionId"
            element={<Results components={{ ResultsView: StubResultsView }} />}
          />
        </Routes>
      </MemoryRouter>
    );

    const error = await screen.findByText(/Unable to load results/i);
    assert.ok(error);
  }
);
