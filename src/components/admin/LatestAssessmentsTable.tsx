import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Assessment {
  session_id: string;
  finished_at: string;
  country: string;
  type_code: string;
  fit_value: number | null;
  share_pct: number | null;
  fit_band: string | null;
  version: string;
}

const formatFitValue = (calibratedFit: number | null, sessionId?: string): string => {
  if (calibratedFit === null || calibratedFit === undefined || !isFinite(calibratedFit) || isNaN(calibratedFit)) {
    if (sessionId) {
      console.warn(`Missing calibrated fit for session: ${sessionId}`);
    }
    return "—";
  }
  // Convert calibrated (~20..85) to 1..100 look
  const fitForUI = Math.round((calibratedFit - 20) * (100 / 65));
  return `${Math.max(1, fitForUI)}%`;
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

const ITEMS_PER_PAGE = 25;

export const LatestAssessmentsTable = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Get total count first
      const { count } = await supabase
        .from('v_latest_assessments_v11')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Fetch paginated data from v1.1 view
      const { data, error } = await supabase
        .from('v_latest_assessments_v11')
        .select('*')
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('finished_at', { ascending: false });

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
          fit_value: row.score_fit_calibrated, // Use calibrated as the primary value
          share_pct: row.share_pct,
          fit_band: row.fit_band,
          version: row.version
        }));

        console.info('Admin v1.1 data source OK', {
          page: currentPage + 1,
          rowCount: transformedData.length,
          totalCount: count,
          fitSample: transformedData.slice(0, 3).map(r => ({
            session: r.session_id?.slice(0, 8),
            fit: r.fit_value,
            band: r.fit_band
          }))
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
  }, [currentPage]);

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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = currentPage * ITEMS_PER_PAGE + 1;
  const endItem = Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Latest Assessments
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {totalCount > 0 && (
              <span>
                {startItem}-{endItem} of {totalCount}
              </span>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent assessment results with calibrated fit scores
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};