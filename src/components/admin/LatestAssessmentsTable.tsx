import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  type_share: number | null;
}

const formatFitValue = (value: number | null): string => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
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
      
      // Use the new v1.1 latest assessments view
      const { data, error } = await supabase
        .from('v_latest_assessments_v11')
        .select('*')
        .order('finished_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching latest assessments:', error);
        return;
      }

      if (data) {
        // Also get type_share from v_kpi_metrics_v11 for these sessions
        const sessionIds = data.map(a => a.session_id);
        const { data: shareData } = await supabase
          .from('v_kpi_metrics_v11')
          .select('session_id, type_share')
          .in('session_id', sessionIds);

        const shareMap = new Map(shareData?.map(s => [s.session_id, s.type_share]) || []);

        const enrichedData = data.map(assessment => ({
          ...assessment,
          type_share: shareMap.get(assessment.session_id) || null
        }));

        setAssessments(enrichedData);
        
        // Debug logging
        console.log('Latest assessments sample:', enrichedData.slice(0, 5));
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
          Recent completed assessments from v1.1 schema
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No assessments found
            </p>
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div
                  key={assessment.session_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {assessment.type_code || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assessment.country || 'Unknown'} • {' '}
                        {assessment.finished_at 
                          ? format(new Date(assessment.finished_at), 'MMM dd, HH:mm')
                          : 'Unknown time'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">
                        Fit: {formatFitValue(assessment.fit_value)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Share: {assessment.type_share ? `${Math.round(assessment.type_share)}%` : '—'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Badge variant={getFitBadgeVariant(assessment.fit_band)}>
                        {assessment.fit_band || 'Unknown'}
                      </Badge>
                      <Badge variant={getVersionBadgeVariant(assessment.version)} className="text-xs">
                        {assessment.version || 'legacy'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};