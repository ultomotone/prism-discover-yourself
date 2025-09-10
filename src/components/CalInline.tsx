import { useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";

interface CalInlineProps {
  calLink: string;
  eventType?: string;
  ui?: { theme?: "light" | "dark" };
}

const CalInline = ({ calLink, eventType, ui = { theme: "light" } }: CalInlineProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
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
