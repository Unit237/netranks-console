import { Check, ChevronDown, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import TypingEffect from "./TypingEffect";

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
}

interface ProfessionalDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  searchable?: boolean;
  showTypingEffect?: boolean;
}

const ProfessionalDropdown: React.FC<ProfessionalDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  required = false,
  className = "",
  searchable = true,
  showTypingEffect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Prepare typing effect texts
  const typingTexts =
    showTypingEffect && !isOpen && !selectedOption
      ? options.slice(0, 5).map((option) => option.label)
      : [];

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group options by category
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const flatOptions = Object.values(groupedOptions).flat();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < flatOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : flatOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
          handleSelect(flatOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          relative w-full cursor-pointer transition-all duration-200 ease-in-out
          ${
            isOpen
              ? "ring-2 ring-green-500 dark:ring-green-400 shadow-lg"
              : "hover:shadow-md"
          }
        `}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
          ${
            isOpen
              ? "border-green-500 dark:border-green-400 bg-white dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
          }
        `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {selectedOption?.icon && (
                <div className="flex-shrink-0 text-green-600 dark:text-green-400">
                  {selectedOption.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {selectedOption ? (
                    selectedOption.label
                  ) : showTypingEffect && typingTexts.length > 0 ? (
                    <TypingEffect
                      texts={typingTexts}
                      speed={60}
                      pauseTime={1500}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  ) : (
                    placeholder
                  )}
                </div>
                {selectedOption?.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {Object.entries(groupedOptions).map(
                ([category, categoryOptions]) => (
                  <div key={category}>
                    {Object.keys(groupedOptions).length > 1 && (
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700">
                        {category}
                      </div>
                    )}
                    {categoryOptions.map((option) => {
                      const flatIndex = Object.values(groupedOptions)
                        .flat()
                        .findIndex((opt) => opt.value === option.value);
                      const isHighlighted = flatIndex === highlightedIndex;
                      const isSelected = option.value === value;

                      return (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`
                          px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center space-x-3
                          ${
                            isHighlighted
                              ? "bg-green-50 dark:bg-green-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }
                          ${
                            isSelected
                              ? "bg-green-100 dark:bg-green-900/30"
                              : ""
                          }
                        `}
                        >
                          {option.icon && (
                            <div className="flex-shrink-0 text-green-600 dark:text-green-400">
                              {option.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {option.label}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {filteredOptions.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No options found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDropdown;
