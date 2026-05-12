"use client";
import Header from "@/src/components/common/header";
import ActionButtons from "@/src/components/pages/dashboard/components/actionButtons";
import { AddTradeModel } from "../../addTrade/addTradeModel";
import { useState } from "react";
import StatsCards from "./components/statsCards";
import ConfidenceIndex from "./components/confidenceIndex";
import PerformanceAndTopTrades from "./components/performanceAndTopTrades";
import InsightCards from "./components/insightCards";

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div>
      <Header title="Dashboard" />
      <ActionButtons addTrade={setIsVisible} />
      <StatsCards />
      <ConfidenceIndex />
      <PerformanceAndTopTrades />
      <InsightCards />
      <AddTradeModel isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
};

export default Dashboard;
