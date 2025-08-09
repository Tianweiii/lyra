"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { GET_ACCOUNTS, GET_TRANSFERS } from "../../../graphql/queries";
import { useQuery } from "@apollo/client";
import { formatUnits } from "ethers";
import { NextPage } from "next";
import { useMediaQuery } from "react-responsive";
import { useAccount } from "wagmi";
// import { BackgroundBeams } from "~~/components/ui/background-beams";
// import CandleChart from "~~/components/ui/candlestick-chart";
import Island from "~~/components/ui/island";
import { BackgroundGradient } from "~~/components/ui/neon-div";
// import NeonButton from "~~/components/ui/neon-button";
import Example from "~~/components/ui/pie-chart";
import PriceChart from "~~/components/ui/price-chart";
import CoinTable, { CoinDataProps } from "~~/components/ui/table";
import UserTable, { UserDataProps } from "~~/components/ui/usertable";
import { loadUserData, splitDecimal } from "~~/utils/helper";

type RenderMapProps = {
  [key: string]: {
    title: string;
    onClick: () => void;
    iconPath: string;
  };
};

const getRole = (id: string | number | undefined) => {
  switch (id?.toString()) {
    case "123":
      return "merchant";
    case "124":
      return "admin";
    default:
      return "user";
  }
};

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const accountId = useAccount().address;

  const { data: accountData } = useQuery(GET_ACCOUNTS, {
    variables: { accountId: accountId?.toString() || "" },
  });

  const balance = accountData?.accounts[0]?.balance || 0;
  const amount: number = parseFloat(formatUnits(balance, 18)); // in wei

  // converted wallet amount
  const walletAmount: number = amount;
  const currencyType: string = "USD";
  // lyra coin  balance
  const coinAmount: number = amount;
  const coinType: string = "LYRA";

  // 123 == merchant, 124 == admin, else user
  const role = getRole(id?.toString());

  const renderMap: RenderMapProps = {
    user: {
      title: "Make Payment",
      onClick: () => router.push("/payment/user"),
      iconPath: "/icons/qr-scan.svg",
    },
    merchant: {
      title: "Generate QR",
      onClick: () => router.push("/payment/merchant"),
      iconPath: "/icons/qr-scan.svg",
    },
    admin: {
      title: "Send Coins",
      onClick: () => router.push("/sendcoins"),
      iconPath: "/icons/send.svg",
    },
  };

  // TODO: Query transfer history here
  const {
    loading: transferLoading,
    error: transferError,
    data: transferData,
  } = useQuery(GET_TRANSFERS, {
    variables: { accountId: accountId?.toString() || "" },
  });

  if (transferLoading) return <p>Loading...</p>;
  if (transferError) return <p>Error: {transferError.message}</p>;

  // Transform the data into the format expected by CoinTable
  const tableData: CoinDataProps[] = transferData.transfers.map((transfer: any) => ({
    data: {
      id: transfer.id,
      date: new Date(transfer.blockTimestamp * 1000), // Convert to JavaScript Date
      coin: {
        name: "LYRA",
        icon: { src: "/icons/lyra.svg", alt: "LYRA icon", width: 24, height: 24 },
      },
      merchant: transfer.to, // Assuming 'to' is the merchant address
      amount: parseFloat(formatUnits(transfer.value, 18)),
      type: "pay", // Assuming all transfers are payments
      status: transfer.transactionHash ? "completed" : "pending", // Example logic for status
    },
  }));

  // const tableData: CoinDataProps[] = [
  //   {
  //     data: {
  //       id: "1",
  //       date: new Date("2025-08-01T10:00:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Coinbase",
  //       amount: 120.5,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "2",
  //       date: new Date("2025-08-02T11:15:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Binance",
  //       amount: 45.0,
  //       type: "pay",
  //       status: "pending",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "3",
  //       date: new Date("2025-08-03T08:30:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Kraken",
  //       amount: 300.75,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "4",
  //       date: new Date("2025-08-04T09:00:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "OKX",
  //       amount: 87.9,
  //       type: "pay",
  //       status: "failed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "5",
  //       date: new Date("2025-08-05T12:00:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Gemini",
  //       amount: 210.0,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "6",
  //       date: new Date("2025-08-06T14:00:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Bybit",
  //       amount: 160.25,
  //       type: "pay",
  //       status: "pending",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "7",
  //       date: new Date("2025-08-07T16:00:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "KuCoin",
  //       amount: 74.4,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "8",
  //       date: new Date("2025-08-08T13:30:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Bitfinex",
  //       amount: 95.0,
  //       type: "pay",
  //       status: "failed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "9",
  //       date: new Date("2025-08-09T15:20:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Crypto.com",
  //       amount: 180.33,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "10",
  //       date: new Date("2025-08-10T09:45:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "MoonPay",
  //       amount: 33.1,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "11",
  //       date: new Date("2025-08-11T10:05:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Simplex",
  //       amount: 250.0,
  //       type: "pay",
  //       status: "pending",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "12",
  //       date: new Date("2025-08-12T11:25:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Ramp",
  //       amount: 410.2,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "13",
  //       date: new Date("2025-08-13T12:15:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Transak",
  //       amount: 12.99,
  //       type: "pay",
  //       status: "failed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "14",
  //       date: new Date("2025-08-14T14:50:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Binance US",
  //       amount: 99.99,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  //   {
  //     data: {
  //       id: "15",
  //       date: new Date("2025-08-15T17:30:00Z"),
  //       coin: {
  //         name: "USDC",
  //         icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
  //       },
  //       merchant: "Robinhood",
  //       amount: 135.0,
  //       type: "pay",
  //       status: "completed",
  //     },
  //   },
  // ];

  const userData: UserDataProps[] = loadUserData();

  return (
    <div className="flex flex-col md:px-24 px-5 py-12 gap-2 mt-10 relative antialiased">
      <Island />
      <div className="flex md:flex-row flex-col h-[45vh] gap-2 z-[10]">
        {/* box 1 */}
        <div className="flex-3 h-[45vh] rounded-lg md:px-8 py-8 flex flex-col gap-5 bg-[#1e1e1e]">
          <p className="text-sm md:text-xl font-normal px-4">Total Balance</p>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-end gap-1">
              <p className="text-2xl md:text-4xl">${splitDecimal(walletAmount, "full")}</p>
              <p className="text-gray-500 text-xl  md:text-3xl">.{splitDecimal(walletAmount, "decimal")}</p>
            </div>
            <p className="text-gray-500 font-semibold">
              {coinAmount} {coinType}s &middot; {currencyType}
            </p>
          </div>
          <PriceChart />
        </div>
        {/* box 2 */}
        <div className="flex-2 md:h-[45vh] flex flex-col gap-2">
          <div className="w-full flex-1 flex gap-2">
            {/* spent this month here */}
            <div className="bg-[#1e1e1e] rounded-lg flex-1">
              <Example />
            </div>
            {/* make payment here */}
            <BackgroundGradient
              containerClassName="rounded-lg flex-1"
              className="w-full h-full bg-[#1e1e1e] p-4 flex flex-col justify-between rounded-lg hover:cursor-pointer"
              onClick={renderMap[role].onClick}
            >
              <>
                <div className="self-end md:p-4 p-2 bg-[#757575] rounded-full">
                  <Image
                    src={renderMap[role].iconPath}
                    width={isMobile ? 20 : 30}
                    height={isMobile ? 20 : 30}
                    alt="Qr Scan Icon"
                  />
                </div>
                <p className="text-xl">{renderMap[role].title}</p>
              </>
            </BackgroundGradient>
          </div>
        </div>
      </div>

      <CoinTable data={tableData} />

      {role === "admin" && <UserTable data={userData} />}
      {/* <BackgroundBeams className="z-0" /> */}
    </div>
  );
};

export default DashboardPage;
