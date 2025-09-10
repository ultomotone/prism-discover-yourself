import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

interface CalInlineProps {
  calLink: string;
  selector: string;
  ui?: { theme?: "light" | "dark" };
}

const CalInline = ({ calLink, selector, ui = { theme: "light" } }: CalInlineProps) => {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "prism" });
      cal("ui", {
        styles: { body: { background: "transparent" } },
        theme: ui.theme,
      });
      cal("inline", { elementOrSelector: selector, calLink });
    })();
  }, [calLink, selector, ui]);

  return <div id={selector.replace("#", "")} />;
};

export default CalInline;
