import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SystemStatus, normalizeSystemStatus } from '@/utils/systemStatus';

export const SystemStatusControl = () => {
  const [status, setStatus] = useState<SystemStatus>({
    status: 'green',
    message: 'All systems operational'
  });
  const [message, setMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'green' | 'yellow' | 'red'>('green');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('scoring_config')
        .select('value')
        .eq('key', 'system_status')
        .maybeSingle();

      if (!error && data?.value) {
        const currentStatus = normalizeSystemStatus(data.value);
        setStatus(currentStatus);
        setSelectedStatus(currentStatus.status);
        setMessage(currentStatus.message);
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
      toast({
        title: "Error",
        description: "Failed to fetch current status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a status message",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Use edge function to update system status (requires service role permissions)
      const { data, error } = await supabase.functions.invoke('updateSystemStatus', {
        body: { 
          status: selectedStatus,
          message: message.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update local state with the new status
      const newStatus: SystemStatus = {
        status: selectedStatus,
        message: message.trim(),
        last_updated: new Date().toISOString(),
        updated_by: 'admin'
      };

      setStatus(newStatus);
      toast({
        title: "Success",
        description: "System status updated successfully",
      });
    } catch (err) {
      console.error('Error updating system status:', err);
      toast({
        title: "Error",
        description: "Failed to update system status",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'green':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'yellow':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'red':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Status Control</CardTitle>
          <CardDescription>Loading current status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status Control</CardTitle>
        <CardDescription>
          Manage the system status indicator shown on the assessment page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Display */}
        <div>
          <Label className="text-sm font-medium">Current Status</Label>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(status.status)} mt-2`}>
            {getStatusIcon(status.status)}
            <span className="text-sm font-medium">System Status:</span>
            <span className="text-sm">{status.message}</span>
          </div>
          {status.last_updated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(status.last_updated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Status Update Controls */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="status-select">Status Level</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={(value: 'green' | 'yellow' | 'red') => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Green - All systems operational</span>
                  </div>
                </SelectItem>
                <SelectItem value="yellow">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Yellow - Minor issues or maintenance</span>
                  </div>
                </SelectItem>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Red - System issues or downtime</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-message">Status Message</Label>
            <Input
              id="status-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter status message..."
              className="w-full"
            />
          </div>

          <Button 
            onClick={updateStatus} 
            disabled={saving || !message.trim()}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Updating...' : 'Update Status'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('green');
              setMessage('All systems operational');
            }}
          >
            Set Green
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('yellow');
              setMessage('Scheduled maintenance in progress');
            }}
          >
            Set Maintenance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('red');
              setMessage('System temporarily unavailable');
            }}
          >
            Set Unavailable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};