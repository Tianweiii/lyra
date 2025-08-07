"use client";

import React from "react";
import { NextPage } from "next";
import Island from "~~/components/ui/island";
import PriceChart from "~~/components/ui/price-chart";
import CoinTable, { CoinDataProps } from "~~/components/ui/table";
import { splitDecimal } from "~~/utils/helper";

const DashboardPage: NextPage = () => {
  // const [type, setType] = useState<"history" | "price">("history");
  // const secondary: string = "#8c8c8c";
  const walletAmount: number = 91255.38;
  const coinType: string = "USDC";
  const currencyType: string = "USD";

  // TODO: Query subgraph here
  const tableData: CoinDataProps[] = [
    {
      data: {
        id: "1",
        date: new Date("2025-08-01T10:00:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Coinbase",
        amount: 120.5,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "2",
        date: new Date("2025-08-02T11:15:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Binance",
        amount: 45.0,
        type: "pay",
        status: "pending",
      },
    },
    {
      data: {
        id: "3",
        date: new Date("2025-08-03T08:30:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Kraken",
        amount: 300.75,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "4",
        date: new Date("2025-08-04T09:00:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "OKX",
        amount: 87.9,
        type: "pay",
        status: "failed",
      },
    },
    {
      data: {
        id: "5",
        date: new Date("2025-08-05T12:00:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Gemini",
        amount: 210.0,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "6",
        date: new Date("2025-08-06T14:00:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Bybit",
        amount: 160.25,
        type: "pay",
        status: "pending",
      },
    },
    {
      data: {
        id: "7",
        date: new Date("2025-08-07T16:00:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "KuCoin",
        amount: 74.4,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "8",
        date: new Date("2025-08-08T13:30:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Bitfinex",
        amount: 95.0,
        type: "pay",
        status: "failed",
      },
    },
    {
      data: {
        id: "9",
        date: new Date("2025-08-09T15:20:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Crypto.com",
        amount: 180.33,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "10",
        date: new Date("2025-08-10T09:45:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "MoonPay",
        amount: 33.1,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "11",
        date: new Date("2025-08-11T10:05:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Simplex",
        amount: 250.0,
        type: "pay",
        status: "pending",
      },
    },
    {
      data: {
        id: "12",
        date: new Date("2025-08-12T11:25:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Ramp",
        amount: 410.2,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "13",
        date: new Date("2025-08-13T12:15:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Transak",
        amount: 12.99,
        type: "pay",
        status: "failed",
      },
    },
    {
      data: {
        id: "14",
        date: new Date("2025-08-14T14:50:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Binance US",
        amount: 99.99,
        type: "pay",
        status: "completed",
      },
    },
    {
      data: {
        id: "15",
        date: new Date("2025-08-15T17:30:00Z"),
        coin: {
          name: "USDC",
          icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
        },
        merchant: "Robinhood",
        amount: 135.0,
        type: "pay",
        status: "completed",
      },
    },
  ];

  return (
    <div className="flex flex-col px-24 py-12 gap-2 mt-10">
      <Island />
      <div className="flex flex-row h-[45vh] gap-2">
        {/* box 1 */}
        <div className="flex-2 h-[45vh] rounded-lg px-8 py-6 flex flex-col gap-5 bg-[#1e1e1e]">
          <p className="text-xl font-normal">Total Balance</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-1">
              <p className="text-4xl">${splitDecimal(walletAmount, "full")}</p>
              <p className="text-gray-500 text-3xl">.{splitDecimal(walletAmount, "decimal")}</p>
            </div>
            <p className="text-gray-500 font-semibold">
              {coinType}s &middot; {currencyType}
            </p>
          </div>
          <PriceChart />
        </div>
        {/* box 2 */}
        <div className="bg-[#1e1e1e] flex-1 h-[45vh] rounded-lg">make payment</div>
      </div>

      {/* <div className="border-1 h-[45vh] rounded-md">
        payment history
      </div> */}
      <CoinTable data={tableData} />
    </div>
  );
};

export default DashboardPage;
