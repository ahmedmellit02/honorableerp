import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxResults?: number;
}

export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ options, value = "", onChange, placeholder, className, disabled, maxResults = 10 }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update input value when prop value changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Filter options based on input
    useEffect(() => {
      if (!inputValue.trim()) {
        setFilteredOptions([]);
        return;
      }

      const filtered = options
        .filter(option => 
          option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.description?.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, maxResults);

      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    }, [inputValue, options, maxResults]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setIsOpen(true);
      
      // If the input matches an option exactly, call onChange
      const exactMatch = options.find(option => 
        option.value.toLowerCase() === newValue.toLowerCase() ||
        option.label.toLowerCase() === newValue.toLowerCase()
      );
      
      if (exactMatch) {
        onChange(exactMatch.value);
      } else {
        onChange(newValue);
      }
    };

    // Handle option selection
    const handleOptionSelect = (option: AutocompleteOption) => {
      setInputValue(option.value);
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen || filteredOptions.length === 0) {
        if (e.key === "ArrowDown" && !isOpen) {
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={cn("pr-8", className)}
            disabled={disabled}
          />
          <ChevronDown 
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-lg"
          >
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  "px-3 py-2 cursor-pointer transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  index === highlightedIndex && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.value}</div>
                    <div className="text-xs text-muted-foreground">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                    )}
                  </div>
                  {inputValue.toLowerCase() === option.value.toLowerCase() && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = "Autocomplete";