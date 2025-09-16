// IMPORTANT: DOM setup before component imports
import "./setup/dom";

import test, { after, afterEach, beforeEach, mock } from "node:test";
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

const { supabase } = await import("@/lib/supabase/client");
const rpcMock = mock.method(supabase, "rpc", () =>
  Promise.resolve({ data: null, error: null })
);

const { default: Results } = await import("@/pages/Results");

const mkOk = (profile: any) => ({
  data: { profile, session: { id: "sess-123", status: "completed" } },
  error: null,
});

beforeEach(() => {
  rpcMock.mock.resetCalls();
  rpcMock.mock.mockImplementation(() => {
    throw new Error("rpcMock not configured for this test");
  });
});

afterEach(() => {
  cleanup();
});

after(() => {
  rpcMock.mock.restore();
});

test(
  "Results page → RPC contract + render: calls RPC with { p_session_id, t } and renders with token present",
  async () => {
    rpcMock.mock.mockImplementation(() =>
      Promise.resolve(
        mkOk({ type_code: "LII", top_3_fits: [{ code: "LII", fit: 72.1 }] })
      )
    );

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

    assert.equal(rpcMock.mock.callCount(), 1);
    const [firstCall] = rpcMock.mock.calls;
    const [fnName, payload] = firstCall.arguments;
    assert.equal(fnName, "get_results_by_session");
    assert.deepEqual(payload, { p_session_id: "sess-123", t: "tok-abc" });
  }
);

test(
  "Results page → RPC contract + render: passes t:null when no token param is present",
  async () => {
    rpcMock.mock.mockImplementation(() =>
      Promise.resolve(mkOk({ type_code: "IEI" }))
    );

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

    const [firstCall] = rpcMock.mock.calls;
    const [, payload] = firstCall.arguments;
    assert.deepEqual(payload, { p_session_id: "sess-xyz", t: null });
  }
);

test(
  "Results page → RPC contract + render: shows error state when backend returns null profile",
  async () => {
    rpcMock.mock.mockImplementation(() =>
      Promise.resolve({ data: { profile: null }, error: null })
    );

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

    const error = await screen.findByText(/Results not found/i);
    assert.ok(error);
  }
);
