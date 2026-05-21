"use client";
import Header from "@/src/components/common/header";
import ActionButtons from "@/src/components/pages/dashboard/components/actionButtons";
import { AddTradeModel } from "../../addTrade/addTradeModel";
import { useState } from "react";
import StatsCards from "./components/statsCards";
import ConfidenceIndex from "./components/confidenceIndex";
import PerformanceAndTopTrades from "./components/performanceAndTopTrades";
import InsightCards from "./components/insightCards";
import TradingCalendar from "@/src/components/pages/calendar/components/tradingCalendar";
import { DashboardRefreshProvider, useDashboardRefresh } from "./dashboardRefreshContext";

// Inner component so it can consume the context
function DashboardInner() {
  const [isVisible, setIsVisible] = useState(false);
  const { triggerRefresh } = useDashboardRefresh();

  return (
    <div>
      <Header title="Dashboard" />
      <ActionButtons addTrade={setIsVisible} />
      <StatsCards />
      <ConfidenceIndex />
      <PerformanceAndTopTrades />
      <div className="mx-3 mt-4">
        <TradingCalendar mini={true} />
      </div>
      <InsightCards />
      <AddTradeModel
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onTradeAdded={triggerRefresh}
      />
    </div>
  );
}

const Dashboard = () => (
  <DashboardRefreshProvider>
    <DashboardInner />
  </DashboardRefreshProvider>
);

export default Dashboard;
