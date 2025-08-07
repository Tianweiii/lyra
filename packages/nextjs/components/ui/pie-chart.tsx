"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Define some light/white theme colors
const COLORS = [
  "#ffffff",
  "#dddddd",
  "#cccccc",
  "#bbbbbb",
  "#aaaaaa",
  "#999999",
  "#888888",
  "#777777",
  "#666666",
  "#555555",
  "#444444",
  "#333333",
];

export const generateWalletData = () => {
  const data = [];
  let amount = 1000;

  for (let i = 0; i < 100; i++) {
    const date = new Date(2024, 0, 1 + i);
    amount += (Math.random() - 0.5) * 100;
    data.push({
      date: date.toISOString().split("T")[0],
      amount: Math.round(amount * 100) / 100,
    });
  }

  return data;
};

// utils/transformWalletData.ts
export const transformWalletDataByMonth = (walletData: { date: string; amount: number }[]) => {
  const monthlyTotals: Record<string, number> = {};

  walletData.forEach(({ date, amount }) => {
    const month = new Date(date).toLocaleString("default", { month: "short", year: "numeric" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
  });

  return Object.entries(monthlyTotals).map(([name, value]) => ({ name, value }));
};

const DonutChart = () => {
  const rawData = generateWalletData();
  const data = transformWalletDataByMonth(rawData);

  return (
    <div style={{ width: "100%", height: 320, backgroundColor: "#1c1c1c", padding: 20, borderRadius: 12 }}>
      <h2 style={{ color: "white", marginBottom: 10, fontSize: 16 }}>Monthly Wallet Summary</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "grey", color: "white", border: "none", borderRadius: 4 }} />
          {/* <Legend verticalAlign="bottom" wrapperStyle={{ color: "white" }} /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
