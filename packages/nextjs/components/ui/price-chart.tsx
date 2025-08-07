import React from "react";
import { useMediaQuery } from "react-responsive";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: isMobile ? "0.5rem" : "1rem",
        borderRadius: "8px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={generateWalletData()}>
          <XAxis
            dataKey="date"
            tick={{
              fill: "#aaa",
              fontSize: isMobile ? 8 : 12,
            }}
            axisLine={false}
            tickLine={false}
            minTickGap={isMobile ? 20 : 0}
          />

          <YAxis
            tickFormatter={v => `$${v / 1000}k`}
            tick={{
              fill: "#aaa",
              fontSize: isMobile ? 8 : 12,
            }}
            axisLine={false}
            tickLine={false}
            {...(isMobile && {
              width: 30,
            })}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              border: "none",
              fontSize: isMobile ? "12px" : "14px",
            }}
            labelStyle={{ color: "#ccc" }}
            formatter={(value, name) => [`$${value}`, name === "amount" ? "Balance" : "Volume"]}
          />

          <Bar dataKey="volume" barSize={isMobile ? 2 : 4} fill="#444" radius={[2, 2, 0, 0]} />

          <Line type="monotone" dataKey="amount" stroke="#ffffff" strokeWidth={isMobile ? 1.5 : 2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WalletBalanceChart;
