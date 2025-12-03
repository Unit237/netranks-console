import { useState } from "react";
import { BiLeftArrowCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../app/providers/ToastProvider";
import AddNewPaymentMethod from "./AddNewPaymentMethod";
import ExistingPaymentMethod from "./ExistingPaymentMethod";

interface PaymentMethod {
  DisplayBrand: string;
  Last4: string;
  ExpMonth: number | string;
  ExpYear: number | string;
  id?: string;
}

export default function Billing() {
  //   const loaderData = useLoaderData() as PaymentMethod | null;
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(!paymentMethod);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleOnSaved = (newPaymentMethod: PaymentMethod) => {
    try {
      if (!newPaymentMethod) {
        throw new Error("Invalid payment method data received");
      }

      setPaymentMethod(newPaymentMethod);
      setIsEditMode(false);

      toast.success({
        title: "Success",
        message: "Payment method saved successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save payment method";

      toast.error({
        title: "Error",
        message: errorMessage,
      });

      console.error("Payment method save error:", error);
    }
  };

  const handleToggleEditMode = () => {
    setIsTransitioning(true);

    // Small delay for smooth transition
    setTimeout(() => {
      setIsEditMode((prev) => !prev);
      setIsTransitioning(false);
    }, 150);
  };

  const handleCancelEdit = () => {
    if (paymentMethod) {
      handleToggleEditMode();
    } else {
      // If no payment method exists, user must add one
      toast.error({
        title: "Action Required",
        message: "Please add a payment method to continue",
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-10 py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="flex items-center text-[13px] mb-2">
          <BiLeftArrowCircle
            onClick={() => navigate(-1)}
            className="h-4 w-4 mr-2 text-2xl cursor-pointer"
          />
          Go back
        </div>
        <div>
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Payment Info
          </h2>

          {/* Content with transition */}
          <div
            className={`
            transition-opacity duration-150
            ${isTransitioning ? "opacity-0" : "opacity-100"}
          `}
          >
            {isEditMode ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <AddNewPaymentMethod onSaved={handleOnSaved} />
              </div>
            ) : paymentMethod ? (
              <div className="flex justify-center">
                <ExistingPaymentMethod paymentMethod={paymentMethod} />
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No payment method on file
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {(paymentMethod || !isEditMode) && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={isEditMode ? handleCancelEdit : handleToggleEditMode}
                disabled={isTransitioning}
                className="
                  px-4 py-2 text-sm font-medium
                  text-blue-600 hover:text-blue-700
                  dark:text-blue-400 dark:hover:text-blue-300
                  hover:bg-blue-50 dark:hover:bg-blue-900/20
                  rounded-md transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-900
                "
              >
                {isEditMode ? "Cancel" : "Change payment method"}
              </button>
            </div>
          )}

          {/* Helper text for first-time users */}
          {!paymentMethod && !isEditMode && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a payment method to enable billing features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
