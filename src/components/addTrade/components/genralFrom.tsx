"use client";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import FormInput from "@/src/components/common/formInput";
import { CreateTradeInput } from "../createTradeSchema";
import FileUpload from "../../common/fileUpload";
import SearchableSelect from "../../common/searchableSelect";
import { getAllStrategies } from "@/src/actions/strategie";

interface GenralFromProps {
  setIsAddStrategyOpen: (value: boolean) => void;
  setStrategySearch: (value: string) => void;
}

function GenralFrom({ setIsAddStrategyOpen, setStrategySearch }: GenralFromProps) {
  const { control, watch, setValue } = useFormContext<CreateTradeInput>();

  const entry_price = watch("entry_price");
  const exit_price = watch("exit_price");
  const quantity = watch("quantity");
  const side = watch("side");

  const pnl_nominal = watch("pnl_nominal") || 0;

  const pnlStyle = pnl_nominal > 0 
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50 font-bold" 
    : pnl_nominal < 0 
      ? "bg-red-500/10 text-red-500 border-red-500/50 font-bold" 
      : "bg-muted/50 text-muted-foreground";

  useEffect(() => {
    const entry = Number(entry_price);
    const exit = Number(exit_price);
    const qty = Number(quantity);

    if (entry > 0 && exit > 0 && qty > 0) {
      let pnl = 0;
      let pnlPercent = 0;

      if (side === "Long") {
        pnl = (exit - entry) * qty;
        pnlPercent = ((exit - entry) / entry) * 100;
      } else if (side === "Short") {
        pnl = (entry - exit) * entry * qty / entry; // Standardizing short calc
        pnlPercent = ((entry - exit) / entry) * 100;
      }

      // CLAMPING: This prevents the value from exceeding 100 or falling below -100
      const clampedPercent = Math.min(Math.max(pnlPercent, -100), 100);

      setValue("pnl_nominal", Number(pnl.toFixed(2)));
      setValue("pnl_percentage", Number(clampedPercent.toFixed(2)));
    } else {
      setValue("pnl_nominal", 0);
      setValue("pnl_percentage", 0);
    }
  }, [entry_price, exit_price, quantity, side, setValue]);

  return (
    <div>      
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pb-2">
      <FormInput
        name="symbol"
        control={control}
        label="Symbol"
        placeholder="e.g. AAPL, BTC/USD"
        required={true}
      />
        <FormInput
          name="asset_class"
          control={control}
          label="Asset Class"
          type="select"
          options={[
            { label: "Equity", value: "Equity" },
            { label: "Crypto", value: "Crypto" },
            { label: "Forex", value: "Forex" },
            { label: "Options", value: "Options" },
          ]}
          required={true}
        />
        <FormInput
          name="side"
          control={control}
          label="Side"
          type="select"
          options={[
            { label: "Long", value: "Long" },
            { label: "Short", value: "Short" },
          ]}
          required={true}
        />

      <FormInput
        name="entry_price"
        control={control}
        label="Entry Price"
        placeholder="0.00"
        type="number"
        required={true}
      />
      <FormInput
        name="exit_price"
        control={control}
        label="Exit Price"
        placeholder="0.00"
        required={true}
        type="number"
      />

      <FormInput
        name="quantity"
        control={control}
        label="Quantity"
        placeholder="1"
        type="number"
        required={true}
      />
      <SearchableSelect
        name="strategy_id"
        control={control}
        label="Strategy"
        placeholder="Search strategies..."
        onSearch={async (search) => {
          const strategies = await getAllStrategies({ search, limit: 10 });
          return (strategies || []).map((s: any) => ({
            label: s.title,
            value: s._id || s.id,
          }));
        }}
        onAddNew={(search) => {
          setStrategySearch(search);
          setIsAddStrategyOpen(true);
        }}
        addNewLabel="Create strategy"
        required={true}
      />

      <FormInput
        name="pnl_nominal"
        control={control}
        label="PnL"
        placeholder="0.00"
        type="number"
        isReadOnly={true}
        required={true}
        style={pnlStyle}
      />
      <FormInput
        name="pnl_percentage"
        control={control}
        label="PnL (%)"
        placeholder="0.00"
        type="number"
        isReadOnly={true}
        required={true}
        style={pnlStyle}
      />

      <FormInput
        name="entry_time"
        control={control}
        label="Entry Time"
        type="datetime-local"
        required={true}
      />
      <FormInput
        name="exit_time"
        control={control}
        label="Exit Time"
        type="datetime-local"
        required={true}
      />
    </div>
    <FormInput
      name="notes"
      control={control}
      label="Notes"
      type="textarea"
      placeholder="Enter your notes here..."
      style="w-full h-30 "
    />
    <FileUpload
      name="trade_image_url"
      control={control}
      label="Trade Screenshots"
    />
    </div>
  );
}

export default GenralFrom;