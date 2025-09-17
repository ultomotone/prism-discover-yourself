import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InformationElement, TypingLabEntry } from "../types";

const dimensionalityLabel: Record<number, string> = {
  0: "0D – Latent",
  1: "1D – Emerging",
  2: "2D – Reliable",
  3: "3D – Adaptive",
  4: "4D – Expert",
};

const strengthLabel = {
  L: "Low",
  M: "Medium",
  H: "High",
} as const;

interface FunctionExpressionTableProps {
  entry: TypingLabEntry;
}

export const FunctionExpressionTable = ({ entry }: FunctionExpressionTableProps) => {
  const rows = Object.entries(entry.functionMap) as [InformationElement, TypingLabEntry["functionMap"][InformationElement]][];
  return (
    <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Function expression map</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dimensionality (0D–4D) shows breadth and auto-correction. Strength (Low/Medium/High) is the raw signal intensity you see in
        the wild.
      </p>
      <Table className="mt-6">
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Function</TableHead>
            <TableHead>Dimensionality</TableHead>
            <TableHead>Strength</TableHead>
            <TableHead>Behavioral evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([element, detail]) => (
            <TableRow key={element}>
              <TableCell className="font-semibold">{element}</TableCell>
              <TableCell>{dimensionalityLabel[detail.dim]}</TableCell>
              <TableCell>{strengthLabel[detail.str]}</TableCell>
              <TableCell className="text-muted-foreground">{detail.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
