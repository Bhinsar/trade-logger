"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import FormInput from "@/src/components/common/formInput";
import { ChecklistCategory, ChecklistPriority, ChecklistItemResponse } from "@/src/actions/checklist/checklist.interface";
import { createChecklistItem, updateChecklistItem } from "@/src/actions/checklist/checklist";
import { toast } from "sonner";
import { Loader2, Plus, Edit3 } from "lucide-react";

const checklistSchema = yup.object().shape({
  title: yup.string().required("Title is required").max(200, "Title is too long"),
  description: yup.string().max(500, "Description is too long").nullable().default(""),
  category: yup.string().required("Category is required"),
  priority: yup.string().required("Priority is required"),
});

interface ChecklistFormInput {
  title: string;
  description: string | null;
  category: string;
  priority: string;
}

interface ChecklistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: ChecklistItemResponse | null;
}

export default function ChecklistDialog({
  isOpen,
  onClose,
  onSuccess,
  editItem,
}: ChecklistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editItem;

  const methods = useForm<ChecklistFormInput>({
    resolver: yupResolver(checklistSchema),
    defaultValues: {
      title: "",
      description: "",
      category: ChecklistCategory.PreMarket,
      priority: ChecklistPriority.Medium,
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        reset({
          title: editItem.title,
          description: editItem.description || "",
          category: editItem.category,
          priority: editItem.priority,
        });
      } else {
        reset({
          title: "",
          description: "",
          category: ChecklistCategory.PreMarket,
          priority: ChecklistPriority.Medium,
        });
      }
    }
  }, [isOpen, editItem, reset]);

  const onSubmit = async (data: ChecklistFormInput) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && editItem) {
        const success = await updateChecklistItem(editItem.id, {
          title: data.title,
          description: data.description || null,
          category: data.category as ChecklistCategory,
          priority: data.priority as ChecklistPriority,
        });
        if (success) {
          toast.success("Checklist item updated successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to update checklist item");
        }
      } else {
        const result = await createChecklistItem({
          title: data.title,
          description: data.description || null,
          category: data.category as ChecklistCategory,
          priority: data.priority as ChecklistPriority,
          is_active: true,
        });
        if (result) {
          toast.success("Checklist item added successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to create checklist item");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = Object.values(ChecklistCategory).map((val) => ({
    label: val,
    value: val,
  }));

  const priorityOptions = Object.values(ChecklistPriority).map((val) => ({
    label: val,
    value: val,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background-secondary border border-white/10 text-white rounded-xl shadow-2xl p-0 overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2">
          {isEditMode ? (
            <Edit3 className="size-5 text-primary" />
          ) : (
            <Plus className="size-5 text-primary" />
          )}
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {isEditMode ? "Edit Checklist Item" : "Add Checklist Item"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <Separator className="border-white/5" />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
            <FormInput
              name="title"
              control={methods.control}
              label="Item Title"
              placeholder="e.g., Check overnight news & global markets"
              required
              style="bg-[#191a29] border-white/10 text-white focus:border-primary placeholder:text-muted-foreground/60 h-10 py-2 px-3 text-sm"
            />

            <FormInput
              name="description"
              control={methods.control}
              label="Description (Optional)"
              type="textarea"
              placeholder="Detail what needs to be done..."
              style="bg-[#191a29] border-white/10 text-white focus:border-primary placeholder:text-muted-foreground/60 min-h-16 py-2 px-3 text-sm"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="category"
                control={methods.control}
                label="Category"
                type="select"
                options={categoryOptions}
                style="bg-[#191a29] border-white/10 text-white focus:border-primary text-sm h-10 py-2"
              />

              <FormInput
                name="priority"
                control={methods.control}
                label="Priority"
                type="select"
                options={priorityOptions}
                style="bg-[#191a29] border-white/10 text-white focus:border-primary text-sm h-10 py-2"
              />
            </div>

            <Separator className="border-white/5" />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-white/10 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={isSubmitting} className="min-w-24">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : null}
                {isEditMode ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
