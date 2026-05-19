"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { createStrategy } from "@/src/actions/strategies/strategie";
import FormInput from "../common/formInput";
import { useForm, Resolver } from "react-hook-form";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { createStrategySchema, CreateStrategyInput } from "./createStrategySchema";
import { yupResolver } from "@hookform/resolvers/yup";

interface AddStrategyModelProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newStrategy: any) => void;
    initialTitle?: string;
}

export function AddStrategyModel({ isOpen, onClose, onSuccess, initialTitle }: AddStrategyModelProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(createStrategySchema) as Resolver<CreateStrategyInput>,
        defaultValues: {
            title: initialTitle || "",
            description: ""
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: initialTitle || "",
                description: ""
            });
        }
    }, [initialTitle, isOpen, reset]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const result = await createStrategy(data);
            if (result) {
                onSuccess?.(result);
                reset();
                onClose();
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
                    <DialogTitle>Add New Strategy</DialogTitle>
                    <DialogDescription>
                        Create a new trading strategy to log your trades.
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Strategy
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}