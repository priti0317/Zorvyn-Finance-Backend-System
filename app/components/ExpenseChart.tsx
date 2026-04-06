"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ExpenseChart({ data }: any) {
  // Convert object to array if needed
  const chartData = Array.isArray(data)
    ? data
    : Object.entries(data || {}).map(([category, amount]) => ({ category, amount }));

  if (!chartData.length) return <p>No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value: any) => `₹ ${value}`} />
        <Bar dataKey="amount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}