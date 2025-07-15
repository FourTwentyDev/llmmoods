'use client';

import { useMemo } from 'react';
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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value.toFixed(2)}
            </p>
          ))}
          <p className="text-sm text-gray-500 mt-2">
            {data.find(d => formatDate(d.date) === label)?.votes || 0} votes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Performance History</h3>
        <p className="text-sm text-gray-500 mt-1">Daily average ratings from community votes</p>
      </div>
      <div className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorIntelligence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorReliability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                ticks={[0, 1, 2, 3, 4, 5]}
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
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
                name="Performance"
              />
              <Line
                type="monotone"
                dataKey="intelligence"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#8b5cf6' }}
                activeDot={{ r: 6 }}
                name="Intelligence"
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
                name="Speed"
              />
              <Line
                type="monotone"
                dataKey="reliability"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
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