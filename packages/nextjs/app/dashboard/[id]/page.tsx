"use client";

import React from "react";
import { NextPage } from "next";
import Island from "~~/components/ui/island";

const DashboardPage: NextPage = () => {
  return (
    <div>
      <Island />
      <p>dashboard testing</p>
      <div style={{ height: 1000 }} />
    </div>
  );
};

export default DashboardPage;
