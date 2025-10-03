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
import { ChevronRight, MessageSquare } from "lucide-react";
import { ItemFlagMetricsKpi, ItemFlagDetail } from "@/hooks/useAssessmentKpis";
import { format } from "date-fns";

interface ItemFlagsTableProps {
  items: ItemFlagMetricsKpi[];
  flagDetails: ItemFlagDetail[];
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

export const ItemFlagsTable = ({ items, flagDetails }: ItemFlagsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  
  // Get flag details for the selected question
  const selectedItemDetails = selectedItem 
    ? flagDetails.filter(detail => detail.question_id === selectedItem)
    : [];

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
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">Question #{selectedItem} — User Feedback</h4>
              <Badge variant="outline" className="ml-auto">
                {selectedItemDetails.length} {selectedItemDetails.length === 1 ? 'note' : 'notes'}
              </Badge>
            </div>
            
            {selectedItemDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No detailed notes available for this question.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedItemDetails.map((detail, idx) => (
                  <div 
                    key={`${detail.session_id}-${idx}`}
                    className="rounded-md border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {detail.flag_type || 'unclear'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(detail.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">
                      {detail.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
