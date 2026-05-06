import React from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

function ActionButtons({ addTrade }: { addTrade: (value: boolean) => void }) {
  return (
    <div className="flex gap-2 w-full justify-end items-center p-3">
      <Button variant="secondary" className="cursor-pointer" onClick={() => addTrade(true)}><Plus /> New Trade</Button>
    </div>
  );
}

export default ActionButtons;
