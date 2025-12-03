interface PaymentMethod {
  DisplayBrand: string;
  Last4: string;
  ExpMonth: number | string;
  ExpYear: number | string;
}

interface ExistingPaymentMethodProps {
  paymentMethod: PaymentMethod;
}

export default function ExistingPaymentMethod({
  paymentMethod,
}: ExistingPaymentMethodProps) {
  return (
    <SimpleCreditCard
      DisplayBrand={paymentMethod.DisplayBrand}
      Last4={paymentMethod.Last4}
      ExpMonth={paymentMethod.ExpMonth}
      ExpYear={paymentMethod.ExpYear}
    />
  );
}

export interface SimpleCardProps {
  /** e.g., "Visa", "Mastercard", "Amex" — straight from your backend */
  DisplayBrand: string;
  /** Last 4 digits of card */
  Last4: string;
  /** numeric or string month (1-12) */
  ExpMonth: number | string;
  /** 2- or 4-digit year */
  ExpYear: number | string;
  /** width in px (height preserves card ratio) */
  width?: number;
  /** simple color style */
  variant?: "light" | "dark";
}

const formatMonth = (m: number | string): string => String(m).padStart(2, "0");

const formatYear = (y: number | string): string => {
  const s = String(y);
  return s.length === 2 ? s : s.slice(-2);
};

/**
 * Minimal, dependency-light credit card display for read-only info.
 * Designed for the fields: DisplayBrand, Last4, ExpMonth, ExpYear
 */
function SimpleCreditCard({
  DisplayBrand,
  Last4,
  ExpMonth,
  ExpYear,
  width = 320,
  variant = "dark",
}: SimpleCardProps) {
  const height = Math.round(width / 1.586);
  const isDark = variant === "dark";

  // Validate card data
  const displayBrand = DisplayBrand || "Card";
  const displayLast4 = Last4 || "0000";
  const displayMonth = formatMonth(ExpMonth || "01");
  const displayYear = formatYear(ExpYear || "00");

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl
        ${
          isDark
            ? "bg-gradient-to-br from-gray-900/95 to-blue-900/90 text-white"
            : "bg-gradient-to-br from-white/95 to-blue-100/40 text-gray-900"
        }
      `}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        padding: "18px",
      }}
    >
      {/* Decorative background elements */}
      <div
        className={`
        absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10
        ${isDark ? "bg-white" : "bg-blue-500"}
      `}
      />
      <div
        className={`
        absolute -bottom-12 -left-12 h-40 w-40 rounded-full opacity-10
        ${isDark ? "bg-blue-400" : "bg-blue-300"}
      `}
      />

      <div className="relative flex h-full flex-col justify-between">
        {/* Top: Brand and Last 4 */}
        <div className="flex items-start justify-between">
          <div
            className={`text-sm font-medium ${
              isDark ? "opacity-85" : "opacity-90"
            }`}
          >
            {displayBrand}
          </div>
          <div className={`text-xs ${isDark ? "opacity-65" : "opacity-60"}`}>
            •••• {displayLast4}
          </div>
        </div>

        {/* Middle: Full masked number */}
        <div>
          <div
            className="select-none font-mono text-2xl tracking-[0.125em] font-medium"
            style={{ letterSpacing: "0.125em" }}
          >
            •••• •••• •••• {displayLast4}
          </div>
        </div>

        {/* Bottom: Expiry date */}
        <div className="flex items-end justify-between">
          <div /> {/* Spacer */}
          <div className="flex flex-col items-end gap-0.5">
            <div
              className={`text-[10px] ${
                isDark ? "text-white/75" : "text-gray-600"
              }`}
            >
              VALID THRU
            </div>
            <div className="text-base font-bold">
              {displayMonth}/{displayYear}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SimpleCreditCard };
