import { ArrowUpRight, Check } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const BillingTab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[35vw] mx-auto p-4 space-y-4">
        {/* Current Plan Section */}
        <div className="bg-greyColor border border-gray-200 rounded-[20px]">
          <h2 className="text-[14px] font-medium text-gray-600 dark:text-white p-4">
            Current plan
          </h2>
          <div className="overflow-hidden">
            <div className="px-6 py-5 bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col items-start space-y-10">
                <div className="w-5 h-5 bg-orange-600 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1 text-[13px]">
                    <span className="text-black dark:text-white">Small:</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      $99/month
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600 dark:text-gray-400">
                    4 of 5 brands used
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-600">
              <h3 className="text-[13px] font-medium text-gray-700 dark:text-white mb-4">
                Includes
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 text-[13px] text-black dark:text-white">
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-[2px]">
                    <div className="flex-shrink-0 w-4 h-4 p-1 bg-green-600 rounded-full flex items-center justify-center">
                      <Check
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="">Unlimited seats</span>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-[2px]">
                    <div className="flex-shrink-0 w-4 h-4 p-1 bg-green-600 rounded-full flex items-center justify-center">
                      <Check
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="">Share of voice analysis</span>
                  </div>
                </div>
                <div className="flex gap-2 text-[13px] text-black dark:text-white">
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-[2px]">
                    <div className="flex-shrink-0 w-4 h-4 p-1 bg-green-600 rounded-full flex items-center justify-center">
                      <Check
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="">Advanced filtering</span>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-[2px]">
                    <div className="flex-shrink-0 w-4 h-4 p-1 bg-green-600 rounded-full flex items-center justify-center">
                      <Check
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="">Prompt designer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Invoices Section */}
        <div className="bg-greyColor border border-gray-200 rounded-[20px]">
          <h2 className="text-[14px] font-medium text-gray-600 dark:text-white p-4">
            Payment & invoices
          </h2>
          <div className="bg-white dark:bg-gray-700 rounded-[20px] border border-gray-200 dark:border-gray-600">
            <div className="px-6 py-5">
              <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-1">
                Manage & view payments
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                Manage payment method and download invoices
              </p>
            </div>

            <div className="px-6 py-5">
              <button
                onClick={() => navigate("/console/billing")}
                className="inline-flex items-center gap-2 px-2 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Manage billing
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
