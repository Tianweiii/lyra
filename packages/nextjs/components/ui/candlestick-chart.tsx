// import React from "react";
// import { Bar, ComposedChart, Customized, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// // Example OHLC data (Open, High, Low, Close)
// const data = [
//   { date: "2024-08-01", open: 120, high: 130, low: 110, close: 125 },
//   { date: "2024-08-02", open: 125, high: 128, low: 118, close: 122 },
//   { date: "2024-08-03", open: 122, high: 135, low: 121, close: 134 },
//   { date: "2024-08-04", open: 134, high: 140, low: 132, close: 135 },
// ];

// const Candlestick = ({
//   x,
//   y,
//   width,
//   height,
//   payload,
// }: {
//   x: any;
//   y: any;
//   width: number;
//   height?: number;
//   payload: any;
// }) => {
//   const color = payload.close >= payload.open ? "#4caf50" : "#f44336";
//   const top = Math.min(payload.open, payload.close);
//   const bottom = Math.max(payload.open, payload.close);
//   const candleHeight = Math.abs(payload.open - payload.close);
//   const centerX = x + width / 2;

//   return (
//     <g>
//       {/* Wick */}
//       <line x1={centerX} x2={centerX} y1={y(payload.high)} y2={y(payload.low)} stroke={color} strokeWidth={2} />
//       {/* Body */}
//       <rect x={centerX - 4} y={y(top)} width={8} height={Math.max(1, y(bottom) - y(top))} fill={color} />
//     </g>
//   );
// };

// const CandleChart = () => {
//   return (
//     <div style={{ width: "100%", height: 400 }}>
//       <ResponsiveContainer>
//         <ComposedChart data={data}>
//           <XAxis dataKey="date" />
//           <YAxis />
//           <Tooltip />
//           {/* Needed dummy bar for spacing */}
//           <Bar dataKey="close" fill="transparent" />
//           <Customized
//             component={(props: any) => {
//               const { xAxisMap, yAxisMap, data, offset } = props;
//               const x = (d: any) => xAxisMap[0].scale(d.date);
//               const y = (val: any) => yAxisMap[0].scale(val);

//               return (
//                 <g>
//                   {data.map((d: any, i: any) => (
//                     <Candlestick key={i} x={x(d)} y={y} width={xAxisMap[0].bandwidth || 20} payload={d} />
//                   ))}
//                 </g>
//               );
//             }}
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default CandleChart;
