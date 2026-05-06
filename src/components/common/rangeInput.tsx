import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";

interface RangeInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  required?: boolean;
}

function RangeInput<T extends FieldValues>({
  name,
  control,
  label,
  min = 1,
  max = 10,
  step = 1,
  className,
  required = false,
}: RangeInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={cn("w-full", className)}>
          <div className="flex justify-between items-center mb-2">
            {label && (
              <FieldLabel required={required} className="text-sm font-medium">{label}</FieldLabel>
            )}
            <span className="text-sm font-bold text-primary tabular-nums">
              {field.value ?? min}
            </span>
          </div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[field.value ?? min]}
            onValueChange={(val) => field.onChange(val[0])}
            className="py-2"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default RangeInput;
