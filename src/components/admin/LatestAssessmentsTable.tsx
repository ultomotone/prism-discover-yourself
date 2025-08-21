import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

interface Assessment {
  session_id: string;
  finished_at: string;
  started_at?: string;
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
      
      // Get total count from profiles table
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('results_version', 'v1.1')
        .not('type_code', 'is', null);
      
      setTotalCount(count || 0);
      
      // Fetch data from profiles with proper v1.1 fields
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          session_id,
          submitted_at,
          type_code,
          score_fit_calibrated,
          score_fit_raw,
          top_gap,
          type_scores,
          top_types,
          fit_band,
          results_version,
          overlay
        `)
        .eq('results_version', 'v1.1')
        .not('type_code', 'is', null)
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('submitted_at', { ascending: false });

      if (error) {  
        console.error('Error fetching latest assessments:', error);
        return;
      }

      if (data) {
        // Get session timing data for all sessions in batch
        const sessionIds = data.map(row => row.session_id);
        const { data: sessionsData } = await supabase
          .from('assessment_sessions')
          .select('id, completed_at, started_at, created_at')
          .in('id', sessionIds);
        
        const sessionTimingMap = new Map(
          (sessionsData || []).map(s => [s.id, s])
        );

        // Get country question ID for country lookup
        const { data: countryConfig } = await supabase
          .from('scoring_config')
          .select('value')
          .eq('key', 'dashboard_country_qid')
          .maybeSingle();
        const countryQId = (countryConfig?.value as any)?.id;

        // Get countries for each session
        const transformedData = await Promise.all(
          data.map(async (row) => {
            // Get country from assessment responses
            let country = 'Unknown';
            if (countryQId) {
              const { data: countryResponse } = await supabase
                .from('assessment_responses')
                .select('answer_value')
                .eq('session_id', row.session_id)
                .eq('question_id', countryQId)
                .maybeSingle();
              country = countryResponse?.answer_value || 'Unknown';
            }
            
            // Calculate individual fit from type_scores (not using global fit)
            const typeScores = row.type_scores as Record<string, any> || {};
            const individualFit = typeScores[row.type_code]?.fit_abs || row.score_fit_calibrated || 0;
            const sharePercentage = typeScores[row.type_code]?.share_pct || 0;
            
            // Get corrected timing from session data
            const sessionTiming = sessionTimingMap.get(row.session_id);
            const completedAt = sessionTiming?.completed_at || row.submitted_at;
            const startedAt = sessionTiming?.started_at;
            
            return {
              session_id: row.session_id,
              finished_at: completedAt, // Use corrected completed_at timestamp
              started_at: startedAt,
              country: country,
              type_code: `${row.type_code}${row.overlay || ''}`, // Include overlay in display
              fit_value: individualFit, // Individual type fit from type_scores
              share_pct: sharePercentage, // Individual type share from type_scores
              fit_band: row.fit_band,
              version: row.results_version
            };
          })
        );

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
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Type <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>PRISM personality type (e.g., LIE, IEI) with overlay (+/−) indicating stress state</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Country <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Location where the assessment was completed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Fit <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How well responses match the assigned type (calibrated score 1-100%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Share <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage probability this is the correct type vs. alternatives</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Band <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Overall confidence level: High (strong fit), Moderate (decent fit), Low (weak fit)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Version <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Scoring algorithm version (v1.1 has enhanced calibration and fit calculation)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.session_id}>
                  <TableCell className="text-sm">
                    {/* Use corrected completed_at timestamp without duration */}
                    {assessment.finished_at 
                      ? format(new Date(assessment.finished_at), 'MMM dd, HH:mm:ss')
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