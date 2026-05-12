import React, { ReactNode, useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";

type SelectOption = {
  label: string;
  value: string;
};

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  charLimit?: number;
  style?: string;
  isDisabled?: boolean;
  isPassword?: boolean;
  placeholder?: string;
  length?: number;
  type?: "text" | "select" | "date" | "datetime-local" | "number" | "textarea";
  options?: SelectOption[];
  currentValue?: string;
  maxValue?: string;
  isReadOnly?: boolean;
  required?: boolean;
}

function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  startIcon,
  endIcon,
  style,
  isDisabled = false,
  isPassword = false,
  placeholder,
  length,
  type = "text",
  options = [],
  currentValue,
  maxValue,
  isReadOnly = false,
  required = false,
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className="w-full">
          {label && (
            <FieldLabel required={required} className="text-md font-medium">{label}</FieldLabel>
          )}

          {type === "select" ? (
            // ── Select variant ──────────────────────────────────────
            <Select
              disabled={isDisabled}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                className={cn(
                  "rounded-md shadow-none border-2  transition-all w-full bg-white h-11 px-4 py-5",
                  "focus:ring-0 focus:ring-offset-0",
                  fieldState.invalid
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-primary",
                  isDisabled && "opacity-50 cursor-not-allowed",
                  style,
                )}
              >
                <SelectValue placeholder={placeholder || label || name} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "textarea" ? (
            <Textarea
              {...field}
              disabled={isDisabled}
              readOnly={isReadOnly}
              placeholder={placeholder || label || name}
              maxLength={length}
              className={cn(
                "rounded-md shadow-none border-2 transition-all w-full h-20",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                startIcon ? "pl-10" : "pl-4",
                endIcon || isPassword ? "pr-12" : "pr-4",
                fieldState.invalid
                  ? "border-red-500 focus:border-red-600 focus-visible:border-red-600"
                  : "border-gray-300 focus:border-primary focus-visible:border-primary",
                isDisabled && "opacity-50 cursor-not-allowed",
                style,
              )}
            />
          ) : (
            // ── Text / Password variant/ date ──────────────────────────────
            <div className="relative flex flex-col w-full gap-1">
              <div className="relative flex items-center w-full">
                {startIcon && (
                  <div className="absolute left-3 z-10 pointer-events-none text-gray-500 size-4 [&_svg]:size-full">
                    {startIcon}
                  </div>
                )}
                <Input
                  {...field}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (type === "number" && val !== "") {
                      val = val.replace(/^(-?)0+(?=\d)/, '$1');
                    }
                    field.onChange(val);
                  }}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  type={
                    isPassword
                      ? showPassword
                        ? "text"
                        : "password"
                      : type
                  }
                  step={type === "number" ? "any" : undefined}
                  value={(() => {
                    const raw: unknown = field.value ?? currentValue ?? "";
                    if (raw instanceof Date) {
                      return new Date(raw.getTime() - raw.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                    }
                    return raw as string | number | readonly string[];
                  })()}
                  max={
                    type === "date"
                      ? maxValue || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]
                      : type === "datetime-local"
                      ? maxValue || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                      : undefined
                  }
                  placeholder={placeholder || label || name}
                  maxLength={length}
                  className={cn(
                    "rounded-md shadow-none border-2 transition-all w-full bg-white h-11",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    startIcon ? "pl-10" : "pl-4",
                    endIcon || isPassword ? "pr-12" : "pr-4",
                    fieldState.invalid
                      ? "border-red-500 focus:border-red-600 focus-visible:border-red-600"
                      : "border-gray-300 focus:border-primary focus-visible:border-primary",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    style,
                  )}
                />
                {endIcon && !isPassword && (
                  <div className="absolute right-3 z-10 pointer-events-none text-gray-500 size-4 [&_svg]:size-full">
                    {endIcon}
                  </div>
                )}
                {isPassword && (
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3.5 z-20 hover:text-black transition-colors text-muted-foreground size-5 [&_svg]:size-full cursor-pointer"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                )}
              </div>

              {/* Character counter — replaces the broken InputGroupAddon stubs */}
              {length && (
                <span className="self-end text-xs tabular-nums text-muted-foreground pr-1">
                  {field.value?.length ?? 0}/{length} characters
                </span>
              )}
            </div>
          )}

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default FormInput;
