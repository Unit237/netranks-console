import { Check } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { BrandOption } from "../@types";
import { searchBrands } from "../services/brandService";

type Props = {
  onSelect: (option: BrandOption | string) => void;
};

const AutocompleteBrand: React.FC<Props> = ({ onSelect }) => {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setOptions([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const brands = await searchBrands(input, controller.signal);
        setOptions(brands);
        setShowDropdown(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
          setOptions([]);
          setShowDropdown(false);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [input]);

  const handleBrandSelect = useCallback(
    (brand: BrandOption | null) => {
      if (brand) {
        setSelectedBrand(brand);
        setShowDropdown(false);
        onSelect(brand);
      }
    },
    [onSelect]
  );

  const handleContinue = useCallback(() => {
    console.log("selectedBrand", selectedBrand);
    console.log("input", input);

    if (selectedBrand) {
      onSelect(selectedBrand);
    } else if (input && input !== "") {
      onSelect(input);
    } else if (options.length > 0) {
      handleBrandSelect(options[0]);
    }
  }, [selectedBrand, options, onSelect, handleBrandSelect]);

  const isButtonDisabled = !input.trim() && !selectedBrand;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && options.length > 0) {
      e.preventDefault();
      onSelect(options[0]);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-[600px] mx-auto relative">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full p-1.5">
            <div className="w-7 h-7 mx-2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M8 17q-.425 0-.712-.288T7 16t.288-.712T8 15h8q.425 0 .713.288T17 16t-.288.713T16 17zM4 9q-.425 0-.712-.288T3 8t.288-.712T4 7t.713.288T5 8t-.288.713T4 9m4 0q-.425 0-.712-.288T7 8t.288-.712T8 7t.713.288T9 8t-.288.713T8 9m4 0q-.425 0-.712-.288T11 8t.288-.712T12 7t.713.288T13 8t-.288.713T12 9m4 0q-.425 0-.712-.288T15 8t.288-.712T16 7t.713.288T17 8t-.288.713T16 9m4 0q-.425 0-.712-.288T19 8t.288-.712T20 7t.713.288T21 8t-.288.713T20 9m0 4q-.425 0-.712-.288T19 12t.288-.712T20 11t.713.288T21 12t-.288.713T20 13m-4 0q-.425 0-.712-.288T15 12t.288-.712T16 11t.713.288T17 12t-.288.713T16 13m-4 0q-.425 0-.712-.288T11 12t.288-.712T12 11t.713.288T13 12t-.288.713T12 13m-4 0q-.425 0-.712-.288T7 12t.288-.712T8 11t.713.288T9 12t-.288.713T8 13m-4 0q-.425 0-.712-.288T3 12t.288-.712T4 11t.713.288T5 12t-.288.713T4 13"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Brand name, website, or question..."
              className="flex-1 max-w-[500px] text-[13px] bg-transparent outline-none border-none text-gray-900 dark:text-gray-100"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {loading && (
              <div className="mr-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={isButtonDisabled}
              className={`rounded-[25px] ml-2 px-4 py-3 text-[14px] font-medium transition-colors ${
                isButtonDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              Continue
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && options.length > 0 ? (
            <div className="absolute w-[500px] ml-12 border border-gray-200 dark:border-gray-600 bg-greyColor rounded-b-[25px] z-10">
              <div className="flex items-start space-x-2 p-4">
                <div className="text-primary flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-primary mt-0.5"
                  >
                    <g fill="none">
                      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                      <path
                        fill="currentColor"
                        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 11a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-9a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1"
                      />
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h1>Multiple brands detected</h1>
                  <p className="text-gray-600 mt-1">
                    Not seeing your brand? Try adding website
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute w-[550px] ml-6 border bg-greyColor dark:bg-gray-600 rounded-b-[20px] z-10">
              <div className="flex items-center px-4 py-2 text-[13px] text-gray-400 dark:text-gray-400">
                Try 'compare us' or 'sentiment on our pricing'
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-2 text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
      </div>

      {/* Brand options */}
      <div className="flex flex-col bg-greyColor dark:bg-gray-600 rounded-[26px] mt-28 max-w-[600px] mx-auto">
        {options.map((option) => (
          <div
            key={option.brandId}
            onClick={() => handleBrandSelect(option)}
            className="cursor-pointer w-full"
          >
            <RenderBrandItemWithIcon
              brand={option}
              selected={selectedBrand?.brandId === option.brandId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export function RenderBrandItem({ brand }: { brand: BrandOption }) {
  return (
    <div className="p-6 w-full max-w-[800px]">
      <div className="flex items-center gap-2 mb-4">
        {brand.icon ? (
          <img src={brand.icon} alt="" className="w-9 h-9 mr-2 rounded-md" />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            ✋
          </div>
        )}
      </div>

      <div>
        <h6 className="font-medium text-[15px] text-gray-900 dark:text-gray-100 mb-1">
          {brand.name}
        </h6>
        <p className="text-gray-600 dark:text-gray-400 text-[13px]">
          {brand.description}
        </p>
      </div>
    </div>
  );
}

export function RenderBrandItemWithIcon({
  brand,
  selected,
}: {
  brand: BrandOption;
  selected?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 w-full max-w-[600px] rounded-[26px] overflow-hidden transition-all duration-200 ${
        selected
          ? "border-2 border-primary"
          : "border border-gray-200 dark:border-gray-600"
      } hover:border-primary hover:shadow-[0_2px_8px_rgba(249,115,22,0.25)]`}
    >
      {/* Top section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600 rounded-[20px]">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center mb-4">
            {brand.icon ? (
              <img
                src={brand.icon}
                alt=""
                className="w-9 h-9 mr-2 rounded-md"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                ✋
              </div>
            )}

            <span className="text-gray-600 dark:text-gray-400 text-[14px] border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1">
              #{brand.brandId}
            </span>
          </div>

          {selected && (
            <div className="">
              <Check className="p-1.5 bg-greenColor rounded-full text-white" />
            </div>
          )}
        </div>

        <div>
          <h6 className="font-medium text-[15px] text-gray-900 dark:text-gray-100 mb-1">
            {brand.name}
          </h6>
          <p className="text-gray-600 dark:text-gray-400 text-[13px]">
            {brand.domain}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-600 rounded-[20px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
            Visibility score
          </span>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
              {Math.round(brand._score)}%
            </span>

            <div className="flex gap-1 w-[60px]">
              {[1, 2, 3, 4].map((i) => {
                const activeIndex = Math.ceil((brand._score / 100) * 4);
                const isActive = i <= activeIndex;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2.5 rounded transition-all duration-200 ${
                      isActive ? "bg-orange-500" : "bg-gray-500"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutocompleteBrand;
