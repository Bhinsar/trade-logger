"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import RangeInput from "@/src/components/common/rangeInput";
import FormInput from "@/src/components/common/formInput";
import { CreateTradeInput } from "../createTradeSchema";

import CheckboxGroup from "@/src/components/common/checkboxGroup";

const MISTAKE_OPTIONS = [
  { label: "Overtrading", value: "Overtrading" },
  { label: "Revenge Trading", value: "Revenge Trading" },
  { label: "Risked Too Much", value: "Risked Too Much" },
  { label: "Exited Too Early", value: "Exited Too Early" },
  { label: "Exited Too Late", value: "Exited Too Late" },
  { label: "FOMO Entry", value: "FOMO Entry" },
  { label: "Ignored Signals", value: "Ignored Signals" },
  { label: "No Clear Plan", value: "No Clear Plan" },
  { label: "Ignored Stop Loss", value: "Ignored Stop Loss" },
  { label: "No Mistakes", value: "No Mistakes" },
];

function PsychologyForm() {
  const { control } = useFormContext<CreateTradeInput>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pb-2">
      <div className="flex flex-col gap-4">
        <RangeInput
          name="entry_confidence"
          control={control}
          label="Entry Confidence (1-10)"
          min={1}
          max={10}
        />
        <RangeInput
          name="satisfaction_rating"
          control={control}
          label="Satisfaction Rating (1-10)"
          min={1}
          max={10}
        />
      </div>

      <CheckboxGroup
        name="mistakes_made"
        control={control}
        label="Mistakes Made"
        options={MISTAKE_OPTIONS}
      />

      <div className="md:col-span-2">
        <FormInput
          name="lessons_learned"
          control={control}
          label="Lessons Learned (comma separated)"
          placeholder="e.g. Wait for confirmation, Trust the system"
          type="textarea"
          style="min-h-[100px]"
        />
      </div>
    </div>
  );
}

export default PsychologyForm;