"use client";
import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/src/components/common/formInput";
import { CreateTradeInput } from "../createTradeSchema";
import SearchableSelect from "../../common/searchableSelect";
import { getAllStrategies } from "@/src/actions/strategies/strategie";
import { searchStocks } from "@/src/actions/stocks/stockActions";

import { UploadDropzone } from "@/src/utils/uploadthing";
import { X, FileIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { FieldError } from "@/src/components/ui/field";
import { cn } from "@/src/lib/utils";

interface GenralFromProps {
  setIsAddStrategyOpen: (value: boolean) => void;
  setStrategySearch: (value: string) => void;
}

function GenralFrom({ setIsAddStrategyOpen, setStrategySearch }: GenralFromProps) {
  const { control, watch, setValue, getValues } = useFormContext<CreateTradeInput>();
  
  const tradeDocUrls = watch("trade_doc_url") || [];

  const handleRemoveFile = (urlToRemove: string) => {
    setValue(
      "trade_doc_url",
      tradeDocUrls.filter((url) => url !== urlToRemove),
      { shouldValidate: true }
    );
  };

  const entry_price = watch("entry_price");
  const exit_price = watch("exit_price");
  const quantity = watch("quantity");
  const side = watch("side");
  const symbol = watch("symbol");

  const pnl_nominal = watch("pnl_nominal") || 0;

  const pnlStyle = pnl_nominal > 0 
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50 font-bold" 
    : pnl_nominal < 0 
      ? "bg-red-500/10 text-red-500 border-red-500/50 font-bold" 
      : "bg-muted/50 text-muted-foreground";

  // Auto-fill entry_time when entry_price is first entered
  useEffect(() => {
    const entry = Number(entry_price);
    if (entry > 0 && !getValues("entry_time")) {
      setValue("entry_time", new Date() as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry_price]);

  // Auto-fill exit_time when exit_price is first entered
  useEffect(() => {
    const exit = Number(exit_price);
    if (exit > 0 && !getValues("exit_time")) {
      setValue("exit_time", new Date() as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exit_price]);

  // PnL calculation
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
        pnl = (entry - exit) * qty;
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
      {/* Symbol — searchable dropdown, only valid NSE stocks */}
      <SearchableSelect
        name="symbol"
        control={control}
        label="Symbol"
        placeholder="Search NSE symbol…"
        required={true}
        options={symbol ? [{ label: symbol, value: symbol }] : []}
        onSearch={async (search) => {
          if (!search || search.trim().length < 1) return [];
          return searchStocks(search);
        }}
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
    <Controller
      name="trade_doc_url"
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2 pt-4">
          <label className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            fieldState.invalid && "text-destructive"
          )}>
            Trade Documents (Images/PDFs)
          </label>
      
      {tradeDocUrls.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-2">
          {tradeDocUrls.map((url, idx) => {
            const isPdf = url.toLowerCase().endsWith(".pdf") || url.includes("type=pdf");
            return (
              <div key={idx} className="relative group border rounded-md overflow-hidden bg-muted/50 w-24 h-24 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all">
                <a href={url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center z-0">
                  {isPdf ? (
                    <>
                      <FileIcon className="h-10 w-10 text-red-500 mb-1 drop-shadow-sm" />
                      <span className="text-[10px] font-semibold text-muted-foreground truncate w-full px-2 text-center uppercase tracking-wider">PDF</span>
                    </>
                  ) : (
                    <Image
                      src={url}
                      alt={`Trade doc ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(url)}
                  className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <UploadDropzone
        endpoint="tradeUploader"
        config={{ mode: "auto" }}
        onClientUploadComplete={(res) => {
          // 'res' contains an array of the uploaded files
          console.log("Files: ", res);
          if (res && res.length > 0) {
            const urls = res.map((file) => {
              if (file.name.toLowerCase().endsWith('.pdf')) {
                return `${file.url}?type=pdf`;
              }
              return file.url;
            });
            setValue("trade_doc_url", [...tradeDocUrls, ...urls], {
              shouldValidate: true,
            });
          }
        }}
        onUploadError={(error: Error) => {
          toast.error(`Upload Failed: ${error.message}`);
        }}
        className="ut-label:text-primary ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-button:ut-uploading:bg-primary/50"
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      )}
    />
    </div>
  );
}

export default GenralFrom;