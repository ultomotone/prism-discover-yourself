import "./setup/dom";

import test, { afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { TypingLabShareButtons } from "../src/features/typing-lab/components/TypingLabShareButtons";

afterEach(() => {
  cleanup();
});

test("renders share controls with expected URLs", async () => {
  render(
    <TypingLabShareButtons
      path="/typing-lab"
      title="Typing Lab"
      message="Explore evidence-based hypotheses"
      align="start"
    />
  );

  const origin = window.location.origin;
  const expectedShareUrl = new URL("/typing-lab", origin).toString();

  const linkedin = await screen.findByRole("link", { name: /Share on LinkedIn/i });
  assert.equal(
    linkedin.getAttribute("href"),
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(expectedShareUrl)}`
  );

  const facebook = await screen.findByRole("link", { name: /Share on Facebook/i });
  assert.equal(
    facebook.getAttribute("href"),
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(expectedShareUrl)}`
  );

  const whatsapp = await screen.findByRole("link", { name: /Share on WhatsApp/i });
  assert.equal(
    whatsapp.getAttribute("href"),
    `https://wa.me/?text=${encodeURIComponent(`Explore evidence-based hypotheses – ${expectedShareUrl}`)}`
  );

  const email = await screen.findByRole("link", { name: /Share on Email/i });
  assert.equal(
    email.getAttribute("href"),
    `mailto:?subject=${encodeURIComponent("Explore evidence-based hypotheses")}&body=${encodeURIComponent(
      `Explore evidence-based hypotheses\n\n${expectedShareUrl}`
    )}`
  );

  await screen.findByRole("link", { name: /Share on SMS/i });
  await screen.findByRole("button", { name: /Copy link for Instagram/i });
  await screen.findByRole("button", { name: /Copy link for TikTok/i });
});

test("copies link content for copy-only platforms", async () => {
  const originalClipboard = navigator.clipboard;
  const copiedPayload: string[] = [];
  Object.assign(navigator, {
    clipboard: {
      writeText: async (value: string) => {
        copiedPayload.push(value);
      },
    },
  });

  try {
    render(
      <TypingLabShareButtons
        path="/typing-lab"
        title="Typing Lab"
        message="Shareable dossier"
      />
    );

    const copyButton = await screen.findByRole("button", { name: /Copy link for Instagram/i });
    fireEvent.click(copyButton);

    const feedback = await screen.findAllByText(/Link copied for Instagram/i);
    assert.ok(feedback.length >= 1);
    assert.equal(copiedPayload.length, 1);

    const expectedText = `Shareable dossier\n${new URL("/typing-lab", window.location.origin).toString()}`;
    assert.equal(copiedPayload[0], expectedText);
  } finally {
    if (originalClipboard === undefined) {
      Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "clipboard");
    } else {
      Object.assign(navigator, { clipboard: originalClipboard });
    }
  }
});

test("surfaces an error when clipboard writes fail", async () => {
  const originalClipboard = navigator.clipboard;
  Object.assign(navigator, {
    clipboard: {
      writeText: async () => {
        throw new Error("copy not available");
      },
    },
  });

  try {
    render(
      <TypingLabShareButtons
        path="/typing-lab"
        title="Typing Lab"
        message="Shareable dossier"
      />
    );

    const copyButton = await screen.findByRole("button", { name: /Copy link for TikTok/i });
    fireEvent.click(copyButton);

    await screen.findByText(/Unable to copy automatically/i);
  } finally {
    if (originalClipboard === undefined) {
      Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "clipboard");
    } else {
      Object.assign(navigator, { clipboard: originalClipboard });
    }
  }
});
