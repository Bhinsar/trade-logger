import React, { useState, useRef, useEffect, useCallback } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  [key: string]: any;
};

export interface SearchableSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options?: SelectOption[];
  onSearch?: (searchTerm: string) => Promise<SelectOption[]>;
  onAddNew?: (searchTerm: string) => void;
  addNewLabel?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function SearchableSelect<T extends FieldValues>({
  control,
  name,
  options = [],
  onSearch,
  onAddNew,
  addNewLabel = "Add new",
  placeholder = "Select or search...",
  label,
  disabled = false,
  className,
  required = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle async search
  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      if (onSearch && isOpen) {
        setIsLoading(true);
        try {
          const results = await onSearch(searchTerm);
          if (isMounted) setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          if (isMounted) setSearchResults([]);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, onSearch, isOpen]);

  const displayedOptions = onSearch
    ? searchResults
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Find the selected option's label to display when not open or searching
        const selectedOption =
          options.find((opt) => opt.value === field.value) ||
          searchResults.find((opt) => opt.value === field.value);

        const displayValue = isOpen ? searchTerm : selectedOption?.label || "";

        const handleSelect = (selectedValue: string) => {
          field.onChange(selectedValue);
          setIsOpen(false);
          setSearchTerm("");
        };

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange("");
          setSearchTerm("");
          inputRef.current?.focus();
        };

        const showAddNew = onAddNew || options?.length > 0 && searchTerm.trim().length > 0;
        const exactMatchExists = displayedOptions.some(
          (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase()
        );

        return (
          <Field className={cn("w-full", className)} ref={containerRef}>
            {label && (
              <FieldLabel required={required} className="text-md font-medium">
                {label}
              </FieldLabel>
            )}

      <div className="relative">
        <div
          className={cn(
            "relative flex items-center w-full rounded-md border-2 transition-colors overflow-hidden",
            disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-text",
              isOpen
                ? "border-primary ring-2 ring-primary/20"
                : fieldState.invalid
                ? "border-red-500"
                : "border-gray-300 bg-gray-300/5 hover:border-gray-400"
          )}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="w-full h-11 px-4 bg-transparent outline-none dark placeholder:text-gray-400"
            placeholder={selectedOption ? selectedOption.label : placeholder}
            value={displayValue}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            disabled={disabled}
            onFocus={() => setIsOpen(true)}
          />

          <div className="flex items-center px-2 space-x-1 text-gray-400">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            
            {field.value && !disabled && !isOpen && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setIsOpen(!isOpen);
                  if (!isOpen) inputRef.current?.focus();
                }
              }}
            >
              <ChevronDown
                className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-100 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {displayedOptions.length === 0 && !isLoading && !showAddNew ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No results found
              </div>
            ) : (
              <div className="py-1">
                {displayedOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors",
                      field.value === option.value ? "bg-primary/5 text-primary" : "text-gray-700"
                    )}
                  >
                    <span>{option.label}</span>
                    {field.value === option.value && <Check className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Button */}
            {showAddNew && !exactMatchExists && (
              <>
                {displayedOptions.length > 0 && <div className="h-px bg-gray-100 my-1" />}
                <button
                  type="button"
                  onClick={() => {
                    onAddNew?.(searchTerm);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium group"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {addNewLabel} "{searchTerm}"
                </button>
              </>
            )}
          </div>
        )}
      </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export default SearchableSelect;
