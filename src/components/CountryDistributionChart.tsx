import React, { useState, useEffect } from 'react';
import { Treemap, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface CountryData {
  country: string;
  count: number;
}

interface CountryDistributionChartProps {
  className?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--secondary) / 0.8)',
  'hsl(var(--accent) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--secondary) / 0.6)',
  'hsl(var(--accent) / 0.6)',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-popover-foreground">{data.country}</p>
        <p className="text-sm text-muted-foreground">
          {data.count} assessment{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const CustomContent = ({ root, depth, x, y, width, height, index, payload }: any) => {
  const ROUNDING = 8;
  const node = payload ?? {};
  const color = COLORS[(Number.isFinite(index) ? index : 0) % COLORS.length];
  
  // Guard against undefined dimensions
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={ROUNDING}
        ry={ROUNDING}
        style={{
          fill: color,
          stroke: 'hsl(var(--border))',
          strokeWidth: 2,
        }}
        className="transition-all duration-300 hover:opacity-80"
      />
      {w > 80 && h > 40 && node.country && (
        <text
          x={x + w / 2}
          y={y + h / 2 - 8}
          textAnchor="middle"
          fill="hsl(var(--primary-foreground))"
          fontSize="14"
          fontWeight="600"
        >
          {node.country}
        </text>
      )}
      {w > 80 && h > 40 && typeof node.count === 'number' && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 8}
          textAnchor="middle"
          fill="hsl(var(--primary-foreground) / 0.8)"
          fontSize="12"
        >
          {node.count}
        </text>
      )}
    </g>
  );
};

export const CountryDistributionChart = ({ className }: CountryDistributionChartProps) => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      
      // Use the new v1.1 country activity function
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase.rpc('kpi_country_activity_v11', {
        start_ts: thirtyDaysAgo.toISOString(),
        end_ts: new Date().toISOString()
      });

      if (error) {
        console.error('Error fetching country data:', error);
        setCountryData([]);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        console.log('Country distribution for activity map:', data);
        // Transform data to match expected format and filter out Unknown/blank
        const formattedData = (data as any[])
          .map((item: any) => ({
            country: item.country,
            count: item.sessions
          }))
          .filter((d: any) => d.country && d.country.trim() !== '' && d.country !== 'Unknown');
        setCountryData(formattedData);
      } else {
        console.log('No country data available');
        setCountryData([]);
      }
    } catch (error) {
      console.error('Unexpected error in fetchCountryData:', error);
      setCountryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountryData();
  }, []);

  const treemapData = countryData.map((item, index) => ({
    ...item,
    size: item.count,
    index,
  }));

  if (loading) {
    return (
      <div className={`h-[400px] flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-muted-foreground">Loading country data...</div>
      </div>
    );
  }

  if (!countryData.length) {
    return (
      <div className={`h-[400px] flex items-center justify-center text-muted-foreground ${className}`}>
        No country data available
      </div>
    );
  }

  return (
    <div className={`h-[400px] w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4/3}
          stroke="hsl(var(--border))"
          content={(props) => <CustomContent {...props} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default CountryDistributionChart;