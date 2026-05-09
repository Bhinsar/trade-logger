import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxGroupProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: CheckboxOption[];
  className?: string;
  required?: boolean;
}

function CheckboxGroup<T extends FieldValues>({
  name,
  control,
  label,
  options,
  className,
  required = false,
}: CheckboxGroupProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentValue = (field.value || []) as string[];

        const toggleOption = (optionValue: string) => {
          const newValue = currentValue.includes(optionValue)
            ? currentValue.filter((v) => v !== optionValue)
            : [...currentValue, optionValue];
          field.onChange(newValue);
        };

        return (
          <Field className={cn("w-full", className)}>
            {label && (
              <FieldLabel required={required} className="text-md font-medium mb-2">
                {label}
              </FieldLabel>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option) => {
                const isSelected = currentValue.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border-2 transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-300 bg-gray-300/5 hover:border-gray-400"
                    )}
                  >
                    <div
                      className={cn(
                        "size-5 rounded border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-gray-300 bg-gray-50"
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white stroke-4" />}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                );
              })}
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export default CheckboxGroup;
