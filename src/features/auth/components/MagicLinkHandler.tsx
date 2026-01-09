import { AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { consumeMagicLink } from "../services/authService";

const MagicLinkHandler = () => {
  const { magicLinkId, p1, p2 } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleMagicLink = useCallback(async () => {
    if (!magicLinkId || !p1 || !p2) {
      setError("Invalid magic link. Missing required parameters.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);

      await consumeMagicLink(magicLinkId, p1, p2);

      // Check if there's a pending survey redirect (first-time user flow)
      const pendingRedirect = localStorage.getItem("pendingSurveyRedirect");
      if (pendingRedirect) {
        try {
          const redirectData = JSON.parse(pendingRedirect);
          // Clear the stored redirect
          localStorage.removeItem("pendingSurveyRedirect");
          
          // Navigate directly to the newly created survey dashboard
          if (redirectData.surveyId) {
            navigate(`/console/survey/${redirectData.surveyId}`, {
              replace: true,
            });
          } else {
            // Fallback: if surveyId is missing, navigate to survey run page
            navigate(`/brand-rank/survey/${redirectData.surveyRunId}/${redirectData.p1}/${redirectData.p2}`, {
              replace: true,
              state: {
                query: redirectData.query,
                selectedBrand: redirectData.selectedBrand,
                survey: redirectData.survey,
              },
            });
          }
          return;
        } catch (error) {
          console.error("Failed to parse pending redirect:", error);
          // Fall through to default redirect
        }
      }

      // Default redirect to console prior to successful authentication
      navigate("/console", { replace: true });
    } catch (err) {
      console.error("Magic link authentication failed", err);

      // Extract error message
      let errorMessage = "Failed to authenticate. Please try again.";
      let details: string | null = null;

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;

        // Try to extract more details from the error
        const errorWithData = err as Error & {
          data?: unknown;
          response?: Response;
        };
        if (errorWithData.response) {
          details = `HTTP ${errorWithData.response.status}: ${errorWithData.response.statusText}`;
        }
        if (errorWithData.data) {
          if (typeof errorWithData.data === "string") {
            details = errorWithData.data;
          } else if (typeof errorWithData.data === "object") {
            try {
              details = JSON.stringify(errorWithData.data);
            } catch {
              details = "An error occurred";
            }
          }
        }
      }

      setError(errorMessage);
      setErrorDetails(details);
      setLoading(false);
    }
  }, [magicLinkId, p1, p2, navigate]);

  useEffect(() => {
    handleMagicLink();
  }, [handleMagicLink]);

  const handleRetry = () => {
    handleMagicLink();
  };

  const handleGoToSignin = () => {
    navigate("/signin", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <div className="text-gray-600 dark:text-gray-400">
          Authenticating...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
              {errorDetails && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {errorDetails}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={handleGoToSignin}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MagicLinkHandler;
