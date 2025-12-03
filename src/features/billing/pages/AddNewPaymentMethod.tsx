import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../app/providers/ToastProvider";
import prms from "../../../app/shared/utils/prms";
import { useUser } from "../../auth/context/UserContext";
import { createSetupIntent, setPaymentMethod } from "../service/billingService";

const stripePromise = loadStripe(prms.stripePublishableKey);

interface PaymentFormProps {
  onSaved: (paymentMethod: any) => void;
}

const AddNewPaymentMethod: React.FC<PaymentFormProps> = ({ onSaved }) => {
  const { useActiveProjectId } = useUser();
  const activeProjectId = useActiveProjectId();
  const toast = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeCustomer = async () => {
      if (!activeProjectId) {
        setError("No active project selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await createSetupIntent(activeProjectId);

        if (!response) {
          throw new Error("Failed to initialize payment setup");
        }

        setClientSecret(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load payment setup";
        setError(errorMessage);
        toast.error({
          title: "Payment Setup Error",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStripeCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  const elementsOptions = useMemo<StripeElementsOptions>(() => {
    const opts: StripeElementsOptions = {
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#EA580C",
        },
      },
    };

    if (clientSecret) {
      opts.clientSecret = clientSecret;
    }

    return opts;
  }, [clientSecret]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading payment setup...
        </p>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 max-w-md">
          <p className="text-sm text-red-800 dark:text-red-200">
            {error || "Unable to initialize payment setup. Please try again."}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary dark:text-primary-hover dark:hover:text-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm onSaved={onSaved} />
    </Elements>
  );
};

function PaymentForm({ onSaved }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { useActiveProjectId } = useUser();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const activeProjectId = useActiveProjectId();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setFormError("Payment system not ready. Please refresh the page.");
      return;
    }

    if (!activeProjectId) {
      setFormError("No active project selected");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    setFormError(null);

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setFormError(error.message || "Payment setup failed");
        toast.error({
          title: "Payment Error",
          message: error.message || "Failed to save payment method",
        });
        return;
      }

      if (!setupIntent?.payment_method) {
        throw new Error("No payment method returned from Stripe");
      }

      const newPaymentMethod = await setPaymentMethod(
        activeProjectId,
        setupIntent.payment_method
      );

      onSaved(newPaymentMethod);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setFormError(errorMessage);
      toast.error({
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 max-w-[80vw] mx-auto p-4"
    >
      <div className="min-h-[200px]">
        <PaymentElement />
      </div>

      {formError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{formError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isSaving}
        className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Saving Payment Method...</span>
          </>
        ) : (
          <span>Save Payment Method</span>
        )}
      </button>
    </form>
  );
}

export default AddNewPaymentMethod;
