"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { ChartSkeleton } from "./skeleton";

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  type?: "bar" | "line" | "pie";
  data: ChartDataPoint[];
  dataKey?: string;
  nameKey?: string;
  loading?: boolean;
  valueFormatter?: (val: number) => string;
  height?: number;
  colors?: string[];
  action?: React.ReactNode;
}

const DEFAULT_COLORS = [
  "#e85d04", // blaze primary
  "#1b4332", // moss
  "#2d6a4f", // fern
  "#3a86ff", // accent blue
  "#ff006e", // accent pink
  "#8338ec", // accent purple
  "#f77f00", // amber
];

export function ChartCard({
  title,
  description,
  type = "bar",
  data,
  dataKey = "value",
  nameKey = "label",
  loading = false,
  valueFormatter = (val) => String(val),
  height = 300,
  colors = DEFAULT_COLORS,
  action,
}: ChartCardProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {type === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line, rgba(0,0,0,0.1))" />
                <XAxis
                  dataKey={nameKey}
                  stroke="var(--muted, #666)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted, #666)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={valueFormatter}
                />
                <Tooltip
                  formatter={(val: any) => [valueFormatter(Number(val)), ""]}
                  contentStyle={{
                    backgroundColor: "var(--panel, #fff)",
                    borderColor: "var(--line, #ccc)",
                    borderRadius: "8px",
                    color: "var(--ink, #000)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={colors[0]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors[0] }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : type === "pie" ? (
              <PieChart>
                <Tooltip
                  formatter={(val: any) => [valueFormatter(Number(val)), ""]}
                  contentStyle={{
                    backgroundColor: "var(--panel, #fff)",
                    borderColor: "var(--line, #ccc)",
                    borderRadius: "8px",
                    color: "var(--ink, #000)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey={dataKey}
                  nameKey={nameKey}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line, rgba(0,0,0,0.1))" />
                <XAxis
                  dataKey={nameKey}
                  stroke="var(--muted, #666)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted, #666)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={valueFormatter}
                />
                <Tooltip
                  formatter={(val: any) => [valueFormatter(Number(val)), ""]}
                  contentStyle={{
                    backgroundColor: "var(--panel, #fff)",
                    borderColor: "var(--line, #ccc)",
                    borderRadius: "8px",
                    color: "var(--ink, #000)",
                  }}
                />
                <Bar dataKey={dataKey} fill={colors[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
