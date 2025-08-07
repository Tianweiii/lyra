import React from "react";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// simulated wallet balance + volume data
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

const WalletBalanceChart = () => {
  return (
    <div style={{ width: "100%", height: "100%", padding: "1rem", borderRadius: "8px" }}>
      <ResponsiveContainer width="100%" height="100%" className={"focus:outline-0"}>
        <ComposedChart data={generateWalletData()}>
          <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} axisLine={false} tickLine={false} />

          <YAxis
            tickFormatter={v => `$${v / 1000}k`}
            tick={{ fill: "#aaa", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{ backgroundColor: "#1e1e1e", border: "none" }}
            labelStyle={{ color: "#ccc" }}
            formatter={(value, name) => [`$${value}`, name === "amount" ? "Balance" : "Volume"]}
          />

          <Bar dataKey="volume" barSize={4} fill="#444" radius={[2, 2, 0, 0]} />

          <Line type="monotone" dataKey="amount" stroke="#ffffff" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WalletBalanceChart;
