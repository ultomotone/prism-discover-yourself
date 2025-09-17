import "./setup/dom";

import test, { afterEach } from "node:test";
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

test("renders Typing Lab hero and entries", async () => {
  renderWithRouter();

  await screen.findByRole("heading", {
    name: /Typing Lab: Evidence-based hypotheses of famous figures/i,
  });

  await screen.findByText(/Ada Lovelace/i);
  await screen.findByText(/Serena Williams/i);
});

test("filters entries via search and debated toggle", async () => {
  const router = renderWithRouter();

  const search = await screen.findByLabelText(/search/i);
  fireEvent.change(search, { target: { value: "Greta" } });

  await screen.findByText(/Greta Gerwig/i);
  const missingAda = screen.queryByText(/Ada Lovelace/i);
  if (missingAda) {
    throw new Error("Ada Lovelace should be filtered out by the search term");
  }

  await waitFor(() => {
    expect(router.state.location.search).toContain("search=Greta");
  });

  fireEvent.change(search, { target: { value: "" } });

  const debatedSwitch = await screen.findByRole("switch", {
    name: /toggle most debated typings/i,
  });
  fireEvent.click(debatedSwitch);

  await screen.findByText(/Greta Gerwig/i);
  const absentSerena = screen.queryByText(/Serena Williams/i);
  if (absentSerena) {
    throw new Error("Serena Williams should be hidden when only debated entries are shown");
  }

  await waitFor(() => {
    expect(router.state.location.search).toContain("debated=1");
  });

  const clearButton = await screen.findByRole("button", { name: /clear filters/i });
  fireEvent.click(clearButton);

  await waitFor(() => {
    expect(router.state.location.search).toBe("");
  });
});

test("reads filters and sort from the query string", async () => {
  const router = renderWithRouter(["/typing-lab?domain=Artist&debated=1&sort=Most%20sourced"]);

  await screen.findByText(/Greta Gerwig/i);
  const serena = screen.queryByText(/Serena Williams/i);
  if (serena) {
    throw new Error("Serena Williams should not be visible when filtering by debated artists");
  }

  expect(router.state.location.search).toBe("?domain=Artist&debated=1&sort=Most+sourced");
});

test("updates query string when sort selection changes", async () => {
  const router = renderWithRouter();

  const sortTrigger = await screen.findByRole("combobox", { name: /sort/i });
  fireEvent.click(sortTrigger);

  const highestConfidence = await screen.findByRole("option", { name: /Highest confidence/i });
  fireEvent.click(highestConfidence);

  await waitFor(() => {
    expect(router.state.location.search).toBe("?sort=Highest+confidence");
  });
});
