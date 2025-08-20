import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Assessment {
  session_id: string;
  finished_at: string;
  country: string;
  type_code: string;
  fit_value: number | null;
  score_fit_raw: number | null;
  share_pct: number | null;
  fit_band: string | null;
  version: string;
}

const formatFitValue = (
  calibratedFit: number | null, 
  rawFit: number | null, 
  showRawFit: boolean, 
  sessionId?: string
): string => {
  const fitCal = calibratedFit;
  const fitRaw = rawFit;
  
  if (showRawFit) {
    if (fitRaw === null || fitRaw === undefined || !isFinite(fitRaw) || isNaN(fitRaw)) {
      if (sessionId) {
        console.warn(`Missing raw fit for session: ${sessionId}`);
      }
      return "—";
    }
    return `${Math.round(fitRaw)}%`;
  } else {
    if (fitCal === null || fitCal === undefined || !isFinite(fitCal) || isNaN(fitCal)) {
      if (sessionId) {
        console.warn(`Missing calibrated fit for session: ${sessionId}`);
      }
      return "—";
    }
    // Convert calibrated (~20..85) to 1..100 look
    const fitForUI = Math.round((fitCal - 20) * (100 / 65));
    return `${fitForUI}%`;
  }
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
  const [showRawFit, setShowRawFit] = useState(false);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Fetch from v1.1 view with both raw and calibrated fits - no cache
      const { data, error } = await supabase
        .from('v_latest_assessments_v11')
        .select('*')
        .limit(50);

      if (error) {  
        console.error('Error fetching latest assessments:', error);
        return;
      }

      if (data) {
        // Transform data to match our interface
        const transformedData = data.map(row => ({
          session_id: row.session_id,
          finished_at: row.finished_at,
          country: row.country,
          type_code: row.type_code,
          fit_value: row.fit_value, // This is the calibrated fit from the view
          score_fit_raw: null, // Will need to fetch separately if needed
          share_pct: row.share_pct,
          fit_band: row.fit_band,
          version: row.version
        }));

        // Verification log for v1.1 data source
        console.info('Admin v1.1 data source OK', {
          rowCount: transformedData.length,
          fitSample: transformedData.slice(0, 5).map(r => ({
            session: r.session_id?.slice(0, 8),
            fitCal: r.fit_value,
            fitRaw: r.score_fit_raw,
            band: r.fit_band
          })),
          outOfRangeFits: transformedData.filter(r => 
            r.fit_value && (r.fit_value > 95 || r.fit_value < 10)
          ).length
        });

        // Warn about unexpected fit ranges
        transformedData.forEach(row => {
          if (row.fit_value && (row.fit_value > 95 || row.fit_value < 10)) {
            console.warn('Unexpected range — check calibration or source', {
              session: row.session_id?.slice(0, 8),
              fit: row.fit_value
            });
          }
        });

        setAssessments(transformedData);
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
        <CardTitle className="flex items-center justify-between">
          Latest Assessments
          <div className="flex items-center space-x-2">
            <Label htmlFor="fit-toggle" className="text-sm font-normal">
              Fit: {showRawFit ? 'Raw' : 'Cal'}
            </Label>
            <Switch
              id="fit-toggle"
              checked={showRawFit}
              onCheckedChange={setShowRawFit}
            />
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          v1.1 {showRawFit ? 'raw and calibrated' : 'calibrated'} fits
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
                    {formatFitValue(assessment.fit_value, assessment.score_fit_raw, showRawFit, assessment.session_id)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {assessment.share_pct ? `${Math.round(assessment.share_pct)}%` : '—'}
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