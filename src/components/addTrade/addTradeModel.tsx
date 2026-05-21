"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import PsychologyForm from "./components/psychologyForm";
import GenralFrom from "./components/genralFrom";
import { useState } from "react";
import { useForm, FormProvider, Resolver, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createTradeSchema, CreateTradeInput } from "./createTradeSchema";
import { createTrade, updateTrade } from "@/src/actions/trades/trade";
import { Brain, Info, Loader2 } from "lucide-react";
import { AddStrategyModel } from "../addStrategy/addStrategyModel";
import { toast } from "sonner";
import { TradeDetail, TradeInterface } from "@/src/actions/trades/trade.interface";

const generalFields = [
    "symbol", "entry_price", "exit_price", "quantity",
    "pnl_nominal", "pnl_percentage", "entry_time", "exit_time",
    "strategy_id", "side", "asset_class", "trade_doc_url"
];

const psychologyFields = [
    "notes", "entry_confidence",
    "satisfaction_rating", "mistakes_made", "lessons_learned"
];

interface AddTradeModelProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    onTradeAdded?: () => void;
    editData?: TradeDetail | null;
    tradeId?: string;
}

export function AddTradeModel({
    isVisible,
    setIsVisible,
    onTradeAdded,
    editData,
    tradeId,
}: AddTradeModelProps) {
    const isEditMode = Boolean(editData && tradeId);
    const [activeTab, setActiveTab] = useState<string>("general");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddStrategyOpen, setIsAddStrategyOpen] = useState(false);
    const [strategySearch, setStrategySearch] = useState("");

    const methods = useForm<CreateTradeInput>({
        resolver: yupResolver(createTradeSchema) as Resolver<CreateTradeInput>,
        // 'values' re-populates the form whenever editData changes (edit mode)
        // 'defaultValues' is used for the create flow
        ...(isEditMode && editData
            ? {
                values: {
                    symbol: editData.symbol,
                    entry_price: editData.entry_price,
                    exit_price: editData.exit_price,
                    quantity: editData.quantity,
                    pnl_nominal: editData.pnl_nominal,
                    pnl_percentage: editData.pnl_percentage,
                    entry_time: new Date(editData.entry_time),
                    exit_time: new Date(editData.exit_time),
                    strategy_id: editData.strategy_id ?? "",
                    side: editData.side as "Long" | "Short",
                    asset_class: editData.asset_class as "Equity" | "Crypto" | "Forex" | "Options",
                    notes: editData.notes ?? "",
                    trade_doc_url: (editData.trade_doc_url ?? []).filter(Boolean) as string[],
                    entry_confidence: editData.entry_confidence ?? 5,
                    satisfaction_rating: editData.satisfaction_rating ?? 5,
                    mistakes_made: (editData.mistakes_made ?? []).filter(Boolean) as string[],
                    lessons_learned: (editData.lessons_learned ?? []).filter(Boolean) as string[],
                },
            }
            : {
                defaultValues: {
                    symbol: "",
                    entry_price: 0,
                    exit_price: 0,
                    quantity: 1,
                    pnl_nominal: 0,
                    pnl_percentage: 0,
                    strategy_id: "",
                    side: "Long",
                    asset_class: "Equity",
                    entry_confidence: 5,
                    satisfaction_rating: 5,
                    notes: "",
                    mistakes_made: [],
                    lessons_learned: [],
                    trade_doc_url: [],
                },
            }),
    });

    const handleClose = (open: boolean) => {
        setIsVisible(open);
        if (!open) {
            methods.reset();
            setActiveTab("general");
        }
    };

    const onSubmit = async (data: CreateTradeInput) => {
        setIsSubmitting(true);
        try {
            if (isEditMode && tradeId) {
                // ── Edit flow ──────────────────────────────────────────────────
                const ok = await updateTrade(tradeId, data as Partial<TradeInterface>);
                if (ok) {
                    setIsVisible(false);
                    methods.reset();
                    setActiveTab("general");
                    onTradeAdded?.();
                    toast.success(`${data.symbol} updated successfully`);
                } else {
                    toast.error("Failed to update trade", {
                        description: "Something went wrong. Please try again.",
                    });
                }
            } else {
                // ── Create flow ────────────────────────────────────────────────
                const res = await createTrade(data as TradeInterface);
                if (res) {
                    setIsVisible(false);
                    methods.reset();
                    setActiveTab("general");
                    onTradeAdded?.();
                    const pnl = data.pnl_nominal ?? 0;
                    toast.success(`${data.symbol} logged successfully`, {
                        description: `P&L: ${pnl >= 0 ? "+" : ""}₹${Number(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                    });
                } else {
                    toast.error("Failed to save trade", {
                        description: "Something went wrong. Please try again.",
                    });
                }
            }
        } catch {
            toast.error("Unexpected error", {
                description: "Could not connect to the server.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onError = (errors: FieldErrors<CreateTradeInput>) => {
        const firstErrorKey = Object.keys(errors)[0];
        if (generalFields.includes(firstErrorKey)) {
            setActiveTab("general");
        } else if (psychologyFields.includes(firstErrorKey)) {
            setActiveTab("psychology");
        }
    };

    return (
        <>
            <Dialog open={isVisible} onOpenChange={handleClose}>
                <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden sm:max-w-[70vw] lg:max-w-[60vw]">
                    <div className="px-6 pt-2">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                                {isEditMode ? `Edit Trade — ${editData?.symbol}` : "New Trade Journal"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <Separator />

                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex flex-col flex-1 overflow-hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden w-full">
                                <div>
                                    <TabsList variant={"line"} className="w-full grid grid-cols-2">
                                        <TabsTrigger value="general" className="text-base"><Info className="mr-2 h-4 w-4" /> General</TabsTrigger>
                                        <TabsTrigger value="psychology" className="text-base"><Brain className="mr-2 h-4 w-4" /> Psychology</TabsTrigger>
                                    </TabsList>
                                </div>

                                <Separator />

                                <div className="flex-1 overflow-y-auto px-6 py-4">
                                    <TabsContent value="general" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <GenralFrom
                                            setIsAddStrategyOpen={setIsAddStrategyOpen}
                                            setStrategySearch={setStrategySearch}
                                        />
                                    </TabsContent>
                                    <TabsContent value="psychology" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <PsychologyForm />
                                    </TabsContent>
                                </div>

                                <Separator />

                                <div className="flex justify-end gap-3 p-4 bg-muted/20">
                                    <Button type="button" variant="outline" onClick={() => setIsVisible(false)} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="default" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isEditMode ? "Save Changes" : "Save Trade"}
                                    </Button>
                                </div>
                            </Tabs>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            <AddStrategyModel
                isOpen={isAddStrategyOpen}
                onClose={() => setIsAddStrategyOpen(false)}
                initialTitle={strategySearch}
                onSuccess={(newStrategy) => {
                    methods.setValue("strategy_id", newStrategy._id || newStrategy.id);
                    setIsAddStrategyOpen(false);
                }}
            />
        </>
    );
}