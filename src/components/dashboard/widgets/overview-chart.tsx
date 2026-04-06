'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// MOCK DATA CHART
const data = [
  { name: 'Wrz', przychod: 35000, koszty: 15000 },
  { name: 'Paź', przychod: 42000, koszty: 18000 },
  { name: 'Lis', przychod: 28000, koszty: 22000 },
  { name: 'Gru', przychod: 55000, koszty: 25000 },
  { name: 'Sty', przychod: 48000, koszty: 20000 },
  { name: 'Lut', przychod: 62000, koszty: 24000 },
];

export function OverviewChart() {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1121] h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Wyniki Finansowe</CardTitle>
        <CardDescription>Przychody vs Koszty (Ostatnie 6 miesięcy)</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[350px] w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                opacity={0.2}
              />

              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
                dx={-10}
              />

              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ paddingBottom: 4 }}
              />

              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" iconSize={8} />

              <Bar
                dataKey="przychod"
                name="Przychód"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />

              <Bar
                dataKey="koszty"
                name="Koszty"
                fill="orange"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
