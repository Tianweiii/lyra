"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  BugAntIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Lyra Payment System</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <p className="text-center text-lg mt-4">A blockchain-based payment system with role-based access control</p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-8 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <BuildingOfficeIcon className="h-8 w-8 fill-secondary" />
              <h3 className="text-lg font-semibold mb-2">Government Portal</h3>
              <p className="mb-4 text-sm">Swap USDT/MATIC to LYRA and send to recipients</p>
              <Link href="/government" passHref className="btn btn-primary btn-sm">
                Access Portal
              </Link>
            </div>

            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <ShoppingBagIcon className="h-8 w-8 fill-secondary" />
              <h3 className="text-lg font-semibold mb-2">Merchant Portal</h3>
              <p className="mb-4 text-sm">Generate QR codes and swap LYRA back to USDT/MATIC</p>
              <Link href="/merchant" passHref className="btn btn-primary btn-sm">
                Access Portal
              </Link>
            </div>

            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <UserIcon className="h-8 w-8 fill-secondary" />
              <h3 className="text-lg font-semibold mb-2">Resident Payment</h3>
              <p className="mb-4 text-sm">Pay merchants with LYRA tokens</p>
              <Link href="/payment" passHref className="btn btn-primary btn-sm">
                Make Payment
              </Link>
            </div>
          </div>

          <div className="flex justify-center items-center gap-8 flex-col md:flex-row mt-8">
            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <UserIcon className="h-8 w-8 fill-secondary" />
              <p>
                Test external contracts with the{" "}
                <Link href="/external-contracts" passHref className="link">
                  External Contracts Demo
                </Link>{" "}
                page.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-8 py-8 text-center items-center max-w-xs rounded-3xl">
              <BuildingOfficeIcon className="h-8 w-8 fill-secondary" />
              <p>
                Check OTC status and fund the contract at{" "}
                <Link href="/otc-status" passHref className="link">
                  OTC Status
                </Link>{" "}
                and{" "}
                <Link href="/fund-otc" passHref className="link">
                  Fund OTC
                </Link>{" "}
                or{" "}
                <Link href="/fund-matic" passHref className="link">
                  Fund MATIC
                </Link>
                . Setup contract permissions at{" "}
                <Link href="/setup-contracts" passHref className="link">
                  Setup Contracts
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
