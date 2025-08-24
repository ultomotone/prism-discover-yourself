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

const formatFitValue = (absoluteFit: number | null, sessionId?: string): string => {
  if (absoluteFit === null || absoluteFit === undefined || !isFinite(absoluteFit) || isNaN(absoluteFit)) {
    if (sessionId) {
      console.warn(`Missing absolute fit for session: ${sessionId}`);
    }
    return "—";
  }
  // Show absolute fit as-is (0-100 scale), round to whole number for display
  return `${Math.round(absoluteFit)}`;
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
        .eq('results_version', 'v1.2.0')
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
        .eq('results_version', 'v1.2.0')
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
          .select('id, completed_at, completed_at_original, started_at, started_at_original, created_at, created_at_original')
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
            // Get country from assessment responses (normalize blanks/Unknown)
            let country = 'Unknown';
            if (countryQId) {
              const { data: countryResponse } = await supabase
                .from('assessment_responses')
                .select('answer_value')
                .eq('session_id', row.session_id)
                .eq('question_id', countryQId)
                .maybeSingle();
              const raw = (countryResponse?.answer_value || '').trim();
              country = raw && raw.toLowerCase() !== 'unknown' ? raw : 'Unknown';
            }
            
            // Calculate individual fit from type_scores (not using global fit)
            const typeScores = row.type_scores as Record<string, any> || {};
            const individualFit = typeScores[row.type_code]?.fit_abs || row.score_fit_calibrated || 0;
            const sharePercentage = typeScores[row.type_code]?.share_pct || 0;
            
            // Get corrected timing from session data
            const sessionTiming = sessionTimingMap.get(row.session_id) as any;
            const completedAt = sessionTiming?.completed_at_original || row.submitted_at || sessionTiming?.completed_at;
            const startedAt = sessionTiming?.started_at_original 
              || sessionTiming?.created_at_original 
              || sessionTiming?.started_at 
              || sessionTiming?.created_at;
            
            return {
              session_id: row.session_id,
              finished_at: completedAt,
              started_at: startedAt,
              country: country,
              type_code: `${row.type_code}${row.overlay || ''}`,
              fit_value: individualFit,
              share_pct: sharePercentage,
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

  // Set up real-time listener for new assessments
  useEffect(() => {
    const channel = supabase
      .channel('admin-assessments-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'profiles',
          filter: 'results_version=eq.v1.2.0'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh assessments when new data comes in
          fetchAssessments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage]); // Include currentPage so listener resets on page changes

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
            Recent assessment results with absolute fit scores (0-100 scale)
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
                        <p>Absolute fit score (0-100): How well responses match this type's prototype</p>
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
                        Confidence <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Overall confidence level based on fit gap, validity checks, and coverage: High/Moderate/Low</p>
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
                    {/* Use corrected completed_at timestamp in Eastern Time */}
                    {assessment.finished_at ? (
                      <div>
                        <div>
                          {new Intl.DateTimeFormat('en-US', {
                            timeZone: 'America/New_York',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          }).format(new Date(assessment.finished_at))} ET
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assessment.finished_at} {/* Debug: show raw UTC timestamp */}
                        </div>
                      </div>
                    ) : '—'}
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