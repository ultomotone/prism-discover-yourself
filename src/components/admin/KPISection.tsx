import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface KPISectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const KPISection = ({ title, description, children }: KPISectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

interface KPITableProps {
  headers: string[];
  rows: Array<{
    cells: React.ReactNode[];
    status?: "good" | "warning" | "danger";
  }>;
}

export const KPITable = ({ headers, rows }: KPITableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, i) => (
            <TableHead key={i}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.cells.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface KPIMetricProps {
  label: string;
  value: string | number;
  target?: string;
  status?: "good" | "warning" | "danger";
}

export const KPIMetric = ({ label, value, target, status }: KPIMetricProps) => {
  const statusColor = {
    good: "bg-green-500/10 text-green-700 border-green-200",
    warning: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    danger: "bg-red-500/10 text-red-700 border-red-200",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {target && <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>}
      </div>
      {status && (
        <Badge className={statusColor[status]}>
          {status === "good" ? "✓" : status === "warning" ? "⚠" : "✗"}
        </Badge>
      )}
    </div>
  );
};
