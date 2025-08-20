import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { backfillMissingProfiles } from "@/utils/backfillProfiles";
import { rescoreBrokenProfiles } from "@/utils/rescoreBrokenProfiles";
import { manualRescoreLatest } from "@/utils/manualRescore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MilestoneProgress } from "@/components/ui/milestone-progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ExternalLink, BarChart3 } from "lucide-react";

interface PreviewStats {
  totalAssessments: number;
  todayCount: number;
  progressPercentage: number;
  topType: string | null;
  overlayStats: Array<{ overlay: string; count: number }>;
}

const DashboardPreview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PreviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No auto-rescoring - server-side only

    const fetchPreviewStats = async () => {
      try {
        // Use secure aggregated statistics instead of direct profile access
        const { data: todayStats } = await supabase
          .from('dashboard_statistics')
          .select('*')
          .eq('stat_date', new Date().toISOString().split('T')[0])
          .maybeSingle();

        // If no data for today, trigger the update function
        if (!todayStats) {
          await supabase.rpc('update_dashboard_statistics');
          
          // Try to fetch again after update
          const { data: refreshedStats } = await supabase
            .from('dashboard_statistics')
            .select('*')
            .eq('stat_date', new Date().toISOString().split('T')[0])
            .maybeSingle();
          
          if (refreshedStats) {
            processStatsData(refreshedStats);
          } else {
            setDefaultStats();
          }
          return;
        }

        processStatsData(todayStats);
      } catch (error) {
        console.error('Failed to fetch preview stats:', error);
        setDefaultStats();
      } finally {
        setLoading(false);
      }
    };

    const processStatsData = (todayStats: any) => {
      const totalAssessments = todayStats?.total_assessments || 0;
      const todayCount = todayStats?.daily_assessments || 0;
      const progressPercentage = Math.min(100, Math.round((totalAssessments / 1000) * 100));

      // Get top type from distribution
      const typeDistribution = todayStats?.type_distribution || {};
      const topType = Object.entries(typeDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null;

      // Process overlay stats
      const overlayStats = [];
      if (todayStats?.overlay_positive) {
        overlayStats.push({ overlay: 'N+', count: todayStats.overlay_positive });
      }
      if (todayStats?.overlay_negative) {
        overlayStats.push({ overlay: 'N–', count: todayStats.overlay_negative });
      }

      setStats({
        totalAssessments,
        todayCount,
        progressPercentage,
        topType,
        overlayStats
      });
    };

    const setDefaultStats = () => {
      setStats({
        totalAssessments: 0,
        todayCount: 0,
        progressPercentage: 0,
        topType: null,
        overlayStats: []
      });
    };

    fetchPreviewStats();

    // Set up real-time subscription to both dashboard_statistics and profiles
    const channel = supabase
      .channel('preview-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_statistics' },
        () => {
          fetchPreviewStats();
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => {
          // When new profile is created, update dashboard stats
          supabase.rpc('update_dashboard_statistics').then(() => {
            fetchPreviewStats();
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="relative animate-pulse">
        <Card className="prism-shadow-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative prism-hover-lift">
      <Card className="prism-shadow-card border-2 border-primary/10 bg-gradient-to-br from-white to-primary/5">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">Live Dashboard</h3>
              </div>
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Road to 1,000 Assessments</span>
                <span className="text-muted-foreground">
                  {stats?.totalAssessments || 0}/1000
                </span>
              </div>
              <MilestoneProgress 
                value={stats?.totalAssessments || 0} 
                max={1000}
                milestones={[100, 500]}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats?.progressPercentage || 0}% complete</span>
                <span>{1000 - (stats?.totalAssessments || 0)} remaining</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-medium text-muted-foreground">Total</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalAssessments || 0}
                </div>
              </div>
              
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Today</span>
                </div>
                <div className="text-2xl font-bold text-accent">
                  +{stats?.todayCount || 0}
                </div>
              </div>
            </div>

            {/* Top Insights */}
            <div className="space-y-2">
              {stats?.topType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Top Type:</span>
                  <Badge variant="outline">{stats.topType}</Badge>
                </div>
              )}
              
              {stats?.overlayStats && stats.overlayStats.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overlay Split:</span>
                  <div className="flex gap-1">
                    {stats.overlayStats.slice(0, 2).map((stat) => (
                      <Badge key={stat.overlay} variant="secondary" className="text-xs">
                        {stat.overlay}: {stat.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full group bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark"
              size="sm"
            >
              View Full Dashboard
              <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 w-12 h-12 prism-gradient-accent rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 prism-gradient-secondary rounded-full opacity-30 animate-pulse delay-700"></div>
    </div>
  );
};

export default DashboardPreview;