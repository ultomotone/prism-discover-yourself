import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Assessment {
  session_id: string;
  finished_at: string;
  country: string;
  type_code: string;
  fit_value: number | null;
  fit_band: string | null;
  version: string;
}

const formatFitValue = (value: number | null, sessionId?: string): string => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
    if (sessionId) {
      console.warn(`Missing calibrated fit for session: ${sessionId}`);
    }
    return "—";
  }
  return `${Math.round(value)}%`;
};

const getFitBadgeVariant = (band: string | null) => {
  switch (band) {
    case 'High':
      return 'default';
    case 'Moderate': 
      return 'secondary';
    case 'Low':
      return 'outline';
    default:
      return 'outline';
  }
};

const getVersionBadgeVariant = (version: string) => {
  return version === 'v1.1' ? 'default' : 'outline';
};

export const LatestAssessmentsTable = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Force v1.1 calibrated fits only - no cache
      const { data, error } = await supabase
        .from('v_latest_assessments_v11')
        .select('session_id, finished_at, country, type_code, fit_value, fit_band, version')
        .order('finished_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching latest assessments:', error);
        return;
      }

      if (data) {
        // Verification log for v1.1 data source
        console.info('Admin v1.1 data source OK', {
          rowCount: data.length,
          fitSample: data.slice(0, 5).map(r => ({
            session: r.session_id?.slice(0, 8),
            fit: r.fit_value,
            band: r.fit_band
          })),
          outOfRangeFits: data.filter(r => 
            r.fit_value && (r.fit_value > 95 || r.fit_value < 10)
          ).length
        });

        // Warn about unexpected fit ranges
        data.forEach(row => {
          if (row.fit_value && (row.fit_value > 95 || row.fit_value < 10)) {
            console.warn('Unexpected range — check calibration or source', {
              session: row.session_id?.slice(0, 8),
              fit: row.fit_value
            });
          }
        });

        setAssessments(data);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Assessments</CardTitle>
        <p className="text-sm text-muted-foreground">
          v1.1 calibrated fits only
        </p>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No assessments found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead>Share</TableHead>
                <TableHead>Band</TableHead>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.session_id}>
                  <TableCell className="text-sm">
                    {assessment.finished_at 
                      ? format(new Date(assessment.finished_at), 'MMM dd, HH:mm')
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="font-medium">
                    {assessment.type_code || '—'}
                  </TableCell>
                  <TableCell>
                    {assessment.country || '—'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatFitValue(assessment.fit_value, assessment.session_id)}
                  </TableCell>
                  <TableCell className="font-mono">
                    —
                  </TableCell>
                  <TableCell>
                    <Badge variant={getFitBadgeVariant(assessment.fit_band)}>
                      {assessment.fit_band || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVersionBadgeVariant(assessment.version)} className="text-xs">
                      {assessment.version || 'legacy'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};