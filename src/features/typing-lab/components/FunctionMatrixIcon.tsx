import type { InformationElement, TypingLabEntry } from "../types";
import { cn } from "@/lib/utils";

const dimensionClasses: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-primary/10 text-primary",
  2: "bg-primary/20 text-primary",
  3: "bg-primary/40 text-primary-foreground",
  4: "bg-primary text-primary-foreground",
};

const strengthClasses = {
  L: "border border-primary/40",
  M: "border-2 border-primary/70",
  H: "border-[3px] border-primary",
} as const;

interface FunctionMatrixIconProps {
  entry: TypingLabEntry;
}

export const FunctionMatrixIcon = ({ entry }: FunctionMatrixIconProps) => {
  return (
    <div className="grid grid-cols-4 gap-1" aria-label="Function matrix miniature">
      {(Object.entries(entry.functionMap) as [InformationElement, TypingLabEntry["functionMap"][InformationElement]][]).map(
        ([element, detail]) => (
          <div
            key={element}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
              dimensionClasses[detail.dim],
              strengthClasses[detail.str]
            )}
            title={`${element}: ${detail.dim}D, ${detail.str} strength`}
          >
            {element}
          </div>
        )
      )}
    </div>
  );
};
