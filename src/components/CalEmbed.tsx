import { useEffect } from "react";
import { sendQuoraEvent } from "@/lib/quora/events";
import { trackEvent } from "@/utils/analytics";

interface CalEmbedProps {
  slug: string;
}

const CalEmbed = ({ slug }: CalEmbedProps) => {
  useEffect(() => {
    trackEvent("booking_page_view", { slug });
    sendQuoraEvent("InitiateCheckout", { step: "cal.com_embed", slug });
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://cal.com") return;
      trackEvent("booking_event", { slug, data: event.data });
      const normalized = normalizeCalMessage(event.data);
      if (normalized?.type === "booking_success") {
        sendQuoraEvent("Purchase", {
          value: normalized.value,
          currency: normalized.currency,
          transaction_id: normalized.bookingId,
          contents: normalized.contents,
        });
      }
      if (normalized?.type === "payment_info") {
        sendQuoraEvent("AddPaymentInfo", {
          step: normalized.step || "cal.com_payment",
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [slug]);

  return (
    <iframe
      src={`https://cal.com/daniel-speiss/${slug}?embed=iframe`}
      title={`Schedule ${slug}`}
      className="w-full min-h-screen border-0"
      allow="payment"
    />
  );
};

export default CalEmbed;

type NormalizedCalMessage = {
  type?: "booking_success" | "payment_info";
  value?: number;
  currency?: string;
  bookingId?: string;
  step?: string;
  contents?: Array<Record<string, unknown>>;
};

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function coerceNumber(candidate: unknown): number | undefined {
  if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === "string") {
    const parsed = Number(candidate.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeCalMessage(raw: unknown): NormalizedCalMessage | undefined {
  const data = tryParseJson(raw);
  if (!data || typeof data !== "object") return undefined;

  const eventName = extractString(
    (data as Record<string, unknown>).event ||
      (data as Record<string, unknown>).eventName ||
      (data as Record<string, unknown>).type ||
      (data as Record<string, unknown>).action,
  );
  const lowered = eventName?.toLowerCase() || "";

  const detail = selectFirstObject([
    (data as Record<string, unknown>).payload,
    (data as Record<string, unknown>).data,
    (data as Record<string, unknown>).detail,
  ]);

  const booking = selectFirstObject([
    detail?.booking,
    detail?.event,
    detail,
  ]);

  const value = coerceNumber(
    detail?.price ||
      detail?.amount ||
      detail?.payment?.amount ||
      booking?.price ||
      booking?.amount ||
      booking?.payment?.amount,
  );
  const currency = extractString(
    detail?.currency || booking?.currency || detail?.payment?.currency,
  );
  const bookingId = extractString(
    detail?.bookingId || detail?.id || booking?.id || (data as Record<string, unknown>).eventId,
  );

  if (lowered.includes("booking") && (lowered.includes("success") || lowered.includes("confirmed"))) {
    const contents = booking?.service
      ? [
          {
            content_id: extractString(booking.service.id),
            content_name: extractString(booking.service.name),
            content_price: value,
            num_items: 1,
          },
        ]
      : undefined;
    return {
      type: "booking_success",
      value,
      currency,
      bookingId,
      contents,
    };
  }

  if (lowered.includes("payment")) {
    return {
      type: "payment_info",
      step: eventName || "payment",
    };
  }

  return undefined;
}

function extractString(input: unknown): string | undefined {
  if (typeof input === "string" && input.trim().length > 0) return input.trim();
  return undefined;
}

function selectFirstObject(inputs: Array<unknown>): Record<string, any> | undefined {
  for (const candidate of inputs) {
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, any>;
    }
  }
  return undefined;
}
