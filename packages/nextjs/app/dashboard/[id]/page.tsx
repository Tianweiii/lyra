"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { GET_TRANSFERS } from "../../../graphql/queries";
import { useQuery } from "@apollo/client";
import { formatUnits } from "ethers";
import { motion } from "motion/react";
import { NextPage } from "next";
import { useMediaQuery } from "react-responsive";
import { useAccount } from "wagmi";
import Island from "~~/components/ui/island";
import { BackgroundGradient } from "~~/components/ui/neon-div";
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
  const [address, setAddress] = useState<string>("");
  const router = useRouter();
  const { id } = useParams();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { address: wagmiAddress } = useAccount();

  // New state to hold fetched balance data
  const [amount, setAmount] = useState<number>(0); // Add amount to state
  const [hasFetchedBalance, setHasFetchedBalance] = useState<boolean>(false);

  useEffect(() => {
    if (wagmiAddress) {
      setAddress(wagmiAddress);
    }
  }, [wagmiAddress]);

  useEffect(() => {
    const contractAddress = "0xc11bd7b043736423dbc2d70ae5a0f642f9959257";
    const apiKey = "NBXFCCHJ8RSXX3X86E4QU1FTJK7JG5ZTD5";

    const fetchBalances = async () => {
      try {
        const res = await fetch(
          `https://api.etherscan.io/v2/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${apiKey}&chainid=137`,
        );

        if (!res.ok) throw new Error("Network response was not ok");

        const json = await res.json();

        // Update the amount state here after a successful fetch
        const balanceString = json.result;
        try {
          const formattedBalance = formatUnits(balanceString, 18);
          setAmount(parseFloat(formattedBalance));
          setHasFetchedBalance(true);
        } catch (err) {
          console.error("Error formatting balance:", err);
          setAmount(0);
        }
      } catch (err) {
        console.error("Error fetching token balance:", err);
      }
    };

    fetchBalances();
  }, [address, hasFetchedBalance]);

  // converted wallet amount
  const walletAmount: number = amount;
  const currencyType: string = "USD";
  // lyra coin  balance
  const coinAmount: number = amount;
  const coinType: string = "LYRA";
  const role = getRole(id?.toString());
  const accountId = role === "admin" ?  "0x5265BCcc8aB5A36A45ABD2E574E6Fa7F863e5C2e": useAccount().address || "";

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
    variables: { accountId },
  });

  if (transferLoading)
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <motion.div
          className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
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

  const userData: UserDataProps[] = loadUserData();

  return (
    <div className="flex flex-col md:px-24 px-5 py-16 gap-2 relative antialiased">
      <Island />
      <div className="flex lg:flex-row flex-col gap-2 z-[10] md:h-[45vh] h-[70vh]">
        {/* box 1 */}
        <div className="lg:flex-3 flex-4 rounded-lg md:px-8 py-8 flex flex-col gap-5 bg-[#1e1e1e]">
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
          <PriceChart accountId={accountId} />
        </div>
        {/* box 2 */}
        <div className="flex-1 lg:flex-2 flex flex-col gap-2">
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
