"use client";

import React from "react";
import { NextPage } from "next";
import Island from "~~/components/ui/island";
import PriceChart from "~~/components/ui/price-chart";
import BasicTable from "~~/components/ui/table";

const DashboardPage: NextPage = () => {
  // const [type, setType] = useState<"history" | "price">("history");
  // const secondary: string = "#8c8c8c";

  return (
    <div className="flex flex-col px-24 py-10 gap-2">
      <Island />
      <div className="flex flex-row h-[45vh] gap-2">
        {/* box 1 */}
        <div className="flex-2 h-[45vh] rounded-lg px-8 py-6 flex flex-col gap-0 bg-[#1e1e1e]">
          <p>Total Balance</p>
          <p>$43,255.38</p>
          <p>USDCs</p>
          <PriceChart />
        </div>
        {/* box 2 */}
        <div className="bg-[#1e1e1e] flex-1 h-[45vh] rounded-lg">make ayment</div>
      </div>

      {/* <div className="border-1 h-[45vh] rounded-md">
        payment history
      </div> */}
      <BasicTable />
    </div>
  );
};

export default DashboardPage;
