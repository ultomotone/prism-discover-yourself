import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SystemStatus {
  status: 'green' | 'yellow' | 'red';
  message: string;
  last_updated?: string;
  updated_by?: string;
}

export const SystemStatusIndicator = () => {
  const [status, setStatus] = useState<SystemStatus>({
    status: 'green',
    message: 'All systems operational'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    
    // Set up real-time listener for status changes
    const channel = supabase
      .channel('system-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scoring_config',
          filter: 'key=eq.system_status'
        },
        () => {
          fetchSystemStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('scoring_config')
        .select('value')
        .eq('key', 'system_status')
        .maybeSingle();

      if (!error && data?.value) {
        setStatus(data.value as unknown as SystemStatus);
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'green':
        return <CheckCircle className="w-4 h-4" />;
      case 'yellow':
        return <Clock className="w-4 h-4" />;
      case 'red':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = () => {
    switch (status.status) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'green':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'yellow':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'red':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-green-700 bg-green-100 border-green-200';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">System Status:</span>
      <span className="text-sm">{status.message}</span>
    </div>
  );
};