"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { formatCompactCurrency } from "@/lib/format";

export function SalesChart({
  totalSales,
  totalPaid,
}: {
  totalSales: number;
  totalPaid: number;
}) {
  // Placeholder trend derived from totals until per-period data exists.
  const chartData = [
    { name: "Sales", value: totalSales },
    { name: "Collected", value: totalPaid },
  ];

  const isGrouped = false;

  if (!isGrouped) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(185 18% 86%)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(Number(v))} />
          <Tooltip formatter={(v) => formatCompactCurrency(Number(v))} />
          <Bar dataKey="value" fill="hsl(180 60% 30%)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(180 60% 30%)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(180 60% 30%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(185 18% 86%)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(Number(v))} />
        <Tooltip formatter={(v) => formatCompactCurrency(Number(v))} />
        <Legend />
        <Area type="monotone" dataKey="value" name="Sales" stroke="hsl(180 60% 30%)" fill="url(#sales)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
