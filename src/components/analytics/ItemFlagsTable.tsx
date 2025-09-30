import { useState } from "react";
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
import { ChevronRight } from "lucide-react";
import { ItemFlagMetricsKpi } from "@/hooks/useAssessmentKpis";

interface ItemFlagsTableProps {
  items: ItemFlagMetricsKpi[];
}

const getFlagRateColor = (rate: number | null): "destructive" | "outline" | "secondary" => {
  if (!rate) return "secondary";
  if (rate >= 0.10) return "destructive";
  if (rate >= 0.05) return "outline";
  return "secondary";
};

const formatRate = (rate: number | null): string => {
  if (!rate) return "0%";
  return `${(rate * 100).toFixed(2)}%`;
};

export const ItemFlagsTable = ({ items }: ItemFlagsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Clarity Flags</CardTitle>
        <CardDescription>
          Questions with highest flag rates (unclear/confusing) - Click to drill in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow 
                  key={item.question_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedItem(item.question_id === selectedItem ? null : item.question_id)}
                >
                  <TableCell>
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${selectedItem === item.question_id ? 'rotate-90' : ''}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{item.question_id}</TableCell>
                  <TableCell>{item.section || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{item.flags}</TableCell>
                  <TableCell className="text-right font-mono">{item.answered}</TableCell>
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
        
        {selectedItem && (
          <div className="rounded-lg border border-muted bg-muted/30 p-4">
            <h4 className="font-semibold mb-2">Question #{selectedItem} Details</h4>
            <p className="text-sm text-muted-foreground">
              Drill-in panel for individual flag notes and A/B variant will be populated when assessment_item_flags data is available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
