"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { createStrategy, updateStrategy } from "@/src/actions/strategies/strategie";
import FormInput from "../common/formInput";
import { useForm, Resolver } from "react-hook-form";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { createStrategySchema, CreateStrategyInput } from "./createStrategySchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { strategy } from "@/src/actions/strategies/strategie.interface";

interface AddStrategyModelProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newStrategy: any) => void;
    initialTitle?: string;
    editData?: strategy | null;
    strategyId?: string;
}

export function AddStrategyModel({ isOpen, onClose, onSuccess, initialTitle, editData, strategyId }: AddStrategyModelProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(editData && strategyId);

    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(createStrategySchema) as Resolver<CreateStrategyInput>,
        defaultValues: {
            title: editData?.title || initialTitle || "",
            description: editData?.description || ""
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: editData?.title || initialTitle || "",
                description: editData?.description || ""
            });
        }
    }, [initialTitle, isOpen, reset, editData]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (isEditMode && strategyId) {
                const ok = await updateStrategy(strategyId, data);
                if (ok) {
                    onSuccess?.({ ...editData, ...data });
                    reset();
                    onClose();
                }
            } else {
                const result = await createStrategy(data);
                if (result) {
                    onSuccess?.(result);
                    reset();
                    onClose();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Strategy" : "Add New Strategy"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode 
                            ? "Modify details of your trading strategy." 
                            : "Create a new trading strategy to log your trades."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormInput
                        name="title"
                        control={control}
                        label="Strategy Name"
                        placeholder="e.g. Trend Following"
                        required={true}
                    />
                    <FormInput
                        name="description"
                        control={control}
                        label="Description"
                        type="textarea"
                        placeholder="Describe your strategy rules..."
                        required={true}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Strategy"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}