import { Check, ExternalLink } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const BillingTab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto">
      {/* Current Plan Section */}
      <div className="bg-greyColor rounded-[25px] mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-gray-500 text-base font-normal">Current plan</h2>
        </div>

        <div className="py-6 bg-white">
          {/* Orange Icon */}
          <div className="w-10 h-10 bg-orange-600 rounded-lg mb-4"></div>

          {/* Plan Details */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-semibold text-gray-900">Small</span>
              <span className="text-gray-500">$99/month</span>
            </div>
            <p className="text-gray-600 text-sm">4 of 5 brands used</p>
          </div>

          {/* Includes Section */}
          <div>
            <h3 className="text-gray-500 text-base font-normal mb-4">
              Includes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-900 text-sm">Unlimited seats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-900 text-sm">
                  Share of voice analysis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-900 text-sm">
                  Advanced filtering
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-900 text-sm">Prompt designer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Invoices Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-gray-500 text-base font-normal">
            Payment & invoices
          </h2>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Manage & view payments
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Manage payment method and download invoices
          </p>

          <button
            onClick={() => navigate("/console/billing")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Manage billing
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
