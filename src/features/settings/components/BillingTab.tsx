import { Check, ExternalLink } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const BillingTab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      {/* Current Plan Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current plan
        </h2>
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Small
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    $99/month
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  4 of 5 brands used
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Includes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Unlimited seats
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Share of voice analysis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Advanced filtering
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Prompt designer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Invoices Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Payment & invoices
        </h2>
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Manage & view payments
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage payment method and download invoices
            </p>
          </div>

          <div className="px-6 py-5">
            <button
              onClick={() => navigate("/console/billing")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Manage billing
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
