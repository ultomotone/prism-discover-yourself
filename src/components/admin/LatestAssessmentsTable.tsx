import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LatestAssessments } from "@/hooks/useAdvancedAdminAnalytics";

export function LatestAssessmentsTable({ data }: { data: LatestAssessments }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No assessments found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Completed (ET)</TableHead>
          <TableHead className="text-right">Top1 Fit</TableHead>
          <TableHead className="text-right">Top Gap</TableHead>
          <TableHead className="text-right">Confidence Margin</TableHead>
          <TableHead>Overlay</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.session_id}>
            <TableCell>
              {(() => {
                try {
                  const date = new Date(row.completed_at_et);
                  if (isNaN(date.getTime())) {
                    return "–";
                  }
                  return format(date, "MM/dd HH:mm");
                } catch (error) {
                  return "–";
                }
              })()}
            </TableCell>
            <TableCell className="font-mono text-right">
              {row.top1_fit != null ? row.top1_fit.toFixed(1) : "–"}
            </TableCell>
            <TableCell className="font-mono text-right">
              {row.top_gap != null ? row.top_gap.toFixed(1) : "–"}
            </TableCell>
            <TableCell className="font-mono text-right">
              {row.confidence_margin != null ? `${row.confidence_margin.toFixed(1)}%` : "–"}
            </TableCell>
            <TableCell>{row.overlay_label ?? "–"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
