"use client";
import Header from "@/src/components/common/header";
import ActionButtons from "@/src/components/pages/dashboard/components/actionButtons";
import { AddTradeModel } from "../../addTrade/addTradeModel";
import { useState } from "react";

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div>
      <div>
        <Header title="Dashboard" />
        <ActionButtons addTrade={setIsVisible} />
      </div>
      <AddTradeModel isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
};

export default Dashboard;
