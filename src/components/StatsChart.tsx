'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDate } from '@/lib/utils';

interface StatsData {
  date: string;
  performance: number;
  speed: number;
  intelligence: number;
  reliability: number;
  votes: number;
}

interface StatsChartProps {
  data: StatsData[];
  modelName: string;
}

export function StatsChart({ data }: StatsChartProps) {
  const [chartColors, setChartColors] = useState({
    chart1: '#3b82f6',
    chart2: '#8b5cf6',
    chart3: '#10b981',
    chart4: '#f59e0b',
  });

  useEffect(() => {
    // Get computed styles to read CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    setChartColors({
      chart1: computedStyle.getPropertyValue('--chart-1').trim() || '#3b82f6',
      chart2: computedStyle.getPropertyValue('--chart-2').trim() || '#8b5cf6',
      chart3: computedStyle.getPropertyValue('--chart-3').trim() || '#10b981',
      chart4: computedStyle.getPropertyValue('--chart-4').trim() || '#f59e0b',
    });
  }, []);

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: formatDate(item.date),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 border rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value.toFixed(2)}
            </p>
          ))}
          <p className="text-sm text-muted-foreground mt-2">
            {data.find(d => formatDate(d.date) === label)?.votes || 0} votes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-card rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold text-foreground">Performance History</h3>
        <p className="text-sm text-muted-foreground mt-1">Daily average ratings from community votes</p>
      </div>
      <div className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.chart1} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.chart1} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorIntelligence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.chart2} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.chart2} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.chart3} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.chart3} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorReliability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.chart4} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.chart4} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground [&_.recharts-cartesian-axis-line]:stroke-border"
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={{ stroke: 'currentColor' }}
                ticks={[0, 1, 2, 3, 4, 5]}
                className="text-muted-foreground [&_.recharts-cartesian-axis-line]:stroke-border"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span className="text-sm font-medium">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="performance"
                stroke={chartColors.chart1}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.chart1 }}
                activeDot={{ r: 6 }}
                name="Performance"
              />
              <Line
                type="monotone"
                dataKey="intelligence"
                stroke={chartColors.chart2}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.chart2 }}
                activeDot={{ r: 6 }}
                name="Intelligence"
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke={chartColors.chart3}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.chart3 }}
                activeDot={{ r: 6 }}
                name="Speed"
              />
              <Line
                type="monotone"
                dataKey="reliability"
                stroke={chartColors.chart4}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.chart4 }}
                activeDot={{ r: 6 }}
                name="Reliability"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}