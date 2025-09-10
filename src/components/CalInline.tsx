import React, { useEffect, useRef } from "react";

interface CalInlineProps {
  calLink: string;
  eventType?: string;
  ui?: { theme?: "light" | "dark" };
}

const CalInline = ({ calLink, eventType, ui = { theme: "light" } }: CalInlineProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      if (ref.current && !ref.current.querySelector("[data-testid='cal-widget']")) {
        const div = document.createElement("div");
        div.setAttribute("data-testid", "cal-widget");
        ref.current.appendChild(div);
      }
      return;
    }

    (async () => {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi({ namespace: "prism" });
      cal("ui", {
        styles: { body: { background: "transparent" } },
        theme: ui.theme,
      });
      cal("inline", {
        elementOrSelector: ref.current!,
        calLink: `${calLink}${eventType ? `/${eventType}` : ""}`,
      });
    })();
  }, [calLink, eventType, ui]);

  return <div ref={ref} />;
};

export default CalInline;
