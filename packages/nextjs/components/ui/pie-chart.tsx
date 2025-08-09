"use client";

import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

export const transformWalletDataByMonth = (walletData: { date: string; amount: number }[]) => {
  const monthlyTotals: Record<string, number> = {};

  walletData.forEach(({ date, amount }) => {
    const month = new Date(date).toLocaleString("default", { month: "short", year: "numeric" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
  });

  return Object.entries(monthlyTotals).map(([name, value]) => ({ name, value }));
};

const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState({
    innerRadius: 80,
    outerRadius: 100,
    fontSize: 16,
    padding: 20,
    legendFontSize: 14,
  });

  React.useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;

      if (width > 1024) {
        setDimensions({
          innerRadius: 80,
          outerRadius: 100,
          fontSize: 16,
          padding: 20,
          legendFontSize: 14,
        });
      } else if (width > 1400) {
        setDimensions({
          innerRadius: 50,
          outerRadius: 70,
          fontSize: 16,
          padding: 18,
          legendFontSize: 12,
        });
      } else {
        setDimensions({
          innerRadius: 30,
          outerRadius: 50,
          fontSize: 15,
          padding: 15,
          legendFontSize: 11,
        });
      }

      // if (width < 768) {
      //   setDimensions({
      //     innerRadius: 30,
      //     outerRadius: 50,
      //     fontSize: 15,
      //     padding: 15,
      //     legendFontSize: 11,
      //   });
      // } else if (width < 1024) {
      //   setDimensions({
      //     innerRadius: 50,
      //     outerRadius: 70,
      //     fontSize: 16,
      //     padding: 18,
      //     legendFontSize: 12,
      //   });
      // } else {
      //   setDimensions({
      //     innerRadius: 80,
      //     outerRadius: 100,
      //     fontSize: 16,
      //     padding: 20,
      //     legendFontSize: 14,
      //   });
      // }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return dimensions;
};

const DonutChart = () => {
  const rawData = generateWalletData();
  const data = transformWalletDataByMonth(rawData);
  const { innerRadius, outerRadius, fontSize, padding, legendFontSize } = useResponsiveDimensions();

  return (
    <div
      style={{
        width: "100%",
        height: "95%",
        backgroundColor: "#1c1c1c",
        padding: padding,
        borderRadius: 12,
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: 10,
          fontSize: fontSize,
          textAlign: "center",
          margin: `0 0 ${padding / 2}px 0`,
        }}
      >
        Monthly Wallet Summary
      </h2>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "grey",
                color: "white",
                border: "none",
                borderRadius: 4,
                fontSize: Math.max(legendFontSize, 10),
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                color: "white",
                fontSize: legendFontSize,
                paddingTop: "10px",
              }}
              iconSize={Math.max(legendFontSize - 2, 8)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart;
