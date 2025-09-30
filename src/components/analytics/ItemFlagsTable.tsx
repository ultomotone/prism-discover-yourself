import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemFlagMetricsKpi } from "@/hooks/useAssessmentKpis";

interface ItemFlagsTableProps {
  items: ItemFlagMetricsKpi[];
}

export const ItemFlagsTable = ({ items }: ItemFlagsTableProps) => {
  const getFlagRateColor = (rate: number | null) => {
    if (!rate) return "secondary";
    if (rate > 0.1) return "destructive";
    if (rate > 0.05) return "outline"; // Changed from "warning" to valid variant
    return "secondary";
  };

  const formatRate = (rate: number | null) => {
    if (!rate) return "0%";
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Clarity Flags</CardTitle>
        <CardDescription>
          Questions with highest flag rates (unclear/confusing)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question ID</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-right">Flags</TableHead>
              <TableHead className="text-right">Answered</TableHead>
              <TableHead className="text-right">Flag Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.question_id}>
                  <TableCell className="font-mono">{item.question_id}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell className="text-right">{item.flags}</TableCell>
                  <TableCell className="text-right">{item.answered}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getFlagRateColor(item.flag_rate)}>
                      {formatRate(item.flag_rate)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
