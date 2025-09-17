import "./setup/dom";

import test, { afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import TypingLab from "../src/pages/TypingLab";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

const renderWithRouter = (initialEntries: string[] = ["/typing-lab"]) => {
  const router = createMemoryRouter(
    [
      {
        path: "/typing-lab",
        element: <TypingLab />,
      },
    ],
    { initialEntries }
  );

  render(<RouterProvider router={router} />);

  return router;
};

afterEach(() => {
  cleanup();
});

test("renders Typing Lab hero with empty state", async () => {
  renderWithRouter();

  await screen.findByRole("heading", {
    name: /Typing Lab: Evidence-based hypotheses of famous figures/i,
  });

  await screen.findByText(/No typings match your filters yet/i);

  const linkedinShare = await screen.findByRole("link", {
    name: /Share on LinkedIn/i,
  });
  const expectedLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    new URL("/typing-lab", window.location.origin).toString()
  )}`;
  assert.equal(linkedinShare.getAttribute("href"), expectedLinkedInUrl);

  await screen.findByRole("link", { name: /Share on Facebook/i });
  await screen.findByRole("link", { name: /Share on Reddit/i });
  await screen.findByRole("link", { name: /Share on WhatsApp/i });
  await screen.findByRole("link", { name: /Share on Email/i });
  await screen.findByRole("link", { name: /Share on SMS/i });
  await screen.findByRole("button", { name: /Copy link for Instagram/i });
  await screen.findByRole("button", { name: /Copy link for TikTok/i });
});

test("updates filters and query string when controls change", async () => {
  const router = renderWithRouter();

  const search = await screen.findByLabelText(/search/i);
  fireEvent.change(search, { target: { value: "Greta" } });

  await waitFor(() => {
    assert.match(router.state.location.search, /search=Greta/);
  });

  const debatedSwitch = await screen.findByRole("switch", {
    name: /toggle most debated typings/i,
  });
  fireEvent.click(debatedSwitch);

  await waitFor(() => {
    assert.match(router.state.location.search, /debated=1/);
  });

  const clearButton = await screen.findByRole("button", { name: /clear filters/i });
  fireEvent.click(clearButton);

  await waitFor(() => {
    assert.equal(router.state.location.search, "");
  });
});

test("reads filters and sort from the query string", async () => {
  const router = renderWithRouter(["/typing-lab?domain=Artist&debated=1&sort=Most%20sourced"]);

  await waitFor(() => {
    assert.equal(router.state.location.search, "?debated=1&sort=Most+sourced");
  });

  await screen.findByText(/No typings match your filters yet/i);
});

